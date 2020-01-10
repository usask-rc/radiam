import React from 'react';
import { translate } from 'react-admin';
import withStyles from '@material-ui/core/styles/withStyles';
import compose from 'recompose/compose';
import { TextField } from "@material-ui/core";
import {PASSWORD_CHANGE, FIELDS} from "../../_constants/index"

const styles = {
    label: { width: '10em', display: 'inline-block' },
    button: { margin: '1em' },
};
const NewPassword = ({ classes, handleChange }) => (
    <>
        <div className={classes.input}>
            <TextField
                id={PASSWORD_CHANGE.PASSWORD_NEW}
                name={PASSWORD_CHANGE.PASSWORD_NEW}
                label={"New Password"}
                onChange={handleChange}
                type={FIELDS.PASSWORD} />
        </div>

        <div className={classes.input}>
            <TextField
                id={PASSWORD_CHANGE.PASSWORD_CONFIRM}
                name={PASSWORD_CHANGE.PASSWORD_CONFIRM}
                label={"Confirm New Password"}
                onChange={handleChange}
                type={FIELDS.PASSWORD} />
        </div>
    </>)

const enhance = compose(
    translate,
    withStyles(styles)
);

export default enhance(NewPassword)