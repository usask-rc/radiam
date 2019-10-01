import React from "react";
import { AppBar, UserMenu, MenuItemLink, translate } from "react-admin";
import SettingsIcon from "@material-ui/icons/Settings";
import { withStyles } from "@material-ui/core/styles";

import * as Constants from "../_constants/index"

import RadiamLogo from "./RadiamLogo";
import { Typography } from "@material-ui/core";

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
const CustomUserMenu = translate(({ translate, ...props }) => (
  <UserMenu {...props}>
    <MenuItemLink
      to="/settings"
      primaryText={translate("en.settings.label")}
      leftIcon={<SettingsIcon />}
    />
  </UserMenu>
));

const CustomAppBar = ({ classes, ...props }) => (
  <AppBar {...props} userMenu={<CustomUserMenu />}>
    <RadiamLogo className={classes.logo} />
    <Typography className={classes.versionText}>{`V${Constants.VERSION}`}</Typography>
    <span className={classes.spacer} />
    <Typography className={classes.appBarText}>{localStorage.getItem("username")}</Typography>
  </AppBar>
);

export default withStyles(styles)(CustomAppBar);