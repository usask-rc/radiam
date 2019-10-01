import React from 'react';
import { translate } from 'react-admin';
import withStyles from '@material-ui/core/styles/withStyles';
import compose from 'recompose/compose';
import { TextField } from "@material-ui/core";
import * as Constants from "../../_constants/index"

const styles = {
    label: { width: '10em', display: 'inline-block' },
    button: { margin: '1em' },
};
const ConfirmPassword = ({ classes, handleChange }) => (
    <React.Fragment>
        <div className={classes.input}>
            <TextField
                id={Constants.password_change.PASSWORD_NEW}
                name={Constants.password_change.PASSWORD_NEW}
                label={"New Password"}
                onChange={handleChange}
                type={Constants.fields.PASSWORD} />
        </div>

        <div className={classes.input}>
            <TextField
                id={Constants.password_change.PASSWORD_CONFIRM}
                name={Constants.password_change.PASSWORD_CONFIRM}
                label={"Confirm New Password"}
                onChange={handleChange}
                type={Constants.fields.PASSWORD} />
        </div>
    </React.Fragment>)

const enhance = compose(
    translate,
    withStyles(styles)
);

export default enhance(ConfirmPassword)