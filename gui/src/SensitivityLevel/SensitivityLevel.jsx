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
import {MODEL_FIELDS, RESOURCE_OPERATIONS} from "../_constants/index";
import TranslationField from "../_components/_fields/TranslationField";
import CustomPagination from "../_components/CustomPagination";

export const SensitivityLevelList = props => (
  <List {...props} exporter={false}
    pagination={<CustomPagination />}
    bulkActionButtons={false}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
      <TranslationField
        label={"en.models.sensitivity_level.label"}
        source={MODEL_FIELDS.LABEL}
      />
    </Datagrid>
  </List>
);

export const SensitivityLevelShow = props => (
  <Show title={<SensitivityLevelTitle />} {...props}>
    <SimpleShowLayout>
      <TranslationField
        label={"en.models.sensitivity_level.label"}
        source={MODEL_FIELDS.LABEL}
      />
    </SimpleShowLayout>
  </Show>
);

const validateLabel = required('en.validate.sensitivitylevel.label');

export const SensitivityLevelCreate = props => (
  <Create {...props}>
    <SimpleForm redirect={RESOURCE_OPERATIONS.LIST}>
      <TextInput
        label={"en.models.sensitivity_level.label"}
        source={MODEL_FIELDS.LABEL}
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
    <SimpleForm redirect={RESOURCE_OPERATIONS.LIST}>
      <TextInput
        label={"en.models.sensitivity_level.label"}
        source={MODEL_FIELDS.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Edit>
);
