import * as Constants from '../_constants/index';
import { isObject, isString, isArray } from 'util';
import { toast } from 'react-toastify';
import radiamRestProvider from './radiamRestProvider';
import { httpClient } from '.';
import { GET_LIST, GET_ONE } from 'ra-core';
var cloneDeep = require('lodash.clonedeep');

//TODO: move '/api' to constants as the url for where the api is hosted.
export function getAPIEndpoint() {
  //TODO: this is just needed for local testing.  this should eventually be removed.
  if (window && window.location && window.location.port === '3000') {
    return `https://dev2.radiam.ca/api`; //TODO: will need updating after we're done with beta
    
  }
  return `/${Constants.API_ENDPOINT}`;
}

export function toastErrors(data) {
  if (isObject(data)) {
    for (var key in data) {
      // eslint-disable-next-line no-loop-func
      data[key].map(errType => {
        toast.error(key + ': ' + errType);
        return errType;
      });
    }
  } else if (isString(data)) {
    toast.error('Error: ' + data);
  } else if (isArray(data)) {
    data.map(item => {
      toast.error('Error: ', item);
      return item;
    });
  } else {
    console.log('Error in toastErrors - what type of object is this?');
    toast.error(data);
  }
}
export function getRelatedDatasets(setDatasets, record){
  return new Promise((resolve, reject) => {

    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    dataProvider(GET_LIST, Constants.models.DATASETS, 
      {filter: { project: record.id, is_active: true}, pagination: {page:1, perPage: 1000}, sort: {field: Constants.model_fields.TITLE, order: "DESC"}}).then(response => response.data)
    .then(assocDatasets => {
      resolve(setDatasets(assocDatasets))
    }).catch(err => reject(err))
  })
}

export function getFolderFiles(setFiles, folderPath, projectID){
  //TODO: we need some way to get a list of root-level folders without querying the entire set of files at /search.  this does not yet exist and is required before this element can be implemented.
  const params = {
    //folderPath may or may not contain an item itself.
    filter: { path_parent: folderPath },
    pagination: { page: 1, perPage: 1000 }, //TODO: this needs some sort of expandable pagination control for many files in a folder.
    sort: { field: 'last_modified', order: 'ASC' },
  };
  const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

  return new Promise((resolve, reject) => {
    
    dataProvider(
      GET_LIST,
      Constants.models.PROJECTS + '/' + projectID + '/search',
      params
    )
      .then(response => {
        let fileList = [];
        response.data.map(file => {
          const newFile = file;
          newFile.children = [];
          newFile.key = file.id;
          fileList = [...fileList, newFile];
          return file;
        });

        fileList.sort(function (a, b) {
          if (a.items) {
            if (b.items) {
              if (a.name < b.name) {
                return -1;
              }
              return 1;
            }
            return -1;
          } else {
            if (b.items) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            return 1;
          }
        });
        resolve(setFiles(fileList));
      })
      .catch(error => {
        //setStatus(status => (status = { loading: false, error: error }));
        console.log('error in fetch from API: ', error);
        reject(error)
      });
  });
}

export function getRootPaths(setListOfRootPaths, setStatus, projectID){
  const params = {
    pagination: { page: 1, perPage: 1000 }, //TODO: this needs some sort of expandable pagination control for many files in a folder.
    sort: { field: 'last_modified', order: 'ASC' },
  };

  const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

  return new Promise((resolve, reject) => {

    dataProvider(
      GET_LIST,
      Constants.models.PROJECTS + '/' + projectID + '/search',
      params
    )
      .then(response => {

        let rootList = {}

        response.data.map(file => {
          //new location that we haven't seen yet.  Add it to the dictionary.
          if (typeof file.location !== "undefined") {
            if (!rootList || !rootList[file.location]) {
              rootList[file.location] = file.path_parent;
            }
            //we've seen this location before.  Compare for the shorter string.
            else {
              //take the smaller value of the two.  They must share a parent path as they are in the same location.
              if (rootList[file.location].length > file.path_parent) {
                rootList[file.location] = file.path_parent
              }
            }
          }
          return file;
        })

        let rootPaths = []

        //create dummy root folder items.
        for (var key in rootList) {
          rootPaths.push({ id: `${key}${rootList[key]}`, key: `${key}${rootList[key]}`, path_parent: rootList[key], path: rootList[key] })
        }
        resolve(setListOfRootPaths(rootPaths))

      })
      .catch(error => {
        reject(setStatus({ loading: false, error: error }));
      });
  });
}

