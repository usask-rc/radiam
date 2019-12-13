//Appbar.jsx
import React, { useState, useEffect } from "react";
import {version} from "../version.json";
import { AppBar, UserMenu, MenuItemLink, translate } from "react-admin";
import SettingsIcon from "@material-ui/icons/Settings";
import { withStyles } from "@material-ui/core/styles";
import * as Constants from "../_constants/index"
import RadiamLogo from "./RadiamLogo";
import { Typography } from "@material-ui/core";
import { Help, HelpOutline } from "@material-ui/icons";
import UserAvatar from "react-user-avatar"
import { getUserDetails } from "../_tools/funcs.jsx";

const styles = {
  appBarText: {
    color: "black",
    textTransform: 'uppercase',
  },
  logo: {
    padding: '1em',
  },
  spacer: {
    flex: 1
  },
  title: {
    flex: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "auto"
  },
  versionText: {
    color: "black",
    paddingLeft: "1em",
  }
};

// "Menu" is the drop-down that you get when you click the Profile button.
const CustomUserMenu = translate(({ translate, user, ...props }) => (
  <UserMenu icon={
    user && user.first_name && user.last_name ? 
    <UserAvatar size="36" name={`${user.first_name} ${user.last_name}`} />
    : <HelpOutline />
  }>
    <MenuItemLink
      to="/settings"
      primaryText={translate("en.settings.label")}
      leftIcon={<SettingsIcon />}
    />
    <MenuItemLink
    to="/help"
    primaryText={translate("en.help.label")}
    leftIcon={<Help/>}
    />
  </UserMenu>
));

const CustomAppBar = ({ classes, ...props }) => {
  const [user, setUser] = useState(null);
  let _isMounted = false

  useEffect(() => {
    _isMounted = true
    getUserDetails().then(data => 
      {
        console.log("data returned from get current user details is: ", data)
        if (_isMounted){
          setUser(data)
        }
      })
      .catch(err => 
        {
          window.location.hash = "#/login"
        }
      )

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [])

  return(
  <AppBar userMenu={<CustomUserMenu user={user} {...props} />}>
    <RadiamLogo className={classes.logo} />
    <Typography className={classes.versionText}>{`V${version}`}</Typography>
    <span className={classes.spacer} />
    <Typography className={classes.appBarText}>{localStorage.getItem(Constants.model_fields.USERNAME)}</Typography>
  </AppBar>
)};

export default withStyles(styles)(CustomAppBar);
