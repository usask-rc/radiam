//Layout.jsx
import React from "react";
import { connect } from "react-redux";
import { Layout } from "react-admin";
import CustomAppBar from "./RadiamAppBar";
import { darkTheme, lightTheme } from "./themes";
import RadiamMenu from "../Dashboard/RadiamMenu";

//TODO: there is a warning here that is likely the react-admin developers' fault.  Their Layout component accepts this appBar but throws an error when it does so.
const CustomLayout = (props) => <Layout 
appBar={CustomAppBar} 
menu={RadiamMenu} {...props} />;

export default React.memo(connect(
  state => ({
    theme: state.theme === "dark" ? darkTheme : lightTheme
  }),
  {}
)(CustomLayout));
