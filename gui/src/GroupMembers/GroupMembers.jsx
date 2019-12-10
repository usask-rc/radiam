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
import GroupMemberTitle from "./GroupMemberTitle";
import { isAdminOfAParentGroup, postObjectWithoutSaveProp, putObjectWithoutSaveProp } from "../_tools/funcs";
import { Toolbar } from "@material-ui/core";
import { EditButton } from "ra-ui-materialui/lib/button";
import { TextInput } from "ra-ui-materialui/lib/input";


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
    <TextInput
      label={"en.models.filters.search"}
      source="search"
      alwaysOn
    />
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

//I shouldnt be able to access Edit page of members a group that I'm not a group Admin in.
const actionStyles = theme => ({
  toolbar:{
    float: "right",
    marginTop: "-20px",
  }
})

const GroupMemberShowActions = withStyles(actionStyles)(({ basePath, data, classes}) => 
{
  const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)

  //TODO: i hate that i have to do this.  It's not that inefficient, but I feel like there must be a better way.
  useEffect(() => {
    if (data && !showEdit){
      isAdminOfAParentGroup(data.group).then(data => {
        setShowEdit(data)
      })
    }
  }, [data])

  if (showEdit){
    return(
    <Toolbar className={classes.toolbar}>
      <EditButton basePath={basePath} record={data} />
    </Toolbar>
    )
  }
  else{
    return null
  }
})

export const GroupMemberShow = props => (
  <Show actions={<GroupMemberShowActions/>} {...props}>
    <SimpleShowLayout>
    <GroupMemberTitle prefix="Viewing" />
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

export const GroupMemberForm = props => {
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [data, setData] = useState({})
  
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      if (props.save){
        props.save(data)
      }
      //accessing in modal form
      else{
        console.log("data is: ", data, "props are: ", props)
        

        //if data previously existed, PUT instead
        if (data.id){
          putObjectWithoutSaveProp(data, Constants.models.GROUPMEMBERS).then(data => {
            console.log("data after updating groupmember: ", data)
            if (props.setEditModal){
              props.setEditModal(false)
            }
          })
        }
        else{
          postObjectWithoutSaveProp(data, Constants.models.GROUPMEMBERS).then(data => {
            console.log("data after posting new groupmember: ", data)
            if (props.setShowModal){
              props.setShowModal(false)
            }
          })
        }
       
      }
    }
  }, [data])

  function handleSubmit(formData) {
    setIsFormDirty(false)
    setData(formData)
  }

  function handleChange(data){
    setIsFormDirty(true)
  }
  console.log("groupmemberform props: ", props)
  //given some chosen group, we only want to be able to add users who are not already members of said group in some form
  //if the primary way we're going to be accessing this form is via Groups, we already have this data for Create.
  return(
  <SimpleForm {...props}
    redirect={Constants.resource_operations.LIST}
    asyncValidate={asyncValidate}
    asyncBlurFields={ [ Constants.model_fk_fields.GROUP, Constants.model_fk_fields.USER ] }
    onChange={handleChange}
    save={handleSubmit}
  >
    {props.record && <GroupMemberTitle prefix={Object.keys(props.record).length > 0 ? "Updating" : "Creating"} />}

    <ReferenceInput
      label={"en.models.groupmembers.user"}
      source={Constants.model_fk_fields.USER}
      reference={Constants.models.USERS}
      resource={Constants.models.USERS}
      defaultValue={props.user ? props.user : (() => setIsFormDirty(false))}
      disabled={props.record && props.record.user ? true : false}
      validate={validateUser}
    >
      <SelectInput optionText={userSelect} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.group"}
      source={Constants.model_fk_fields.GROUP}
      reference={Constants.models.GROUPS}
      resource={Constants.models.GROUPS}
      defaultValue={props.group ? props.group : (() => setIsFormDirty(false))}
      disabled={props.record && props.record.group ? true : false}
      validate={validateGroup}
    >
      <SelectInput optionText={Constants.model_fields.NAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.role"}
      source={Constants.model_fk_fields.GROUP_ROLE}
      reference={Constants.models.ROLES}
      resource={Constants.models.ROLES}
      defaultValue={props.group_role ? props.group_role : (() => setIsFormDirty(false))}
      validate={validateRole}
    >
      <TranslationSelect optionText={Constants.model_fields.LABEL} />
    </ReferenceInput>
    <DateInput
      label={"en.models.generic.date_expires"}
      source={Constants.model_fields.DATE_EXPIRES}
      defaultValue={props.date_expires ? props.date_expires : (() => setIsFormDirty(false))}
      allowEmpty
    />
    <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
  </SimpleForm>
  )
}

export const GroupMemberCreate = props => {
  
  let group = props.group
  if (props.location.group){
    group = props.location.group
  }
  return (
    <Create {...props} >
      <GroupMemberForm group={group}/>
    </Create>
  );
}

export const GroupMemberEdit = props => {
  return (
    <Edit {...props}>
      <GroupMemberForm/>
    </Edit>
  );
}
