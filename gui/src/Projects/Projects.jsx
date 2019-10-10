import React, {Component} from "react";
import {
  CardActions,
  Create,
  CreateButton,
  Datagrid,
  Edit,
  Filter,
  ImageField,
  List,
  ReferenceField,
  ReferenceInput,
  RefreshButton,
  required,
  SelectInput,
  Show,
  ShowButton,
  ShowController,
  SimpleForm,
  Tab,
  TabbedShowLayout,
  TextField,
  TextInput,
  translate,
  withTranslate,
} from 'react-admin';

import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Divider from '@material-ui/core/Divider';
import { CardContentInner } from "ra-ui-materialui";
import * as Constants from "../_constants/index";
import BrowseTab from './Browse/BrowseTab';
import FilesTab from "./Files/FilesTab";
import { EditMetadata, ConfigMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import CustomPagination from "../_components/CustomPagination";
import { ProjectName } from "../_components/_fields/ProjectName.jsx";
import { ProjectStepper } from "../_components/ProjectStepper.jsx";
import { userSelect, UserShow } from "../_components/_fields/UserShow";
import "../_components/components.css";
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/Settings';
import compose from "recompose/compose";
import { FormDataConsumer } from 'ra-core';
import DeleteButton from 'ra-ui-materialui/lib/button/DeleteButton';
import MapView from '../_components/_fragments/MapView';
import RelatedDatasets from '../Datasets/RelatedDatasets';
import { Drawer } from '@material-ui/core';
import { DatasetCreate } from '../Datasets/Datasets';
import { Route } from "react-router"

const styles = {
  actions: {
    backgroundColor: 'inherit',
  },
  header: {
    backgroundColor: 'inherit',
  },
  image: {
    height: `${Constants.AVATAR_HEIGHT}`,
  },
  root: {
    backgroundColor: 'inherit',
  },
};

const filterStyles = {
  form: {
    backgroundColor: 'inherit',
  },
};

const validateGroup = required('en.validate.project.group');
const validateName = required('en.validate.project.name');
const validatePrimaryContactUser = required('en.validate.project.primary_contact_user');

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const ProjectFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <ReferenceInput
      label={'en.models.projects.group'}
      source={Constants.model_fk_fields.GROUP}
      reference={Constants.models.GROUPS}
    >
      <SelectInput optionText={Constants.model_fields.NAME} />
    </ReferenceInput>
    <TextInput
      label={'en.models.projects.name'}
      source={Constants.model_fields.NAME}
    />
  </Filter>
));
//will need to be updated to look up only groups that the user is in.
export const ProjectList = withStyles(styles)(({ classes, ...props }) => (
  <List
    {...props}
    classes={{
      root: classes.root,
      header: classes.header,
      actions: classes.actions,
    }}
    exporter={false}
    filters={<ProjectFilter />}
    sort={{ field: Constants.model_fields.DATE_UPDATED, order: 'DESC' }}
    perPage={10}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <ProjectName label={'en.models.projects.name'} />
      <ReferenceField
        linkType={false}
        label={'en.models.projects.primary_contact_user'}
        source={Constants.model_fields.PRIMARY_CONTACT_USER}
        reference={Constants.models.USERS}
        allowEmpty
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={'en.models.projects.group'}
        source={Constants.model_fk_fields.GROUP}
        reference={Constants.models.GROUPS}
      >
        <TextField source={Constants.model_fields.NAME} />
      </ReferenceField>
      <TextField
        label={'en.models.projects.keywords'}
        source={Constants.model_fields.KEYWORDS}
      />
    </Datagrid>
  </List>
));

export const ProjectShow = withTranslate(withStyles(styles)(
  ({ classes, permissions, translate, ...props }) => {
    const { record } = props;
    return (
      <Show {...props}>
        <TabbedShowLayout>
          <Tab label={'summary'}>
            <ProjectName label={'en.models.projects.name'} />
            <RelatedDatasets projectID={props.id} {...props} />
            <TextField
              label={'en.models.projects.keywords'}
              source={Constants.model_fields.KEYWORDS}
            />
            <ReferenceField
              label={'en.models.projects.primary_contact_user'}
              source={Constants.model_fields.PRIMARY_CONTACT_USER}
              reference={Constants.models.USERS}
            >
              <UserShow />
            </ReferenceField>
            <ReferenceField
              label={'en.models.projects.group'}
              source={Constants.model_fields.GROUP}
              reference={Constants.models.GROUPS}
            >
              <TextField source={Constants.model_fields.NAME} />
            </ReferenceField>
            /** Needs a ShowController to get the record into the ShowMetadata **/
            <ShowController translate={translate} {...props}>
              { controllerProps => (
                <ShowMetadata
                  type="project"
                  translate={translate}
                  record={controllerProps.record}
                  basePath={controllerProps.basePath}
                  resource={controllerProps.resource}
                  id={controllerProps.record.id}
                  props={props}
                />
              )}
            </ShowController>
            <MapView/>
          </Tab>
          <Tab label={Constants.model_fields.FILES} path={Constants.model_fields.FILES}>
            <ProjectName label={'en.models.projects.name'} />
            <FilesTab projectID={props.id} />
          </Tab>
          <Tab label={'browse'} path={'browse'}>
            <ProjectName label={'en.models.projects.name'} />
            <BrowseTab projectID={props.id} />
          </Tab>
        </TabbedShowLayout>
      </Show>
    );
}));

