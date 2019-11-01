import React from "react";
import {
  Create,
  Datagrid,
  Edit,
  List,
  required,
  Show,
  SimpleShowLayout,
  SimpleForm,
  TextInput
} from "react-admin";
import * as Constants from "../_constants/index";
import TranslationField from "../_components/_fields/TranslationField";
import CustomPagination from "../_components/CustomPagination";

export const SensitivityLevelList = props => (
  <List {...props} exporter={false}
    pagination={<CustomPagination />}
    bulkActionButtons={false}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <TranslationField
        label={"en.models.sensitivity_level.label"}
        source={Constants.model_fields.LABEL}
      />
    </Datagrid>
  </List>
);

export const SensitivityLevelShow = props => (
  <Show title={<SensitivityLevelTitle />} {...props}>
    <SimpleShowLayout>
      <TranslationField
        label={"en.models.sensitivity_level.label"}
        source={Constants.model_fields.LABEL}
      />
    </SimpleShowLayout>
  </Show>
);

const validateLabel = required('en.validate.sensitivitylevel.label');

export const SensitivityLevelCreate = props => (
  <Create {...props}>
    <SimpleForm redirect={Constants.resource_operations.LIST}>
      <TextInput
        label={"en.models.sensitivity_level.label"}
        source={Constants.model_fields.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Create>
);

export const SensitivityLevelTitle = ({ record }) => {
  return <span>Sensitivity Level {record ? `"${record.label}"` : ""}</span>;
};

export const SensitivityLevelEdit = props => (
  <Edit title={<SensitivityLevelTitle />} {...props}>
    <SimpleForm redirect={Constants.resource_operations.LIST}>
      <TextInput
        label={"en.models.sensitivity_level.label"}
        source={Constants.model_fields.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Edit>
);
