import React, { useState, useEffect } from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateInput,
  Edit,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";
import { EditToolbar } from "../_components";
import { withStyles } from "@material-ui/core/styles";
import * as Constants from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { Prompt } from 'react-router';


const listStyles = {
  actions: {
    backgroundColor: "inherit"
  },
  root: {
    backgroundColor: "inherit"
  },
  header: {
    backgroundColor: "inherit"
  }
};
const filterStyles = {
  form: {
    backgroundColor: "inherit"
  }
};

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const GroupFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <DateInput source={Constants.model_fields.DATE_UPDATED} />
    <TextInput
      label={"en.models.groups.name"}
      source={Constants.model_fields.NAME}
    />
    <TextInput
      label={"en.models.groups.description"}
      source={Constants.model_fields.DESCRIPTION}
    />
    <ReferenceInput
      label={"en.models.groups.parent_group"}
      source={Constants.model_fk_fields.PARENT_GROUP}
      reference={Constants.models.GROUPS}
    >
      <SelectInput optionText={Constants.model_fields.NAME} />
    </ReferenceInput>
  </Filter>
));

export const GroupList = withStyles(listStyles)(({ classes, ...props }) => (
  <List
    {...props}
    classes={{
      root: classes.root,
      header: classes.header,
      actions: classes.actions
    }}
    exporter={false}
    filters={<GroupFilter />}
    sort={{ field: Constants.model_fields.DATE_UPDATED, order: "DESC" }}
    perPage={10}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <TextField
        label={"en.models.groups.name"}
        source={Constants.model_fields.NAME}
      />
      <TextField
        label={"en.models.groups.description"}
        source={Constants.model_fields.DESCRIPTION}
      />
      <ReferenceField
        linkType={false}
        label={"en.models.groups.parent_group"}
        source={Constants.model_fk_fields.PARENT_GROUP}
        reference={Constants.models.GROUPS}
        allowEmpty
      >
        <TextField
          label={"en.models.groups.name"}
          source={Constants.model_fields.NAME}
        />
      </ReferenceField>
    </Datagrid>
  </List>
));

export const GroupShow = props => (
  <Show title={<GroupTitle />} {...props}>
    <SimpleShowLayout>
      <TextField
        label={"en.models.groups.name"}
        source={Constants.model_fields.NAME}
      />
      <TextField
        label={"en.models.groups.description"}
        source={Constants.model_fields.DESCRIPTION}
      />
      <BooleanField
        label={"en.models.generic.active"}
        source={Constants.model_fields.ACTIVE}
      />
      <ReferenceField
        linkType={false}
        label={"en.models.groups.parent_group"}
        source={Constants.model_fk_fields.PARENT_GROUP}
        reference={Constants.models.GROUPS}
        allowEmpty
      >
        <TextField
          label={"en.models.groups.name"}
          source={Constants.model_fields.NAME}
        />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

export const GroupTitle = ({ record }) => {
  return <span>{record ? `"${record.name}"` : ""}</span>;
};

const validateName = required('en.validate.group.group_name');
const validateDescription = required('en.validate.group.description');
const validateParentGroup = (value, allValues) => {
  if (value && allValues.id === value){
    return 'A Group may not be a parent group of itself'
  }
}

const asyncValidate = getAsyncValidateNotExists({id: Constants.model_fields.ID, name : Constants.model_fields.NAME, reject: "There is already a group with this name. Please pick another name for your group." }, Constants.models.GROUPS);

const GroupForm = props => 
{
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [data, setData] = useState({})
  
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      console.log("before save, isformdirty, data: ", isFormDirty, data)
      props.save(data)
    }
  }, [data])

  function handleSubmit(formData) {
    setIsFormDirty(false)
    setData(formData)
  }

  function handleChange(data){
    setIsFormDirty(true)
  }
return(
  <SimpleForm
    {...props}
    toolbar={<EditToolbar />}
    asyncValidate={asyncValidate}
    asyncBlurFields={[ Constants.model_fields.NAME ]}
    onChange={handleChange}
    save={handleSubmit}
  >
    <TextInput
      label={"en.models.groups.name"}
      source={Constants.model_fields.NAME}
      validate={validateName}
    />
    <TextInput
      label={"en.models.groups.description"}
      source={Constants.model_fields.DESCRIPTION}
      validate={validateDescription}
    />
    <BooleanInput
      label={"en.models.generic.active"}
      defaultValue={true}
      source={Constants.model_fields.ACTIVE}
    />
    <ReferenceInput
      label={"en.models.groups.parent_group"}
      source={Constants.model_fk_fields.PARENT_GROUP}
      reference={Constants.models.GROUPS}
      validate={validateParentGroup}
      allowEmpty
    >
      <SelectInput
        label={"en.models.groups.name"}
        optionText={Constants.model_fields.NAME}
      />
    </ReferenceInput>
    <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
  </SimpleForm>
)
};

export const GroupCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Create {...props}>
      <GroupForm {...other} />
    </Create>
  );
}

export const GroupEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Edit title={<GroupTitle />} {...props}>
      <GroupForm {...other} />
    </Edit>
  );
}
