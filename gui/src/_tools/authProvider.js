// in src/authProvider.js
import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_ERROR,
  AUTH_CHECK,
  AUTH_GET_PERMISSIONS
} from "react-admin";
import { getAPIEndpoint } from "./funcs";
import * as Constants from "../_constants/index"
import { toast } from "react-toastify";

function validateToken(checkToken) {
  const request = new Request(getAPIEndpoint() + "/token/verify/", {
    method: Constants.methods.POST,
    body: JSON.stringify({ token: checkToken }),
    headers: new Headers({ "Content-Type": "application/json" })
  });

  return fetch(request)
    .then(response => {
      //if unauthorized, give the client a chance to refresh the token.
      if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
        //TODO:there is an error between here and the Resolve.  I don't quite know what it is - error is 'uncaught exception: undefined'
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then(result => {
      if (result && result.code && result.code === "token_not_valid") {
        let curTok = JSON.parse(localStorage.getItem(Constants.WEBTOKEN));
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
    method: Constants.methods.POST,
    body: JSON.stringify({ refresh: curTok.refresh }),
    headers: new Headers({ "Content-Type": "application/json" })
  });

  return validateToken(curTok.refresh).then(fetch(request)
    .then(response => {
      if (response.status < 200 || response.status >= 300) {  //TODO: this should force the user to the login screen.
        localStorage.removeItem(Constants.WEBTOKEN)
        window.location.hash = "#/login"
        console.error(response.statusText);
      }
      return response.json();
    })
    .then(token => {
      curTok.access = token.access;
      localStorage.setItem(Constants.WEBTOKEN, JSON.stringify(curTok));
      return Promise.resolve();
    })
    .catch(Promise.reject()))
    .catch(
      //TODO: refresh token is expired if it doesn't validate.  The user should be logged out here, but I haven't figured this out yet.
      Promise.reject()
    );
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
    method: Constants.methods.GET,
    headers: headers
  });

  return request;
}

function getGroupRoles() {
  const request = getRequest(`/${Constants.models.ROLES}/`);
  return fetch(request)
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
      localStorage.setItem(Constants.models.ROLES, JSON.stringify(groupRoles));
      return Promise.resolve(groupRoles);
    });
}

function getUser(groupRoles) {
  const username = localStorage.getItem(Constants.model_fields.USERNAME);
  const request = getRequest(`/${Constants.models.USERS}/?${Constants.model_fields.USERNAME}=` + username);
  return fetch(request)
    .then(response => {
      if ((response.status >= 200 && response.status < 300) || (response.status === 401 || response.status === 403)) {
        return response.json();
      } else {
        throw new Error("There was more than one user returned matching that username");
      }
    })
    .then(result => {
      if (result.count > 1) {
        console.log("Had more than one user with the same username", result);
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
      localStorage.setItem(Constants.ROLE_USER, JSON.stringify(user));
      return Promise.resolve(user);
    });
}

function getGroupMemberships(user) {
  const request = getRequest("/groupmembers/?user=" + user.id);
  return fetch(request)
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
            if (user.groupRoles[rolesIndex].id === Constants.ROLE_DATA_MANAGER) {
              user.is_data_manager = true; //TODO: this should be a list of project IDs i'm a data manager of
              dataManagerships.push(groupMembership.group)
            } else if (user.groupRoles[rolesIndex].id === Constants.ROLE_GROUP_ADMIN) {

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

      localStorage.setItem(Constants.ROLE_USER, JSON.stringify(user));
      return Promise.resolve(user);
    }).catch(error => {
      console.log("Unable to get memberships", error);
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
      localStorage.setItem(Constants.ROLE_USER, JSON.stringify(user));
      return Promise.resolve(user);
    }).catch(error => {
      console.log("Unable to get groups", error);
      Promise.reject();
    });
}

export default (type, params, ...rest) => {
  if (type === AUTH_LOGIN) {
    const { username, password } = params;
    localStorage.setItem(Constants.login_details.USERNAME, username);
    const request = new Request(getAPIEndpoint() + "/token/", {
      method: Constants.methods.POST,
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
        toast.error("Incorrect User Credentials.  Please try again.")
      })
      .then(curTok => {
        var token = JSON.stringify(curTok);
        localStorage.setItem(Constants.WEBTOKEN, token);
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
    localStorage.removeItem(Constants.models.ROLES);
    localStorage.removeItem(Constants.WEBTOKEN);
    localStorage.removeItem(Constants.ROLE_USER);
    localStorage.removeItem(Constants.login_details.USERNAME);

    return Promise.resolve();
  }
  if (type === AUTH_ERROR) {
    const getToken = localStorage.getItem(Constants.WEBTOKEN);
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
    const getToken = localStorage.getItem(Constants.WEBTOKEN);

    //I'm confident that the same thing can be achieved with withRouter from react-router
    //get the model and ID from the URL and check for user authorization on this page.
    console.log("href is: ", window.location.href, "window location: ", window.location)

    return validateToken(JSON.parse(getToken).access)
      .then(() => {
          Promise.resolve()
        }
      )
      .catch(
        refreshAccessToken(JSON.parse(getToken))
          .then(Promise.resolve())
          .catch(Promise.reject())
      );
  }
  if (type === AUTH_GET_PERMISSIONS) {
    console.log("getpermissions checked with params: " ,params, rest);

    const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
    return user ? Promise.resolve(user) : Promise.resolve({ role: Constants.ROLE_ANONYMOUS, is_admin: false });

  }
  return Promise.reject("Unknown method");
};
