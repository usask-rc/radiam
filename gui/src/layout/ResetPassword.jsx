//ResetPassword.jsx
import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import { Card, CardActions, Button, Avatar } from "@material-ui/core";
import { Link } from "ra-ui-materialui";
import { withRouter } from "react-router-dom";
import LockIcon from "@material-ui/icons/Lock";
import { getAPIEndpoint } from "../_tools";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { withStyles } from "@material-ui/core/styles";
import {METHODS, LOGIN_DETAILS, FIELDS} from "../_constants/index";
import { toastErrors } from "../_tools/funcs";
import { required } from "ra-core";

const styles = theme => ({
  actions: {
    padding: "0 1em 1em 1em"
  },
  avatar: {
    margin: "1em",
    display: "flex",
    justifyContent: "center"
  },
  button: {
    marginTop: "6em",
    padding: "1em",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column"
  },
  card: {
    width: 300,
    marginTop: "6em"
  },
  form: {
    padding: "0 1em 1em 1em"
  },
  icon: {
    backgroundColor: "black"
  },
  input: {
    marginTop: "1em"
  },
  loading: {
    margin: "1em",
    fontSize: "24px"
  },
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  },
  title: {
    padding: "16px 16px"
  },
});

const validatePassword = [required()];
const validateConfirmPassword = values => {
  const errors = {}

  console.log("validateconfirmpassword values are: ", values)

  return errors
}

//TODO: this page needs to be integrated into the translation schema.
class ResetPassword extends Component {
  constructor() {
    super();
    this.state = {
      password: "",
      confirmPassword: "",
      update: false,
      isLoading: true,
      error: false,
      token: null
    };
  }

  componentDidMount() {
    const {match} = this.props
    if (this.props && match && match.params && match.params.token) {
      this.setState({ token: match.params.token });
    }
    //TODO: if not token, we have to reject and leave this page.
    else {
      this.setState({
        update: false,
        isLoading: false,
        error: true,
        completed: false
      });
    }
    console.log("this props is: ", this.props)

  }
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  //TODO: create a generic component for 'password, confirm password' to use on both this page and elsewhere.
  updatePassword = e => {
    e.preventDefault();

    const { token, password, confirmPassword } = this.state;

    if (password === confirmPassword) {
      const request = new Request(
        getAPIEndpoint() + "/password_reset/confirm/",
        {
          method: METHODS.POST,
          body: JSON.stringify({ token, password }),
          headers: new Headers({ "Content-Type": "application/json" })
        }
      );

      return fetch(request)
        .then(response => {
          if (response.status === 400) {
            return response.json();
            //toastErrors("Invalid Password:  ", response.json());
          } else if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText);
          } else {
            toast.success("Password successfully changed.");

            return response.json();
          }
        })
        .then(data => {
          if (data.password) {
            data.password.map(item => {
              toastErrors(item);
              return item;
            });
          } else {
            //success.  redirect to login.
            this.setState({ completed: true });
          }
          return data;
        })
        .catch(err => {
          toastErrors(
            "Key may be expired.  Please try re-sending the validation email."
          );
        });
    } else {
      toastErrors("Passwords do not match!");
    }
  };

  render() {
    const { password, confirmPassword, completed } = this.state;
    const { classes } = this.props;

    return (
      <div className={classes.main}>
        {!completed ? (
          <Card className={classes.card}>
            <>
              <form onSubmit={this.updatePassword}>
                <div className={classes.form}>
                  <div className={classes.avatar}>
                    <Avatar className={classes.icon}>
                      <LockIcon />
                    </Avatar>
                  </div>
                  <div className={classes.input}>
                    <TextField
                      id={LOGIN_DETAILS.PASSWORD}
                      label={"Password"}
                      onChange={this.handleChange(LOGIN_DETAILS.PASSWORD)}
                      value={password}
                      fullWidth
                      type={FIELDS.PASSWORD}
                      validate={validatePassword}
                    />
                  </div>
                  <div className={classes.input}>
                    <TextField
                      id={LOGIN_DETAILS.PASSWORD_CONFIRM}
                      label={"Confirm Password"}
                      onChange={this.handleChange(LOGIN_DETAILS.PASSWORD_CONFIRM)}
                      value={confirmPassword}
                      fullWidth
                      type={FIELDS.PASSWORD}
                      validate={validateConfirmPassword}
                    />
                  </div>
                </div>
                <CardActions className={classes.actions}>
                  <Button
                    variant="outlined"
                    type={FIELDS.SUBMIT}
                    color="primary"
                    fullWidth
                  >
                    {"Update Password"}
                  </Button>
                </CardActions>
              </form>
            </>
          </Card>
        ) : (
            <>
              <Link to="/login">
                <Button
                  className={classes.button}
                  color="primary"
                  variant="outlined"
                  fullWidth
                >
                  {" "}
                  Return to Login
              </Button>
              </Link>
            </>
          )}
        <ToastContainer />
      </div>
    );
  }
}

export default withStyles(styles)(withRouter(ResetPassword));
