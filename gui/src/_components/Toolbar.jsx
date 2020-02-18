import React from 'react';
import { Toolbar, SaveButton, DeleteButton } from 'react-admin';
import { withStyles } from '@material-ui/styles';
import { getCurrentUserID } from '../_tools/funcs';
import { DeleteWithUndoButton, DeleteWithConfirmButton } from 'ra-ui-materialui/lib/button';
//This custom toolbar exists in order to cut the Deletion button out of certain models.
//To 'delete' these models, the user must go into the Edit function for them and deactivate them, after which they (will eventually) stop being pulled from the API except under certain circumstances.
const styles = {
  deleteButton: {
    marginLeft: "2em",
  }
}

//separate entry for deleting users - we don't want users to be able to delete themselves.
const BaseUserToolbar = ({classes, ...props}) => {
  console.log("BaseUserToolbar props: ", props)
  const { record } = props
  return(
  <Toolbar {...props}>
    <SaveButton />
    {record.id !== getCurrentUserID() && 
      <DeleteWithConfirmButton className={classes.deleteButton} 
        confirmTitle={`Delete User ${record.username} <${record.first_name} ${record.last_name}> ?`}
        confirmContent={`Are you sure you want to delete this user?`}
       {...props} />
    }
  </Toolbar>
)}

//for anything with `name` as a field
const BaseToolbar = ({classes, ...props}) => {
  console.log("BaseToolbar props: ", props)
  const { record } = props
  return(
    <Toolbar {...props}>
      <SaveButton />
      <DeleteWithConfirmButton className={classes.deleteButton}
      confirmTitle={`Delete ${record.name} ?`}
      confirmContent={`Are you sure you would like to delete this record?`}/>
    </Toolbar>
  )
}

export const UserToolbar = withStyles(styles)(BaseUserToolbar)
export const DefaultToolbar = withStyles(styles)(BaseToolbar)