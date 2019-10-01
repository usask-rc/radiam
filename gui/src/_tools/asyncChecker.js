import { getAPIEndpoint } from "../_tools/funcs";
import { httpClient } from "../_tools/httpClient";

//TODO:we need another validator for updates - if Names are unique, we want to be able to maintain the same name on an item that we are updating.  This is not currently possible.

export function getAsyncValidateNotExists(checkField, endpoint_path) {
  return function asyncValidate(data, middleware, context, field) {
    return new Promise(async (resolve, reject) => {
      if (data[checkField.name]) {
        let param = checkField.param ? checkField.param : checkField.name;
        let url = getAPIEndpoint() + "/" + endpoint_path + "/?" + param + "=" + data[checkField.name];
        return httpClient(url, { "method": "GET" }).then(response => {
          if (response.json && response.json.count && response.json.count > 0) {

            if (response.json.results[0].id && data.id && response.json.results[0].id === data.id){//check to ensure the value we found isn't just this one.
              resolve({})
            }
            else{
              let rejection = {};
              rejection[checkField["name"]] = checkField["reject"];
              reject(rejection);
            }
          } else {
            resolve({});
          }
        });
      } else {
        resolve({});
      }
    });
  }
}

export function getAsyncValidateTwoNotExists(one, two, endpoint_path) {
  return function asyncValidate(data, middleware, context, field) {
    return new Promise(async (resolve, reject) => {
      if (data[one.name] && data[two.name]) {
        let oneParam = one.param ? one.param : one.name + "=" + data[one.name];
        let twoParam = two.param ? two.param : two.name + "=" + data[two.name];
        let param = oneParam + "&" + twoParam;
        let url = getAPIEndpoint() + "/" + endpoint_path + "/?" + param
        return httpClient(url, { "method": "GET" }).then(response => {
          if (response.json && response.json.count && response.json.count > 0) {
            if (response.json.results[0].id && data.id && response.json.results[0].id === data.id){
              resolve({})
            }
            else{
              let rejection = {};
              rejection[one["name"]] = one["reject"];
              rejection[two["name"]] = two["reject"];
              reject(rejection);
            }

          } else {
            resolve({});
          }
        });
      } else {
        resolve({});
      }
    });
  }
}
