import React from "react";
import {
  Create,
  Datagrid,
  Edit,
  ImageField,
  ImageInput,
  List,
  NumberField,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  withTranslate,
} from "react-admin";
import { withStyles } from "@material-ui/core/styles";
import * as Constants from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";

const styles = theme => ({
  image: {
    height: `${Constants.AVATAR_HEIGHT}`
  },
});

export const ProjectAvatarsList = withStyles(styles)(({ classes, ...props }) => (
  <List {...props} exporter={false}
    sort={{ field: "avatar_image", order: "DESC" }}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <ImageField
        classes={classes}
        source="avatar_image"
        title="avatar_image"
        label={"en.models.project_avatars.avatar_image"} />
      <NumberField
        source="width"
        label={"en.models.project_avatars.width"} />
      <NumberField
        source="height"
        label={"en.models.project_avatars.width"} />
    </Datagrid>
  </List>
));

export const ProjectAvatarsShow = withStyles(styles)(({ classes, ...props }) => (
  <Show {...props}>
    <SimpleShowLayout>
      <ImageField
        classes={classes}
        source="avatar_image"
        title="avatar_image"
        label={"en.models.project_avatars.avatar_image"} />
      <NumberField
        source="width"
        label={"en.models.project_avatars.width"} />
      <NumberField
        source="height"
        label={"en.models.project_avatars.width"} />
    </SimpleShowLayout>
  </Show>
));

const validateAvatar = required('en.validate.projectavatar.avatar_image');

const ProjectAvatarForm = ({ classes, translate, ...props }) => {
  return <SimpleForm {...props} redirect={Constants.resource_operations.LIST}>
    <ImageInput
      wultiple={false}
      source="avatar_image"
      label="en.models.project_avatars.avatar_image"
      accept="image/*"
      placeholder={translate('en.models.project_avatars.drop_image')}
      validate={validateAvatar}>
      <ImageField
        classes={classes}
        source="avatar_image"
        title="title"
      />
    </ImageInput>
  </SimpleForm>
};

export const ProjectAvatarsCreate = withTranslate(withStyles(styles)(({ classes, translate, ...props }) => (
  <Create {...props}>
    <ProjectAvatarForm translate={translate} />
  </Create>
)));

export const ProjectAvatarsEdit = withTranslate(withStyles(styles)(({ classes, translate, ...props }) => (
  <Edit {...props}>
    <ProjectAvatarForm translate={translate} />
  </Edit>
)));
