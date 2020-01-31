import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography"
import ConfirmPassword from "../_fragments/ConfirmPassword";
import { MODELS, PATHS, METHODS, FIELDS, WEBTOKEN, ROLE_USER, WARNINGS, } from "../../_constants/index";
import { getAPIEndpoint, toastErrors } from "../../_tools/funcs";
import RequestPassword from "../_fragments/RequestPassword";
import {Redirect} from "react-router-dom"
import { Responsive } from "ra-ui-materialui/lib/layout";
import { toast } from "react-toastify";
import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  flexColumn: { display: "flex", flexDirection: "column" },
  leftCol: { marginTop: "1em", flex: 1, marginRight: "1em" },
  rightCol: { flex: 1, marginLeft: "1em" },
  singleCol: { marginBottom: "2em" },

  main: {
    flexDirection: "column",
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
  title: {
    fontSize: "2em",
    },
  submitButton: {
    marginTop: "1em",
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

    const token = localStorage.getItem(WEBTOKEN);

    console.log("token and userid are: ", token, userID)
    if (token) {
      const parsedToken = JSON.parse(token);
      headers.set("Authorization", `Bearer ${parsedToken.access}`);
    } else {
      //TODO: no token?  Log the user out.
      //no idea how to do this when I have no access to History since authprovider is monopolized by the Admin component.
      toastErrors(
        WARNINGS.NO_AUTH_TOKEN
      );
      this.setState({redirect: true})
    }

    const request = new Request(
      `${getAPIEndpoint()}/${MODELS.USERS}/${userID}/${PATHS.SET_PASSWORD}/`,
      {
        method: METHODS.POST,
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
          WARNINGS.NO_CONNECTION
        );
      });
  }

  handleSubmit = event => {
    const {newPassword, confirmPassword} = this.state
    event.preventDefault();
    //get uuid from storage
    const user = JSON.parse(localStorage.getItem(ROLE_USER));
    if (user && user.id) {
      //the endpoint we need is at /users/${user.id}/set_password/
      if (newPassword === confirmPassword) {
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
        WARNINGS.NO_AUTH_TOKEN
      );
      this.setState({redirect: true})
    }
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  
  render() {
    const {classes} = this.props
    const { redirect } = this.state
    console.log("state in changepassword is: ", this.state)
    return (
      <>
      <Responsive
        medium={
          <>
            <div className={classes.main}>
              <div className={classes.leftCol}>
                <form className={classes.flex} onSubmit={this.handleSubmit}>
                  <div>
                  <Typography component={"h4"} variant={"h4"}
                    className={classes.title}
                  >{"Please enter and confirm a new password:"}
                  </Typography>
                  <RequestPassword handleChange={this.handleChange} />
                  <ConfirmPassword handleChange={this.handleChange} />

                    <Button
                      variant="outlined"
                      type={FIELDS.SUBMIT}
                      color="primary"
                      className={classes.submitButton}
                    >
                      {"Update Password"}
                    </Button>
                </div>
                </form>
              </div>
            </div>
          </>
        }
      />
      {redirect && <Redirect to="/login"/>}
      </>
    );
  }
}

export default withStyles(styles) (ChangePassword);
