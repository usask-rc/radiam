//Toolbar.jsx
import React from 'react';
import { Toolbar, SaveButton } from 'react-admin';
import { withStyles } from '@material-ui/styles';
import { getCurrentUserID } from '../_tools/funcs';
import { DeleteWithConfirmButton } from 'ra-ui-materialui/lib/button';
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
  const { hasCreate, hasEdit, hasShow, hasList, ...rest } = props
    return(
      <Toolbar {...rest}>
        <SaveButton />
          {props.record.id !== getCurrentUserID() && <DeleteWithConfirmButton className={classes.deleteButton} 
            confirmTitle={`Delete User ${props.record.username}?`}
            confirmContent={`Are you sure you want to delete this user?`}
           {...props} />
          }
      </Toolbar>
    )  
}

//for anything with `name` as a field - Groups, Projects, display_name (Locations) title (datasets) 
const BaseToolbar = ({classes, ...props}) => {
  //console.log("BaseToolbar props: ", props)
  const { hasCreate, hasEdit, hasShow, hasList, ...rest } = props
  const { record } = props
  return(
    <Toolbar {...rest}>
      <SaveButton />
      {
        record && 
        <DeleteWithConfirmButton className={classes.deleteButton}
        confirmTitle={`Delete ${record.name || record.title || record.display_name} ?`}
        confirmContent={`Are you sure you would like to delete this record?`}/>
      }
    </Toolbar>
  )
}

//for anything that is a model of foreign keys with no name/title
const BaseFKToolbar = ({classes, ...props}) => {
  //console.log("FKToolbar props: ", props)
  const { hasCreate, hasEdit, hasShow, hasList, ...rest } = props
  const { record, id, resource} = props
  return(
    <Toolbar {...rest}>
      <SaveButton />
      {record && 
        <DeleteWithConfirmButton className={classes.deleteButton}
        confirmTitle={`Delete record in table ${resource}?`}
        confirmContent={`Delete ${resource} record ID: ${id}?`}
        />
      }

    </Toolbar>
  )
}
export const UserToolbar = withStyles(styles)(BaseUserToolbar)
export const DefaultToolbar = withStyles(styles)(BaseToolbar)
export const FKToolbar = withStyles(styles)(BaseFKToolbar)