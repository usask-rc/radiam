import * as Constants from '../_constants/index';
import { isObject, isString, isArray } from 'util';
import { toast } from 'react-toastify';
var cloneDeep = require('lodash.clonedeep');

//TODO: move '/api' to constants as the url for where the api is hosted.
export function getAPIEndpoint() {
  //TODO: this is just needed for local testing.  this should eventually be removed.
  if (window && window.location && window.location.port === '3000') {
    return `https://dev2.radiam.ca/api`; //TODO: will need updating after we're done with beta
    
  }
  return Constants.API_ENDPOINT;
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

export function submitObjectWithGeo(formData, geo, props){
  console.log("formData heading into submitobjectwithgeo is: ", formData)
  if (formData.id){
    updateObjectWithGeo(formData, geo, props)
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

export function createObjectWithGeo(formData, geo, props){
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
            props.history.push(`/${props.resource}/`)
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
