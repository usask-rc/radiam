//funcs.jsx
import { API_ENDPOINT, ROLE_USER, ROLES, MODELS, MODEL_FIELDS, WARNINGS, WEBTOKEN, RESOURCE_OPERATIONS, METHODS, I18N_TLE, FK_FIELDS } from "../_constants/index";
import { isObject, isString, isArray } from "util";
import { toast } from "react-toastify";
import radiamRestProvider from "./radiamRestProvider";
import { httpClient } from ".";
import { GET_LIST, GET_ONE, CREATE, UPDATE } from "ra-core";
import moment from "moment";

var cloneDeep = require("lodash.clonedeep");

const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

//returns the endpoint set in constants
export function getAPIEndpoint() {
  return `https://dev2.radiam.ca/api`
  return `/${API_ENDPOINT}`;
}

//for some dataset key, return a generated export value
export function getExportKey(id, type){
  return new Promise((resolve, reject) => {
    const params = {id: id}
    dataProvider("EXPORT", type, params).then(data => {
      resolve(data)
    }).catch(err => reject(err))
  })
}

//for some export key and dataset values, request a download from the API.
export function requestDownload(key, data){
  const {id, title} = data

  return new Promise((resolve, reject) => {
      const token = localStorage.getItem(WEBTOKEN);
      const parsedToken = JSON.parse(token);

      //TODO: I couldn't grok a way to do this with the dataprovider. this is probably something to change - but it works.
      fetch(`${getAPIEndpoint()}/exportrequests/${key.data}/download`, 
      {method: "GET", headers: {
        Authorization: `Bearer ${parsedToken.access}`,
        'Content-Type': 'application/zip',
      }}).then(response => response.blob()).then(blob => {
      const now = moment().format("YYYY-MM-DD")
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}_${now}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      resolve()
    }).catch(err => reject(err))
  })
}

//there are various pages across the app that use this to have their edit button gated off.
//note that they have their edit functionality gated on the API side, but we need a way to block it from appearing to users who are not authenticated.
export function isAdminOfAParentGroup(group_id){
  return new Promise((resolve, reject) => {
    const user = JSON.parse(localStorage.getItem(ROLE_USER))
    if (!group_id || !user){
      reject("User Not Authenticated")
    }
    else if (user.is_admin){ //sysadmins have blanket permissions regardless of group
      resolve(true)
    }

    getParentGroupList(group_id).then(data => {
      data.map(group => {

        //NOTE: this should fail if the user is made admin of a parent group and then accesses said page without logging out and back in
        for (var i = 0; i < user.groupAdminships.length; i++){
          if (group.id === user.groupAdminships[i]){
            resolve(true)
          }
        }
        return group
      })
      resolve(false)
    }).catch(err => {
      reject(err)
    })
  })
};

//retrieve a list of group IDs, retrieve a list of users with their Role and Group data attached.
export const getUsersInMyGroups = (groupIDs) => {
  return new Promise((resolve, reject) => {
      if (!groupIDs){
          resolve([])
      }
      const promises = []
      const groupPromises = []

      groupIDs.map(groupID => {
        groupPromises.push(getGroupData(groupID).then(groupData => {
          return groupData
        }))
        return groupID
      })

      Promise.all(groupPromises).then(groupList => {
        groupList.map(group => {
          return promises.push(getGroupMembers(group).then(groupData => {
            return groupData
          }))
        })
        return groupList
      })
      .then((groupRecords) => {
        Promise.all(promises).then(userLists => {
          const usersInMyGroups = {}
          userLists.map(userList => {
            userList.map(record => {
              //this stuff is largely used for the dashboard display
              record.group.since = record.date_created
              record.group.expires = record.date_expires
              record.group.group_role = record.group_role //a role is associated with the user-group relationship

              //a filtering mechanism to remove duplicate users and listify them
              if (usersInMyGroups.hasOwnProperty(record.user.id))
              {
                usersInMyGroups[record.user.id].group.push(record.group)
              }
              else{
                usersInMyGroups[record.user.id] = record
                usersInMyGroups[record.user.id].group = [record.group]
              }
              return record
            })
            return userList
          })
          resolve(usersInMyGroups)
          return userLists
        })
        .catch(err => reject(err))
        return groupRecords
      })
    })
  }

