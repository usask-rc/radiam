import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { FieldProps, InjectedFieldProps, fieldPropTypes } from "react-admin";
import * as Constants from "../../_constants/index";

export const agentSelect = choice => choice.id ?
    `${choice.id}` : `${choice.id}`;

//i dont know how necessary this is - but this is the equivalent display item for Location Show, to display Agent data on a File display.  It is not completed yet.
export const AgentShow: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = ({
    className,
    allowEmpty,
    basePath,
    translateChoice,
    record = {},
    ...rest
}) => {
    console.log("in agentshow, rest is: ", rest)

    const display_location = get(record, Constants.model_fields.ID);
    const display_user = get(record, "user");

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

