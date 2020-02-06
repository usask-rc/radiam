//funcs.jsx
import { API_ENDPOINT, ROLE_USER, MODELS, MODEL_FIELDS, WARNINGS, WEBTOKEN, RESOURCE_OPERATIONS, METHODS, I18N_TLE, FK_FIELDS } from '../_constants/index';
import { isObject, isString, isArray } from 'util';
import { toast } from 'react-toastify';
import radiamRestProvider from './radiamRestProvider';
import { httpClient } from '.';
import { GET_LIST, GET_ONE, CREATE, UPDATE } from 'ra-core';
import moment from 'moment';
var cloneDeep = require('lodash.clonedeep');

const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);


//TODO: move '/api' to constants as the url for where the api is hosted.
export function getAPIEndpoint() {
  //TODO: this is just needed for local testing.  this should eventually be removed.
  if (window && window.location && window.location.port === '3000') {
    
    //return `https://dev2.radiam.ca/api`; //TODO: will need updating after we're done with beta
    //return `http://dev7.radiam.ca:8100/api`; //TODO: will need updating after we're done with beta
    return `http://localhost:8100/api`; //TODO: will need updating after we're done with beta
  }
  
  return `/${API_ENDPOINT}`;
}

//given a group id and our cookies, can we edit this value?
export function isAdminOfAParentGroup(group_id){
  return new Promise((resolve, reject) => {
    if (!group_id){
      reject("No Group ID")
    }

    const user = JSON.parse(localStorage.getItem(ROLE_USER))
    if (user){
      if (user.is_admin){
      resolve(true)
      }
    }else{
      reject("No User Cookie")
    }

    getParentGroupList(group_id).then(data => {
      data.map(group => {
        for (var i = 0; i < user.groupAdminships.length; i++){
          if (group.id === user.groupAdminships[i]){
            resolve(true)
          }
        }
      })
      resolve(false)

    }).catch(err => {
      console.error("isadminofaparentgroup error: ",err)
      reject("Invalid Key")
    })
  })
};

export function getUserRoleInGroup(group){ //given a group ID, determine the current user's status in said group
  //given the cookies available, return the highest level that this user could be.  Note that this is only used to display first time use instructions.
  const user = JSON.parse(localStorage.getItem(ROLE_USER))
  if (user){
    if (group !== null){
      if (user.groupAdminships && group in user.groupAdminships){
        return "group_admin"
      }
      else if (user.dataManagerships && group in user.dataManagerships){
        return "data_manager"
      }
    }
    return "user"
  }
  //no cookie or group
  else if (!user && !group){
    return "anonymous"
  }
  else{
    //punt to front page - no user cookie available
    console.error("No User Cookie Detected - Returning to front page")
    window.location.hash = "#/login"
  }
}

//this gets all projects that the user has worked on.
//we want to get all (recent) files in a project and display them in an expandable listview.
//TODO: handle potential setstate on unmounted component
export function getRecentProjects(count=1000) {

  return new Promise((resolve, reject) => {
      
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const now = moment();

    dataProvider(GET_LIST, MODELS.PROJECTS, {
      order: { field: MODEL_FIELDS.NAME },
      pagination: { page: 1, perPage: count }, //TODO: Probably needs pagination.
    })
      .then(response => response.data)
      .then(projects => {

        const promises = []
        projects.map(project => {
          promises.push(getProjectData({id: project.id,
            sort: {
              field: MODEL_FIELDS.INDEXED_DATE,
              order: '-',
            },
            pagination: {
              page: 1,
              perPage: 1,
            }
          }).then((data) => {
            if (data.files.length > 0){
              const newProject = project
              newProject.recentFile = data.files[0] //TODO:  this is available to us but not currently used.
              newProject.nbFiles = data.nbFiles
              const timeDiff = now.diff(moment(newProject.recentFile.indexed_date).toISOString(), "days")
              newProject.daysOld = timeDiff
              newProject.recentFile.timeAgo = `${timeDiff} days ago`
              project = newProject
            }
            return data
          }))
          return project
        });
      Promise.all(promises).then(data => {
        let hasFiles = false
        projects.map(project => {
          if (project.recentFile){
            hasFiles = true
          }
        })
        resolve({projects: projects, loading: false, hasFiles: hasFiles})
      }).catch(err => {
        reject(err)
      })
    });
  })
};