//should really be named 'get all projects'
//gets all projects with their most recent file data.
export function getRecentProjects(count=1000) {
  return new Promise((resolve, reject) => {
    const now = moment();
    dataProvider(GET_LIST, MODELS.PROJECTS, {
      order: { field: MODEL_FIELDS.NAME },
      pagination: { page: 1, perPage: count },
    })
      .then(response => {
        const projects = response.data
        const promises = []

        projects.map(project => {
          promises.push(getProjectData({id: project.id,
            sort: {
              field: MODEL_FIELDS.INDEXED_DATE,
              order: "-",
            },
            pagination: {
              page: 1,
              perPage: 1,
            }
          }).then((data) => {
            if (data.files.length > 0){
              const newProject = project
              newProject.recentFile = data.files[0]
              newProject.nbFiles = data.nbFiles

              //TODO: move down to the component level?
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
          return project
        })
        resolve({projects: projects, loading: false, hasFiles: hasFiles})
        return data
      }).catch(err => {
        reject(err)
      })
      return response
    });
  })
};

//determine the user's highest permission level - used for warning / info cards on the front page.
export function getMaxUserRole(){
  const user = JSON.parse(localStorage.getItem(ROLE_USER))
  if (user){
    if (user.is_admin){
      return ROLES.ADMIN
    }
    else if (user.is_group_admin){
      return ROLES.GROUP_ADMIN
    }
    else if (user.is_data_manager){
      return ROLES.DATA_MANAGER 
    }
    return ROLES.USER
  }else{
    //punt to front page - no user cookie available
    window.location.hash = "/#/login"
    return ROLES.ANONYMOUS
  }
}

//react-admin doesnt have enough toasty popups - this function is used to replace areas where it is lacking.
export function toastErrors(data) {
  if (isObject(data)) {
    for (var key in data) {
      // eslint-disable-next-line no-loop-func
      data[key].map(errType => {
        toast.error(key + ": " + errType);
        return errType;
      });
    }
  } else if (isString(data)) {
    toast.error("Error: " + data);
  } else if (isArray(data)) {
    data.map(item => {
      toast.error("Error: ", item);
      return item; 
    });
  } else {
    toast.error(data);
  }
}

//retrieve the first coordinate of the geojson data to help us centre the map
export function getFirstCoordinate(layer) {
  if (layer && layer.feature) {
    const layerGeo = layer.feature.geometry;
    if (layerGeo && layerGeo.type && layerGeo.coordinates){
      switch (layerGeo.type) {
        case "Point":
          if (layerGeo.coordinates.length === 2){
            return [layerGeo.coordinates[1], layerGeo.coordinates[0]];
          }
          break;
        case "MultiPoint":
        case "LineString":
          if (layerGeo.coordinates[0].length === 2){
            return [layerGeo.coordinates[0][1], layerGeo.coordinates[0][0]];
          }
          break;
        case "MultiLineString":
        case "Polygon":
          if (layerGeo.coordinates[0][0].length === 2){
            return [layerGeo.coordinates[0][0][1], layerGeo.coordinates[0][0][0]];
          }
          break;
        case "MultiPolygon":
          if (layerGeo.coordinates[0][0][0].length === 2){
            return [
              layerGeo.coordinates[0][0][0][1],
              layerGeo.coordinates[0][0][0][0],
            ];
          }
          break;
        default:
          console.error("Invalid feature sent to getFirstCoordinate. Layer: ", layer);
      }
    }
  }
  return false
}

//given a parent path in a project, find all files in that directory.
export function getFolderFiles(
  params,
  type,
  dataType="projects",
) {

  const queryParams = {
    filter: { path_parent: params.folderPath, type:type, location:params.location },
    pagination: { page: params.page, perPage: params.numFiles },
    sort: { field: params.sortBy, order: params.order },
    q: params.q,
  };

  console.log("queryParams in getfolderfiles: ", queryParams)

  return new Promise((resolve, reject) => {
    dataProvider(
      "GET_FILES",
      dataType + "/" + params.projectID,
      queryParams
    )
      .then(response => {
        let fileList = [];

        console.log("getfolderfiles files: ", response.data)
        response.data.map(file => {
          const newFile = file;
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
        reject(err);
      });
  });
}

//get all datasets related to a project.  Would be strange to require pagination on this.
export function getRelatedDatasets(projectID) {
  return new Promise((resolve, reject) => {
    dataProvider(GET_LIST, MODELS.DATASETS, {
      filter: { project: projectID, is_active: true },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: MODEL_FIELDS.TITLE, order: "DESC" },
    })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

//this is the backup solution for showing dataset files.  since i dont know where they are rooted, i have to search from root.
//TODO: implement dataset query the same way as Projects Files are queried - this should now be possible, supposing that the dataset's searchmodel contains both a location and a wildcard for path_parent.
export function getRootPaths_old(projectID, dataType="projects" ){
  return new Promise((resolve, reject) => {
    
    const params_allFiles={
      pagination: { page: 1, perPage: 1000000},
      sort: {field: "path_parent.keyword", order: "DESC"},
    }
    dataProvider("GET_FILES", `${dataType}/${projectID}`, params_allFiles).then(allFiles => {
      //get root paths by location

      const rootPaths = {}
      allFiles.data.map(file => {
        if (file.location in rootPaths){
          if (file.path_parent.length < rootPaths[file.location].path_parent.length){
            rootPaths[file.location] = file
          }
        }else{
          rootPaths[file.location] = file
        }
        return file
      })
      //return {location: location, path_parent: ".", locationpromise: getLocationData(location)}
      const rootPathList = []
      Object.keys(rootPaths).map(key => {
        rootPathList.push({
          location: key, path_parent: rootPaths[key].path_parent, locationpromise: getLocationData(key)
        })
      })

      resolve(rootPathList)
    }).catch(err => reject(err))
  })
}

//assumption: "path_parent" of all locations is "." with the current agent as of 03/18/2020
export function getRootPaths(projectID, dataType="projects", searchModel={}) {

    return new Promise((resolve, reject) => {
    
      const params = {
        pagination: {page: 1, perPage: 1000},
        filter: { project: projectID },
      }

      dataProvider(GET_LIST, "locationprojects", params).then(response => {
        console.log("getlist of locationprojects response: ", response)
        //Filter possible duplicates using a set

        let locationSet = new Set()
        response.data.forEach(locationproject => {
          locationSet.add(locationproject.location)
        })
        locationSet = [...locationSet]
        return locationSet
      }).then(locations => {
        //if (dataType === "projects"){
        return locations.map(location => {
          return {location: location, path_parent: ".", locationpromise: getLocationData(location)}
        })
      }).then(data => resolve(data))
  });
}

//a test func to get all files
export function getAllProjectData(projectID, type){
  const params = {
    pagination: { page: 1, perPage: 10000 },
    type: "file"
  }
  return new Promise((resolve, reject) => {
    dataProvider("GET_FILES", `${type}/` + projectID, params).then(response => {
      console.log("response from getallprojectdata is: ", response)
      resolve(response.data)
    })
  })
}

export function getProjectData(params, dataType="projects") {
  //get only folders if true, otherwise get only files
  
  return new Promise((resolve, reject) => {
    dataProvider(
      "GET_FILES",
      dataType + "/" + params.id,
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

export function getLocationData(location_id) {
  return new Promise((resolve, reject) => {
    dataProvider(GET_ONE, MODELS.LOCATIONS, { id: location_id })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

//given some group, return all of its parent groups.  used to mark access to certain buttons / forms.
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
      console.error("getparentgrouplist err: ", err)
      reject(err)
    })
  })
}

export function getGroupData(group_id) {
  return new Promise((resolve, reject) => {
    //get this group"s details, then ascend if it has a parent.
    dataProvider(GET_ONE, MODELS.GROUPS, { id: group_id })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getUserDetails(userID){
  return new Promise((resolve, reject) => {
    dataProvider("GET_ONE", MODELS.USERS, {id: userID})
    .then(response => {
      resolve(response.data)
    }).catch(err => reject(err))
  })
}

export function getCurrentUserID(){
  //return user id from local storage
  const user = JSON.parse(localStorage.getItem(ROLE_USER))
  if (user){
    return user.id
  }
  //reject and send to login page -- no login cookie
  window.location.hash = "#/login"
  return false
}

export function getCurrentUserDetails() {
  return new Promise((resolve, reject) => {
    dataProvider("CURRENT_USER", MODELS.USERS)
      .then(response => {
        if (response && response.data){
          resolve(response.data);
        }
          else {
          reject({ redirect: true });
          toastErrors(WARNINGS.NO_AUTH_TOKEN);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

//TODO: Consolidate with getGroupMembers
export function getUsersInGroup(record) {
  return new Promise((resolve, reject) => {
    let groupUsers = [];
    const { id, is_active } = record;

    dataProvider(GET_LIST, MODELS.GROUPMEMBERS, {
      filter: { group: id, is_active: is_active },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: MODEL_FIELDS.USER, order: "DESC" },
    })
      .then(response => {
        if (response.total === 0) {
          resolve([])
        }
        const groupMembers = response.data
        const promises = []
        groupMembers.forEach(groupMember => {
          promises.push(getUserDetails(groupMember.user).then(user => {
            groupMember.user = user
            user.group = [record]
            groupUsers.push(user)
            return groupMember
          }))
        });

        Promise.all(promises).then(data => {
          resolve(groupUsers)
          return data
        })
        .catch(err => reject(err))

        return groupMembers;
      })
      .catch(err => reject("error in attempt to fetch groupMembers: ", err));
  });
}

//given a group, return a list of groupmembers with full User and Role data included.
export function getGroupMembers(record) {
  return new Promise((resolve, reject) => {
    dataProvider(GET_LIST, MODELS.ROLES)
      .then(response => {
        const groupRoles = response.data
        const { id, is_active } = record;

        dataProvider(GET_LIST, MODELS.GROUPMEMBERS, {
          filter: { group: id, is_active: is_active },
          pagination: { page: 1, perPage: 1000 },
          sort: { field: MODEL_FIELDS.USER, order: "DESC" },
        })
          .then(response2 => {
            const groupMembers = response2.data
            const promises = []

            groupMembers.forEach(groupMember => {
              promises.push(getUserDetails(groupMember.user).then(user => {
                groupMember.user = user
                groupMember.group_role = groupRoles.filter(role => role.id === groupMember.group_role)[0];
                groupMember.group = record
                return user
              }))
            });
            Promise.all(promises).then(data => {
              resolve(groupMembers)
              return data
            }).catch(err => reject(err))

            return groupMembers;
          })
          .catch(err => {
            reject("error in in get groupmembers: ", err);
          });
        return groupRoles;
      });
  });
}

//return a list of groups that the user is in
export function getMyGroupIDs(){
  return new Promise((resolve, reject) => {
    
  const user = JSON.parse(localStorage.getItem(ROLE_USER))

  dataProvider(GET_LIST, MODELS.GROUPMEMBERS, {
    filter: {user: user.id},
    pagination: { page: 1, perPage: 1000 },
    sort: { field: MODEL_FIELDS.USER, order: "DESC" },
  }).then(response => {
    const groupList = []
    response.data.forEach(groupMember => {
      groupList.push(groupMember.group)
    })
    resolve(groupList)
  }).catch(err => reject(err))
})
}

//given a user, return a list of groupmember entries containing the groups they are in along with their role within it.
export function getUserGroups(record) {
  return new Promise((resolve, reject) => {
    dataProvider(GET_LIST, MODELS.ROLES)
      .then(response => {
        const groupRoles = response.data
        const { id, is_active } = record;
        
        dataProvider(GET_LIST, MODELS.GROUPMEMBERS, {
          filter: { user: id, is_active: is_active },
          pagination: { page: 1, perPage: 1000 },
          sort: { field: MODEL_FIELDS.GROUP, order: "DESC" },
        })
        .then(response2 => {
          const groupMembers = response2.data
          const promises = []
          groupMembers.map(groupMember => {

            promises.push(getGroupData(groupMember.group).then(researchgroup => {
              groupMember.group = researchgroup
              groupMember.group_role = groupRoles.filter(role => role.id === groupMember.group_role)[0];
              return researchgroup
            }))
            return groupMember
          });

          Promise.all(promises).then(data => {
            resolve(groupMembers)
          }).catch(err => reject(err))
          return response2;
        })
        .catch(err => {
          reject("error in in get groupmembers: ", err);
        });
        return groupRoles;
      });
  });
}

export function submitObjectWithGeo(
  formData,
  geo,
  props,
  redirect = RESOURCE_OPERATIONS.LIST,
  inModal=false
) {

  return new Promise((resolve, reject) => {
    if (formData.id) {
      updateObjectWithGeo(formData, geo, props, redirect).then(data => resolve(data)).catch(err => reject(err));
    } else {
      createObjectWithGeo(formData, geo, props, inModal).then(data => resolve(data)).catch(err => reject(err));
    }
  })
}

function updateObjectWithGeo(formData, geo, props) {

  return new Promise((resolve, reject) => {
    if (geo && Object.keys(geo).length > 0) {
      formData.geo = geo;
      formData.geo.object_id = formData.id
    } else {
      //api wont allow null geojson, so replace it with an empty list of features.
      formData.geo = {
        object_id: formData.id,
        content_type: props.resource.substring(0, props.resource.length - 1),
        geojson: {
          type: "FeatureCollection",
          features: [],
        },
      };
    }
    if (props.save){ //use the react-admin form"s default save func
      resolve(props.save(formData, RESOURCE_OPERATIONS.LIST));
    }
    else{
      putObjectWithoutSaveProp(formData, props.resource).then(data => {
        resolve(data)
      }).catch(err => reject(err))
    }

  })
}

export function putObjectWithoutSaveProp(formData, resource){
  return new Promise((resolve, reject) => {
    const params = {id: formData.id, data: formData, resource:resource }
  
    dataProvider(UPDATE, resource, params).then(response => {
        resolve(response)
    }).catch(err => {
        reject(err)
    })
  })
}

//for the rare cases that we don"t have the Save prop and want to POST some model item
export function postObjectWithoutSaveProp(formData, resource){
  return new Promise((resolve, reject) => {

    const params = { data: formData, resource:resource }

    dataProvider(CREATE, resource, params).then(response => {
        resolve(response)
    }).catch(err => {
        reject(err)
    })
  })
}

export function createObjectWithGeo(formData, geo, props, inModal) {

  return new Promise((resolve, reject) => {
    let headers = new Headers({ "Content-Type": "application/json" });
    const token = localStorage.getItem(WEBTOKEN);

    if (token) {
      const parsedToken = JSON.parse(token);
      headers.set("Authorization", `Bearer ${parsedToken.access}`);

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
          reject({err: `Could not submit ${props.resource} to API, status: ${response.status} ${response.statusText}`})
          throw new Error(response.statusText); //error here when creating dataset nested in project
        })
        .then(data => {
          //some data exists - add in the object ID before submission
          if (geo && geo.content_type) {
            data.geo = geo;
            data.geo.object_id = data.id;
          } else {
            //no value - can"t send null into geo, so make a basic structure.
            data.geo = {
              object_id: data.id,
              content_type: props.resource.substring(
                0,
                props.resource.length - 1
              ),
              geojson: {
                type: "FeatureCollection",
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
              resolve(data)

              //TODO: test thoroughly what happens in modals
              if (!inModal){ //stop redirect if in a modal
                props.history.push(`/${props.resource}`);
              }
            });
        }).catch(err => {
          console.error("err in POST new object with geo: ", err, formData, geo, props)
          reject(err)
        })
        ;
    } else {
      toastErrors(WARNINGS.NO_AUTH_TOKEN);
      reject({error: WARNINGS.NO_AUTH_TOKEN})
    }
  })
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
    return "T07:00:00.000000Z";
  } else {
    return "T23:59:59.999999Z";
  }
}

export function formatBytes(bytes, decimals) {
  if (bytes === 0) return "0 KB";
  var k = 1024;
  var dm;
  if (!decimals) {
    dm = 3;
  } else {
    dm = decimals;
  }
  var sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  // Skip bytes and do KB instead
  if (i === 0) {
    i = 1;
  }
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
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
          return field;
        });
        return item;
      });
    }

    else {
      if (direction !== 1) {
        FK_FIELDS[resource].map(field => {
          return field;
        });
      }
    }
  }

  if (resource === "DATASETS") {
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
      data.date_starts = translateDates(data.date_starts, "date_starts");
    }
    //turn this date into a timestamp, since react_admin seems to only want to send dates.  Defaulting to end of the selected day.
    if (data.date_expires) {
      data.date_expires = translateDates(data.date_expires, "date_expires");
    }
  }

  return data;
}

export function translateDates(date, type, direction = 1) {
  if (direction) {
    if (type === "date_expires" && date.length < 11) {
      date += appendTimestamp();
    } else if (type === "date_starts" && date.length < 11) {
      date += appendTimestamp(true);
    }
  }
  return date;
}

export const truncatePath = (path) => {
  if (!path){
    return path
  }
  let tempPath = path
  let tempPathArr = tempPath.split("/")

  if (!tempPathArr){
    tempPathArr = tempPath.split("\\")
  }
  
  if (tempPathArr.length > 4){
    tempPathArr = tempPathArr.slice(tempPathArr.length - 4)
    tempPath = ".../" + tempPathArr.join("/")
  }
  else if (tempPath.length > 30){
    //truncate anyways, keep the start - if there are no slashes, its just a long title.
    tempPath = `${tempPath.slice(0, 30)}...`
  }
  return tempPath
}
