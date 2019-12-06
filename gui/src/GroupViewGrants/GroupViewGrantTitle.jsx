import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import { ReferenceField } from 'ra-ui-materialui/lib/field';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

//might want to somehow get the group and dataset translated into the title for display
const GroupViewGrantTitle = ({ prefix="", record, classes }) => {
    return (
        <Typography className={classes.titleText}>{`${prefix}`}</Typography>
    )
};

export default withStyles(styles)(GroupViewGrantTitle)
