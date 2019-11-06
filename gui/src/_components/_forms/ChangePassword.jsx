import React, { Component } from "react";
import { Button, CardActions, Typography } from "@material-ui/core";
import ConfirmPassword from "../_fragments/ConfirmPassword";
import * as Constants from "../../_constants/index";
import { getAPIEndpoint, toastErrors } from "../../_tools/funcs";
import RequestPassword from "../_fragments/RequestPassword";
import {Redirect} from "react-router"
import { Responsive } from "ra-ui-materialui/lib/layout";
import { toast } from "react-toastify";

const styles = theme => ({
  flex: { display: "flex" },
  flexColumn: { display: "flex", flexDirection: "column" },
  leftCol: { marginTop: "1em", flex: 1, marginRight: "1em" },
  rightCol: { flex: 1, marginLeft: "1em" },
  singleCol: { marginBottom: "2em" },

  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  },
  loading: {
    margin: "1em",
    fontSize: "24px"
  },
  card: {
    minWidth: 300,
    marginTop: "6em"
  },
  form: {
    padding: "0 1em 1em 1em"
  },
  input: {
    marginTop: "1em"
  },
  actions: {
    padding: "0 1em 1em 1em"
  },
  title: {
    padding: "16px 16px"
  },
  button: {
    marginTop: "6em",
    padding: "1em",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column"
  }
});

//TODO: move api call to the central security provider file if possible once this functionality is completed.
//there HAS to be a way to access the existing cookies / token through authprovider / radiamrestprovider rather than doing it here.  I just can't think of how to go about doing it.
class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { password: "", newPassword: "", confirmPassword: "", redirect:false}
    this.changePassword = this.changePassword.bind(this)
  }

  changePassword(userID) {
    let headers = new Headers({ "Content-Type": "application/json" });

    const token = localStorage.getItem(Constants.WEBTOKEN);

    console.log("token and userid are: ", token, userID)
    if (token) {
      const parsedToken = JSON.parse(token);
      headers.set("Authorization", `Bearer ${parsedToken.access}`);
    } else {
      //TODO: no token?  Log the user out.
      //no idea how to do this when I have no access to History since authprovider is monopolized by the Admin component.
      toastErrors(
        Constants.warnings.NO_AUTH_TOKEN
      );
      this.setState({redirect: true})
    }

    const request = new Request(
      `${getAPIEndpoint()}/${Constants.models.USERS}/${userID}/${Constants.paths.SET_PASSWORD}/`,
      {
        method: Constants.methods.POST,
        body: JSON.stringify({ ...this.state }),
        headers: headers
      }
    );

    return fetch(request)
      .then(response => {
        //we want the error messages if they exist in a bad request
        if (
          response.status === 400 ||
          response.status === 500 ||
          (response.status >= 200 && response.status < 300)
        ) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then(data => {
        if (data.old_password || data.new_password || data.set_password || data.non_field_errors) {
          toastErrors(data);
          return;
        }
        //set completed to true - clear and minimize the password change menu..
        //this.setState({ completed: true })
        toast.success("Password successfully changed.");
        return data;
      })
      .catch(err => {
        toastErrors(
          Constants.warnings.NO_CONNECTION
        );
      });
  }

  handleSubmit = event => {
    event.preventDefault();
    //get uuid from storage
    const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
    if (user && user.id) {
      //the endpoint we need is at /users/${user.id}/set_password/
      if (this.state.newPassword === this.state.confirmPassword) {
        this.changePassword(user.id);
      } else {
        toastErrors(
          "Please ensure that your New password matches the Confirm field."
        );
      }
    }
    //TODO: if we're somehow here and there is no user in localstorage, we need to log out. Probably want a toast to indicate this.
    else {
      toastErrors(
        Constants.warnings.NO_AUTH_TOKEN
      );
      this.setState({redirect: true})
    }
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  
  render() {
    console.log("state in changepassword is: ", this.state)
    return (
      <React.Fragment>
      <Responsive
        medium={
          <React.Fragment>
            <div style={styles.flex}>
              <div style={styles.leftCol}>
                <form style={styles.flex} onSubmit={this.handleSubmit}>
                  <Typography component={"h4"} variant={"h4"}
                    className={styles.title}
                  >{"Please enter and confirm a new password:"}</Typography>
                  <RequestPassword handleChange={this.handleChange} />
                  <ConfirmPassword handleChange={this.handleChange} />

                  <CardActions className={styles.actions}>
                    <Button
                      variant="outlined"
                      type={Constants.fields.SUBMIT}
                      color="primary"
                    >
                      {"Update Password"}
                    </Button>
                  </CardActions>
                </form>
              </div>
            </div>
          </React.Fragment>
        }
      />
      {this.state.redirect && <Redirect to="/login"/>}
      </React.Fragment>
    );
  }
}

export default ChangePassword;
