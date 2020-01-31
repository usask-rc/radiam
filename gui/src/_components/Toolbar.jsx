import React from 'react';
import { Toolbar, SaveButton } from 'react-admin';
//This custom toolbar exists in order to cut the Deletion button out of certain models.
//To 'delete' these models, the user must go into the Edit function for them and deactivate them, after which they (will eventually) stop being pulled from the API except under certain circumstances.
export const EditToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export default EditToolbar;
