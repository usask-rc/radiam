import React from "react";
import { connect } from "react-redux";
import { Layout } from "react-admin";
import CustomAppBar from "./AppBar";
import { darkTheme, lightTheme } from "./themes";

const CustomLayout = props => <Layout appBar={CustomAppBar} {...props} />;

export default connect(
  state => ({
    theme: state.theme === "dark" ? darkTheme : lightTheme
  }),
  {}
)(CustomLayout);
