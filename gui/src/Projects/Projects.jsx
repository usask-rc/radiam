import React from 'react';
import {
  Create,
  Datagrid,
  Edit,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  Show,
  Tab,
  TabbedShowLayout,
  TextField,
  TextInput,
  withTranslate,
} from 'react-admin';

import { withStyles } from '@material-ui/core/styles';
import * as Constants from '../_constants/index';
import FilesTab from './Files/FilesTab';
import BrowseTab from './Browse/BrowseTab';
import CustomPagination from '../_components/CustomPagination';
import { ProjectName } from '../_components/_fields/ProjectName.jsx';
import { ProjectStepper } from '../_components/ProjectStepper.jsx';
import { UserShow } from '../_components/_fields/UserShow';
import '../_components/components.css';
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

export const ProjectShow = withStyles(styles)(
  ({ classes, permissions, ...props }) => {

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
  }
);

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

export const ProjectEdit = withTranslate(
  withStyles(styles)(({ classes, permissions, translate, ...props }) => (
    <React.Fragment>
      <Edit title={<ProjectTitle />} {...props}>
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            const { record, basePath, resource } = rest;
            if (canEditProject({ permissions, record })) {
              return (
                <React.Fragment>
                  <RelatedDatasets projectID={props.id} {...props} />
                  <ProjectStepper
                    permissions={permissions}
                    translate={translate}
                    classes={classes}
                    mode={"edit"}
                    {...rest}
                  />
                  {permissions.is_admin && (
                    <DeleteButton
                      record={record}
                      basePath={basePath}
                      resource={resource}
                    />
                  )}
                </React.Fragment>
              );
            }
            return null;
          }}
        </FormDataConsumer>
      </Edit>
      <Route path='/#/datasets/create' render={ () =>(
        <Drawer open>
          <DatasetCreate {...props} />
        </Drawer>)}
        />
      
    </React.Fragment>

  ))
);

//<SimpleForm redirect={Constants.resource_operations.LIST}>
//<ProjectStepper classes={classes} translate={translate} />
//<ProjectEditInputs permissions={permissions} />
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
