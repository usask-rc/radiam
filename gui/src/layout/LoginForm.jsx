//LoginForm.jsx
import React from 'react'
import { Field, Form } from 'react-final-form'
import {LOGIN_DETAILS, FIELDS} from "../_constants/index"
import compose from "recompose/compose"
import { withStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button"
import CardActions from "@material-ui/core/CardActions"
import CircularProgress from "@material-ui/core/CircularProgress"
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import ToggleForgot from './ToggleForgot';
import { translate } from "react-admin"

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


const LoginForm = ({classes, isLoading, handleSubmit, renderInput, toggleForgotPassword, login}) => {

    return(
        <MuiThemeProvider>
            <Form onSubmit={(values) => handleSubmit(values)}
            
            /*
            validate = {(values, props) => {
            const errors = {};
            console.log("values, props in rff: ", values, props)
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
            }}
            */>
            { ( {handleSubmit, pristine, reset, submitting, login }) => (
                <form onSubmit={handleSubmit}>
                    <div className={classes.form}>
                        <div className={classes.input}>
                            <Field
                                autoFocus
                                name={LOGIN_DETAILS.USERNAME}
                                component={renderInput}
                                label="auth.username"
                                disabled={isLoading}
                            />
                        </div>
                        <div className={classes.input}>
                            <Field
                                name={LOGIN_DETAILS.PASSWORD}
                                component={renderInput}
                                label={"auth.password"}
                                type={FIELDS.PASSWORD}
                                disabled={isLoading}
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
                            {"auth.sign_in"}
                        </Button>
                    </CardActions>
                    <ToggleForgot forgotText={"en.auth.forgot"} toggleForgotPassword={toggleForgotPassword} />
                </form>
            )}
            </Form>
        </MuiThemeProvider>
    )
}

const enhance = compose(
    translate,
    withStyles(styles)
);

export default enhance(LoginForm)