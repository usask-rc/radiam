import React from "react";
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
  NumberInput,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  required,
  SelectArrayInput,
  SelectInput,
  Show,
  ShowView,
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
import { regex, number, minValue, FormDataConsumer, ShowController } from "ra-core";
import { Grid, Typography } from "@material-ui/core";
import { ArrayInput } from "ra-ui-materialui/lib/input/ArrayInput";
import TranslationSelectArray from "../_components/_fields/TranslationSelectArray";

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
    >
      <SelectInput optionText={userSelect} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.agents.location"}
      source={Constants.model_fk_fields.LOCATION}
      reference={Constants.models.LOCATIONS}
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

export const UserAgentShow = props => {
console.log("props in useragentshow are; ", props);
return(
  <ShowController {...props}>
    {controllerProps => 
    {

      console.log("controllerProps is: ", controllerProps)

    return(
  <ShowView title={<UserAgentTitle />} {...props} {...controllerProps}>
    <SimpleShowLayout>
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
      <ArrayField source={"project_config_list"} label={"Target Projects"}>
        <SingleFieldList>
          <ReferenceField source={"project"} reference={Constants.models.PROJECTS}>
            <ChipField source="name" />
          </ReferenceField>
        </SingleFieldList>
      </ArrayField>
      }

      {controllerProps.record && controllerProps.record.remote_api_username && controllerProps.record.remote_api_token && 
      <React.Fragment>
      <TextField
        label={"en.models.agents.remote_api_username"}
        source={Constants.model_fields.REMOTE_API_USERNAME}
      />
      
      <TextField
        label={"en.models.agents.remote_api_token"}
        source={Constants.model_fields.REMOTE_API_TOKEN}
      />
      </React.Fragment>
      }
    
      <TextField
        label={"en.models.agents.crawl_minutes"}
        source={Constants.model_fields.CRAWL_MINUTES}
      />
      <TextField
        label={"en.models.agents.version"}
        source={Constants.model_fields.VERSION}
      />
      <BooleanField
        label={"en.models.generic.active"}
        source={Constants.model_fields.ACTIVE}
      />
    </SimpleShowLayout>
  </ShowView>)}
}
  </ShowController>
)};

const validateVersion = regex(/^\d+\.\d+\.\d+/, 'en.validate.useragents.version')
const validateCrawlTime = [number(), minValue(1)]
const validateLocation=required('en.validate.useragents.location')
const validateUser = required('en.validate.useragents.user');

export const UserAgentTitle = ({ record }) => {
  return <span>UserAgent {record ? `"${record.id}"` : ""}</span>;
};

//TODO: some values must be moved to the Strings file.
export const UserAgentCreate = props => {

  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Create {...props}>
      <SimpleForm {...props} redirect={Constants.resource_operations.LIST}>
        <ReferenceInput
        label={"en.models.agents.user"}
        source={Constants.model_fk_fields.USER}
        reference={Constants.models.USERS}
        validate={validateUser}
        >
          <SelectInput source={Constants.model_fields.USERNAME} optionText={userSelect} />
        </ReferenceInput>
        <ReferenceInput
          label={"en.models.agents.location"}
          source={Constants.model_fk_fields.LOCATION}
          reference={Constants.models.LOCATIONS}
          filter={{location_type: Constants.LOCATIONTYPE_OSF}}
          validate={validateLocation}
        >
          <SelectInput optionText={locationSelect} source={Constants.model_fields.DISPLAY_NAME} />
        </ReferenceInput>
       
        <ArrayInput source="project_config_list">
          <SimpleFormIterator>
            <ReferenceInput
            label={"en.models.agents.projects"}
            source={"project"}
            reference={Constants.models.PROJECTS}>
              <SelectInput optionText={"name"}/>
            </ReferenceInput>
          </SimpleFormIterator>
        </ArrayInput>
    
        
        <TextInput source="remote_api_username" label={"en.models.agents.remoteapiusername"} required />
        <TextInput source="remote_api_token" label={"en.models.agents.remoteapitoken"} required />
        <NumberInput source="crawl_minutes" defaultValue={15} validate={validateCrawlTime} label={"en.models.agents.crawl_minutes"} />
        <TextInput source="version" label={"en.models.agents.version"} validate={validateVersion} defaultValue={`0.0.1`} />
        <BooleanInput source={Constants.model_fields.ACTIVE} label={"en.models.agents.active"} defaultValue={true} />
      </SimpleForm>
    </Create>
  )
};

const WithProps = ({children, ...props}) => children(props)

//TODO: Config can be EMPTY / nonexistent, but it CANNOT be `null` on submission
export const UserAgentEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  console.log("props in useragentedit are: ", props)
  console.log("props in useragentedit other is: ", other)
  return (
    <Edit {...props}>
      <SimpleForm>
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
      console.log("formData in this form is: ", formData)

        return(
          <React.Fragment>
          <ArrayInput source="project_config_list">
          <SimpleFormIterator disableRemove disableAdd>
            <ReferenceInput
            label={"en.models.agents.projects"}
            source={"project"}
            reference={Constants.models.PROJECTS}>
              <SelectInput optionText={"name"} disabled/>
            </ReferenceInput>
            {formData.project_config_list[0] && formData.project_config_list[0].config && <TextInput source="config.rootdir" disabled/>}
          </SimpleFormIterator>
        </ArrayInput>
          <Grid container direction="row">
          <Grid xs={12}>
            <NumberInput source="crawl_minutes" defaultValue={15} validate={validateCrawlTime} label={"en.models.agents.crawl_minutes"} />
          </Grid>
          <Grid xs={12}>
            <TextInput source="version" label={"en.models.agents.version"} validate={validateVersion} />
          </Grid>
          <Grid xs={12}>
            <BooleanInput source={Constants.model_fields.ACTIVE} label={"en.models.agents.active"} defaultValue={true} />
          </Grid>
        </Grid>
        </React.Fragment>)
      }
      }
      </FormDataConsumer>
      </SimpleForm>
    </Edit>

  );
}
/*
<ReferenceField
        linkType={false}
        label={"en.models.agents.location"}
        source={Constants.model_fk_fields.LOCATION}
        reference={Constants.models.LOCATIONS}
      >
        <TextField source={Constants.model_fields.DISPLAY_NAME} />
      </ReferenceField>
*/