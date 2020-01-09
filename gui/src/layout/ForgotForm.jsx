//ForgotForm.jsx

import React from 'react'
import Button from '@material-ui/core/Button'
import {withStyles} from '@material-ui/core/styles'
import { translate } from "ra-core"
import { Field } from 'redux-form';
import {LOGIN_DETAILS, FIELDS} from "../_constants/index"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CardActions from 'material-ui/Card/CardActions';
import CircularProgress from "material-ui/CircularProgress"
import ToggleForgot from './ToggleForgot';
import compose from "recompose/compose"

const styles = () => ({
    form: {
        padding: "0 1em 1em 1em"
    },
    input: {
        marginTop: "1em"
    },   
    actions: {
        padding: "0 1em 1em 1em"
    },
    button: {
        textTransform: "none",
    },
});


const validateEmail = value =>
value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
'Invalid email address' : undefined
const ForgotForm = ({classes, handleSubmit, forgotPassword, toggleForgotPassword, renderInput, handleChange, isLoading }) => {
    return(
        <MuiThemeProvider>
            <form onSubmit={handleSubmit(forgotPassword)}>
                <div className={classes.form}>
                    <div className={classes.input}>
                        <Field
                        autoFocus
                        name={LOGIN_DETAILS.EMAIL}
                        component={renderInput}
                        onChange={handleChange}
                        label={translate("en.auth.email")}
                        disabled={isLoading}
                        validate={validateEmail}
                        />
                    </div>
                </div>
                <CardActions className={classes.actions}>
                    <Button
                        variant="outlined"
                        type={FIELDS.SUBMIT}
                        color="primary"
                        disabled={isLoading}
                        className={classes.button}
                        fullWidth
                    >
                        {isLoading && <CircularProgress size={25} thickness={2} />}
                        {translate("en.auth.send_email")}
                    </Button>
                </CardActions>
                <ToggleForgot forgotText={"en.auth.return_to_login"} toggleForgotPassword={toggleForgotPassword} />
            </form>
        </MuiThemeProvider>
    )
}


const enhance = compose(
    translate,
    withStyles(styles)
);

export default enhance(ForgotForm)