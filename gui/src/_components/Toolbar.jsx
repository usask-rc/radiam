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

//for anything with `name` as a field - Groups, Projects, display_name (Locations) title (datasets) 
const BaseToolbar = ({classes, ...props}) => {
  console.log("BaseToolbar props: ", props)
  const { record } = props
  return(
    <Toolbar {...props}>
      <SaveButton />
      {
        //TODO: there remains a bug here where props.record exists in the parent component (in Location only) but not here.
        props.record && 
        <DeleteWithConfirmButton className={classes.deleteButton}
        confirmTitle={`Delete ${record.name || record.title || record.display_name} ?`}
        confirmContent={`Are you sure you would like to delete this record?`}/>
      }
    </Toolbar>
  )
}

//for anything that is a model of foreign keys with no name/title

const BaseFKToolbar = ({classes, ...props}) => {
  console.log("FKToolbar props: ", props)
  const { record } = props
  return(
    <Toolbar {...props}>
      <SaveButton />
      {props.record && 
        <DeleteWithConfirmButton className={classes.deleteButton}
        confirmTitle={`Delete record in table ${props.resource}?`}
        confirmContent={`Delete ${props.resource} record ID: ${record.id}?`}
        />
      }

    </Toolbar>
  )
}
export const UserToolbar = withStyles(styles)(BaseUserToolbar)
export const DefaultToolbar = withStyles(styles)(BaseToolbar)
export const FKToolbar = withStyles(styles)(BaseFKToolbar)