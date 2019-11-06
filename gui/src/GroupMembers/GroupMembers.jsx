//GroupMember.jsx
import React, { useState, useEffect } from "react";
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
} from "react-admin";
import * as Constants from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import { getAsyncValidateTwoNotExists } from "../_tools/asyncChecker";
import TranslationField from "../_components/_fields/TranslationField";
import TranslationSelect from "../_components/_fields/TranslationSelect";
import { userSelect, UserShow } from "../_components/_fields/UserShow";
import { withStyles } from "@material-ui/core/styles";
import { Prompt } from 'react-router';


const listStyles = {
  actions: {
    backgroundColor: "inherit"
  },
  root: {
    backgroundColor: "inherit"
  },
  header: {
    backgroundColor: "inherit"
  }
};
const filterStyles = {
  form: {
    backgroundColor: "inherit"
  }
};

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const GroupMemberFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <DateInput source={Constants.model_fields.DATE_UPDATED} />
    <ReferenceInput
      label={"en.models.groupmembers.user"}
      source={Constants.model_fk_fields.USER}
      reference={Constants.models.USERS}
    >
      <SelectInput optionText={Constants.model_fields.USERNAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.group"}
      source={Constants.model_fk_fields.GROUP}
      reference={Constants.models.GROUPS}
    >
      <SelectInput optionText={Constants.model_fields.NAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.role"}
      source={Constants.model_fk_fields.GROUP_ROLE}
      reference={Constants.models.ROLES}
    >
      <TranslationSelect optionText={Constants.model_fields.LABEL} />
    </ReferenceInput>
  </Filter>
));

export const GroupMemberList = withStyles(listStyles)(
  ({ classes, ...props }) => {
    return (
      <List
        {...props}
        classes={{
          root: classes.root,
          header: classes.header,
          actions: classes.actions
        }}
        exporter={false}
        filters={<GroupMemberFilter />}
        sort={{ field: Constants.model_fields.DATE_UPDATED, order: "DESC" }}
        perPage={10}
        pagination={<CustomPagination />}
        bulkActionButtons={false}
      >
        <Datagrid rowClick={Constants.resource_operations.SHOW}>

          <ReferenceField
            linkType={false}
            label={"en.models.groupmembers.user"}
            source={Constants.model_fk_fields.USER}
            reference={Constants.models.USERS}
            allowEmpty //TODO: this `not loading user` issue will be fixed when ADM-1712 is resolved
          >
            <UserShow />
          </ReferenceField>
          <ReferenceField
            linkType={false}
            label={"en.models.groupmembers.group"}
            source={Constants.model_fk_fields.GROUP}
            reference={Constants.models.GROUPS}>
            <TextField source={Constants.model_fields.NAME}  />
          </ReferenceField>
          <ReferenceField
            linkType={false}
            label={"en.models.groupmembers.role"}
            source={Constants.model_fk_fields.GROUP_ROLE}
            reference={Constants.models.ROLES}
          >
            <TranslationField
              label={"en.models.roles.label"}
              source={Constants.model_fields.LABEL}
            />
          </ReferenceField>
          <DateField
            label={"en.models.generic.date_updated"}
            options={{
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            }}
            source={Constants.model_fields.DATE_UPDATED}
          />
          <DateField
            label={"en.models.generic.date_expires"}
            options={{
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            }}
            source={Constants.model_fields.DATE_EXPIRES}
          />
        </Datagrid>
      </List>
    )
  }
);

export const GroupMemberShow = props => (
  <Show title={<GroupMemberTitle />} {...props}>
    <SimpleShowLayout>
      <ReferenceField
        linkType={false}
        label={"en.models.groupmembers.user"}
        source={Constants.model_fk_fields.USER}
        reference={Constants.models.USERS}
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={"en.models.groupmembers.group"}
        source={Constants.model_fk_fields.GROUP}
        reference={Constants.models.GROUPS}
      >
        <TextField source={Constants.model_fields.NAME} />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={"en.models.groupmembers.role"}
        source={Constants.model_fk_fields.GROUP_ROLE}
        reference={Constants.models.ROLES}
      >
        <TranslationField
          label={"en.models.roles.label"}
          source={Constants.model_fields.LABEL}
        />
      </ReferenceField>
      <DateField
        label={"en.models.generic.date_created"}
        options={{
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }}
        source={Constants.model_fields.CREATED_AT}
      />
      <DateField
        label={"en.models.generic.date_updated"}
        options={{
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }}
        source={Constants.model_fields.DATE_UPDATED}
      />
      <DateField
        label={"en.models.generic.date_expires"}
        options={{
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }}
        source={Constants.model_fields.DATE_EXPIRES}
      />
    </SimpleShowLayout>
  </Show>
);

export const GroupMemberTitle = ({ record }) => {
  return <span>GroupMember {record ? `"${record.date_created}"` : ""}</span>;
};

const validateUser = required('en.validate.groupmembers.user');
const validateGroup = required('en.validate.groupmembers.group');
const validateRole = required('en.validate.groupmembers.role');

/**
 * Check with the API whether a user has already been assigned a role in a group.
 */
const asyncValidate = getAsyncValidateTwoNotExists(
  {
    id: Constants.model_fields.ID,
    name : Constants.model_fk_fields.USER,
    reject: Constants.warnings.TOO_MANY_ROLES,
  },
  {
    id: Constants.model_fields.ID,
    name : Constants.model_fk_fields.GROUP,
    reject: Constants.warnings.TOO_MANY_ROLES,
  },
  Constants.models.GROUPMEMBERS
);

const GroupMemberForm = props => {
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
  <SimpleForm {...props}
    redirect={Constants.resource_operations.LIST}
    asyncValidate={asyncValidate}
    asyncBlurFields={ [ Constants.model_fk_fields.GROUP, Constants.model_fk_fields.USER ] }
    onChange={handleChange}
    save={handleSubmit}
  >
  <ReferenceInput
    label={"en.models.groupmembers.user"}
    source={Constants.model_fk_fields.USER}
    reference={Constants.models.USERS}
    validate={validateUser}
  >
    <SelectInput optionText={userSelect} />
  </ReferenceInput>
  <ReferenceInput
    label={"en.models.groupmembers.group"}
    source={Constants.model_fk_fields.GROUP}
    reference={Constants.models.GROUPS}
    validate={validateGroup}
  >
    <SelectInput optionText={Constants.model_fields.NAME} />
  </ReferenceInput>
  <ReferenceInput
    label={"en.models.groupmembers.role"}
    source={Constants.model_fk_fields.GROUP_ROLE}
    reference={Constants.models.ROLES}
    validate={validateRole}
  >
    <TranslationSelect optionText={Constants.model_fields.LABEL} />
  </ReferenceInput>
  <DateInput
    label={"en.models.generic.date_expires"}
    source={Constants.model_fields.DATE_EXPIRES}
    allowEmpty
  />
  <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
</SimpleForm>
  )
}

export const GroupMemberCreate = props => {
  return (
    <Create {...props}>
      <GroupMemberForm/>
    </Create>
  );
}

export const GroupMemberEdit = props => {
  return (
    <Edit title={<GroupMemberTitle />} {...props}>
      <GroupMemberForm/>
    </Edit>
  );
}
