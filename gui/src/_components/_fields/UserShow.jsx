import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { FieldProps, InjectedFieldProps, fieldPropTypes } from "react-admin";
import * as Constants from "../../_constants/index";
import { withStyles } from "@material-ui/core/styles";
import UserAvatar from "react-user-avatar"

const styles = {
  image: {
    height: `${Constants.AVATAR_HEIGHT}`
  },
  imageContainer: {
    float: "left",
    "margin": "9px"
  },
  nameContainer: {
    float: "left",
    padding: "17px 17px"
  }
};

export const userSelect = choice => choice.first_name || choice.last_name ?
  `${choice.first_name} ${choice.last_name} (${choice.username})` : `${choice.username}`;

export const UserShow: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = withStyles(styles)  (({
  classes,
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
      <span>
      <div className={classes.imageContainer}>
        <UserAvatar size="36" name={`${first} ${last}`} />
      </div>
      <div className={classes.nameContainer}>
      <Typography
        component="span"
        variant="body1"
        className={className}
        {...rest}
      >
        {first} {last} ({username})
        </Typography>
        </div>
      </span>
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
});


UserShow.defaultProps = {
  addLabel: true,
  sortBy: Constants.model_fields.USERNAME,
};

const EnhancedUserShow = withStyles(styles)(UserShow);

EnhancedUserShow.defaultProps = {
  addLabel: true,
  sortBy: Constants.model_fields.USERNAME,
};

EnhancedUserShow.displayName = 'EnhancedUserShow';

export default EnhancedUserShow;
