//Layout.jsx
import React from "react";
import { connect } from "react-redux";
import { Layout } from "react-admin";
import CustomAppBar from "./AppBar";
import { darkTheme, lightTheme } from "./themes";
import RadiamMenu from "../Dashboard/RadiamMenu";

const CustomLayout = (props) => <Layout 
appBar={CustomAppBar} 
menu={RadiamMenu} {...props} />;

export default React.memo(connect(
  state => ({
    theme: state.theme === "dark" ? darkTheme : lightTheme
  }),
  {}
)(CustomLayout));
