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
import {RESOURCE_OPERATIONS, MODEL_FIELDS} from "../_constants/index";
import TranslationField from "../_components/_fields/TranslationField";
import CustomPagination from "../_components/CustomPagination";

export const DataCollectionStatusList = props => (
  <List {...props} exporter={false}
    pagination={<CustomPagination />}
    bulkActionButtons={false}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
      <TranslationField
        label={"en.models.data_collection_status.label"}
        source={MODEL_FIELDS.LABEL}
      />
    </Datagrid>
  </List>
);

export const DataCollectionStatusShow = props => (
  <Show title={<DataCollectionStatusTitle />} {...props}>
    <SimpleShowLayout>
      <TranslationField
        label={"en.models.data_collection_status.label"}
        source={MODEL_FIELDS.LABEL}
      />
    </SimpleShowLayout>
  </Show>
);

const validateLabel = required('en.validate.datacollectionstatus.label');

export const DataCollectionStatusCreate = props => (
  <Create {...props}>
    <SimpleForm redirect={RESOURCE_OPERATIONS.LIST}>
      <TextInput
        label={"en.models.data_collection_status.label"}
        source={MODEL_FIELDS.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Create>
);

export const DataCollectionStatusTitle = ({ record }) => {
  return (
    <span>Data Collection Status {record ? `"${record.label}"` : ""}</span>
  );
};

export const DataCollectionStatusEdit = props => (
  <Edit title={<DataCollectionStatusTitle />} {...props}>
    <SimpleForm redirect={RESOURCE_OPERATIONS.LIST}>
      <TextInput
        label={"en.models.data_collection_status.label"}
        source={MODEL_FIELDS.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Edit>
);
