from __future__ import print_function
import os
import sys

from osf_api import api
import psycopg2
import time

from radiam_api import RadiamAPI
from configobj import ConfigObj
import json
import requests
import multiprocessing
import logging

def _setup_osf(osf_token):
    return api.OSF(token=osf_token)


def list_(osf_token, project_name, agent_id, location_id):
    osf = _setup_osf(osf_token)

    project = osf.project(project_name)

    meta_data = []
    for store in project.storages:
        for file_ in store.files:
            data = (file_._json(file_._get(file_._endpoint), 200))
            if data is not None:
                data = data['data']
            else:
                continue
            path = file_.path
            if path.startswith('/'):
                path = path[1:]

            filemeta_dict = {
                'size': file_._get_attribute(data, 'attributes', 'size'),
                'date_created': file_.date_created,
                'date_modified': file_.date_modified,
                'path': file_.path,
                'type': file_._get_attribute(data, 'attributes', 'kind'),
                'name': file_._get_attribute(data, 'attributes', 'name'),
                'provider': file_._get_attribute(data, 'attributes', 'provider'),
                'extension': os.path.splitext(os.path.basename(file_.path))[1][1:].strip().lower(),
                'project_id': project_name,
                'plugin': 'osf',
                'location': location_id,
                'agent': agent_id
            }
            meta_data.append(filemeta_dict)
    return meta_data


def list_difference(list1,list2):
    return list(set(list1)-set(list2)), list(set(list2)-set(list1))

def update_info(osf_token, project_name, host, API, agent_id, location_id, radiam_project_id):
    metadata = list_(osf_token, project_name, agent_id , location_id)
    path_list = [i['path'] for i in metadata]
    config_project_endpoint = host + "/api/projects/" + radiam_project_id + "/"
    res = API.search_endpoint_by_fieldname(config_project_endpoint, 'osf', 'plugin')['results']
    res_path_list = [i['path'] for i in res]
    files_to_add, files_to_del = list_difference(path_list, res_path_list)
    if files_to_add:
        API.create_document_bulk(config_project_endpoint,
                                 [i for i in metadata if i['path'] in files_to_add])
    if files_to_del:
        id_list = [i['id'] for i in res if i['path'] in files_to_del]
        for id in id_list:
            API.delete_document(config_project_endpoint, id)


def get_radiam_token_for_osf(agent_id):
    token_endpoint = 'http://nginx/api/useragents/' + agent_id + '/tokens/get'
    head = {"Content-Type": "application/json", "Accept": "application/json"}
    r = requests.get(token_endpoint, headers=head)
    if r.status_code == 200:
        tokens = json.loads(r.content)
        tokens["access"] = tokens["access_token"]
        tokens["refresh"] = tokens["refresh_token"]
        tokens.pop("access_token")
        tokens.pop("refresh_token")
        return tokens
    else:
        return None


def main():
    if sys.version_info[0] < 3:
        raise Exception("Python 3 is required to run the Radiam agent")

    host = 'http://nginx'
    processes = []

    logger = logging.getLogger(__name__)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s [%(name)-12s] %(levelname)-8s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)

    try:
        logger.debug("In start")
        db_config = ConfigObj(r"/code/config/db/db_env")
        db_name = db_config['POSTGRES_DB']
        db_user = db_config['POSTGRES_USER']
        db_password = db_config['POSTGRES_PASSWORD']
        if os.path.isdir('/run/secrets/'):
            for filename in os.listdir('/run/secrets/'):
                with open(os.path.join('/run/secrets/', filename), 'r') as secrets_file:
                    os.environ[filename] = secrets_file.read()
        if os.environ:
            db_name = os.environ.get('POSTGRES_DB', db_name)
            db_user = os.environ.get('POSTGRES_USER', db_user)
            db_password = os.environ.get('POSTGRES_PASSWORD', db_password)

        conn = psycopg2.connect(host='db', dbname=db_name, user=db_user, password=db_password)
        cursor = conn.cursor(cursor_factory=None)

        while True:
            logger.debug("In loop")
            cursor.execute(
                "select agents.id as user_agent_id, agents.remote_api_token, loc.id as loc_id, loc.osf_project, agent_config.project_id from rdm_locations loc join rdm_location_types loc_type on loc.location_type_id = loc_type.id join rdm_user_agents agents on agents.location_id = loc.id join rdm_user_agent_project_config agent_config on agent_config.agent_id = agents.id where loc_type.label = %(str)s;",
                {'str': 'location.type.osf'})
            for item in cursor:
                try:
                    logger.debug("Found configuration")
                    agent_id = item[0]
                    osf_token = item[1]
                    location_id = item[2]
                    project_name = item[3]
                    radiam_project_id = item[4]
                    radiam_tokens = get_radiam_token_for_osf(agent_id)
                    if (radiam_tokens == None):
                        logger.error("Not able to retrieve radiam tokens for agent %s, continuing." %agent_id)
                    else:
                        agent_config = {"authtokens": radiam_tokens, "useragent": agent_id, "osf": True}
                        API = RadiamAPI(**agent_config)
                        API.setLogger(logger)

                        p = multiprocessing.Process(target=update_info, args=(osf_token, project_name, host, API, agent_id, location_id, radiam_project_id))
                        processes.append(p)
                        p.start()
                except Exception as e:
                    logger.error('Error with OSF Project %s' %e)
                    sys.exit(1)
            for process in processes:
                process.join()
            time.sleep(3600)

    except psycopg2.Error as e:
        print('Database Error %s' %e.pgerror)
        sys.exit(1)

if __name__ == "__main__":
    main()
