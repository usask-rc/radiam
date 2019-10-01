import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { withStyles } from "@material-ui/core/styles";
import { FieldProps, InjectedFieldProps, ReferenceField, } from "react-admin";
import * as Constants from "../../_constants/index";


const styles = {
  image: {
    height: `${Constants.AVATAR_HEIGHT}`
  },
  imageContainer: {
    float: "left",
    "margin": "6px 6px 6px 0px"
  },
  nameContainer: {
    float: "left",
    padding: "17px 0"
  }
};

const ShowImage: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = ({
  classes,
  record,
  source,
  ...rest
}) => {
  return <img alt="" src={get(record, source)} className={classes.image} />;
};

export const ProjectName: SFC<FieldProps & InjectedFieldProps & fieldPropTypes> = withStyles(styles)(({
  classes,
  className,
  allowEmpty,
  basePath,
  translateChoice,
  record = {},
  ...rest
}) => {
  return <span>
    <div className={classes.imageContainer}>
      <ReferenceField
        basePath={basePath}
        linkType={false}
        record={record}
        source={Constants.model_fields.AVATAR}
        reference={Constants.models.PROJECTAVATARS}
        allowEmpty
      >
        <ShowImage classes={classes} source={Constants.model_fields.AVATAR_IMAGE} record={record} />
      </ReferenceField>
    </div>
    <div className={classes.nameContainer}>
      <Typography
        component="span"
        variant="body1"
        className={className}
      >
        {record.name}
      </Typography>
    </div>
  </span>
});

ProjectName.defaultProps = {
  addLabel: true,
  sortBy: "name",
};

const EnhancedProjectName = withStyles(styles)(ProjectName);

EnhancedProjectName.defaultProps = {
  addLabel: true,
  sortBy: "name",
};

EnhancedProjectName.displayName = 'EnhancedProjectName';

export default EnhancedProjectName;
