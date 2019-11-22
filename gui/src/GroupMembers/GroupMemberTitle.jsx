import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography, TextField } from '@material-ui/core';
import ReferenceField from 'ra-ui-materialui/lib/field/ReferenceField';
import { UserShow } from '../_components/_fields/UserShow';
const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const GroupMemberTitle = ({ prefix="", record, classes }) => {
    return (<Typography className={classes.titleText}>{`${prefix} User-Group Relation`}</Typography>)
};

export default withStyles(styles)(GroupMemberTitle)