export function getGroupUsers(setGroupMembers, record) {
  return new Promise((resolve, reject) => {
    let groupUsers = []

    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    dataProvider(GET_LIST, Constants.models.ROLES).then(response => response.data)
    .then(groupRoles => {

        const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
        const { id, is_active } = record

        dataProvider(GET_LIST, Constants.models.GROUPMEMBERS, {
            filter: { group: id, is_active: is_active }, pagination: { page: 1, perPage: 1000 }, sort: { field: Constants.model_fields.USER, order: "DESC" }
        }).then(response => {
          return response.data})
            .then(groupMembers => {
                groupMembers.map(groupMember => {
                    dataProvider(GET_ONE, Constants.models.USERS, {
                        id: groupMember.user
                    }).then(response => {
                        return response.data
                    }).then(user => {
                        groupMember.user = user
                        groupMember.group_role = groupRoles.filter(role => role.id === groupMember.group_role)[0]
                        groupUsers = [...groupUsers, groupMember]
                        if (groupUsers.length === groupMembers.length){
                          setGroupMembers(groupMembers)
                        }

                    }).catch(err => reject("error in attempt to get researchgroup with associated groupmember: " + err))
                    return groupMember
                  })
                  return groupMembers
            })
            .catch(err => {
              reject("error in in get groupmembers: ", err)
            })
      return groupRoles
    })
  })
}

export function getUserGroups(record) {
  return new Promise((resolve, reject) => {
  
    let userGroupMembers = []

    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    dataProvider(GET_LIST, Constants.models.ROLES).then(response => response.data)
    .then(groupRoles => {

        const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
        const { id, is_active } = record

        dataProvider(GET_LIST, Constants.models.GROUPMEMBERS, {
            filter: { user: id, is_active: is_active }, pagination: { page: 1, perPage: 1000 }, sort: { field: Constants.model_fields.GROUP, order: "DESC" }
        }).then(response => {
          return response.data})
            .then(groupMembers => {
                groupMembers.map(groupMember => {
                    dataProvider(GET_ONE, Constants.models.GROUPS, {
                        id: groupMember.group
                    }).then(response => {
                        return response.data
                    }).then(researchgroup => {
                        groupMember.group = researchgroup
                        groupMember.group_role = groupRoles.filter(role => role.id === groupMember.group_role)[0]
                        userGroupMembers = [...userGroupMembers, groupMember]
                        if (userGroupMembers.length === groupMembers.length){
                          resolve(groupMembers)
                        }

                    }).catch(err => reject("error in attempt to get researchgroup with associated groupmember: " + err))
                    return groupMember
                  })
                  return groupMembers
            })
            .catch(err => {
              reject("error in in get groupmembers: ", err)
            })
      return groupRoles
    })
  })
}

export function submitObjectWithGeo(formData, geo, props, redirect=Constants.resource_operations.LIST ){
  console.log("formData heading into submitobjectwithgeo is: ", formData)
  if (formData.id){
    updateObjectWithGeo(formData, geo, props, redirect)
  }
  else{
    createObjectWithGeo(formData, geo, props);
  }
}

function updateObjectWithGeo(formData, geo, props){
  if (geo && Object.keys(geo).length > 0){
    formData.geo = geo
  }
  else{
      //api wont allow null geojson, so replace it with an empty list of features.
      formData.geo = {
          object_id: formData.id,
          content_type: props.resource.substring(0, props.resource.length - 1),
              geojson: {
                  type: "FeatureCollection",
                  features: []
              }
      }
  }
  props.save(formData, Constants.resource_operations.LIST);
}

