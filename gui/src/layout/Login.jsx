//Login.jsx
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import compose from "recompose/compose";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import {ThemeProvider as MuiThemeProvider} from '@material-ui/core/styles';
import {
  createMuiTheme,
  withStyles
} from "@material-ui/core/styles";
import LockIcon from "@material-ui/icons/Lock";
import { translate } from "ra-core"
import { userLogin } from "react-admin";
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
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  componentDidMount(){
    localStorage.clear()
    sessionStorage.clear()
  }

  handleSubmit(data) {
    this.login({username: data.username, password: data.password})
  }

  handleSubmitEmail(data){
    //console.log("handlesubmitemail: ", data)
  }


  handleChange = e => {
    this.setState({ [e.target.name] : e.target.value});
  };


  //TODO: the below Toasts need to be put in the Constants or the Translation file.
  forgotPassword = ({email}) => {
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
    dataProvider("PASSWORD_RESET_EMAIL", "password_reset", {
      email: email
    })
      .then(() =>
        {
          toast.success("Please check your email for a password reset link.")
          this.toggleForgotPassword()
        }
      )
      .catch(err =>
        toast.error("Error: ", err)
      );
  };

  toggleForgotPassword = (e) => {
    const { forgotPassword } = this.state
    if (e){
      e.preventDefault()
    }
    this.setState({forgotPassword: !forgotPassword });
  };

  login = auth =>{
    const {userLogin, location} = this.props
    //console.log("login props: ", this.props)
    return userLogin(
      auth,
      location.state ? location.state.nextPathname : "/"
    )
  };

  render() {
    const { classes, loading } = this.props;
    const { forgotPassword } = this.state
    return (
      <div className={classes.main}>
        <Card className={classes.card}>
          <div className={classes.avatar}>
            <Avatar className={classes.icon}>
              <LockIcon />
            </Avatar>
          </div>

          {!forgotPassword ? (
            <LoginForm loading={loading} renderInput={renderInput} handleSubmit={this.handleSubmit} toggleForgotPassword={this.toggleForgotPassword} login={this.login} />
          ) : ( 
            <ForgotForm handleSubmit={this.forgotPassword} forgotPassword={this.forgotPassword} toggleForgotPassword={this.toggleForgotPassword} renderInput={renderInput} loading={loading}/>
          )}
        </Card>
        <ToastContainer />
      </div>
    );
  }
}

Login.propTypes = {
  authProvider: PropTypes.func,
  classes: PropTypes.object,
  previousRoute: PropTypes.string,
  translate: PropTypes.func.isRequired,
  userLogin: PropTypes.func.isRequired
};

const mapStateToProps = state => ({ loading: state.admin.loading > 0 });

const enhance = compose(
  translate,
  /*
  reactFinalForm({
    form: "signIn",
    validate: (values, props) => {
      const errors = {};
      //console.log("values, props in rff: ", values, props)
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
    */

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
