//Layout.jsx
import React from "react";
import { connect } from "react-redux";
import { Layout } from "react-admin";
import CustomAppBar from "./RadiamAppBar";
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
