import React, { Component } from 'react'
import { translate } from 'ra-core';
import { withStyles } from '@material-ui/styles';
import { connect } from "react-redux";
import { changeLocale, Title } from "react-admin";
import compose from "recompose/compose";
import { changeTheme } from "./actions";



const styles = {
    label: { width: "10em", display: "inline-block" },
    button: { margin: "1em" }
  };
  

const Help = ({ translate }) => (
    <React.Fragment>

    </React.Fragment>
)
const mapStateToProps = state => ({
    theme: state.theme,
    locale: state.i18n.locale
  });
  
  const enhance = compose(
    connect(
      mapStateToProps,
      {
        changeLocale,
        changeTheme
      }
    ),
    translate,
    withStyles(styles)
  );
  
  export default enhance(Help);
  