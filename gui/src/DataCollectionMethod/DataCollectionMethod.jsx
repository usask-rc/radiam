import React from 'react';
import {
  Create,
  Datagrid,
  Edit,
  List,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
} from 'react-admin';
import {RESOURCE_OPERATIONS, MODEL_FIELDS} from '../_constants/index';
import TranslationField from '../_components/_fields/TranslationField';
import CustomPagination from '../_components/CustomPagination';

export const DataCollectionMethodList = props => (
  <List {...props} exporter={false} 
        pagination={<CustomPagination />}
        bulkActionButtons={false}>
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
      <TranslationField
        label={'en.models.data_collection_method.label'}
        source={MODEL_FIELDS.LABEL}
      />
    </Datagrid>
  </List>
);

export const DataCollectionMethodShow = props => (
  <Show title={<DataCollectionMethodTitle />} {...props}>
    <SimpleShowLayout>
      <TranslationField
        label={'en.models.data_collection_method.label'}
        source={MODEL_FIELDS.LABEL}
      />
    </SimpleShowLayout>
  </Show>
);

const validateLabel = required('en.validate.datacollectionmethod.label');

export const DataCollectionMethodCreate = props => (
  <Create {...props}>
    <SimpleForm redirect={RESOURCE_OPERATIONS.LIST}>
      <TextInput
        label={'en.models.data_collection_method.label'}
        source={MODEL_FIELDS.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Create>
);

export const DataCollectionMethodTitle = ({ record }) => {
  return (
    <span>Data Collection Method {record ? `"${record.label}"` : ''}</span>
  );
};

export const DataCollectionMethodEdit = props => (
  <Edit title={<DataCollectionMethodTitle />} {...props}>
    <SimpleForm redirect={RESOURCE_OPERATIONS.LIST}>
      <TextInput
        label={'en.models.data_collection_method.label'}
        source={MODEL_FIELDS.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Edit>
);
