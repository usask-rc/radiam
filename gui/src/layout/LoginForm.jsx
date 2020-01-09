//LoginForm.jsx
import React from 'react'
import { Field } from 'redux-form'
import * as Constants from "../_constants/index"
import compose from "recompose/compose"
import { translate } from "ra-core";
import { withStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button"
import CardActions from "@material-ui/core/CardActions"
import CircularProgress from "material-ui/CircularProgress"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ToggleForgot from './ToggleForgot';

const styles = () => ({
    actions: {
        padding: "0 1em 1em 1em"
    },
    button: {
        textTransform: "none",
    },
    form: {
        padding: "0 1em 1em 1em"
    },
    input: {
        marginTop: "1em"
    },   
})

const LoginForm = ({classes, translate, isLoading, renderInput, toggleForgotPassword, handleSubmit, login}) => {
    return(
        <MuiThemeProvider>
            <form onSubmit={handleSubmit(login)}>
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
                <ToggleForgot forgotText={"en.auth.forgot"} toggleForgotPassword={toggleForgotPassword} />
            </form>
        </MuiThemeProvider>
    )
}

const enhance = compose(
    translate,
    withStyles(styles)
);

export default enhance(LoginForm)