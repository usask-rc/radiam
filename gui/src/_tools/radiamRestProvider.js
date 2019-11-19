import * as Constants from '../_constants/index';

import { stringify } from 'query-string';
import {
  fetchUtils,
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY,
} from 'react-admin';
import { translateResource } from '../_tools/funcs';
import get from 'lodash/get';

export default (apiUrl, httpClient = fetchUtils.fetchJson) => {
  const convertDataRequestToHTTP = (type, resource, params) => {
    let url = '';
    let sort = '';
    let formData = new FormData();
    const options = {};
    switch (type) {

      
      case "GET_FILES": {//TODO: parameters should now be handled in the body rather than the url.

        let {page, perPage} = params.pagination
        url = `${apiUrl}/${resource}/${Constants.paths.SEARCH}/`
        options.method = Constants.methods.POST

        /*
         * If there was a query parameter passed from the component,
         * create a valid Elasticsearch request body to POST to /search.
         */

        // TODO: Maybe this should be pulled out into a separate function?
        if (params.q) {
          let query = {
            "query": {
              "multi_match": {
                "query": params.q,
                "fields": ["*"],
                "lenient": "true"
              }
            }
          };

          options.body = JSON.stringify(query);
        }

        if (params && params.sort)
        {
          let sign = '';
          if (params.sort.order && params.sort.order === 'DESC') {
            sign = '-';
          }
          sort = `ordering=${sign}${params.sort.field}`; //this line should be the sole dominion of the /search elasticsearch endpoint.
        }

        // url = url + `?${stringify(query)}&page=${page}&page_size=${perPage}&${sort}`;
        url = url + `?page=${page}&page_size=${perPage}&${sort}`;

        //TODO: parameters should now be handled in the body rather than the url.
        /*
        if (params && params.q) {
          url = url + `&q=${params.q}`;
        }*/

        break;
      }

      case GET_LIST: {
        url = `${apiUrl}/${resource}/`;

        console.log("params sent to get_list are: ", params)

        if (params)
        {
          if (
            params.filter &&
            params.sort && //new - adding this might have broken things.
            Object.keys(params.filter).length > 0
          ) {
            const { page, perPage } = params.pagination;
            const { sortField, sortOrder } = params.sort;

            let query = {
              ...fetchUtils.flattenObject(params.filter),
              _sort: sortField ? sortField : null,
              _order: sortOrder ? sortOrder : null,
              _start: (page - 1) * perPage,
              _end: page * perPage,
            };
            url = url + `?${stringify(query)}&page=${page}&perPage=${perPage}`;
          }
          //should be all other cases.  I don't see why we would ever have use for a page designation.
          else if (params.pagination || params.sort) {
            let page = `page=${params.pagination.page}&page_size=${params.pagination.perPage}`;

            url = `${apiUrl}/${resource}/?`;
            if (page && sort) {
              url = `${url}${page}&${sort}`;
            } else if (page) {
              url = `${url}${page}`;
            } else if (sort) {
              url = `${url}${sort}`;
            }
            if (params.query) {
              url = url + `&${stringify(params.query)}`;
            }
          }
        }

        console.log("url receiving get_list query is: ", url)
        break;
      }

      case 'CURRENT_USER': {
        url = `${apiUrl}/${Constants.models.USERS}/current/`;

        options.method = Constants.methods.GET;
        break;
      }

      case 'PASSWORD_RESET_EMAIL': {
        url = `${apiUrl}/password_reset/`;

        options.method = Constants.methods.POST;
        options.body = JSON.stringify({ email: params.email });
        break;
      }

      case 'PASSWORD_CHANGE': {
        url = `${apiUrl}/${Constants.models.USERS}/${params.userID}/${Constants.paths.SET_PASSWORD}/`;

        options.method = Constants.methods.POST;
        options.body = JSON.stringify({
          old_password: params.old_password,
          new_password: params.new_password,
          confirm_password: params.confirm_password,
        });
        break;
      }

      //react-admin by default accesses this GET_ONE when we try to hit it from a datagrid object.
      //it will have no parameters and so as a result we cannot send the ?is_active=false flag onclick.
      case GET_ONE:

        if (params.is_active === false) {
          url = `${apiUrl}/${resource}/${params.id}/?is_active=false`;
        } else {
          url = `${apiUrl}/${resource}/${params.id}/?is_active=true`;
        }

        break;

      case GET_MANY_REFERENCE: {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const query = {
          ...fetchUtils.flattenObject(params.filter),
          [params.target]: params.id,
          _sort: field,
          _order: order,
          _start: (page - 1) * perPage,
          _end: page * perPage,
        };

        url = `${apiUrl}/${resource}/?${stringify(query)}`;

        break;
      }

      case UPDATE:
        url = `${apiUrl}/${resource}/${params.id}/`;


        console.log("params and options in update are: ", params, options)


        options.method = 'PUT';
        if (
          resource === Constants.models.PROJECTAVATARS &&
          get(params, 'data.avatar_image.rawFile')
        ) {
          formData.append('avatar_image', params.data.avatar_image.rawFile);
          options.body = formData;
        } else {
          console.log("params data before update is: ", params.data)
          params.data = translateResource(resource, params.data, 1);
          options.body = JSON.stringify(params.data);
        }

        break;

      case CREATE:
        url = `${apiUrl}/${resource}/`;
        options.method = Constants.methods.POST;
        if (
          resource === Constants.models.PROJECTAVATARS &&
          get(params, 'data.avatar_image.rawFile')
        ) {
          formData.append('avatar_image', params.data.avatar_image.rawFile);
          options.body = formData;
        } else {
          params.data = translateResource(resource, params.data, 1);
          options.body = JSON.stringify(params.data);
        }

        break;

      case DELETE:
        url = `${apiUrl}/${resource}/${params.id}/`;

        options.method = 'DELETE';

        break;

      case GET_MANY:
        // Map a sub object that has '{ id: "theid"}' to just 'theid' e.g. project sensitivity level
        params.ids = params.ids.map(item => (item.id ? item.id : item));
        
        const  query = {
            [`ids`]: params.ids.join(','),
        };

        url = `${apiUrl}/${resource}/?${stringify(query)}`;
        break;

      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }

    return { url, options };
  };

  const convertHTTPResponse = (response, type, resource, params) => {
    const { headers, json } = response;

    switch (type) {
      case 'PASSWORD_RESET_EMAIL':
      case 'PASSWORD_RESET_CONFIRM':
      case 'PASSWORD_CHANGE':
      case 'CURRENT_USER': {
        return { data: json };
      }

      case "GET_FILES":

        json.results = translateResource(resource, json.results);

        let ret = {
          data: json.results,
          total: json.count,
          next: json.next,
          previous: json.previous,
        };

        ret.data.map(item => (item.key = item.id));
        return ret;

      case GET_LIST:
        json.results = translateResource(resource, json.results);

        ret = {
          data: json.results,
          total: json.count,
          next: json.next,
          previous: json.previous,
        };
        ret.data.map(item => (item.key = item.id));

        return ret;

      case GET_ONE:
        let fields = translateResource(resource, json);

        console.log("GET_ONE fields, json, resource are:" , fields, json, resource)

        return {
          data: {
            ...fields,
            key: json.id,
          },
        };

      //"Get_Many" is a bit of a misnomer.  We're looking for a value matching an ID from Many that we're searching for in params.ids[0].  This returns one value.
      case GET_MANY:
        let many;
        // Handle results being in a paged results object or raw

        if (json.results) {
          many = translateResource(resource, json.results);
        } else {
          many = translateResource(resource, json);
        }

        let rets;

        rets = {
          data: many.filter(item =>
            params.ids.find(element => element === item.id)
          ),
        };

        //map our IDs and Keys
        rets.data.map(item => (item.key = item.id));

        return rets;

      case GET_MANY_REFERENCE:

        return {
          data: json.results,

          total: parseInt(
            headers
              .get('count')
              .split('/')
              .pop(),
            10
          ),
        };

      //TODO: there's an inconsistency here between create and update - i dont know which one I should be using, but both work for now.  one will likely have to change at some point.
      case CREATE:
        params.data = translateResource(resource, params.data);

        return {
          data: {
            ...json,
            key: json.id,
          },
        };

      case UPDATE:
        params.data = translateResource(resource, params.data);

        return {
          data: {
            ...params.data,
            key: json.id,
          },
        };

      //TODO: what is this?  Why is there a 'fake' here?
      case DELETE:
        return { data: { id: 'fake' } };

      default:
        return { data: json };
    }
  };

  //TODO: these functions are (i think) unused, but will need to be updated now that we have a proper ID field.
  return (type, resource, params) => {
    // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead

    if (type === UPDATE_MANY) {
      return Promise.all(
        params.ids.map(id =>
          httpClient(`${apiUrl}/${resource}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
          })
        )
      ).then(responses => ({
        data: responses.map(response => response.json),
      }));
    }

    // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    if (type === DELETE_MANY) {
      return Promise.all(
        params.ids.map(id =>
          httpClient(`${apiUrl}/${resource}/${id}/`, {
            method: 'DELETE',
          })
        )
      ).then(responses => ({
        data: responses.map(response => response.json),
      }));
    }

    const { url, options } = convertDataRequestToHTTP(type, resource, params);

    return httpClient(url, options).then(response =>
      convertHTTPResponse(response, type, resource, params)
    );
  };
};
