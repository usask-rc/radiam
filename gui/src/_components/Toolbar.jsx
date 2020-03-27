//Toolbar.jsx
import React from 'react';
import { Toolbar, SaveButton } from 'react-admin';
import { withStyles } from '@material-ui/styles';
import { getCurrentUserID } from '../_tools/funcs';
import { DeleteWithConfirmButton } from 'ra-ui-materialui/lib/button';
import { ROLE_USER } from "../_constants/index"
//This custom toolbar exists in order to cut the Deletion button out of certain models.
//To 'delete' these models, the user must go into the Edit function for them and deactivate them, after which they (will eventually) stop being pulled from the API except under certain circumstances.
const styles = {
  deleteButton: {
    marginLeft: "2em",
  }
}

//separate entry for deleting users - we don't want users to be able to delete themselves.
const BaseUserToolbar = ({classes, ...props}) => {
  const { hasCreate, hasEdit, hasShow, hasList, ...rest } = props
  console.log("BaseUserToolbar props: ", props)

    return(
      <Toolbar {...rest}>
        <SaveButton />
        {//TODO: / NOTE: there is a react-admin error with DeleteWithConfirmButton about onSave.  this is react-admin's fault - it happens whenever this tag is used, regardless of props passed into it.
        }
          {props.record.id !== getCurrentUserID() && <DeleteWithConfirmButton className={classes.deleteButton}
            confirmTitle={`Delete User?`}
            confirmContent={`Are you sure you want to delete this user?`}
           {...props} />
          }
      </Toolbar>
    )  
}

//for anything with `name` as a field - Groups, Projects, display_name (Locations) title (datasets) 
const BaseToolbar = ({classes, ...props}) => {
  console.log("basetoolbar props: ", props)
  const user = JSON.parse(localStorage.getItem(ROLE_USER));

  return(
    <Toolbar {...props}>
      <SaveButton />
      {//TODO: for some reason this is only broken in Locations - it can't receive props record for some reason.
        user.is_admin && props.resource !== `locations` && 
        <DeleteWithConfirmButton className={classes.deleteButton}
        confirmTitle={`Delete Record?`}
        confirmContent={`Are you sure you would like to delete this record?`} 
        record={props}
      />
      }
    </Toolbar>
  )
}

//for anything that is a model of foreign keys with no name/title
const BaseFKToolbar = ({classes, ...props}) => {
  console.log("FKToolbar props: ", props)
  const { hasCreate, hasEdit, hasShow, hasList, save, ...rest } = props
  const { record, resource } = props
  return(
    <Toolbar {...rest}>
      <SaveButton />
      {//TODO: / NOTE: there is a react-admin error with DeleteWithConfirmButton about onSave.  this is react-admin's fault - it happens whenever this tag is used, regardless of props passed into it.
      }
      {record && 
        <DeleteWithConfirmButton className={classes.deleteButton}
        confirmTitle={`Delete record in table ${resource}?`}
        confirmContent={`Delete ${resource} record?`}
        />
      }

    </Toolbar>
  )
}
export const UserToolbar = withStyles(styles)(BaseUserToolbar)
export const DefaultToolbar = withStyles(styles)(BaseToolbar)
export const FKToolbar = withStyles(styles)(BaseFKToolbar)