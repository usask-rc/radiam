import React, { SFC } from "react";
import get from 'lodash/get';
import Typography from '@material-ui/core/Typography';
import { withStyles } from "@material-ui/core/styles";
import { FieldProps, InjectedFieldProps, ReferenceField, } from "react-admin";
import {MODEL_FIELDS, MODELS, AVATAR_HEIGHT} from "../../_constants/index";


const styles = {
  image: {
    height: `${AVATAR_HEIGHT}`
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
}) => {
  return <span>
    <div className={classes.imageContainer}>
      <ReferenceField
        basePath={basePath}
        linkType={false}
        record={record}
        source={MODEL_FIELDS.AVATAR}
        reference={MODELS.PROJECTAVATARS}
        allowEmpty
      >
        <ShowImage classes={classes} source={MODEL_FIELDS.AVATAR_IMAGE} record={record} />
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
  sortBy: MODEL_FIELDS.NAME,
};

export default ProjectName;
