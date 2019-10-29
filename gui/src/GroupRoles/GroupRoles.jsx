//GroupRoles.jsx
import React, { useState, useEffect } from "react";
import { Create, Datagrid, Edit, List, required, Show, SimpleForm, SimpleShowLayout, TextInput } from "react-admin";
import * as Constants from "../_constants/index";
import TranslationField from "../_components/_fields/TranslationField";
import CustomPagination from "../_components/CustomPagination";
import { Divider } from "@material-ui/core";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { Prompt } from 'react-router';

export const GroupRoleList = props => (
  <List {...props} exporter={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <TranslationField
        label={"en.models.roles.label"}
        source={Constants.model_fields.LABEL}
      />
      <TranslationField
        label={"en.models.roles.description"}
        source={Constants.model_fields.DESCRIPTION}
        sortable={false}
      />
    </Datagrid>
  </List>
);

export const GroupRoleShow = props => (
  <Show title={<GroupRoleTitle />} {...props}>
    <SimpleShowLayout>
      <TranslationField
        label={"en.models.roles.label"}
        source={Constants.model_fields.LABEL}
      />
      <Divider />
      <TranslationField
        label={"en.models.roles.description"}
        source={Constants.model_fields.DESCRIPTION}
      />
    </SimpleShowLayout>
  </Show>
);

export const GroupRoleTitle = ({ record }) => {
  return <span>GroupRole {record ? `"${record.label}"` : ""}</span>;
};

/**
 * Check with the API whether a role label has already been used.
 */
const asyncValidate = getAsyncValidateNotExists({ id: Constants.model_fields.ID, name: Constants.model_fields.LABEL, reject: "There is already a role with this label. Please pick another label for your role." }, Constants.models.ROLES);
const validateLabel = required('en.validate.role.label');

const GroupRoleForm = props => {
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [data, setData] = useState({})
  
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      props.save(data)
    }
  }, [data, props])

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
    asyncValidate={asyncValidate}
    asyncBlurFields={[Constants.model_fields.LABEL]}
    onChange={handleChange}
    save={handleSubmit} >
    <TextInput
      label={"en.models.roles.label"}
      source={Constants.model_fields.LABEL}
      validate={validateLabel}
    />
    <TextInput
      label={"en.models.roles.description"}
      source={Constants.model_fields.DESCRIPTION}
    />
    <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
  </SimpleForm>
  )
};

export const GroupRoleCreate = props => (
  <Create {...props}>
    <GroupRoleForm {...props} />
  </Create>
);

export const GroupRoleEdit = props => (
  <Edit title={<GroupRoleTitle />} {...props}>
    <GroupRoleForm {...props} />
  </Edit>
);
