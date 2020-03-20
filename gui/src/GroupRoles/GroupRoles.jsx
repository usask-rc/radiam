//GroupRoles.jsx
import React, { useState, useEffect } from "react";
import { Create, Datagrid, Edit, List, required, Show, SimpleForm, SimpleShowLayout, TextInput } from "react-admin";
import TranslationField from "../_components/_fields/TranslationField";
import CustomPagination from "../_components/CustomPagination";
import { Divider } from "@material-ui/core";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { Prompt } from 'react-router';
import {RESOURCE_OPERATIONS, MODELS, WARNINGS, MODEL_FIELDS} from "../_constants/index";

export const GroupRoleList = props => (
  <List {...props} exporter={false}
    pagination={<CustomPagination />}
    bulkActionButtons={false}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
      <TranslationField
        label={"en.models.roles.label"}
        source={MODEL_FIELDS.LABEL}
      />
      <TranslationField
        label={"en.models.roles.description"}
        source={MODEL_FIELDS.DESCRIPTION}
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
        source={MODEL_FIELDS.LABEL}
      />
      <Divider />
      <TranslationField
        label={"en.models.roles.description"}
        source={MODEL_FIELDS.DESCRIPTION}
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
const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID, name: MODEL_FIELDS.LABEL, reject: "There is already a role with this label. Please pick another label for your role." }, MODELS.ROLES);
const validateLabel = required('en.validate.role.label');

const GroupRoleForm = props => {
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [data, setData] = useState({})
  let _isMounted = true
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      props.save(data)
    }
    return function cleanup() {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      _isMounted = false
    }
  }, [data, props])

  function handleSubmit(formData) {
    if (_isMounted){
      setIsFormDirty(false)
      setData(formData)
    }
  }

  function handleChange(data){
    if (_isMounted){
      setIsFormDirty(true)
    }
  }
  
  return(
  <SimpleForm {...props}
    redirect={RESOURCE_OPERATIONS.LIST}
    asyncValidate={asyncValidate}
    asyncBlurFields={[MODEL_FIELDS.LABEL]}
    onChange={handleChange}
    save={handleSubmit} >
    <TextInput
      label={"en.models.roles.label"}
      source={MODEL_FIELDS.LABEL}
      validate={validateLabel}
    />
    <TextInput
      label={"en.models.roles.description"}
      source={MODEL_FIELDS.DESCRIPTION}
    />
    <Prompt when={isFormDirty} message={WARNINGS.UNSAVED_CHANGES}/>
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
