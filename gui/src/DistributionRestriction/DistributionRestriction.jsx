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

export const DistributionRestrictionList = props => (
  <List {...props} exporter={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <TranslationField
        label={"en.models.distribution_restriction.label"}
        source={Constants.model_fields.LABEL}
      />
    </Datagrid>
  </List>
);

export const DistributionRestrictionShow = props => (
  <Show title={<DistributionRestrictionTitle />} {...props}>
    <SimpleShowLayout>
      <TranslationField
        label={"en.models.distribution_restriction.label"}
        source={Constants.model_fields.LABEL}
      />
    </SimpleShowLayout>
  </Show>
);

const validateLabel = required('en.validate.distributionrestriction.label');

export const DistributionRestrictionCreate = props => (
  <Create {...props}>
    <SimpleForm redirect={Constants.resource_operations.LIST}>
      <TextInput
        label={"en.models.distribution_restriction.label"}
        source={Constants.model_fields.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Create>
);

export const DistributionRestrictionTitle = ({ record }) => {
  return (
    <span>Distribution Restriction {record ? `"${record.label}"` : ""}</span>
  );
};

export const DistributionRestrictionEdit = props => (
  <Edit title={<DistributionRestrictionTitle />} {...props}>
    <SimpleForm redirect={Constants.resource_operations.LIST}>
      <TextInput
        label={"en.models.distribution_restriction.label"}
        source={Constants.model_fields.LABEL}
        validate={validateLabel}
      />
    </SimpleForm>
  </Edit>
);
