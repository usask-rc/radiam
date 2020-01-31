import React from 'react';
import ResetPassword from '../layout/ResetPassword';
import { Route } from 'react-router';
import Settings from '../Settings/Settings';
import Help from "../Settings/Help";

//NOTE: This page throws a warning for the /reset/:token page.  This warning is resolved by react-router 4.4, but react-admin is restricted to <=4.2.  Until React-admin resolves this, this warning will likely persist.
export default [
  <Route exact path="/settings" component={Settings} />,
  <Route exact path="/help" component={Help} />,
  <Route
    exact
    path="/reset/:token"
    render={() => <ResetPassword />}
    noLayout
  />,
];
