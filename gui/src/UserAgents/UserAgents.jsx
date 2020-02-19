//UserAgents.jsx
import React, { useState, useEffect } from "react";
import CustomPagination from "../_components/CustomPagination";
import {
  ArrayField,
  ArrayInput,
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
import {MODEL_FIELDS, MODEL_FK_FIELDS, MODELS, RESOURCE_OPERATIONS, LOCATIONTYPE_OSF, ROLE_USER} from "../_constants/index";
import { withStyles } from "@material-ui/core/styles";
import { locationSelect, LocationShow } from "../_components/_fields/LocationShow";
import { userSelect, UserShow } from "../_components/_fields/UserShow";
import { regex, FormDataConsumer, ShowController } from "ra-core";
import { Grid, Toolbar } from "@material-ui/core";
import { Show } from "ra-ui-materialui/lib/detail";
import { EditButton } from "ra-ui-materialui/lib/button";
import UserAgentTitle from "./UserAgentTitle";
import { FKToolbar } from "../_components/Toolbar";

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
      source={MODEL_FK_FIELDS.USER}
      reference={MODELS.USERS}
      alwaysOn
    >
      <SelectInput optionText={userSelect} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.agents.location"}
      source={MODEL_FK_FIELDS.LOCATION}
      reference={MODELS.LOCATIONS}
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
      actions: classes.actions
    }}
    exporter={false}
    filters={<UserAgentFilter />}
    sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: "DESC" }}
    perPage={10}
    pagination={<CustomPagination />}
    bulkActionButtons={false}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
      <ReferenceField
        link={false}
        label={"en.models.agents.user"}
        source={MODEL_FK_FIELDS.USER}
        reference={MODELS.USERS}
        allowEmpty={false}
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        link={false}
        label={"en.models.agents.location"}
        source={MODEL_FK_FIELDS.LOCATION}
        reference={MODELS.LOCATIONS}
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
  const user = JSON.parse(localStorage.getItem(ROLE_USER));
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
        link={false}
        label={"en.models.agents.user"}
        source={MODEL_FK_FIELDS.USER}
        reference={MODELS.USERS}
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        link={false}
        label={"en.models.agents.location"}
        source={MODEL_FK_FIELDS.LOCATION}
        reference={MODELS.LOCATIONS}
      >
        <LocationShow />
      </ReferenceField>
     {controllerProps.record && controllerProps.record.project_config_list && 
      <ArrayField source={MODEL_FIELDS.PROJECT_CONFIG_LIST} label={"Target Projects"}>
        <SingleFieldList>
          <ReferenceField source={MODEL_FK_FIELDS.PROJECT} reference={MODELS.PROJECTS} link="show">
            <ChipField source={MODEL_FIELDS.NAME} />
          </ReferenceField>
        </SingleFieldList>
      </ArrayField>
      }

      {controllerProps.record && controllerProps.record.remote_api_username && controllerProps.record.remote_api_token && 
      <>
      <TextField
        label={"en.models.agents.remote_api_username"}
        source={MODEL_FIELDS.REMOTE_API_USERNAME}
      />
      
      <TextField
        label={"en.models.agents.remote_api_token"}
        source={MODEL_FIELDS.REMOTE_API_TOKEN}
      />
      </>
      }
    
      <TextField
        label={"en.models.agents.version"}
        source={MODEL_FIELDS.VERSION}
      />
      <BooleanField
        label={"en.models.generic.active"}
        source={MODEL_FIELDS.ACTIVE}
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
      <SimpleForm {...other} redirect={RESOURCE_OPERATIONS.LIST}>
      <UserAgentTitle prefix={"Creating Agent"} />
        <Grid container direction="row">
          <Grid item xs={12}>  
          <ReferenceInput
          label={"en.models.agents.user"}
          source={MODEL_FK_FIELDS.USER}
          reference={MODELS.USERS}
          validate={validateUser}
          >
            <SelectInput source={MODEL_FIELDS.USERNAME} optionText={userSelect} />
          </ReferenceInput>
          </Grid>
          <Grid item xs={12}>
            <ReferenceInput
              label={"en.models.agents.location"}
              source={MODEL_FK_FIELDS.LOCATION}
              reference={MODELS.LOCATIONS}
              filter={{location_type: LOCATIONTYPE_OSF}}
              validate={validateLocation}
            >
              <SelectInput optionText={locationSelect} source={MODEL_FIELDS.DISPLAY_NAME} />
            </ReferenceInput>
          </Grid>
          
          <Grid item xs={12}>

            <ArrayInput source={MODEL_FIELDS.PROJECT_CONFIG_LIST}>
              <SimpleFormIterator>
                <ReferenceInput
                label={"en.models.agents.projects"}
                source={MODEL_FK_FIELDS.PROJECT}
                reference={MODELS.PROJECTS}>
                  <SelectInput optionText={MODEL_FIELDS.NAME}/>
                </ReferenceInput>
              </SimpleFormIterator>
            </ArrayInput>
          </Grid>
          
          <Grid item xs={12}>
            <TextInput source="remote_api_username" label={"en.models.agents.remoteapiusername"} required />
          </Grid>
          <Grid item xs={12}>
            <TextInput source="remote_api_token" label={"en.models.agents.remoteapitoken"} required />
          </Grid>
          <Grid item xs={12}>
            <TextInput source="version" label={"en.models.agents.version"} validate={validateVersion} defaultValue={`0.0.1`} />
          </Grid>
          <Grid item xs={12}>
            <BooleanInput source={MODEL_FIELDS.ACTIVE} label={"en.models.agents.active"} defaultValue={true} />
          </Grid>
        </Grid>
        </SimpleForm>
    </Create>
  )
};

