import React, { useEffect, useState } from "react";
import {
  Create,
  Datagrid,
  DateField,
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
import * as Constants from "../_constants/index";
import { withStyles } from "@material-ui/core/styles";
import CustomPagination from "../_components/CustomPagination";
import { Prompt } from 'react-router';

const styles = {
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

const filterStyles = {
  form: {
    backgroundColor: "inherit"
  }
};

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const GroupViewGrantFilter = withStyles(filterStyles)(
  ({ classes, ...props }) => (
    <Filter classes={classes} {...props}>
      <ReferenceInput
        label={"en.models.grants.dataset"}
        source={Constants.model_fk_fields.DATASET}
        reference={Constants.models.DATASETS}
      >
        <SelectInput optionText={Constants.model_fields.NAME} />
      </ReferenceInput>
      <ReferenceInput
        label={"en.models.grants.group"}
        source={Constants.model_fk_fields.GROUP}
        reference={Constants.models.GROUPS}
      >
        <SelectInput optionText={Constants.model_fields.NAME} />
      </ReferenceInput>
      <TextInput
        label={"en.models.grants.fields"}
        source={Constants.model_fields.FIELDS}
      />
    </Filter>
  )
);

export const GroupViewGrantList = withStyles(styles)(({ classes, ...props }) => (
    <List
      {...props}
      classes={{
        root: classes.root,
        header: classes.header,
        actions: classes.actions
      }}
      exporter={false}
      filters={<GroupViewGrantFilter />}
      sort={{ field: Constants.model_fields.DATE_UPDATED, order: "DESC" }}
      perPage={10}
      pagination={<CustomPagination />}
    >
      <Datagrid rowClick={Constants.resource_operations.SHOW}>
        <ReferenceField
          linkType={false}
          label={"en.models.grants.group"}
          source={Constants.model_fk_fields.GROUP}
          reference={Constants.models.GROUPS}
        >
          <TextField source={Constants.model_fields.NAME} />
        </ReferenceField>
        <ReferenceField
          linkType={false}
          label={"en.models.grants.dataset"}
          source={Constants.model_fk_fields.DATASET}
          reference={Constants.models.DATASETS}
        >
          <TextField source={Constants.model_fields.TITLE} />
        </ReferenceField>
        <TextField source={Constants.model_fields.FIELDS} allowEmpty />
        <DateField
          source={Constants.model_fields.DATE_STARTS}
          label={"en.models.generic.date_starts"}
          allowEmpty
        />
        <DateField
          source={Constants.model_fields.DATE_EXPIRES}
          label={"en.models.generic.date_expires"}
          allowEmpty
        />
      </Datagrid>
    </List>
  )
);

export const GroupViewGrantShow = props => (
  <Show title={<GroupViewGrantTitle />} {...props}>
    <SimpleShowLayout>
      <ReferenceField
        linkType={false}
        label={"en.models.grants.group"}
        source={Constants.model_fk_fields.GROUP}
        reference={Constants.models.GROUPS}
      >
        <TextField source={Constants.model_fields.NAME} />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={"en.models.grants.dataset"}
        source={Constants.model_fk_fields.DATASET}
        reference={Constants.models.DATASETS}
      >
        <TextField source={Constants.model_fields.TITLE} />
      </ReferenceField>
      <TextField source={Constants.model_fields.FIELDS} allowEmpty />
      <DateField
        source={Constants.model_fields.DATE_STARTS}
        label={"en.models.generic.date_starts"}
        allowEmpty
      />
      <DateField
        source={Constants.model_fields.DATE_EXPIRES}
        label={"en.models.generic.date_expires"}
        allowEmpty
      />
    </SimpleShowLayout>
  </Show>
);

const validateDataset = required('en.validate.viewgrants.dataset');
const validateGroup = required('en.validate.viewgrants.group');

const GroupViewGrantForm = props => {
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
  <SimpleForm {...props} 
    redirect={Constants.resource_operations.LIST}
    onChange={handleChange}
    save={handleSubmit}>
    <ReferenceInput
      label={"en.models.grants.group"}
      source={Constants.model_fk_fields.GROUP}
      reference={Constants.models.GROUPS}
      validate={validateGroup}
    >
      <SelectInput source={Constants.model_fields.NAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.grants.dataset"}
      source={Constants.model_fk_fields.DATASET}
      reference={Constants.models.DATASETS}
      validate={validateDataset}
    >
      <SelectInput optionText={Constants.model_fields.TITLE} />
    </ReferenceInput>
    <TextInput source={Constants.model_fields.FIELDS} allowEmpty />
    <DateInput
      source={Constants.model_fields.DATE_STARTS}
      label={"en.models.generic.date_starts"}
      allowEmpty
    />
    <DateInput
      source={Constants.model_fields.DATE_EXPIRES}
      label={"en.models.generic.date_expires"}
      allowEmpty
    />
    <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>

  </SimpleForm>
)};

export const GroupViewGrantTitle = ({ record }) => {
  return <span>GroupViewGrant {record ? `"${record.fields}"` : ""}</span>;
};

export const GroupViewGrantCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Create {...props}>
      <GroupViewGrantForm {...other} />
    </Create>
  );
};

export const GroupViewGrantEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Edit title={<GroupViewGrantTitle />} {...props}>
      <GroupViewGrantForm {...other} />
    </Edit>
  );
};
