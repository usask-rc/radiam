//ForgotPassword.jsx
import React, { Component, useState } from 'react'
import { Field } from "redux-form";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";

import { translate } from "react-admin";
import * as Constants from "../_constants/index";
import "react-toastify/dist/ReactToastify.css";
import { TextField } from '@material-ui/core';


const validateEmail = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
  'Invalid email address' : undefined


  //TODO: return here once we figure out how to get rid of the `this.submitForm()` in the parent (Login.jsx) file.
const ForgotPassword = ({classes, translate, renderInput, forgotPassword, toggleForgotPassword}) => {

    const [email, setEmail] = useState('')

    const handleChange = (event) => {
        if (event.target.name === 'email' && validateEmail(event.target.value) === undefined){
            setEmail(event.target.value)
            console.log("email set to: ", email)
        }
        else if (event.targete.name === 'email'){
            setEmail(null)
        }
    }
    /*
    const handleSubmit = (event) => {
        if 
    }*/

    return (
        <React.Fragment>
            <div className={classes.form}>
            <div className={classes.input}>
                <TextField
                autoFocus
                name={Constants.login_details.EMAIL}
                onChange={handleChange}
                label={translate("en.auth.email")}
                validate={validateEmail}/>
            </div>
            </div>
            <CardActions className={classes.actions}>
        <Button
            variant="outlined"
            onClick={handleSubmit}
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
        </React.Fragment>
    )
}

export default ForgotPassword