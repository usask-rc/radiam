import { getAPIEndpoint } from "../_tools/funcs";
import { httpClient } from "../_tools/httpClient";
import {METHODS, MODEL_FIELDS} from "../_constants/index"

export function getAsyncValidateNotExists(checkField, endpoint_path) {
  return function asyncValidate(data, middleware, context, field) {
    return new Promise(async (resolve, reject) => {
      if (data[checkField.name]) {
        let param = checkField.param ? checkField.param : checkField.name;
        let url = `${getAPIEndpoint()}/${endpoint_path}/?${param}=${data[checkField.name]}`;
        return httpClient(url, { "method": METHODS.GET }).then(response => {
          if (response.json && response.json.count && response.json.count > 0) {
            //console.log("asyncvalidatenotexists response: ", response)
            if (response.json.results[0].id && data.id && response.json.results[0].id === data.id){//check to ensure the value we found isn't just this one.
            //console.log("asyncvalidatenotexists resolving 1")
              resolve({})
            }
            else{
              let rejection = {};
              rejection[checkField[MODEL_FIELDS.NAME]] = checkField["reject"];
              //console.log("asyncvalidatenotexists rejecting")
              reject(rejection);
            }
          } else {
            //console.log("asyncvalidatenotexists resolving 2")
            resolve({});
          }
        });
      } else {
        //console.log("asyncvalidatenotexists resolving 3")
        resolve({});
      }
    });
  }
}

export function getAsyncValidateDuplicateNotExists(one, two, endpoint_path) {
  return function asyncValidate(data, middleware, context, field) {
    return new Promise(async (resolve, reject) => {
      if (data[one.name] && data[two.name]) {
        let oneParam = one.param ? one.param : `${one.name}=${data[one.name]}`;
        let twoParam = two.param ? two.param : `${two.name}=${data[two.name]}`;
        let param = `${oneParam}&${twoParam}`;
        let url = `${getAPIEndpoint()}/${endpoint_path}/?${param}`
        return httpClient(url, { "method": METHODS.GET }).then(response => {
          if (response.json && response.json.count && response.json.count > 0) {
            if (response.json.results[0].id && data.id && response.json.results[0].id === data.id){
              resolve({})
            }
            else{
              let rejection = {};
              rejection[one[MODEL_FIELDS.NAME]] = one["reject"];
              rejection[two[MODEL_FIELDS.NAME]] = two["reject"];
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
