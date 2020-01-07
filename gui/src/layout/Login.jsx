//Login.jsx
import React, { Component } from "react";
import PropTypes from "prop-types";
import { propTypes, reduxForm } from "redux-form";
import { connect } from "react-redux";
import compose from "recompose/compose";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import {
  MuiThemeProvider,
  createMuiTheme,
  withStyles
} from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";
import { translate, userLogin } from "react-admin";
import { lightTheme } from "./themes";
import { radiamRestProvider, getAPIEndpoint, httpClient } from "../_tools";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginForm from "./LoginForm"
import ForgotForm from "./ForgotForm";

const styles = theme => ({
  avatar: {
    margin: "1em",
    display: "flex",
    justifyContent: "center"
  },
  card: {
    minWidth: 300,
    marginTop: "6em"
  },
  icon: {
    backgroundColor: theme.palette.secondary.main
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
});

// see http://redux-form.com/6.4.3/examples/material-ui/
const renderInput = ({
  meta: { touched, error } = {},
  input: { ...inputProps },
  ...props
}) => 
{
return(
    <TextField
      error={!!(touched && error)}
      helperText={touched && error}
      {...inputProps}
      {...props}
      fullWidth
    />
  )};

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      forgotPassword: false,
      email: "",
      token: "",
      reset_password: ""
    };
  }
  componentDidMount(){
    localStorage.clear()
    sessionStorage.clear()
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


  //TODO: the below Toasts need to be put in the Constants or the Translation file.
  forgotPassword = (e) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    const { email } = this.state
    dataProvider("PASSWORD_RESET_EMAIL", "password_reset", {
      email: email
    })
      .then(() =>
        toast.success("Please check your email for a password reset link.")
      )
      .catch(err =>
        toast.error("Error: ", err)
      );
  };

  toggleForgotPassword = (e) => {
    const { forgotPassword } = this.state
    e.preventDefault()
    this.setState({forgotPassword: !forgotPassword });
  };

  login = auth =>{
    const {userLogin, location} = this.props
    return userLogin(
      auth,
      location.state ? location.state.nextPathname : "/"
    )};

  render() {
    const { classes, handleSubmit, isLoading } = this.props;
    const { forgotPassword } = this.state
    console.log("Login.jsx rendered.  Props: ", this.props)

    return (
      <div className={classes.main}>
        <Card className={classes.card}>
          <div className={classes.avatar}>
            <Avatar className={classes.icon}>
              <LockIcon />
            </Avatar>
          </div>

          {!forgotPassword ? (
            <LoginForm isLoading={isLoading} renderInput={renderInput} handleSubmit={handleSubmit} toggleForgotPassword={this.toggleForgotPassword} login={this.login} />
          ) : ( 
            <ForgotForm handleSubmit={handleSubmit} forgotPassword={this.forgotPassword} toggleForgotPassword={this.toggleForgotPassword} renderInput={renderInput} 
            handleChange={this.handleChange} isLoading={isLoading}/>
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
      if (props.anyTouched){
        if (!values.username) {
          errors.username = translate("ra.validation.required");
        }
        if (!values.password) {
          errors.password = translate("ra.validation.required");
        }
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
