//radiamrestprovider.js
import {PATHS, METHODS, MODELS} from '../_constants/index';
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

    console.log("data request is: ", type, resource, params)
    switch (type) {
      
      //for getting all files in a project/dataset and filtering said files
      case "GET_FILES": {//TODO: parameters should now be handled in the body rather than the url.
        //if parameter 'q' exists, our folder search should be an 'includes' rather than a 'matches'.
        let {page, perPage} = params.pagination
        url = `${apiUrl}/${resource}/${PATHS.SEARCH}/`
        options.method = METHODS.POST

        let query = {
          query: {
            bool: {
              must: [],
            }
          }
        }
        const {filter} = params

        console.log("params.filter in get_files are: ", params.filter)

        //`filter` can only hold path_parent or type right now, so its probably not necessary to loop this
        if (filter){
          if (filter.path_parent && !params.q){ //no search item?  Then we only want the current folder.
            query.query.bool.must.push({"match": {"path_parent.keyword":filter.path_parent}})
          }

          if (filter.type){
            query.query.bool.must.push({"match": {"type":filter.type}})
          }

          if (filter.location){
            query.query.bool.must.push({"match": {"location":filter.location}})
          }

          //add here as needed
          if (filter.length > 2){
            //then my assumption is wrong
            console.log("more than 2 Param Filters found: ", filter)
          }
        }

        //if we're searching, throw in our query into a SHOULD match
        if (params.q){
          //specify what fields we're searching on
          //certain fields like `type` used to delineate between files and folders will have to be treated differently
          
          //query string search on all searchable fields (no numbers/dates)
          query.query.bool.should = [{
            'query_string': {
              'query': `*${params.q}*`
            }
          }] 
          query.query.bool.minimum_should_match = 1
        }

        //TODO: ordering and pagination do not yet exist satisfactorily (everything is a single page dump)
        options.body = JSON.stringify(query);

        console.log("stringified query: ", options.body)

        //TODO: sort and pagination will likely move to the POST body eventually.  For now, these controls exist in the URL.
        if (params.sort && params.sort.field && params.sort.field.length > 0){
          let sortOrder = ""
          if (params.sort.order){
            sortOrder = "-"
          }
          sort = `ordering=${sortOrder}${params.sort.field}`
        }
        url = url + `?page=${page}&page_size=${perPage}&${sort}`;
        console.log("url before get_files request: ", url)
        break;
      }

      case GET_LIST: {
        url = `${apiUrl}/${resource}/`;

        console.log("params sent to get_list are: ", params, url)


        if (params)
        {
          let query = {};
          if (
            params.filter &&
            params.sort && //new - adding this might have broken things.
            Object.keys(params.filter).length > 0
          ) {
            const { page, perPage } = params.pagination;

            console.log("params sort: ", params.sort)
            let { field, order } = params.sort;
            if (order === "DESC"){
              order = "-"
            }else{
              order = ""
            }

            query = {
              ...fetchUtils.flattenObject(params.filter), //removed when adding in partial search
              ordering: `${order}${field}`,

              _start: (page - 1) * perPage,
              _end: page * perPage,
              page: page,
              perPage: perPage,
            };
            if (params.hasOwnProperty("query")) {
                Object.keys(params["query"]).forEach(function(key) {
                    query[key] = params["query"][key];
                });
            }
            url = url + `?${stringify(query)}`;
          }
          //should be all other cases.  I don't see why we would ever have use for a page designation.
          else if (params.pagination || params.sort) {
            console.log("params in else: ", params)
            let { page, perPage } = params.pagination;

            let query = {};
            if (params.hasOwnProperty("query")) {
              query = params["query"];
            }
            if (!perPage){
              perPage = 10
            }

            let order = ""
            let field = ""
            let ordering = ""
            if (params.sort && params.sort.field && params.sort.field.length > 0 && params.sort.order && params.sort.order.length > 0){
              if (params.sort.order === "DESC"){
                order = "-" 
              }
              field = params.sort.field

              ordering = `&ordering=${order}${field}`
            }
            
            url = `${apiUrl}/${resource}/?page=${page}&page_size=${perPage}${ordering}&${stringify(query)}`;

          }
        }

        console.log("url receiving get_list query is: ", url)
        break;
      }
    

      case 'CURRENT_USER': {
        url = `${apiUrl}/${MODELS.USERS}/current/`;

        options.method = METHODS.GET;
        break;
      }

      case 'PASSWORD_RESET_EMAIL': {
        url = `${apiUrl}/password_reset/`;

        options.method = METHODS.POST;
        options.body = JSON.stringify({ email: params.email });
        break;
      }

      case 'PASSWORD_CHANGE': {
        url = `${apiUrl}/${MODELS.USERS}/${params.userID}/${PATHS.SET_PASSWORD}/`;

        options.method = METHODS.POST;
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

        console.log("in get_one, data is: ", type, resource, params)

        if (params && params.is_active === false) {
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
          resource === MODELS.PROJECTAVATARS &&
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
        console.log("formdata in create: ", formData)

        console.log("CREATE type, resource, params: ", type, resource, params)
        url = `${apiUrl}/${resource}/`;
        options.method = METHODS.POST;
        if (
          resource === MODELS.PROJECTAVATARS &&
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

        console.log("params in delete: ", params)
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
    let ret = null;

    switch (type) {
      case 'PASSWORD_RESET_EMAIL':
      case 'PASSWORD_RESET_CONFIRM':
      case 'PASSWORD_CHANGE':
      case 'CURRENT_USER': {
        return { data: json };
      }

      case "GET_FILES":

        json.results = translateResource(resource, json.results);

        ret = {
          data: json.results,
          total: json.count,
          next: json.next,
          previous: json.previous,
        };

        console.log("GET_FILES ret: ", ret)
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
        console.log("ret in get_list is: ", ret)
        return ret;

      case GET_ONE:
          console.log("fields in get_one: ", resource, json)

        let fields = translateResource(resource, json);

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

        ret = {
          data: many.filter(item =>
            params.ids.find(element => element === item.id)
          ),
        };

        //map our IDs and Keys
        ret.data.map(item => (item.key = item.id));
        return ret;

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
