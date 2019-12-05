//Users.jsx
import React, { Component } from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  crudUpdateMany,
  Datagrid,
  DateInput,
  Edit,
  EmailField,
  Filter,
  List,
  required,
  Show,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";
import * as Constants from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import { EditToolbar } from "../_components";
import UserFormWithAssoc from "./UserForm";
import UserDetails from "./UserDetails";
import UserEditForm from "./UserEditForm";
import { withStyles } from "@material-ui/core/styles";
import ToggleActiveButton from "./ToggleActiveButton";
import UserTitle from "./UserTitle";
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import { EditButton, DeleteButton } from 'react-admin';

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
  email: {
    fontSize: 14,
  }
};

const filterStyles = {
  form: {
    backgroundColor: "inherit"
  }
};

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const UserFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <DateInput source={Constants.model_fields.DATE_UPDATED} />
    <TextInput
      label={"en.models.users.username"}
      source={Constants.model_fields.USERNAME}
    />
    <TextInput
      label={"en.models.users.notes"}
      source={Constants.model_fields.NOTES}
    />
    <TextInput
      label={"en.models.users.email"}
      source={Constants.model_fields.EMAIL}
    />
    <TextInput
      label={"en.models.users.fname"}
      source={Constants.model_fields.FIRST_NAME}
    />
    <TextInput
      label={"en.models.users.lname"}
      source={Constants.model_fields.LAST_NAME}
    />
    <BooleanInput
      label={"en.models.users.active"}
      defaultValue={true}
      source={Constants.model_fields.ACTIVE} />

  </Filter>
));

const userListRowClick = (id, basePath, record) => record.is_active ? `${basePath}/${record.id}/show?is_active=true` : `${basePath}/${record.id}/show?is_active=false`

const PostBulkActionButtons = props => (
  <React.Fragment>
    <ToggleActiveButton label="Toggle Active" {...props} />
  </React.Fragment>
)


export const UserList = withStyles(listStyles)(({ classes, ...props }) => {

  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;

  return (
    <List
      hasCreate={false}
      {...props}
      classes={{
        root: classes.root,
        header: classes.header,
        actions: classes.actions
      }}
      exporter={false}
      filters={<UserFilter />}
      sort={{ field: Constants.model_fields.DATE_UPDATED, order: "DESC" }}
      perPage={10}
      pagination={<CustomPagination />}
      //bulkActionButtons={<PostBulkActionButtons {...other}/>} - This can be activated as soon as Username is no longer a required field on PUT.
      bulkActionButtons={false}
    >
      <Datagrid rowClick={userListRowClick} {...other}>
        <TextField
          label={"en.models.users.username"}
          source={Constants.model_fields.USERNAME}
        />
        <TextField
          label={"en.models.users.fname"}
          source={Constants.model_fields.FIRST_NAME}
        />
        <TextField
          label={"en.models.users.lname"}
          source={Constants.model_fields.LAST_NAME}
        />
        <EmailField
          className={classes.email}
          label={"en.models.users.email"}
          source={Constants.model_fields.EMAIL}
        />
        <TextField
          label={"en.models.users.notes"}
          source={Constants.model_fields.NOTES}
        />
        <BooleanField
          label={"en.models.users.active"}
          source={Constants.model_fields.ACTIVE} />
      </Datagrid>
    </List>
  )
}
);

/*
function manages_user(data)  {
  console.log("data in manages_user: ", data)
  //given my user id, is this user in a group I manage?
  return true
}*/

const actionsStyles = theme => ({
  root: {
    float: "right",
    marginTop: "-10px",
  }
})

const UserDetailsActions = ({permissions, basePath, data, resource, classes}) => {

  console.log("permissions, basepath, etc: ", permissions, basePath, data, resource)
  //can only modify the user if I'm a superuser or I'm modifying my own data.
  if (permissions && data && (permissions.is_admin || (permissions.id === data.id))){
    return(<Toolbar className={classes.root}>
          <EditButton basePath={basePath} record={data} />
          {permissions.is_admin && <DeleteButton basePath={basePath} record={data} resource={resource} />}
      </Toolbar>)
  }
  else{
      return null
  }
}

const EnhancedUserDetailsActions = withStyles(actionsStyles)(UserDetailsActions)

export const UserShow = props => {
  console.log("usershow props: ", props)

  return (
    <Show actions={<EnhancedUserDetailsActions permissions={props.permissions} {...props} />} {...props}>
      <UserDetails {...props} />
    </Show>
  )
};

const validateUsername = required('en.validate.user.username');

//TODO: want ability to create user-group association from here.
const UserForm = props => (
  <SimpleForm {...props} >
    <TextInput
      label={"en.models.users.username"}
      source={Constants.model_fields.USERNAME}
      validate={validateUsername}
    />
    <TextInput
      label={"en.models.users.fname"}
      source={Constants.model_fields.FIRST_NAME}
    />
    <TextInput
      label={"en.models.users.lname"}
      source={Constants.model_fields.LAST_NAME}
    />
    <TextInput
      label={"en.models.users.email"}
      source={Constants.model_fields.EMAIL}
    />
    <TextInput
      label={"en.models.users.notes"}
      source={Constants.model_fields.NOTES}
    />
    <BooleanInput
      label={"en.models.generic.active"}
      source={Constants.model_fields.ACTIVE}
      defaultValue={true}
    />
  </SimpleForm>
);

export const UserCreate = props => {
  //filter out unneeded hasCreate, hasEdit, etc.  These throw an error if passed to our custom userForm.
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Create {...props}>
      <UserFormWithAssoc {...other} redirect={'/show'} />
    </Create>
  )
};

export const UserEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  console.log("UserEdit props: ", props)
  return (
    <Edit toolbar={<EditToolbar />} {...props}>
      <UserForm  {...other} />
    </Edit>
  )
};

//TODO: add "are you sure?" prompt.
//a form for superusers, this is gated in App.jsx.
export const UserEditWithDeletion = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  if (props.id !== String(JSON.parse(localStorage.getItem(Constants.ROLE_USER)).id)) { //dont allow superusers to delete themselves
    return (
      <Edit toolbar={<EditToolbar />} {...props}>
        <UserEditForm {...other} />
      </Edit>
    )
  }

  else {
    return (<UserEdit {...props} />)
  }
}
