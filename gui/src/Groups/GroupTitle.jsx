import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const GroupTitle = ({ prefix="", record, classes }) => {
    return <Typography className={classes.titleText}>{`${prefix} ${record && record.name ? record.name : ""}`}</Typography>;
};

export default withStyles(styles)(GroupTitle)