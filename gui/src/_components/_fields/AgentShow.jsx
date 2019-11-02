import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { FieldProps, InjectedFieldProps, fieldPropTypes } from "react-admin";
import * as Constants from "../../_constants/index";

export const agentSelect = choice => choice.location ?
    `${choice.location}` : `${choice.user}`;

//TODO: once we finally get some fresh data, test to make sure this AgentShow is displaying on project files.
export const AgentShow: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = ({
    className,
    allowEmpty,
    basePath,
    translateChoice,
    record = {},
    ...rest
}) => {
    const display_location = get(record, Constants.model_fields.LOCATION);
    const display_user = get(record, Constants.model_fk_fields.USER);
    if (display_location) {
        return (
            <Typography
                component="span"
                variant="body1"
                className={className}
                {...rest}
            >
                {display_location}
            </Typography>
        );
    } else {
        return (
            <Typography
                component="span"
                variant="body1"
                className={className}
                {...rest}
            >
                {display_user}
            </Typography>
        );
    }
};

