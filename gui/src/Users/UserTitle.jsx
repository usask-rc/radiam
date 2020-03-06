import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import get from 'lodash/get';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const UserTitle = ({ prefix="", record, classes, ...props }) => {
    return <Typography className={classes.titleText}>{`${prefix} ${record ? record.username : ""}`}</Typography>;
};
  
export default withStyles(styles)(UserTitle)