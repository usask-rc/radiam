import requests
import json
import time
import os
import urllib
import logging

class RadiamAPI(object):
    def __init__(self, **kwargs):
        self.logger = None
        self.tokenfile = None
        self.baseurl = "http://nginx"
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
                "login": self.baseurl + "/api/token/",
                "refresh": self.baseurl + "/api/token/refresh/",
                "users": self.baseurl + "/api/users/",
                "groups": self.baseurl + "/api/researchgroups/",
                "projects": self.baseurl + "/api/projects/",
                "locations": self.baseurl + "/api/locations/",
                "locationtypes": self.baseurl + "/api/locationtypes/",
                "useragents": self.baseurl + "/api/useragents/"
            }

    def setLogger(self, logger):
        self.logger = logger

    def load_auth_from_file(self):
        if os.path.exists(self.tokenfile):
            with open(self.tokenfile) as f:
                self.authtokens = json.load(f)
            if self.authtokens.get("access"):
                return True
        return None

    def log(self, message):
        # The API class will only log error messages
        if self.logger:
            self.logger.error(message)

    def write_auth_to_file(self, authfile = None):
        if not authfile:
            authfile = self.tokenfile
        with open(authfile, 'w') as f:
            json.dump(self.authtokens, f)

    def login(self, username, password):
        body = {"username":username, "password":password}
        try:
            resp = requests.post(self.endpoints.get("login"),
                data=json.dumps(body), headers=self.headers
                )
        except:
            return False
        if resp.status_code != 200:
            return False
        else:
            resp_obj = json.loads(resp.text)
            if resp_obj["refresh"] != None:
                self.authtokens["refresh"] = resp_obj["refresh"]
            if resp_obj["access"] != None:
                self.authtokens["access"] = resp_obj["access"]
            if self.tokenfile:
                self.write_auth_to_file()
            return True


    def refresh_token(self):
        if not self.osf:
            body = { "refresh" : self.authtokens.get("refresh") }
            resp = requests.post(self.endpoints.get("refresh"),
                    data=json.dumps(body), headers=self.headers
                    )
            if resp.status_code != 200:
                self.log("Unable to refresh auth token {}:\n{}\n".format(resp.status_code, resp.text))
            else:
                self.write_auth_to_file()
                resp_obj = json.loads(resp.text)
                if resp_obj["access"] != None:
                    self.authtokens["access"] = resp_obj["access"]
        else:
            resp = requests.get(self.baseurl + '/api/useragents/' + self.useragent + '/token/new')
            if resp.status_code != 200:
                self.log("Unable to refresh auth token {}:\n{}\n".format(resp.status_code, resp.text))
            else:
                resp_obj = json.loads(resp.text)
                if resp_obj["access"] != None:
                    self.authtokens["access"] = resp_obj["access"]

    def api_get(self, url, retries=1):
        if retries <= 0:
            self.log("Ran out of retries to connect to Radiam API")
            return None
        get_headers = self.headers
        get_headers["Authorization"] = "Bearer " + self.authtokens.get("access")
        resp = requests.get(url, headers=get_headers)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                self.write_auth_to_file()
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
        post_headers["Authorization"] = "Bearer " + self.authtokens.get("access")
        resp = requests.post(url, headers=post_headers, data=body)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                self.write_auth_to_file()
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
        post_headers["Authorization"] = "Bearer " + self.authtokens.get("access")
        resp = requests.post(url, headers=post_headers, json=body)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                self.write_auth_to_file()
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
        delete_headers["Authorization"] = "Bearer " + self.authtokens.get("access")
        resp = requests.delete(url, headers=delete_headers)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                self.write_auth_to_file()
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

    def get_users(self):
        return self.api_get(self.endpoints.get("users"))

    def get_logged_in_user(self):
        return self.api_get(self.endpoints.get("users") + "current")

    def get_groups(self):
        return self.api_get(self.endpoints.get("groups"))

    def get_projects(self):
        return self.api_get(self.endpoints.get("projects"))

    def agent_checkin(self, body, checkin_url):
        if body is None:
            return None
        if isinstance(body, dict):
            body = json.dumps(body)
        return self.api_post(checkin_url, body)

    def create_project(self, body):
        if body is None:
            return None
        if isinstance(body, dict):
            body = json.dumps(body)
        return self.api_post(self.endpoints.get("projects"), body)

    def create_location(self, body):
        if body is None:
            return None
        if isinstance(body, dict):
            body = json.dumps(body)
        return self.api_post(self.endpoints.get("locations"), body)

    def create_useragent(self, body):
        if body is None:
            return None
        if isinstance(body, dict):
            body = json.dumps(body)
        return self.api_post(self.endpoints.get("useragents"), body)

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

    def search_endpoint_by_path(self, index_url, path):
        if path is None:
            self.log("Path argument is missing for endpoint search")
            return None
        index_url = index_url + "search/"
        body = {
                "query" : {
                    "bool" : {
                        "filter" : {
                            "term" : {
                                "path.keyword" : path
                            }
                        }
                    }
                }
            }
        return self.api_post(index_url, json.dumps(body))

    def search_endpoint_by_fieldname(self, index_url, target, fieldname):
        if target is None:
            self.log("Path argument is missing for endpoint search")
            return None
        index_url = index_url+"search?" + fieldname + "=" + target
        return self.api_get(index_url)

    def search_endpoint_by_name(self, endpoint, name, namefield="name"):
        if name is None:
            self.log("Name argument is missing for endpoint search")
            return None
        if endpoint.startswith("http"):
            endpoint_url = endpoint
        else:
            if self.endpoints.get(endpoint):
                endpoint_url = self.endpoints.get(endpoint)
            else:
                self.log(endpoint + " is neither an endpoint URL nor a well known endpoint")
                return None
        endpoint_url += "?" + namefield + "=" + name
        return self.api_get(endpoint_url)

    def api_get_statusCode(self, url, retries=1):
        if retries <= 0:
            self.log("Ran out of retries")
            return None
        get_headers = self.headers
        get_headers["Authorization"] = "Bearer " + self.authtokens.get("access")
        resp = requests.get(url, headers=get_headers)
        if resp.status_code == 403:
            response_json = json.loads(resp.text)
            if response_json["code"] == "token_not_valid":
                self.refresh_token()
                self.write_auth_to_file()
                return self.api_get(url=url, retries=retries - 1)
            else:
                self.log("Unauthorized request {}:\n{}\n".format(resp.status_code, resp.text))
        else:
            return resp.status_code
