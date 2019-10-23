import React, { Component } from 'react'
import PropTypes from "prop-types";
import Home from "@material-ui/icons/Home";
import { translate } from "ra-core"
import {MenuItemLink} from "react-admin"

const CustomDashboardMenuItem = ({ locale, onClick, translate, ...props}) => (
    <MenuItemLink onClick={onClick}
    to="/"
    primaryText={"Home"}
    leftIcon={<Home /> }
    exact
    {...props}/>
);

CustomDashboardMenuItem.propTypes={
    classes: PropTypes.object,
    locale: PropTypes.string,
    onClick: PropTypes.func,
    translate: PropTypes.func,
}

export default CustomDashboardMenuItem