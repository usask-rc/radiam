//GroupViewGrants.jsx
import React, { useState } from "react";
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
  withTranslate,
} from "react-admin";
import {RESOURCE_OPERATIONS, MODELS, MODEL_FK_FIELDS, MODEL_FIELDS} from "../_constants/index";
import { withStyles } from "@material-ui/core/styles";
import CustomPagination from "../_components/CustomPagination";
import GroupViewGrantTitle from "./GroupViewGrantTitle";
import { DatasetShow } from "../_components/_fields/DatasetShow";
import { GroupShow } from "../_components/_fields/GroupShow";
import { FKToolbar } from "../_components/Toolbar";
import FieldsChip from "./FieldsChip";
import ChipInput from "material-ui-chip-input";

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
  fieldChip: {
    marginRight: "0.5em",
  },
  fieldChipLabel: {
    fontSize: "0.8em",
    color: "grey",
    marginBottom: "0.5em",
  },
  columnHeaders: {
    fontWeight: "bold",
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
      <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW} classes={{headerCell: classes.columnHeaders}}>
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
        <FieldsChip
          type={"list"}
          classes={classes}
          label={"en.models.grants.fields"} 
        />
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

export const GroupViewGrantShow = withStyles(styles)(({ classes, ...props }) => (
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
      <FieldsChip
          classes={classes}
          label={"en.models.grants.fields"}
      />
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
));

const validateDataset = required('en.validate.viewgrants.dataset');
const validateGroup = required('en.validate.viewgrants.group');
const validateDateStarts = required("en.validate.viewgrants.date_start");

const GroupViewGrantForm = ({translate, classes, ...props}) => {
  const [grantedFields, setGrantedFields] = useState(props.record && props.record.fields ? props.record.fields.split(",") : "")


  const handleChipChange = (data) => {
    setGrantedFields(data)
  }

  const handleChipAdd = (data) => {
    setGrantedFields([...grantedFields, data])
  }
  
  const handleChipDelete = (data, idx) => {
    let tempGrantedFields = [...grantedFields]
    tempGrantedFields.splice(idx, 1)
    setGrantedFields(tempGrantedFields)
  }

  const handleSubmit=(data) => {
    //console.log("gvg handlesubmit: ", data)
    data.fields = grantedFields ? grantedFields.join(",") : ""
    props.save(data)
  }

  //console.log("props in groupviewgrantform: ", props)
  return(
  <SimpleForm {...props} 
    redirect={RESOURCE_OPERATIONS.LIST}
    save={handleSubmit}
    toolbar={<FKToolbar {...props} />}
    >
    <GroupViewGrantTitle prefix={props.record && Object.keys(props.record).length > 0 ? "Updating View Grant" : "Creating View Grant"} />

    <ReferenceInput
      label={"en.models.grants.group"}
      source={MODEL_FK_FIELDS.GROUP}
      reference={MODELS.GROUPS}
      validate={validateGroup}
      required
    >
      <SelectInput source={MODEL_FIELDS.NAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.grants.dataset"}
      source={MODEL_FK_FIELDS.DATASET}
      reference={MODELS.DATASETS}
      validate={validateDataset}
      required
    >
      <SelectInput optionText={MODEL_FIELDS.TITLE} />
    </ReferenceInput>
    <ChipInput
      label={translate("en.models.grants.fields")} //typically dont need to invoke translate, this is custom so we do.
      newChipKeys={[',']}
      onAdd={(data) => handleChipAdd(data)}
      onDelete={(data, idx) => handleChipDelete(data, idx)}
      onChange={handleChipChange}
      value={grantedFields}
    />
    <DateInput
      source={MODEL_FIELDS.DATE_STARTS}
      label={"en.models.generic.date_starts"}
      validate={validateDateStarts}
    />
    <DateInput
      source={MODEL_FIELDS.DATE_EXPIRES}
      label={"en.models.generic.date_expires"}
      allowEmpty
    />

  </SimpleForm>
)};

export const GroupViewGrantCreate = withTranslate(({translate, ...props}) => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Create {...props}>
      <GroupViewGrantForm translate={translate} {...other} />
    </Create>
  );
});

export const GroupViewGrantEdit = withTranslate(({translate, ...props}) => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Edit {...props}>
      <GroupViewGrantForm translate={translate} {...other} />
    </Edit>
  );
});
