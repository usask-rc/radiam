import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    createText: {
        padding: "1em",
        fontSize: "2em",
    },
    updateText: {
        fontSize: "2em",
    }
}

const ProjectTitle = ({ prefix="", record, classes }) => {
    return <Typography className={record ? classes.updateText : classes.createText}>{`${prefix} ${record ? record.name : ""}`}</Typography>;
};

export default withStyles(styles)(ProjectTitle)