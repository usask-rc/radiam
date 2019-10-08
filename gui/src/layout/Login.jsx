import React, { Component } from "react";
import PropTypes from "prop-types";
import { propTypes, reduxForm, Field } from "redux-form";
import { connect } from "react-redux";
import compose from "recompose/compose";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import {
  MuiThemeProvider,
  createMuiTheme,
  withStyles
} from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";

import { translate, userLogin } from "react-admin";
import * as Constants from "../_constants/index";
import { lightTheme } from "./themes";
import { radiamRestProvider, getAPIEndpoint, httpClient } from "../_tools";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = theme => ({
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  },
  card: {
    minWidth: 300,
    marginTop: "6em"
  },
  avatar: {
    margin: "1em",
    display: "flex",
    justifyContent: "center"
  },
  icon: {
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    padding: "0 1em 1em 1em"
  },
  input: {
    marginTop: "1em"
  },
  actions: {
    padding: "0 1em 1em 1em"
  }
});

// see http://redux-form.com/6.4.3/examples/material-ui/
const renderInput = ({
  meta: { touched, error } = {},
  input: { ...inputProps },
  ...props
}) => (
    <TextField
      error={!!(touched && error)}
      helperText={touched && error}
      {...inputProps}
      {...props}
      fullWidth
    />
  );

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forgotpassword: false,
      email: "",
      token: "",
      reset_password: ""
    };
  }

  handleSubmit(event) {
    this.submitForm();
    event.preventDefault();
  }

  handleChange = e => {
    // If you are using babel, you can use ES 6 dictionary syntax
    // let change = { [e.target.name] = e.target.value }
    let change = {};
    change[e.target.name] = e.target.value;
    this.setState(change);
  };

  forgotPassword = () => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    dataProvider("PASSWORD_RESET_EMAIL", "password_reset", {
      email: this.state.email
    })
      .then(response =>
        toast.success("Check your email for a password reset link.")
      )
      .catch(err =>
        toast.success("Check your email for a password reset link.")
      );
    this.toggleForgotPassword();
  };

  toggleForgotPassword = () => {
    this.setState(state => ({ forgotpassword: !state.forgotpassword }));
  };

  login = auth =>
    this.props.userLogin(
      auth,
      this.props.location.state ? this.props.location.state.nextPathname : "/"
    );

  render() {
    const { classes, handleSubmit, isLoading, translate } = this.props;
    return (
      <div className={classes.main}>
        <Card className={classes.card}>
          <div className={classes.avatar}>
            <Avatar className={classes.icon}>
              <LockIcon />
            </Avatar>
          </div>
          {
            //TODO: this can be extracted into its own class, but I'm not sure about how to do this currently.
          }
          {!this.state.forgotpassword ? (
            <React.Fragment>
              <form onSubmit={handleSubmit(this.login)}>
                <div className={classes.form}>
                  <div className={classes.input}>
                    <Field
                      autoFocus
                      name={Constants.login_details.USERNAME}
                      component={renderInput}
                      label={translate("en.auth.username")}
                      disabled={isLoading}
                    />
                  </div>
                  <div className={classes.input}>
                    <Field
                      name={Constants.login_details.PASSWORD}
                      component={renderInput}
                      label={translate("en.auth.password")}
                      type={Constants.fields.PASSWORD}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <CardActions className={classes.actions}>
                  <Button
                    variant="outlined"
                    type={Constants.fields.SUBMIT}
                    color="primary"
                    disabled={isLoading}
                    className={classes.button}
                    fullWidth
                  >
                    {isLoading && <CircularProgress size={25} thickness={2} />}
                    {translate("en.auth.sign_in")}
                  </Button>
                </CardActions>
              </form>
              <Button
                variant="outlined"
                color="inherit"
                disabled={isLoading}
                className={classes.button}
                onClick={this.toggleForgotPassword}
                fullWidth
              >
                {translate("en.auth.forgot")}
              </Button>
            </React.Fragment>
          ) : (
              <React.Fragment>
                <form onSubmit={handleSubmit(this.forgotPassword)}>
                  <div className={classes.form}>
                    <div className={classes.input}>
                      <Field
                        autoFocus
                        name={Constants.login_details.EMAIL}
                        component={renderInput}
                        onChange={this.handleChange}
                        label={translate("en.auth.email")}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <CardActions className={classes.actions}>
                    <Button
                      variant="outlined"
                      type={Constants.fields.SUBMIT}
                      color="primary"
                      disabled={isLoading}
                      className={classes.button}
                      fullWidth
                    >
                      {isLoading && <CircularProgress size={25} thickness={2} />}
                      {translate("en.auth.send_email")}
                    </Button>
                  </CardActions>
                  <Button
                    variant="outlined"
                    color="inherit"
                    disabled={isLoading}
                    className={classes.button}
                    onClick={this.toggleForgotPassword}
                    fullWidth
                  >
                    {translate("en.auth.return_to_login")}
                  </Button>
                </form>
              </React.Fragment>
            )}
        </Card>
        <ToastContainer />
      </div>
    );
  }
}

Login.propTypes = {
  ...propTypes,
  authProvider: PropTypes.func,
  classes: PropTypes.object,
  previousRoute: PropTypes.string,
  translate: PropTypes.func.isRequired,
  userLogin: PropTypes.func.isRequired
};

const mapStateToProps = state => ({ isLoading: state.admin.loading > 0 });

const enhance = compose(
  translate,
  reduxForm({
    form: "signIn",
    validate: (values, props) => {
      const errors = {};
      const { translate } = props;
      if (!values.username) {
        errors.username = translate("ra.validation.required");
      }
      if (!values.password) {
        errors.password = translate("ra.validation.required");
      }
      return errors;
    }
  }),
  connect(
    mapStateToProps,
    { userLogin }
  ),
  withStyles(styles)
);

const EnhancedLogin = enhance(Login);

// We need to put the MuiThemeProvider decoration in another component
// Because otherwise the withStyles() HOC used in EnhancedLogin won't get
// the right theme
const LoginWithTheme = props => (
  <MuiThemeProvider theme={createMuiTheme(lightTheme)}>
    <EnhancedLogin {...props} />
  </MuiThemeProvider>
);

export default LoginWithTheme;
