import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { FieldProps, InjectedFieldProps, fieldPropTypes } from "react-admin";
import * as Constants from "../../_constants/index";

export const userSelect = choice => choice.first_name || choice.last_name ?
  `${choice.first_name} ${choice.last_name} (${choice.username})` : `${choice.username}`;

export const UserShow: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = ({
  className,
  allowEmpty,
  basePath,
  translateChoice,
  record = {},
  ...rest
}) => {
  const first = get(record, Constants.model_fields.FIRST_NAME);
  const last = get(record, Constants.model_fields.LAST_NAME);
  const username = get(record, Constants.model_fields.USERNAME);
  if (first || last) {
    return (
      <Typography
        component="span"
        variant="body1"
        className={className}
        {...rest}
      >
        {first} {last} ({username})
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
        {username}
      </Typography>
    );
  }
};

