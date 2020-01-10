// in authProvider.js
import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_ERROR,
  AUTH_CHECK,
  AUTH_GET_PERMISSIONS
} from "react-admin";
import { getAPIEndpoint } from "./funcs";
import { METHODS, WEBTOKEN, MODELS, MODEL_FIELDS, ROLE_USER, ROLE_DATA_MANAGER, ROLE_GROUP_ADMIN, ROLE_ANONYMOUS, LOGIN_DETAILS } from "../_constants/index"
import { toast } from "react-toastify";

function validateToken(checkToken) {
  const request = new Request(getAPIEndpoint() + "/token/verify/", {
    method: METHODS.POST,
    body: JSON.stringify({ token: checkToken }),
    headers: new Headers({ "Content-Type": "application/json" })
  });

  return new Promise((resolve, reject) => {
    fetch(request).then(response => {
      if (response.status >= 200 && response.status < 300){
        resolve(response)
      }
      else if (response.status === 401 || response.status === 403){
        let curTok = JSON.parse(localStorage.getItem(WEBTOKEN));
        refreshAccessToken(curTok).then(
          resolve("resolve after refreshaccess call in validate")
          ).catch(err => reject(err))
      }
      else{
        throw new Error(response.statusText)
      }
    }).catch(err => reject(err))
  })
}


function refreshAccessToken(curTok) {
  const request = new Request(getAPIEndpoint() + "/token/refresh/", {
    method: METHODS.POST,
    body: JSON.stringify({ refresh: curTok.refresh }),
    headers: new Headers({ "Content-Type": "application/json" })
  });

  return new Promise((resolve, reject) => {

    validateToken(curTok.refresh).then(fetch(request)
      .then(response => {
        if (response.status < 200 || response.status >= 300) {  //TODO: this should force the user to the login screen.
          localStorage.removeItem(WEBTOKEN)
          window.location.hash = "#/login"
          console.error(response.statusText);
        }
        return response.json();
      })
      .then(token => {
        curTok.access = token.access;
        localStorage.setItem(WEBTOKEN, JSON.stringify(curTok));
        resolve()
      })
      .catch(err => reject(err)))
  })
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
  return new Promise((resolve, reject) => {
    const request = getRequest(`/${MODELS.ROLES}/`);
    fetch(request)
      .then(response => {
        if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
          return response.json();
        } else {
          console.log("response from group roles fetch is: ", response);
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
        resolve(groupRoles)
      }).catch(err => reject(err));
  })
}

function getUser(groupRoles) {

  return new Promise((resolve, reject) => {
      
    const username = localStorage.getItem(MODEL_FIELDS.USERNAME);
    const request = getRequest(`/${MODELS.USERS}/?${MODEL_FIELDS.USERNAME}=` + username);
    fetch(request)
      .then(response => {
        if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
          return response.json();
        } else {
          throw new Error("There was more than one user returned matching that username");
        }
      })
      .then(result => {
        if (result.count > 1) {
          throw new Error("We have more than one user with the same username.")
        }
        console.log("in getUser, result is: ", result)
        var user = { is_admin: false, is_data_manager: false, is_group_admin: false, groupRoles: groupRoles };
        var newUser = result.results[0];
        var admin = newUser.is_superuser;
        if (admin) {
          user.is_admin = true;
        } else {
          user.is_admin = false;
        }
        user.id = newUser.id;
        localStorage.setItem(ROLE_USER, JSON.stringify(user));
        resolve(user);
      })
      .catch(err => reject(err));
  })
}

function getGroupMemberships(user) {
  return new Promise((resolve, reject) => {
    const request = getRequest("/groupmembers/?user=" + user.id);
    fetch(request)
      .then(response => {
        if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
          return response.json();
        } else {
          console.log("response from group roles fetch is: ", response);
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
                user.is_data_manager = true; //TODO: this should be a list of project IDs i'm a data manager of
                dataManagerships.push(groupMembership.group)
              } else if (user.groupRoles[rolesIndex].id === ROLE_GROUP_ADMIN) {

                user.is_group_admin = true; //TODO: this should be list of project IDs i'm a group admin of.
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
        resolve(user)
      }).catch(error => {
        reject(error)
      });
  })
}

function getGroups(user) {
  return new Promise((resolve, reject) => {
    const request = getRequest("/researchgroups/");
    fetch(request)
      .then(response => {
        if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
          return response.json();
        } else {
          console.log("response from groups fetch is: ", response);
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
        resolve(user)
      }).catch(error => {
        console.log("Unable to get groups", error);
        reject(error)
      });
    })
}

//TODO: other functions here are wrapped in promises, but this one has issues when doing that.  Is there a good way to do this?
export default (type, params, ...rest) => {
  if (type === AUTH_LOGIN) {
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
          console.log("response statustext is: ", response.statusText);
          throw new Error(response.statusText);
        }
        return response.json();
      }).catch(function (error) {
        console.log("Error thrown from response is: ", error)
        toast.error("Could not log in.  Please ensure your credentials are correct.")
      })
      .then(curTok => {
        var token = JSON.stringify(curTok);
        localStorage.setItem(WEBTOKEN, token);
        Promise.resolve(curTok);
      })
      .catch(function (error) {
        console.log("Couldn't get token", error)
      })
      .then(getGroupRoles)
      .catch(function (error) {
        console.log("Couldn't get group roles", error)
      })
      .then(groupRoles => getUser(groupRoles))
      .catch(function (error) {
        console.log("Couldn't get user", error)
      })
      .then(user => getGroupMemberships(user))
      .catch(function (error) {
        console.log("Couldn't get group memberships", error)
      })
      .then(user => getGroups(user))
      .catch(function (error) {
        console.log("Couldn't get groups", error)
      });
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

    //I'm confident that the same thing can be achieved with withRouter from react-router
    //get the model and ID from the URL and check for user authorization on this page.

    return validateToken(JSON.parse(getToken).access)
      .then(() => {
          Promise.resolve()//there is a uncaught exception here, I don't know what is causing it, but it's seemingly after the promise resolve.
        }
      )
      .catch(
        refreshAccessToken(JSON.parse(getToken))
          .then(Promise.resolve())
          .catch(Promise.reject())
      );
  }
  if (type === AUTH_GET_PERMISSIONS) {

    const user = JSON.parse(localStorage.getItem(ROLE_USER));
    return user ? Promise.resolve(user) : Promise.resolve({ role: ROLE_ANONYMOUS, is_admin: false });

  }
  return Promise.reject("Unknown method");
};
