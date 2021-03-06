// in src/authProvider.js
import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_ERROR,
  AUTH_CHECK,
  AUTH_GET_PERMISSIONS
} from "react-admin";
import { getAPIEndpoint, getCurrentUserDetails } from "./funcs";
import {MODELS, ROLE_USER, ROLE_DATA_MANAGER, ROLE_GROUP_ADMIN, ROLE_ANONYMOUS, LOGIN_DETAILS, METHODS, WEBTOKEN} from "../_constants/index"
import { toast } from "react-toastify";

function validateToken(checkToken) {
  const request = new Request(getAPIEndpoint() + "/token/verify/", {
    method: METHODS.POST,
    body: JSON.stringify({ token: checkToken }),
    headers: new Headers({ "Content-Type": "application/json" })
  });

  return fetch(request)
    .then(response => {
      //if unauthorized, give the client a chance to refresh the token.
      if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(result => {
      if (result && result.code && result.code === "token_not_valid") {
        let curTok = JSON.parse(localStorage.getItem(WEBTOKEN));
        return refreshAccessToken(curTok)
          .then(Promise.resolve())
          .catch(Promise.reject());
      } else {
        Promise.resolve();
      }
    })
    .catch(error => {
      Promise.reject();
    });
}


function refreshAccessToken(curTok) {
  const request = new Request(getAPIEndpoint() + "/token/refresh/", {
    method: METHODS.POST,
    body: JSON.stringify({ refresh: curTok.refresh }),
    headers: new Headers({ "Content-Type": "application/json" })
  });

  return validateToken(curTok.refresh).then(fetch(request)
    .then(response => {
      if (response.status < 200 || response.status >= 300) {
        localStorage.removeItem(WEBTOKEN)
        window.location.hash = "#/login"
        console.error(response.statusText);
      }
      return response.json();
    })
    .then(token => {
      curTok.access = token.access;
      localStorage.setItem(WEBTOKEN, JSON.stringify(curTok));
      return Promise.resolve()
    })
    .catch(e => Promise.reject(e)))
}

function getRequest(url, suppliedToken) {
  var headers = new Headers({ "Content-Type": "application/json" });
  var token = suppliedToken;
  if (!suppliedToken) {
    token = JSON.parse(localStorage.getItem("token"));
  }
  if (token) {
    headers.set("Authorization", "Bearer " + token.access);
  }
  const request = new Request(getAPIEndpoint() + url, {
    method: METHODS.GET,
    headers: headers
  });

  return request;
}

function getGroupRoles() {
  const request = getRequest(`/${MODELS.ROLES}/`);
  return fetch(request)
    .then(response => {
      if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(result => {
      var groupRoles = [];
      for (var i = 0; i < result.count; i++) {
        var groupRole = result.results[i];
        groupRoles.push(groupRole);
      }
      localStorage.setItem(MODELS.ROLES, JSON.stringify(groupRoles));
      return Promise.resolve(groupRoles);
    });
}

function getUser(groupRoles) {

  return getCurrentUserDetails()
    .then(result => {
      if (result && result.id) {
        var user = { is_admin: false, is_data_manager: false, is_group_admin: false, groupRoles: groupRoles };
        user.is_admin = result.is_superuser ? true : false //this affects what options are visible - not what are available to preform
        user.username = result.username
        user.id = result.id

        localStorage.setItem(ROLE_USER, JSON.stringify(user));
        return Promise.resolve(user);
      }
    }).catch(err => Promise.reject(err));
}

function getGroupMemberships(user) {
  const request = getRequest("/groupmembers/?user=" + user.id);
  return fetch(request)
    .then(response => {
      if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(result => {
      var groupMemberships = [];
      var groupAdminships = [];
      var dataManagerships = [];
      var groupUserships = [];
      for (var i = 0; i < result.count; i++) {
        var groupMembership = result.results[i];
        for (var rolesIndex = 0; rolesIndex < user.groupRoles.length; rolesIndex++) {
          if (user.groupRoles[rolesIndex].id === groupMembership.group_role) {
            groupMembership.group_role = user.groupRoles[rolesIndex];
            if (user.groupRoles[rolesIndex].id === ROLE_DATA_MANAGER) {
              user.is_data_manager = true;
              dataManagerships.push(groupMembership.group)
            } else if (user.groupRoles[rolesIndex].id === ROLE_GROUP_ADMIN) {
              user.is_group_admin = true;
              groupAdminships.push(groupMembership.group)
            }
            else{
              groupUserships.push(groupMembership.group)
            }
            groupMemberships.push(groupMembership.group)
            break;
          }
        }
        groupMemberships.push(groupMembership);
      }
      user.groupMemberships = groupMemberships;
      user.groupAdminships = groupAdminships
      user.dataManagerships = dataManagerships
      user.groupUserships = groupUserships

      localStorage.setItem(ROLE_USER, JSON.stringify(user));
      return Promise.resolve(user);
    }).catch(error => {
      console.error("Unable to get memberships", error);
      Promise.reject();
    });
}

function getGroups(user) {
  const request = getRequest("/researchgroups/");
  return fetch(request)
    .then(response => {
      if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(result => {
      var groups = [];
      for (var i = 0; i < result.count; i++) {
        var group = result.results[i];
        for (var membershipsIndex = 0; membershipsIndex < user.groupMemberships.length; membershipsIndex++) {
          if (user.groupMemberships[membershipsIndex].group === group.id) {
            user.groupMemberships[membershipsIndex].group = group;
          }
        }
        groups.push(group);
      }
      user.groups = groups;
      localStorage.setItem(ROLE_USER, JSON.stringify(user));
      return Promise.resolve(user);
    }).catch(error => {
      console.error("Unable to get groups", error);
      Promise.reject();
    });
}

export default (type, params, ...rest) => {
  if (type === AUTH_LOGIN) {

    return new Promise((resolve, reject) => 
    {

    const { username, password } = params;
    localStorage.setItem(LOGIN_DETAILS.USERNAME, username);
    const request = new Request(getAPIEndpoint() + "/token/", {
      method: METHODS.POST,
      body: JSON.stringify({ username, password }),
      headers: new Headers({ "Content-Type": "application/json" })
    });
    return fetch(request)
      .then(response => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(curTok => {
        var token = JSON.stringify(curTok);
        localStorage.setItem(WEBTOKEN, token);
        Promise.resolve(curTok);
      })
      .then(getGroupRoles)
      .then(groupRoles => getUser(groupRoles))
      .then(user => getGroupMemberships(user))
      .then(user => getGroups(user)).then(data => resolve(data))

      .catch(function (error) {
        console.error("Error thrown from response is: ", error)
        toast.error("Could not log in.  Please ensure your credentials are correct.")
        reject(error)
      })
    })
  }
  if (type === AUTH_LOGOUT) {
    localStorage.removeItem(MODELS.ROLES);
    localStorage.removeItem(WEBTOKEN);
    localStorage.removeItem(ROLE_USER);
    localStorage.removeItem(LOGIN_DETAILS.USERNAME);

    return Promise.resolve();
  }
  if (type === AUTH_ERROR) {
    const getToken = localStorage.getItem(WEBTOKEN);
    if (getToken) {
      return validateToken(JSON.parse(getToken).access)
        .then(Promise.resolve())
        .catch(
          refreshAccessToken(JSON.parse(getToken))
            .then(Promise.resolve())
            .catch(Promise.reject())
        );
    } else {
      return Promise.resolve();
    }
  }
  if (type === AUTH_CHECK) {

    const getToken = localStorage.getItem(WEBTOKEN);
    
    if (!getToken || getToken.length === 0){
      let pathArr = window.location.href.split("/")
      if (pathArr.includes("reset")){
        return Promise.resolve()
      }
      else{
        return Promise.reject()
      }
    }
    else{
      return validateToken(JSON.parse(getToken).access)
        .then(() => {
            return Promise.resolve()
          }
        )
        .catch(e =>{ //refresh the access token if current one is invalid
          refreshAccessToken(JSON.parse(getToken))
            .then(Promise.resolve())
            .catch(Promise.reject())
          Promise.reject(e)
        }
        );
    }
  }
  if (type === AUTH_GET_PERMISSIONS) {

    let pathArr = window.location.href.split("/")

    if (pathArr.includes("reset")){
      return Promise.resolve({role: ROLE_ANONYMOUS, is_admin: false})
    }
    else{
      const user = JSON.parse(localStorage.getItem(ROLE_USER));
      return user ? Promise.resolve(user) : Promise.reject({ role: ROLE_ANONYMOUS, is_admin: false });
    }
  }
  return Promise.reject("Unknown method");
};
