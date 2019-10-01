import React, { useState, useEffect } from "react";
import { Create, Datagrid, Edit, List, required, Show, SimpleForm, SimpleShowLayout, TextInput } from "react-admin";
import * as Constants from "../_constants/index";
import TranslationField from "../_components/_fields/TranslationField";
import CustomPagination from "../_components/CustomPagination";
import { Prompt } from 'react-router';

export const LocationTypeList = props => (
  <List {...props} exporter={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <TranslationField
        label={"en.models.locationtypes.label"}
        source={Constants.model_fields.LABEL}
      />
    </Datagrid>
  </List>
);

export const LocationTypeShow = props => (
  <Show title={<LocationTypeTitle />} {...props}>
    <SimpleShowLayout>
      <TranslationField
        label={"en.models.locationtypes.label"}
        source={Constants.model_fields.LABEL}
      />
    </SimpleShowLayout>
  </Show>
);

export const LocationTypeTitle = ({ record }) => {
  return <span>LocationType {record ? `"${record.label}"` : ""}</span>;
};

const validateLabel = required('en.validate.locationtypes.label');

const LocationTypeForm = props => {
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [data, setData] = useState({})
  
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
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
  <SimpleForm {...props} redirect={Constants.resource_operations.LIST} onChange={handleChange} save={handleSubmit}>
    <TextInput
      label={"en.models.locationtypes.label"}
      source={Constants.model_fields.LABEL}
      validate={validateLabel}
    />
    <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
  </SimpleForm>
)
  };

export const LocationTypeCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Create {...props}>
      <LocationTypeForm {...other} />
    </Create>
  )
};

export const LocationTypeEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Edit title={<LocationTypeTitle />} {...props}>
      <LocationTypeForm {...other} />
    </Edit>
  )
};