//TODO: Config can be EMPTY / nonexistent, but it CANNOT be `null` on submission
export const UserAgentEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Edit {...props}>
      <SimpleForm
      toolbar={<FKToolbar {...props} />}>
        <UserAgentTitle prefix={"Editing Agent"} />
        <ReferenceField
          link={false}
          label={"en.models.agents.location"}
          source={MODEL_FK_FIELDS.LOCATION}
          reference={MODELS.LOCATIONS}
        >
          <LocationShow/>
        </ReferenceField>
        <ReferenceField
          link={false}
          label={"en.models.agents.user"}
          source={MODEL_FK_FIELDS.USER}
          reference={MODELS.USERS}
          allowEmpty={false}
        >
          <UserShow />
        </ReferenceField>
        <FormDataConsumer>
          {formDataProps => 
            {
              const record = formDataProps.record
              console.log("in fdc, formData is: ", record)
              //if record has an api token and username, it is an OSF agent and we want to allow modification of this
              if (record && record.remote_api_token && record.remote_api_username && record.project_config_list && record.project_config_list.length > 0){
                record.project_config_list.map(project => {
                  //delete config for this prior to display, it's not relevant
                  const newProj = project
                  delete newProj.config
                  return newProj
                })
                return(
                  <>
                    <ArrayInput source={MODEL_FIELDS.PROJECT_CONFIG_LIST}>
                      <SimpleFormIterator disableRemove disableAdd>
                        <ReferenceInput
                        label={"en.models.agents.projects"}
                        source={MODEL_FK_FIELDS.PROJECT}
                        reference={MODELS.PROJECTS}>
                          <SelectInput optionText={MODEL_FIELDS.NAME} disabled/>
                        </ReferenceInput>
                        {record.project_config_list && record.project_config_list.length > 0 && record.project_config_list[0] && record.project_config_list[0].config && <TextInput source="config.rootdir" disabled/>}
                      </SimpleFormIterator>
                    </ArrayInput>
                  </>)
              }
              else{
                //need something returned here or RA will complain - but we want nothing returned for non-OSF agents here.
                  return <></>
                
              }
            }
          }
        </FormDataConsumer>
        
        <Grid container direction="row">
          <Grid item xs={12}>
            <TextInput disabled source="version" label={"en.models.agents.version"} validate={validateVersion} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>

  );
}