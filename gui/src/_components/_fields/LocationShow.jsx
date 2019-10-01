import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { FieldProps, InjectedFieldProps, fieldPropTypes } from "react-admin";
import * as Constants from "../../_constants/index";

export const locationSelect = choice => choice.display_name ?
  `${choice.display_name}` : `${choice.host_name}`;

export const LocationShow: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = ({
  className,
  allowEmpty,
  basePath,
  translateChoice,
  record = {},
  ...rest
}) => {
  const display_name = get(record, Constants.model_fields.DISPLAY_NAME);
  const host_name = get(record, Constants.model_fields.HOST_NAME);
  if (display_name) {
    return (
      <Typography
        component="span"
        variant="body1"
        className={className}
        {...rest}
      >
        {display_name}
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
        {host_name}
      </Typography>
    );
  }
};

