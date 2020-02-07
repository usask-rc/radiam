import requests
import json
import time
import os
import urllib
import logging

class RadiamAPI(object):
    def __init__(self, **kwargs):
        self.logger = None
        self.baseurl = "http://radiamapi:8000"  # Docker API container
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.authtokens = {}
        for key, value in kwargs.items():
            setattr(self, key, value)
        if self.baseurl:
            if not self.baseurl.startswith('http'):
                self.baseurl = "http://" + self.baseurl
            self.endpoints = {
                "osfconfigs": self.baseurl + "/api/useragents/osf_configs/",
                "projects": self.baseurl + "/api/projects/",
                "locations": self.baseurl + "/api/locations/",
                "locationtypes": self.baseurl + "/api/locationtypes/",
                "useragents": self.baseurl + "/api/useragents/"
            }

    def setLogger(self, logger):
        self.logger = logger

    def log(self, message):
        # The API class will only log error messages
        if self.logger:
            self.logger.error(message)

    def refresh_token(self):
        if self.osf:
            resp = requests.get(self.endpoints.get("useragents") + self.useragent + '/tokens/new/')
            if resp.status_code != 200:
                self.log("Unable to refresh auth tokens {}:\n{}\n".format(resp.status_code, resp.text))
            else:
                resp_obj = json.loads(resp.text)
                if resp_obj.get("access_token", None) != None:
                    self.log("New access token: {}".format(resp_obj["access_token"]))
                    self.authtokens["access"] = resp_obj["access_token"]
                else:
                    self.log("Unable to obtain access token {}:\n{}\n".format(resp.status_code, resp.text))
                if resp_obj.get("refresh_token", None) != None:
                    self.log("New refresh token: {}".format(resp_obj["refresh_token"]))
                    self.authtokens["refresh"] = resp_obj["refresh_token"]
                else:
                    self.log("Unable to obtain refresh token {}:\n{}\n".format(resp.status_code, resp.text))

    def get_bearer_token(self):
        if self.authtokens.get("access", None) and self.authtokens.get("access") != "":
                return self.authtokens.get("access")
        return "novalidtoken"

    def get_osf_useragents(self):
        """ Get the OSF endpoint data from the Radiam API """
        resp = requests.get(self.endpoints.get("osfconfigs"))
        if resp.status_code != 200:
            self.log("Unable to get list of OSF user agents {}:\n{}\n".format(resp.status_code, resp.text))
            return None
        else:
            return json.loads(resp.text)

    def api_get(self, url, retries=1):
        if retries <= 0:
            self.log("Ran out of retries to connect to Radiam API")
            return None
        get_headers = self.headers
        get_headers["Authorization"] = "Bearer " + self.get_bearer_token()
        resp = requests.get(url, headers=get_headers)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                return self.api_get(url=url, retries=retries - 1)
            else:
                self.log("Unauthorized request {}:\n{}\n".format(resp.status_code, resp.text))
        elif resp.status_code == 200:
            return json.loads(resp.text)
        elif resp.status_code == 429:
            # untested until ADM-562 is resolved
            response_json = json.loads(resp.text)
            time.sleep(int(response_json.get("retry-after", "3")) + 1)
            self.api_get(url, retries=1)
        else:
            self.log("Radiam API error while getting from: {} with code {} and error {} \n".format(url, resp.status_code, resp.text))
            return None

    def api_post(self, url, body, retries=1):
        if retries <= 0:
            self.log("Ran out of retries to connect to Radiam API")
            return None
        post_headers = self.headers
        post_headers["Authorization"] = "Bearer " + self.get_bearer_token()
        resp = requests.post(url, headers=post_headers, data=body)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                return self.api_post(url=url, body=body, retries=retries - 1)
            else:
                self.log("Unauthorized request {}:\n{}\n".format(resp.status_code, resp.text))
        elif resp.status_code == 200 or resp.status_code == 201:
            # Indicates the post was successful and there is content to return
            return json.loads(resp.text)
        elif resp.status_code == 429:
            # untested until ADM-562 is resolved
            response_json = json.loads(resp.text)
            time.sleep(int(response_json.get("retry-after", "3")) + 1)
            self.api_post(url, body, retries=1)
        else:
            self.log("Radiam API error {}:\n{}\n".format(resp.status_code, resp.text))
            return None

    def api_post_bulk(self, url, body, retries=1):
        if retries <= 0:
            self.log("Ran out of retries to connect to Radiam API")
            return None, False
        post_headers = self.headers
        post_headers["Authorization"] = "Bearer " + self.get_bearer_token()
        resp = requests.post(url, headers=post_headers, json=body)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                return self.api_post_bulk(url=url, body=body, retries=retries - 1)
            else:
                self.log("Unauthorized request {}:\n{}\n".format(resp.status_code, resp.text))
        elif resp.status_code == 200 or resp.status_code == 201:
            # Indicates the post was successful and there is content to return
            return json.loads(resp.text), True
        else:
            self.log("Radiam API error {}:\n{}\n".format(resp.status_code, resp.text))
            return resp.text, False

    def api_delete(self, url, retries=1):
        if retries <= 0:
            self.log("Ran out of retries to connect to Radiam API")
            return None
        delete_headers = self.headers
        delete_headers["Authorization"] = "Bearer " + self.get_bearer_token()
        resp = requests.delete(url, headers=delete_headers)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                return self.api_delete(url=url, retries=retries - 1)
            else:
                self.log("Unauthorized request {}:\n{}\n".format(resp.status_code, resp.text))
        elif resp.status_code == 200 or resp.status_code == 204:
            # 200 = delete OK
            # 204 = delete OK, no content to deliver
            return True
        else:
            self.log("Radiam API error {}:\n{}\n".format(resp.status_code, resp.text))
            return None

    def agent_checkin(self, body, checkin_url):
        if body is None:
            return None
        if isinstance(body, dict):
            body = json.dumps(body)
        return self.api_post(checkin_url, body)

    def create_document(self, index_url, body):
        if body is None:
            return None
        if isinstance(body, dict):
            body = json.dumps(body)
        index_url += "docs/"
        return self.api_post(index_url, body)

    def create_document_bulk(self, index_url, body):
        if body is None:
            return None, False
        if isinstance(body, dict):
            body = json.dumps(body)
        index_url += "docs/"
        return self.api_post_bulk(index_url, body)

    def delete_document(self, index_url, id):
        if id is None:
            return None
        index_url += "docs/" + urllib.parse.quote(id)
        return self.api_delete(index_url)

    def get_project_endpoint(self, project_id):
        return self.endpoints.get("projects") + project_id + "/"

    def search_endpoint_by_path(self, index_url, path):
        return self.search_endpoint_by_fieldname(index_url, path, "path.keyword")

    def search_endpoint_by_fieldname(self, index_url, target, fieldname):
        if fieldname is None:
            self.log(target + " field name is missing for endpoint search")
            return None
        if target is None:
            self.log(fieldname + " argument is missing for endpoint search")
            return None
        index_url = index_url + "search/"
        body = {
                "query" : {
                    "bool" : {
                        "filter" : {
                            "term" : {
                                fieldname : target
                            }
                        }
                    }
                }
            }
        return self.api_post(index_url, json.dumps(body))



