import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { FieldProps, InjectedFieldProps, fieldPropTypes } from "react-admin";
import {MODEL_FIELDS, MODEL_FK_FIELDS} from "../../_constants/index";

export const agentSelect = choice => choice.location ?
    `${choice.location}` : `${choice.user}`;

export const AgentShow: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = ({
    className,
    allowEmpty,
    basePath,
    translateChoice,
    record = {},
    ...rest
}) => {
    const display_location = get(record, MODEL_FIELDS.LOCATION);
    const display_user = get(record, MODEL_FK_FIELDS.USER);
    if (display_location) {
        return (
            <Typography
                component="span"
                variant="body1"
                className={className}
                {...rest}
            >
                {record.id}
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

