import React, { Component } from 'react'
import PropTypes from "prop-types";
import { propTypes, reduxForm, Field } from "redux-form";
import { connect } from "react-redux";
import compose from "recompose/compose";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CircularProgress from "@material-ui/core/CircularProgress";

import { translate } from "react-admin";
import * as Constants from "../_constants/index";
import "react-toastify/dist/ReactToastify.css";



const ForgotPassword = ({classes, handleSubmit, handleChange, renderInput, forgotPassword, toggleForgotPassword, validateEmail}) => {

    return(<React.Fragment>
        <form onSubmit={handleSubmit(forgotPassword)}>
          <div className={classes.form}>
            <div className={classes.input}>
              <Field
                autoFocus
                name={Constants.login_details.EMAIL}
                component={renderInput}
                onChange={handleChange}
                label={translate("en.auth.email")}
                validate={validateEmail}
              />
            </div>
          </div>
          <CardActions className={classes.actions}>
            <Button
              variant="outlined"
              type={Constants.fields.SUBMIT}
              color="primary"
              className={classes.button}
              fullWidth
            >
              {translate("en.auth.send_email")}
            </Button>
          </CardActions>
          <Button
            variant="outlined"
            color="inherit"
            className={classes.button}
            onClick={toggleForgotPassword}
            fullWidth
          >
            {translate("en.auth.return_to_login")}
          </Button>
        </form>
      </React.Fragment>)
}

export default ForgotPassword