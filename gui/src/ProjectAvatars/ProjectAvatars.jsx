//ProjectAvatars.jsx
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
import {AVATAR_HEIGHT, RESOURCE_OPERATIONS, MODEL_FIELDS} from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";

const styles = theme => ({
  image: {
    height: `${AVATAR_HEIGHT}`
  },
});

export const ProjectAvatarsList = withStyles(styles)(({ classes, ...props }) => (
  <List {...props} exporter={false}
    sort={{ field: MODEL_FIELDS.AVATAR_IMAGE, order: "DESC" }}
    bulkActionButtons={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
      <ImageField
        classes={classes}
        source={MODEL_FIELDS.AVATAR_IMAGE}
        title={MODEL_FIELDS.AVATAR_IMAGE}
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
        source={MODEL_FIELDS.AVATAR_IMAGE}
        title={MODEL_FIELDS.AVATAR_IMAGE}
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
  return <SimpleForm {...props} redirect={RESOURCE_OPERATIONS.LIST}>
    <ImageInput
      wultiple={false}
      source={MODEL_FIELDS.AVATAR_IMAGE}
      label="en.models.project_avatars.avatar_image"
      accept="image/*"
      placeholder={translate('en.models.project_avatars.drop_image')}
      validate={validateAvatar}>
      <ImageField
        classes={classes}
        source={MODEL_FIELDS.AVATAR_IMAGE}
        title={MODEL_FIELDS.TITLE}
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
