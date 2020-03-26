//Users.jsx
import React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  Edit,
  EmailField,
  Filter,
  List,
  Show,
  TextField,
  TextInput,
} from "react-admin";
import {MODEL_FIELDS} from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import UserDetails from "./UserDetails";
import UserEditForm from "./UserEditForm";
import { withStyles } from "@material-ui/core/styles";
import ToggleActiveButton from "./ToggleActiveButton";
import Toolbar from '@material-ui/core/Toolbar';
import { EditButton } from 'react-admin';
import UserForm from "./UserForm";
import {  UserToolbar } from "../_components/Toolbar";

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
const UserFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <TextInput
          label={"en.models.filters.search"}
          source="search"
          alwaysOn
    />
    <BooleanInput
      label={"en.models.users.active"}
      source={MODEL_FIELDS.ACTIVE}
      alwaysOn />
  </Filter>
));

const userListRowClick = (id, basePath, record) => record.is_active ? `${basePath}/${record.id}/show?is_active=true` : `${basePath}/${record.id}/show?is_active=false`

// eslint-disable-next-line no-unused-vars
const PostBulkActionButtons = props => (
  <>
    <ToggleActiveButton label="Toggle Active" {...props} />
  </>
)


export const UserList = withStyles(listStyles)(({ classes, ...props }) => {

  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;

  return (
    <List
      hasCreate={false}
      {...props}
      classes={{
        root: classes.root,
        actions: classes.actions
      }}
      filterDefaultValues={{is_active: true}}
      exporter={false}
      filters={<UserFilter />}
      sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: "DESC" }}
      perPage={10}
      pagination={<CustomPagination />}
      //bulkActionButtons={<PostBulkActionButtons {...other}/>} - This can be activated as soon as Username is no longer a required field on PUT.
      bulkActionButtons={false}
    >
      <Datagrid rowClick={userListRowClick} classes={{headerCell: classes.columnHeaders}} {...other}>
        <TextField
          label={"en.models.users.username"}
          source={MODEL_FIELDS.USERNAME}
        />
        <TextField
          label={"en.models.users.fname"}
          source={MODEL_FIELDS.FIRST_NAME}
        />
        <TextField
          label={"en.models.users.lname"}
          source={MODEL_FIELDS.LAST_NAME}
        />
        <EmailField
          className={classes.email}
          label={"en.models.users.email"}
          source={MODEL_FIELDS.EMAIL}
        />
        <TextField
          label={"en.models.users.notes"}
          source={MODEL_FIELDS.NOTES}
        />
        <BooleanField
          label={"en.models.users.active"}
          source={MODEL_FIELDS.ACTIVE} />
      </Datagrid>
    </List>
  )
}
);

const actionsStyles = theme => ({
  root: {
    float: "right",
    marginTop: "-10px",
  }
})

const UserDetailsActions = ({permissions, basePath, data, resource, classes}) => {

  //console.log("permissions, basepath, etc: ", permissions, basePath, data, resource)
  //only superuser can modify user data - users must go via the User Edit page.
  if (permissions && permissions.is_admin){
    return(<Toolbar className={classes.root}>
          <EditButton basePath={basePath} record={data} />
      </Toolbar>)
    //there was a deletebutton here, i've restricted deleting users to the API only.
    //{permissions.is_admin && <DeleteButton basePath={basePath} record={data} resource={resource} />}
  }
  else{
      return null
  }
}

const EnhancedUserDetailsActions = withStyles(actionsStyles)(UserDetailsActions)

export const UserShow = props => {
  //console.log("usershow props: ", props)

  return (
    <Show actions={<EnhancedUserDetailsActions permissions={props.permissions} {...props} />} {...props}>
      <UserDetails {...props} />
    </Show>
  )
};

export const UserCreate = props => {
  //filter out unneeded hasCreate, hasEdit, etc.  These throw an error if passed to our custom userForm.
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
  return (
    <Create {...props}>
      <UserForm {...other} redirect={'/show'} />
    </Create>
  )
};

export const UserEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
    return(
    <Edit toolbar={<UserToolbar />} {...props}>
      <UserEditForm {...other}/>
    </Edit>)
    
};

export const UserEditWithDeletion = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props
    return (
      <Edit toolbar={<UserToolbar {...props} />} {...props}>
        <UserEditForm {...other} />
      </Edit>
    )
}
