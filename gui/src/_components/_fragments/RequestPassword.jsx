


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
const RequestPassword = ({ classes, handleChange }) => (
    <React.Fragment>
        <div className={classes.input}>
            <TextField
                id={Constants.password_change.PASSWORD_OLD}
                name={Constants.password_change.PASSWORD_OLD}
                label={Constants.login_details.PASSWORD}
                onChange={handleChange}
                type={Constants.fields.PASSWORD} />
        </div>
    </React.Fragment>)

const enhance = compose(
    translate,
    withStyles(styles)
);

export default enhance(RequestPassword)