export function createObjectWithGeo(formData, geo, props, redirect){
  let headers = new Headers({ "Content-Type": "application/json" });
  const token = localStorage.getItem(Constants.WEBTOKEN);
  
  if (token) {
      const parsedToken = JSON.parse(token);
      headers.set("Authorization", `Bearer ${parsedToken.access}`);

      console.log("formData sent in creation request is: ", formData)
      const request = new Request(
          getAPIEndpoint() + `/${props.resource}/`, {
              method: Constants.methods.POST,
              body: JSON.stringify({ ...formData }),
              headers: headers
          }
      )
      return fetch(request).then(response => {

          if (response.status >= 200 && response.status < 300) {
              return response.json();
          }
          throw new Error(response.statusText);
      })
      .then(data => {
        console.log("data in createobjectiwhtgeo is: ", data)
        //some data exists - add in the object ID before submission
        if (geo && geo.content_type) {
            data.geo = geo
            data.geo.object_id = data.id
        }
        else{ //no value - can't send null into geo, so make a basic structure.
            data.geo = {
                object_id: data.id,
                content_type: props.resource.substring(0, props.resource.length - 1),
                    geojson: {
                        type: "FeatureCollection",
                        features: []
                    }
            }
        }
        
        const request = new Request(
            getAPIEndpoint() + `/${props.resource}/${data.id}/`, {
                method: Constants.methods.PUT,
                body: JSON.stringify({ ...data }),
                headers: headers
            }
        )

        return fetch(request).then(response => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(data => {  
            console.log("data after update is: ", data)
            props.history.push(`${redirect}/`)
        })
      }
      )
      
  }
  else {
      //TODO: logout the user.
      toastErrors(
          Constants.warnings.NO_AUTH_TOKEN
      );
  }
}

export function getTranslation(
  translate,
  item,
  namespace = Constants.I18N_TLE
) {
  if (item !== translate(`${namespace}.${item}`)) {
    return translate(`${namespace}.${item}`);
  }
  //this should never happen unless someone puts a prefix server-side.
  else if (item !== translate(item)) {
    return translate(item);
  } else {
    console.error(`No translation found for ${item} in namespace ${namespace}`);
    return item;
  }
}

//note:  DateField/DateInput in react-admin does not display the following day until roughly 7:00 AM on that day.
function appendTimestamp(start = false) {
  if (start) {
    return 'T07:00:00.000000Z';
  } else {
    return 'T23:59:59.999999Z';
  }
}

export function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 KB';
  var k = 1024;
  var dm;
  if (!decimals) {
    dm = 3;
  } else {
    dm = decimals;
  }
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  // Skip bytes and do KB instead
  if (i === 0) {
    i = 1;
  }
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function translateResource(resource, untranslatedData, direction = 0) {
  let data = cloneDeep(untranslatedData);

  if (resource) {
    resource = resource.toUpperCase();
  }

  if (resource in Constants.fk_fields) {
    //this other version is for non-nullable foreign keys.
    if (Array.isArray(data)) {
      data.map(item => {
        Constants.fk_fields[resource].map(field => {
          //we now have both URLs AND sub-objects in the mix.  This has to be dealt with differently than how we were doing this before.
          if (item[field] && isObject(item[field])) {
            //TODO: something has to be done here, but I don't quite know what yet.
          }
          return field;
        });
        return item;
      });
    }

    //TODO: there is some issue with creation/editing of PARENT_GROUP, but I believe this is server-side, not client-side.  This will have to be researched further on monday.
    else {
      if (direction !== 1) {
        Constants.fk_fields[resource].map(field => {
          if (data[field]) {
            //currently this only holds single nested objects - the ID we want is in that URL.
            if (data[field] && isObject(data[field])) {
              //TODO: again, something has to be done here - i dont know what yet.
              console.log(
                'Single Object is Resource: ',
                resource,
                'field: ',
                field
              );
            }
          }
          return field;
        });
      }
    }
  }

  if (resource === 'DATASETS') {
    // If we are saving a project we need to unroll a set of data collection methods
    // or a set of data sensitivity levels from an array of ids to their own proper
    // subobjects. These are a special case as they are a many to many relationship
    // and require special handling with the api.
    if (!Array.isArray(data)) {
      if (direction === 1) {
        if (
          data.data_collection_method &&
          data.data_collection_method[0] &&
          !data.data_collection_method[0].hasOwnProperty(
            Constants.model_fields.ID
          )
        ) {
          data.data_collection_method = data.data_collection_method.map(
            method => {
              return {
                id: method,
              };
            }
          );
        }

        if (
          data.sensitivity_level &&
          data.sensitivity_level[0] &&
          !data.sensitivity_level[0].hasOwnProperty(Constants.model_fields.ID)
        ) {
          data.sensitivity_level = data.sensitivity_level.map(sensitivity => {
            return {
              id: sensitivity,
            };
          });
        }
      }
      //the data format that is expected in the 'multi select array' fields is just an array of items, which then are queried to the server for full details.
      //django sends us objects instead of this, and as a result these values must be filtered out.
      //TODO: this needs to be tested thoroughly.
      else {
        if (data.sensitivity_level && isObject(data.sensitivity_level[0])) {
          data.sensitivity_level = data.sensitivity_level.map(item => item.id);
        }
        if (
          data.data_collection_method &&
          isObject(data.data_collection_method[0])
        ) {
          data.data_collection_method = data.data_collection_method.map(
            item => item.id
          );
        }
      }
    }
  }

  if (data) {
    //turn this date into a timestamp, since react_admin seems to only want to send dates.  Defaulting to end of the selected day.
    if (data.date_starts) {
      data.date_starts = translateDates(data.date_starts, 'date_starts');
    }
    //turn this date into a timestamp, since react_admin seems to only want to send dates.  Defaulting to end of the selected day.
    if (data.date_expires) {
      data.date_expires = translateDates(data.date_expires, 'date_expires');
    }
  }

  return data;
}

//TODO: this is meant to replace the date section of translateResource above
export function translateDates(date, type, direction = 1) {
  if (direction) {
    if (type === 'date_expires' && date.length < 11) {
      date += appendTimestamp();
    } else if (type === 'date_starts' && date.length < 11) {
      date += appendTimestamp(true);
    }
  }
  //TODO: need to do something downstream later.
  return date;
}
