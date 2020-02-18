//UserInput.jsx
import React from "react";
import { Field } from 'react-final-form'
import { MODEL_FIELDS} from "../_constants/index";
import "../_components/components.css";
import { InputLabel, Select, MenuItem } from "@material-ui/core";


const renderUserInput = ({ input, users }) => {
    return (<>
      <InputLabel htmlFor={MODEL_FIELDS.PRIMARY_CONTACT_USER}>{`Primary Contact`}</InputLabel>
      <Select id={MODEL_FIELDS.PRIMARY_CONTACT_USER} name={MODEL_FIELDS.PRIMARY_CONTACT_USER}
        {...input}
      >
        {users && [...users].map(user => {
          return (<MenuItem value={user.id} key={user.id}>{user.username}</MenuItem>)
        })}
      </Select>
    </>)
  }
  
export const UserInput = ({ source, ...props }) => <Field name={source} component={renderUserInput} {...props} />