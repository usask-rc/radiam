//UserAgents.jsx
import React, { useState, useEffect } from "react";
import CustomPagination from "../_components/CustomPagination";
import {
  ArrayField,
  BooleanField,
  BooleanInput,
  ChipField,
  Create,
  Datagrid,
  Edit,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
} from "react-admin";
import * as Constants from "../_constants/index";
import { withStyles } from "@material-ui/core/styles";
import { locationSelect, LocationShow } from "../_components/_fields/LocationShow";
import { userSelect, UserShow } from "../_components/_fields/UserShow";
import { regex, FormDataConsumer, ShowController } from "ra-core";
import { Grid, Toolbar } from "@material-ui/core";
import { ArrayInput } from "ra-ui-materialui/lib/input/ArrayInput";
import { Show } from "ra-ui-materialui/lib/detail";
import { EditButton } from "ra-ui-materialui/lib/button";
import UserAgentTitle from "./UserAgentTitle";

const filterStyles = {
  form: {
    backgroundColor: "inherit"
  }
};
const listStyles = {
  actions: {
    backgroundColor: "inherit"
  },
  header: {
    backgroundColor: "inherit"
  },
  root: {
    backgroundColor: "inherit"
  },
};

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const UserAgentFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <ReferenceInput
      label={"en.models.agents.user"}
      source={Constants.model_fk_fields.USER}
      reference={Constants.models.USERS}
      alwaysOn
    >
      <SelectInput optionText={userSelect} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.agents.location"}
      source={Constants.model_fk_fields.LOCATION}
      reference={Constants.models.LOCATIONS}
      alwaysOn
    >
      <SelectInput optionText={locationSelect} />
    </ReferenceInput>
  </Filter>
));

//will need to be updated to look up only groups that the user is in.
export const UserAgentList = withStyles(listStyles)(({ classes, ...props }) => (
  <List
    {...props}
    classes={{
      root: classes.root,
      header: classes.header,
      actions: classes.actions
    }}
    exporter={false}
    filters={<UserAgentFilter />}
    sort={{ field: Constants.model_fields.DATE_UPDATED, order: "DESC" }}
    perPage={10}
    pagination={<CustomPagination />}
    bulkActionButtons={false}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <ReferenceField
        linkType={false}
        label={"en.models.agents.user"}
        source={Constants.model_fk_fields.USER}
        reference={Constants.models.USERS}
        allowEmpty={false}
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={"en.models.agents.location"}
        source={Constants.model_fk_fields.LOCATION}
        reference={Constants.models.LOCATIONS}
      >
        <LocationShow />
      </ReferenceField>
      
    </Datagrid>
  </List>
));

const actionStyles = theme => ({
  toolbar:{
    float: "right",
    marginTop: "-20px",
  }
})

const UserAgentShowActions = withStyles(actionStyles)(({ basePath, data, resource, classes}) => 
{
  const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)

  useEffect(() => {
    if (data && !showEdit){
      if (data.user === user.id){
        setShowEdit(true)
      }
    }
  }, [data])

  if (showEdit){
    return(
    <Toolbar className={classes.toolbar}>
      <EditButton basePath={basePath} record={data} />
    </Toolbar>
    )
  }
  else{
    return null
  }
})

export const UserAgentShow = props => {
//only show edit path if we are a group admin of the group that owns the project that this is connected to.
return(
  <ShowController toolbar={null} {...props}>
    {controllerProps => 
    {

      console.log("controllerProps is: ", controllerProps)
      console.log("in controllerprops, props: ", props)

    return(
  <Show actions={<UserAgentShowActions />} {...props} {...controllerProps}>
    <SimpleShowLayout toolbar={null}>
      <UserAgentTitle prefix={"Viewing Agent"} />
    
      <ReferenceField
        linkType={false}
        label={"en.models.agents.user"}
        source={Constants.model_fk_fields.USER}
        reference={Constants.models.USERS}
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={"en.models.agents.location"}
        source={Constants.model_fk_fields.LOCATION}
        reference={Constants.models.LOCATIONS}
      >
        <LocationShow />
      </ReferenceField>
     {controllerProps.record && controllerProps.record.project_config_list && 
      <ArrayField source={Constants.model_fields.PROJECT_CONFIG_LIST} label={"Target Projects"}>
        <SingleFieldList>
          <ReferenceField source={Constants.model_fk_fields.PROJECT} reference={Constants.models.PROJECTS} linkType="show">
            <ChipField source={Constants.model_fields.NAME} />
          </ReferenceField>
        </SingleFieldList>
      </ArrayField>
      }

      {controllerProps.record && controllerProps.record.remote_api_username && controllerProps.record.remote_api_token && 
      <>
      <TextField
        label={"en.models.agents.remote_api_username"}
        source={Constants.model_fields.REMOTE_API_USERNAME}
      />
      
      <TextField
        label={"en.models.agents.remote_api_token"}
        source={Constants.model_fields.REMOTE_API_TOKEN}
      />
      </>
      }
    
      <TextField
        label={"en.models.agents.version"}
        source={Constants.model_fields.VERSION}
      />
      <BooleanField
        label={"en.models.generic.active"}
        source={Constants.model_fields.ACTIVE}
      />
    </SimpleShowLayout>
  </Show>)}
}
  </ShowController>
)};

