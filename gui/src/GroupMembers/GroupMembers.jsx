//GroupMembers.jsx
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
import {RESOURCE_OPERATIONS, ROLE_USER, WARNINGS, MODELS, MODEL_FK_FIELDS, MODEL_FIELDS} from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import { getAsyncValidateDuplicateNotExists } from "../_tools/asyncChecker";
import TranslationField from "../_components/_fields/TranslationField";
import TranslationSelect from "../_components/_fields/TranslationSelect";
import { userSelect, UserShow } from "../_components/_fields/UserShow";
import { withStyles } from "@material-ui/core/styles";
import { Prompt } from 'react-router';
import GroupMemberTitle from "./GroupMemberTitle";
import { isAdminOfAParentGroup, postObjectWithoutSaveProp, putObjectWithoutSaveProp } from "../_tools/funcs";
import { Toolbar } from "@material-ui/core";
import { EditButton } from "ra-ui-materialui/lib/button";
import { FKToolbar } from "../_components/Toolbar";
import { groupSelect } from "../_components/_fields/GroupShow";


const listStyles = {
  actions: {
    backgroundColor: "inherit"
  },
  root: {
    backgroundColor: "inherit"
  },
  header: {
    backgroundColor: "inherit"
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
const GroupMemberFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <ReferenceInput
      label={"en.models.groupmembers.user"}
      source={MODEL_FK_FIELDS.USER}
      reference={MODELS.USERS}
    >
      <SelectInput optionText={MODEL_FIELDS.USERNAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.group"}
      source={MODEL_FK_FIELDS.GROUP}
      reference={MODELS.GROUPS}
    >
      <SelectInput optionText={MODEL_FIELDS.NAME} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.role"}
      source={MODEL_FK_FIELDS.GROUP_ROLE}
      reference={MODELS.ROLES}
    >
      <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
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
          actions: classes.actions
        }}
        exporter={false}
        filters={<GroupMemberFilter />}
        sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: "DESC" }}
        perPage={10}
        pagination={<CustomPagination />}
        bulkActionButtons={false}
      >
        <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW} classes={{headerCell: classes.columnHeaders}}>

          <ReferenceField
            link={false}
            label={"en.models.groupmembers.user"}
            source={MODEL_FK_FIELDS.USER}
            reference={MODELS.USERS}
            allowEmpty //TODO: this `not loading user` issue will be fixed when ADM-1712 is resolved
          >
            <UserShow />
          </ReferenceField>
          <ReferenceField
            link={false}
            label={"en.models.groupmembers.group"}
            source={MODEL_FK_FIELDS.GROUP}
            reference={MODELS.GROUPS}>
            <TextField source={MODEL_FIELDS.NAME}  />
          </ReferenceField>
          <ReferenceField
            link={false}
            label={"en.models.groupmembers.role"}
            source={MODEL_FK_FIELDS.GROUP_ROLE}
            reference={MODELS.ROLES}
          >
            <TranslationField
              label={"en.models.roles.label"}
              source={MODEL_FIELDS.LABEL}
            />
          </ReferenceField>
          <DateField
            label={"en.models.generic.date_updated"}
            source={MODEL_FIELDS.DATE_UPDATED}
          />
          <DateField
            label={"en.models.generic.date_expires"}
            source={MODEL_FIELDS.DATE_EXPIRES}
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
  const user = JSON.parse(localStorage.getItem(ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)
  useEffect(() => {
    let _isMounted = true
    if (data && !showEdit){
      isAdminOfAParentGroup(data.group).then(data => {
        if (_isMounted){
          setShowEdit(data)
        }
      })
    }
    return function cleanup() {
      _isMounted = false
    }
  }, [data, showEdit])

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
        link={false}
        label={"en.models.groupmembers.user"}
        source={MODEL_FK_FIELDS.USER}
        reference={MODELS.USERS}
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        link={false}
        label={"en.models.groupmembers.group"}
        source={MODEL_FK_FIELDS.GROUP}
        reference={MODELS.GROUPS}
      >
        <TextField source={MODEL_FIELDS.NAME} />
      </ReferenceField>
      <ReferenceField
        link={false}
        label={"en.models.groupmembers.role"}
        source={MODEL_FK_FIELDS.GROUP_ROLE}
        reference={MODELS.ROLES}
      >
        <TranslationField
          label={"en.models.roles.label"}
          source={MODEL_FIELDS.LABEL}
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
        source={MODEL_FIELDS.CREATED_AT}
      />
      <DateField
        label={"en.models.generic.date_updated"}
        options={{
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }}
        source={MODEL_FIELDS.DATE_UPDATED}
      />
      <DateField
        label={"en.models.generic.date_expires"}
        options={{
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }}
        source={MODEL_FIELDS.DATE_EXPIRES}
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
const asyncValidate = getAsyncValidateDuplicateNotExists(
  {
    id: MODEL_FIELDS.ID,
    name : MODEL_FK_FIELDS.USER,
    reject: WARNINGS.TOO_MANY_ROLES,
  },
  {
    id: MODEL_FIELDS.ID,
    name : MODEL_FK_FIELDS.GROUP,
    reject: WARNINGS.TOO_MANY_ROLES,
  },
  MODELS.GROUPMEMBERS
);

//TODO: make date_expires_at required - it is currently a required field, for some reason.
export const GroupMemberForm = props => {
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [data, setData] = useState({})
  useEffect(() => {
    let _isMounted = true
    if (data && Object.keys(data).length > 0) {
      if (props.save){
        props.save(data)
      }
      //accessing in modal form
      else{
        //console.log("data is: ", data, "props are: ", props)
        

        //if data previously existed, PUT instead
        if (data.id){
          putObjectWithoutSaveProp(data, MODELS.GROUPMEMBERS).then(data => {
            //console.log("data after updating groupmember: ", data)
            if (props.setEditModal){
              if (_isMounted){
                props.setEditModal(false)
              }
            }
          })
        }
        else{
          postObjectWithoutSaveProp(data, MODELS.GROUPMEMBERS).then(data => {
            //console.log("data after posting new groupmember: ", data)
            if (props.setCreateModal){
              if (_isMounted){
                props.setCreateModal(false)
              }
            }
          })
        }
       
      }
    }
    return function cleanup() {
      _isMounted = false
    }
  }, [data, props])

  function handleSubmit(formData) {
    //console.log("handleSubmit in groupmembers is submitting formData: ", formData)
    setIsFormDirty(false)
    setData(formData)
  }

  function handleChange(data){
    setIsFormDirty(true)
  }
  //console.log("groupmemberform props: ", props)
  //given some chosen group, we only want to be able to add users who are not already members of said group in some form
  //if the primary way we're going to be accessing this form is via Groups, we already have this data for Create.
  return(
  <SimpleForm {...props}
    redirect={RESOURCE_OPERATIONS.LIST}
    asyncValidate={asyncValidate}
    asyncBlurFields={ [ MODEL_FK_FIELDS.GROUP, MODEL_FK_FIELDS.USER ] }
    onChange={handleChange}
    save={handleSubmit}
    toolbar={<FKToolbar {...props}/>}
  >
    {props.record && <GroupMemberTitle prefix={Object.keys(props.record).length > 0 ? "Updating" : "Creating"} />}

    <ReferenceInput
      label={"en.models.groupmembers.user"}
      source={MODEL_FK_FIELDS.USER}
      reference={MODELS.USERS}
      resource={MODELS.USERS}
      defaultValue={props.user ? props.user : null}
      disabled={props.record && props.record.user ? true : false}
      validate={validateUser}
    >
      <SelectInput optionText={userSelect} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.group"}
      source={MODEL_FK_FIELDS.GROUP}
      reference={MODELS.GROUPS}
      resource={MODELS.GROUPS}
      defaultValue={props.record && props.record.group ? props.record.group : null}
      disabled={((props.record && props.record.group) || props.group) ? true : false}
      validate={validateGroup}
    >
      <SelectInput optionText={groupSelect} />
    </ReferenceInput>
    <ReferenceInput
      label={"en.models.groupmembers.role"}
      source={MODEL_FK_FIELDS.GROUP_ROLE}
      reference={MODELS.ROLES}
      resource={MODELS.ROLES}
      defaultValue={props.group_role ? props.group_role  : null}
      validate={validateRole}
    >
      <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
    </ReferenceInput>
    <DateInput
      label={"en.models.generic.date_expires"}
      source={MODEL_FIELDS.DATE_EXPIRES}
      defaultValue={props.date_expires ? props.date_expires : null}
      allowEmpty
    />
    <Prompt when={isFormDirty} message={WARNINGS.UNSAVED_CHANGES}/>
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