export function getMaxUserRole(){

  const user = JSON.parse(localStorage.getItem(ROLE_USER))
  if (user){
    if (user.is_admin){
      return "admin"
    }
    else if (user.is_group_admin){
      return "group_admin"
    }
    else if (user.is_data_manager){
      return "data_manager" 
    }
    return "user"
  }else{
    //punt to front page - no user cookie available
    console.error("No User Cookie Detected - Returning to front page")
    window.location.hash = "#/login"
    return "anonymous"
  }
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
    toast.error(data);
  }
}

//TODO: this can be reused elsewhere in the map views.
export function getFirstCoordinate(layer) {
  if (layer && layer.feature) {
    const layerGeo = layer.feature.geometry;
    if (layerGeo && layerGeo.type && layerGeo.coordinates){
      switch (layerGeo.type) {
        case 'Point':
          if (layerGeo.coordinates.length === 2){
            return [layerGeo.coordinates[1], layerGeo.coordinates[0]];
          }
          break;
        case 'MultiPoint':
        case 'LineString':
          if (layerGeo.coordinates[0].length === 2){
            return [layerGeo.coordinates[0][1], layerGeo.coordinates[0][0]];
          }
          break;
        case 'MultiLineString':
        case 'Polygon':
          if (layerGeo.coordinates[0][0].length === 2){
            return [layerGeo.coordinates[0][0][1], layerGeo.coordinates[0][0][0]];
          }
          break;
        case 'MultiPolygon':
          if (layerGeo.coordinates[0][0][0].length === 2){
            return [
              layerGeo.coordinates[0][0][0][1],
              layerGeo.coordinates[0][0][0][0],
            ];
          }
          break;
        default:
          console.error(
            'Invalid feature sent to getFirstCoordinate. Layer: ',
            layer
          );
      }
    }
  }
  return false
}

export function getFolderFiles(
  params,
  type,
  dataType="projects"
) {

  //TODO: we need some way to get a list of root-level folders without querying the entire set of files at /search.  this does not yet exist and is required before this element can be implemented.
  const queryParams = {
    //folderPath may or may not contain an item itself.
    filter: { path_parent: params.folderPath, type:type },
    pagination: { page: params.page, perPage: params.numFiles },
    sort: { field: params.sortBy, order: params.order },
    q: params.q,
  };

  console.log("getFolderFiles queryParams: ", queryParams, "get_files")

  return new Promise((resolve, reject) => {
    dataProvider(
      'GET_FILES',
      dataType + '/' + params.projectID,
      queryParams
    )
      .then(response => {

        console.log("getfolderfiles response: ", response)
        let fileList = [];
        response.data.map(file => {
          const newFile = file;
          newFile.children = [];
          newFile.key = file.id;
          fileList = [...fileList, newFile];
          return file;
        });

        resolve({
          files: fileList,
          total: response.total,
          next: response.next,
        });
      })
      .catch(err => {
        console.log("folder files data error: ", err)
        reject(err);
      });
  });
}

export function getRelatedDatasets(projectID) {
  return new Promise((resolve, reject) => {
    dataProvider(GET_LIST, MODELS.DATASETS, {
      filter: { project: projectID, is_active: true },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: MODEL_FIELDS.TITLE, order: 'DESC' },
    })
      .then(response => response.data)
      .then(assocDatasets => {
        resolve(assocDatasets);
      })
      .catch(err => reject(err));
  });
}