const validateVersion = regex(/^\d+\.\d+\.\d+/, 'en.validate.useragents.version')
const validateLocation=required('en.validate.useragents.location')
const validateUser = required('en.validate.useragents.user');

//TODO: some values must be moved to the Strings file.
export const UserAgentCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Create {...other}>
      <SimpleForm {...other} redirect={Constants.resource_operations.LIST}>
      <UserAgentTitle prefix={"Creating Agent"} />

      <FormDataConsumer>

      {({formData, ...rest}) => 
      {
        return(
        <Grid container direction="row">
        <Grid xs={12}>  
        <ReferenceInput
        label={"en.models.agents.user"}
        source={Constants.model_fk_fields.USER}
        reference={Constants.models.USERS}
        validate={validateUser}
        >
          <SelectInput source={Constants.model_fields.USERNAME} optionText={userSelect} />
        </ReferenceInput>
        </Grid>
        <Grid xs={12}>
        <ReferenceInput
          label={"en.models.agents.location"}
          source={Constants.model_fk_fields.LOCATION}
          reference={Constants.models.LOCATIONS}
          filter={{location_type: Constants.LOCATIONTYPE_OSF}}
          validate={validateLocation}
        >
          <SelectInput optionText={locationSelect} source={Constants.model_fields.DISPLAY_NAME} />
        </ReferenceInput>
        </Grid>
        <Grid xs={12}>
        <ArrayInput source={Constants.model_fields.PROJECT_CONFIG_LIST} required>
          <SimpleFormIterator>
            <ReferenceInput
            label={"en.models.agents.projects"}
            source={Constants.model_fk_fields.PROJECT}
            reference={Constants.models.PROJECTS}>
              <SelectInput optionText={Constants.model_fields.NAME}/>
            </ReferenceInput>
          </SimpleFormIterator>
        </ArrayInput>
        </Grid>
        <Grid xs={12}>
        <TextInput source="remote_api_username" label={"en.models.agents.remoteapiusername"} required />
        </Grid>
        <Grid xs={12}>
        <TextInput source="remote_api_token" label={"en.models.agents.remoteapitoken"} required />
        </Grid>
        <Grid xs={12}>
        <TextInput source="version" label={"en.models.agents.version"} validate={validateVersion} defaultValue={`0.0.1`} />
        </Grid>
        <Grid xs={12}>
        <BooleanInput source={Constants.model_fields.ACTIVE} label={"en.models.agents.active"} defaultValue={true} />
        </Grid>
        </Grid>
        )
      }
      }
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  )
};

//TODO: Config can be EMPTY / nonexistent, but it CANNOT be `null` on submission
export const UserAgentEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Edit {...props}>
      <SimpleForm>
        <UserAgentTitle prefix={"Editing Agent"} />
        <ReferenceField
          linkType={false}
          label={"en.models.agents.location"}
          source={Constants.model_fk_fields.LOCATION}
          reference={Constants.models.LOCATIONS}
        >
          <LocationShow/>
        </ReferenceField>
        <ReferenceField
          linkType={false}
          label={"en.models.agents.user"}
          source={Constants.model_fk_fields.USER}
          reference={Constants.models.USERS}
          allowEmpty={false}
        >
          <UserShow />
        </ReferenceField>
        <FormDataConsumer>
        {({formData, ...rest}) => 
        {
          if (formData && formData.remote_api_token && formData.remote_api_username){
            formData.project_config_list.map(project => {
              const newProj = project
              delete newProj.config
              return newProj
            })
          }

          return(
            <>
            <ArrayInput source={Constants.model_fields.PROJECT_CONFIG_LIST}>
            <SimpleFormIterator disableRemove disableAdd>
              <ReferenceInput
              label={"en.models.agents.projects"}
              source={Constants.model_fk_fields.PROJECT}
              reference={Constants.models.PROJECTS}>
                <SelectInput optionText={Constants.model_fields.NAME} disabled/>
              </ReferenceInput>
              {formData.project_config_list[0] && formData.project_config_list[0].config && <TextInput source="config.rootdir" disabled/>}
            </SimpleFormIterator>
          </ArrayInput>
            <Grid container direction="row">
            <Grid xs={12}>
              <TextInput source="version" label={"en.models.agents.version"} validate={validateVersion} />
            </Grid>
            <Grid xs={12}>
              <BooleanInput source={Constants.model_fields.ACTIVE} label={"en.models.agents.active"} defaultValue={true} />
            </Grid>
          </Grid>
          </>)
        }
        }
        </FormDataConsumer>
      </SimpleForm>
    </Edit>

  );
}