export const ProjectEditInputs = withStyles(styles)(({ classes, permissions, record, state }) => {
  if (canEditProject({ permissions, record })) {
    return <CardContentInner>
      <div>
        <TextInput
          className="input-small"
          label={"en.models.projects.name"}
          source={Constants.model_fields.NAME}
          validate={validateName} />
      </div>
        <ReferenceInput
          resource="projectavatars"
          className="input-small"
          label="Avatar"
          source={"avatar"} reference="projectavatars">
            <SelectInput source="avatar_image" optionText={<ImageField classes={{image: classes.image}} source="avatar_image" />}/>
        </ReferenceInput>
      <div>
        <TextInput
          className="input-small"
          label={"en.models.projects.keywords"}
          source={Constants.model_fields.KEYWORDS} />
      </div>
      <div>
        <ReferenceInput
          resource="users"
          className="input-small"
          label={"en.models.projects.primary_contact_user"}
          source={Constants.model_fields.PRIMARY_CONTACT_USER} reference="users"
          validate={validatePrimaryContactUser}>
          <SelectInput optionText={userSelect} />
        </ReferenceInput>
      </div>
      <div>
        <ReferenceInput
          resource="researchgroups"
          className="input-small"
          label={"en.models.projects.group"}
          source={Constants.model_fields.GROUP}
          reference={Constants.models.GROUPS}
          validate={validateGroup}>
          <SelectInput optionText={Constants.model_fields.NAME} />
        </ReferenceInput>
        { record.id && (
          <React.Fragment>
            <EditMetadata id={record.id} type="project"/>
            <ConfigMetadata id={record.id} type="project"/>
          </React.Fragment>
          )}
      </div>
    </CardContentInner>;
  }
});

export const ProjectCreate = withTranslate(
  withStyles(styles)(({ classes, translate, ...props }) => (
    <Create {...props}>
      <ProjectStepper classes={classes} translate={translate} {...props} />
    </Create>
  ))
);

export const ProjectTitle = ({ record }) => (
  <span>Project {record ? `"${record.name}"` : ''}</span>
);

class BaseProjectEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: false,
    };
  }

  render() {
    const { classes, permissions, record, ...others } = this.props;

    return <Edit title={<ProjectTitle />} actions={<MetadataEditActions />} {...others}>
      <SimpleForm redirect={Constants.resource_operations.LIST}>
        <ProjectEditInputs classes={classes} permissions={permissions} record={record} state={this.state} />
      </SimpleForm>
    </Edit>;
  }
};

const enhance = compose(
  translate,
  withStyles(styles),
);
const TagCreateActions = ({id}) => 
{
  //create a dataset
  console.log("props in tagcreateactions is: ", id)
return(
  <CardActions>
    <RelatedDatasets projectID={id} />
  </CardActions>
)};

export const ProjectEdit = enhance(BaseProjectEdit);

const canEditProject = ({ permissions, record }) => {
  if (!permissions) {
    return false;
  } else if (!record) {
    return false;
  } else if (permissions.is_admin) {
    return true;
  } else if (
    permissions.groupMemberships &&
    permissions.groupMemberships.length > 0
  ) {
    for (var i = 0; i < permissions.groupMemberships.length; i++) {
      var groupMembership = permissions.groupMemberships[i];
      //'if there is a group in this membership, and its ID matches the group we are inspecting, proceed'.
      if (groupMembership.group && groupMembership.group.id === record.group) {
        if (
          groupMembership.group_role.id === Constants.ROLE_DATA_MANAGER ||
          groupMembership.group_role.id === Constants.ROLE_GROUP_ADMIN
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
  } else {
    return false;
  }
};
