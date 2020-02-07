//GroupViewGrants.jsx
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
import {RESOURCE_OPERATIONS, WARNINGS, MODELS, MODEL_FK_FIELDS, MODEL_FIELDS} from "../_constants/index";
import { withStyles } from "@material-ui/core/styles";
import CustomPagination from "../_components/CustomPagination";
import { Prompt } from 'react-router';
import GroupViewGrantTitle from "./GroupViewGrantTitle";
import { DatasetShow } from "../_components/_fields/DatasetShow";
import { GroupShow } from "../_components/_fields/GroupShow";

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
      <TextInput
        label={"en.models.filters.search"}
        source="search"
        alwaysOn
      />
      <ReferenceInput
        label={"en.models.grants.dataset"}
        source={MODEL_FK_FIELDS.DATASET}
        reference={MODELS.DATASETS}
        alwaysOn
      >
        <SelectInput optionText={MODEL_FIELDS.TITLE} />
      </ReferenceInput>
    </Filter>
  )
);

export const GroupViewGrantList = withStyles(styles)(({ classes, ...props }) => (
    <List
      {...props}
      classes={{
        root: classes.root,
        actions: classes.actions
      }}
      exporter={false}
      filters={<GroupViewGrantFilter />}
      sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: "DESC" }}
      perPage={10}
      bulkActionButtons={false}
      title={
        "Group View Grants"
      }
      pagination={<CustomPagination />}
    >
      <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
        <ReferenceField
          link={false}
          label={"en.models.grants.group"}
          source={MODEL_FK_FIELDS.GROUP}
          reference={MODELS.GROUPS}
        >
          <TextField source={MODEL_FIELDS.NAME} />
        </ReferenceField>
        <ReferenceField
          link={false}
          label={"en.models.grants.dataset"}
          source={MODEL_FK_FIELDS.DATASET}
          reference={MODELS.DATASETS}
        >
          <TextField source={MODEL_FIELDS.TITLE} />
        </ReferenceField>
        <TextField source={MODEL_FIELDS.FIELDS} allowEmpty />
        <DateField
          source={MODEL_FIELDS.DATE_STARTS}
          label={"en.models.generic.date_starts"}
          allowEmpty
        />
        <DateField
          source={MODEL_FIELDS.DATE_EXPIRES}
          label={"en.models.generic.date_expires"}
          allowEmpty
        />
      </Datagrid>
    </List>
  )
);

export const GroupViewGrantShow = props => (
  <Show {...props}>
    <SimpleShowLayout>
      <GroupViewGrantTitle prefix="Showing View Grant" />
      <ReferenceField
        link={false}
        label={"en.models.grants.group"}
        source={MODEL_FK_FIELDS.GROUP}
        reference={MODELS.GROUPS}
      >
<GroupShow />
      </ReferenceField>
      <ReferenceField
        link={false}
        label={"en.models.grants.dataset"}
        source={MODEL_FK_FIELDS.DATASET}
        reference={MODELS.DATASETS}
      >
        <DatasetShow />
      </ReferenceField>
      <TextField source={MODEL_FIELDS.FIELDS} allowEmpty />
      <DateField
        source={MODEL_FIELDS.DATE_STARTS}
        label={"en.models.generic.date_starts"}
        allowEmpty
      />
      <DateField
        source={MODEL_FIELDS.DATE_EXPIRES}
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
  console.log("props in groupviewgrantform: ", props)
  return(
  <SimpleForm {...props} 
    redirect={RESOURCE_OPERATIONS.LIST}
    onChange={handleChange}
    save={handleSubmit}>
    <GroupViewGrantTitle prefix={props.record && Object.keys(props.record).length > 0 ? "Updating View Grant" : "Creating View Grant"} />

    <ReferenceInput
      label={"en.models.grants.group"}
      source={MODEL_FK_FIELDS.GROUP}
      reference={MODELS.GROUPS}
      validate={validateGroup}
    >
      <SelectInput source={MODEL_FIELDS.NAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.grants.dataset"}
      source={MODEL_FK_FIELDS.DATASET}
      reference={MODELS.DATASETS}
      validate={validateDataset}
    >
      <SelectInput optionText={MODEL_FIELDS.TITLE} />
    </ReferenceInput>
    <TextInput source={MODEL_FIELDS.FIELDS} allowEmpty />
    <DateInput
      source={MODEL_FIELDS.DATE_STARTS}
      label={"en.models.generic.date_starts"}
      allowEmpty
    />
    <DateInput
      source={MODEL_FIELDS.DATE_EXPIRES}
      label={"en.models.generic.date_expires"}
      allowEmpty
    />
    <Prompt when={isFormDirty} message={WARNINGS.UNSAVED_CHANGES}/>

  </SimpleForm>
)};

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
    <Edit {...props}>
      <GroupViewGrantForm {...other} />
    </Edit>
  );
};