//gets the root folder paths for a given project
export function getRootPaths(projectID, dataType="projects") {
  const params = {
    pagination: { page: 1, perPage: 1000 }, //TODO: we may want some sort of expandable option for folders, but I'm not sure this is necessary.
    sort: { field: 'last_modified', order: '' },
    filter: { type: 'directory' },
  };

  return new Promise((resolve, reject) => {
    dataProvider(
      'GET_FILES',
      dataType + '/' + projectID,
      params
    )
      .then(response => {
        let rootList = {};

        response.data.map(file => {
          //find the root paths by taking the smallest length parent paths at each location
          if (typeof file.location !== 'undefined') {
            if (!rootList || !rootList[file.location]) {
              rootList[file.location] = file.path_parent;
            } else {
              
              if (rootList[file.location].length > file.path_parent.length) {
                rootList[file.location] = file.path_parent;
              }
            }
          }
          return file;
        });

        let rootPaths = [];

        //create dummy root folder items for display
        for (var key in rootList) {
          rootPaths.push({
            id: key,
            key: `${key}${rootList[key]}`,
            path_parent: rootList[key],
            path: rootList[key],
            location: key,
          });
        }
        console.log("root paths being returned are: ", rootPaths)
        resolve(rootPaths);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getProjectData(params, dataType="projects") {
  //get only folders if true, otherwise get only files
  
  return new Promise((resolve, reject) => {
    dataProvider(
      'GET_FILES',
      dataType + '/' + params.id,
      params
    )
      .then(response => {
        resolve({ files: response.data, nbFiles: response.total });
      })
      .catch(err => {
        reject(err);
      });
  });
}

//given some group, return all of its parent groups.
export function getParentGroupList(group_id, groupList = []){
  return new Promise((resolve, reject) => {
    //resolve upon having all parent groups
    dataProvider(GET_ONE, MODELS.GROUPS, {id: group_id})
    .then(response => {
      groupList.push(response.data)
      if (response.data.parent_group === null){
        resolve(groupList)
      }else{
        getParentGroupList(response.data.parent_group, groupList).then(data => {
          resolve(groupList)
        })
      }
      return response.data
    })
    .catch(err => {
      console.log("getparentgrouplist err: ", err)
      reject(err)
    })
  })
}

export function getGroupData(group_id) {
  return new Promise((resolve, reject) => {
    //get this group's details, then ascend if it has a parent.
    dataProvider(GET_ONE, MODELS.GROUPS, { id: group_id })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

//get a single user
//TODO: merge into a greater `get one item` function
export function getUserDetails(userID){
  return new Promise((resolve, reject) => {
    dataProvider("GET_ONE", MODELS.USERS, {id: userID})
    .then(response => {
      resolve(response.data)
    }).catch(err => reject(err))
  })
}

export function getCurrentUserDetails() {
  return new Promise((resolve, reject) => {
    dataProvider('CURRENT_USER', MODELS.USERS)
      .then(response => {
        const localID = JSON.parse(localStorage.getItem(ROLE_USER))
          .id;

        if (response.data.id === localID) {
          resolve(response.data);
        } else {
          reject({ redirect: true });
          toastErrors(WARNINGS.NO_AUTH_TOKEN);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

//TODO: this can probably be consolidated with getGroupMembers
//returns a list of users in said group
export function getUsersInGroup(record) {
  return new Promise((resolve, reject) => {
    let groupUsers = [];
    const { id, is_active } = record;

    dataProvider(GET_LIST, MODELS.GROUPMEMBERS, {
      filter: { group: id, is_active: is_active },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: MODEL_FIELDS.USER, order: 'DESC' },
    })
      .then(response => {
        
        if (response && response.total === 0) {
          resolve([]);
        }
        return response.data;
      })
      .then(groupMembers => {
        const promises = []
        groupMembers.map(groupMember => {
          promises.push(getUserDetails(groupMember.user).then(user => {
            groupMember.user = user
            groupUsers.push(user)
            return groupMember
          }))
        });

        Promise.all(promises).then(data => {
          console.log("promise all data is: ", data)
          resolve(groupUsers)
          return data
        })
        .catch(err => reject(err))

        return groupMembers;
      })
      .catch(err => reject('error in attempt to fetch groupMembers: ', err));
  });
}

//given a group, return a list of groupmembers with full User and Role data included.
export function getGroupMembers(record) {
  return new Promise((resolve, reject) => {
    dataProvider(GET_LIST, MODELS.ROLES)
      .then(response => response.data)
      .then(groupRoles => {
        const { id, is_active } = record;

        dataProvider(GET_LIST, MODELS.GROUPMEMBERS, {
          filter: { group: id, is_active: is_active },
          pagination: { page: 1, perPage: 1000 },
          sort: { field: MODEL_FIELDS.USER, order: 'DESC' },
        })
          .then(response => {
            return response.data;
          })
          .then(groupMembers => {

            const promises = []

            groupMembers.map(groupMember => {
              promises.push(getUserDetails(groupMember.user).then(user => {
                groupMember.user = user
                groupMember.group_role = groupRoles.filter(role => role.id === groupMember.group_role)[0];
                return user
              }))
            });
            Promise.all(promises).then(data => {
              console.log("in promise all data is: ", data, "groupmembers is: ", groupMembers)
              resolve(groupMembers)
            }).catch(err => reject(err))

            return groupMembers;
          })
          .catch(err => {
            reject('error in in get groupmembers: ', err);
          });
        return groupRoles;
      });
  });
}

//given a user, return a list of groupmember entries containing the groups they are in along with their role within it.
export function getUserGroups(record) {
  return new Promise((resolve, reject) => {
    dataProvider(GET_LIST, MODELS.ROLES)
      .then(response => response.data)
      .then(groupRoles => {
        const { id, is_active } = record;
        
        dataProvider(GET_LIST, MODELS.GROUPMEMBERS, {
          filter: { user: id, is_active: is_active },
          pagination: { page: 1, perPage: 1000 },
          sort: { field: MODEL_FIELDS.GROUP, order: 'DESC' },
        })
        .then(response => {
          return response.data;
        })
        .then(groupMembers => {

          const promises = []
          groupMembers.map(groupMember => {

            promises.push(getGroupData(groupMember.group).then(researchgroup => {
              console.log("data returned from getgroupdata in getusergroups is: ", researchgroup)
              groupMember.group = researchgroup
              groupMember.group_role = groupRoles.filter(role => role.id === groupMember.group_role)[0];
              return researchgroup
            }))
            return groupMember
          });

          Promise.all(promises).then(data => {
            resolve(groupMembers)
          }).catch(err => reject(err))
          return groupMembers;
        })
        .catch(err => {
          reject('error in in get groupmembers: ', err);
        });
        return groupRoles;
      });
  });
}

//TODO: contact candidates have to be in a gross format to work with the existing drop down list system.
export function getPrimaryContactCandidates(groupList) {
  let contactCandidates = {}
  return new Promise((resolve, reject) => {
    const promises = []
    groupList.map(group => {
      promises.push(getUsersInGroup(group).then(data => {
        data.map(item => {
          contactCandidates[item.id] = item;
          return item;
        })
      }))
    })

    Promise.all(promises).then(data => {
      const candidateList = []
      Object.keys(contactCandidates).map(key => candidateList.push(contactCandidates[key]))
      resolve(candidateList)
    }).catch(err => reject(err))
  })
}

//TODO: convert to promise / callback system
//TODO: do the above
export function submitObjectWithGeo(
  formData,
  geo,
  props,
  redirect = RESOURCE_OPERATIONS.LIST,
  inModal=false
) {
  console.log('formData heading into submitobjectwithgeo is: ', formData);
  if (formData.id) {
    updateObjectWithGeo(formData, geo, props, redirect);
  } else {
    createObjectWithGeo(formData, geo, props, inModal);
  }
}

function updateObjectWithGeo(formData, geo, props) {
  if (geo && Object.keys(geo).length > 0) {
    formData.geo = geo;
  } else {
    //api wont allow null geojson, so replace it with an empty list of features.
    formData.geo = {
      object_id: formData.id,
      content_type: props.resource.substring(0, props.resource.length - 1),
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };
  }
  if (props.save){
    props.save(formData, RESOURCE_OPERATIONS.LIST);
  }
  else{
    putObjectWithoutSaveProp(formData, props.resource)
  }
}

export function putObjectWithoutSaveProp(formData, resource){
  return new Promise((resolve, reject) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const params = {id: formData.id, data: formData, resource:resource }
  
    dataProvider(UPDATE, resource, params).then(response => {
        resolve(response)
    }).catch(err => {
        reject(err)
    })
  })
}

//for the rare cases that we don't have the Save prop and want to POST some model item
export function postObjectWithoutSaveProp(formData, resource){
  return new Promise((resolve, reject) => {

    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const params = { data: formData, resource:resource }

    dataProvider(CREATE, resource, params).then(response => {
        resolve(response)
    }).catch(err => {
        reject(err)
    })
  })
}

//TODO: When creating Projects, there is a failure somewhere here.
export function createObjectWithGeo(formData, geo, props, inModal) {
  console.log("createobjectwithgeo called with parameters: ", formData, geo, props, inModal)
  let headers = new Headers({ 'Content-Type': 'application/json' });
  const token = localStorage.getItem(WEBTOKEN);

  if (token) {
    const parsedToken = JSON.parse(token);
    headers.set('Authorization', `Bearer ${parsedToken.access}`);

    //POST the new object, then update it immediately afterwards with any geoJSON it carries. //TODO: this props.resource is undefined with the current stepper
    const request = new Request(getAPIEndpoint() + `/${props.resource}/`, {
      method: METHODS.POST,
      body: JSON.stringify({ ...formData }),
      headers: headers,
    });

    return fetch(request)
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response.json();
        }
        throw new Error(response.statusText); //error here when creating dataset nested in project
      })
      .then(data => {
        console.log('data in createobjectwithgeo is: ', data);
        //some data exists - add in the object ID before submission
        if (geo && geo.content_type) {
          data.geo = geo;
          data.geo.object_id = data.id;
        } else {
          //no value - can't send null into geo, so make a basic structure.
          data.geo = {
            object_id: data.id,
            content_type: props.resource.substring(
              0,
              props.resource.length - 1
            ),
            geojson: {
              type: 'FeatureCollection',
              features: [],
            },
          };
        }

        //the PUT request to update this object with its geoJSON
        const request = new Request(
          getAPIEndpoint() + `/${props.resource}/${data.id}/`,
          {
            method: METHODS.PUT,
            body: JSON.stringify({ ...data }),
            headers: headers,
          }
        );

        return fetch(request)
          .then(response => {
            if (response.status >= 200 && response.status < 300) {
              return response.json();
            }
            throw new Error(response.statusText);
          })
          .then(data => {
            console.log("Data from geoJSON update: ", data);
            if (!inModal){ //stop redirect if in a modal
              props.history.push(`/${props.resource}`);
            }
          });
      }).catch(err => {
        console.log("err in POST new object with geo: ", err, formData, geo, props)
      })
      ;
  } else {
    //TODO: logout the user.
    toastErrors(WARNINGS.NO_AUTH_TOKEN);

    if (props && props.history) {
      props.history.push(`/login`);
    } else {
      console.error(
        'no props sent to createobjectwithgeo - how did this happen?  formData: ',
        formData
      );
    }
  }
}

export function getTranslation(
  translate,
  item,
  namespace = I18N_TLE
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

  if (resource in FK_FIELDS) {
    //this other version is for non-nullable foreign keys.
    if (Array.isArray(data)) {
      data.map(item => {
        FK_FIELDS[resource].map(field => {
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
        FK_FIELDS[resource].map(field => {
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
            MODEL_FIELDS.ID
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
          !data.sensitivity_level[0].hasOwnProperty(MODEL_FIELDS.ID)
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
