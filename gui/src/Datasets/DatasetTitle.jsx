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

const DatasetTitle = ({ classes, ...props }) => {
    if (props.record){
    return <Typography className={props.record ? classes.updateText : classes.createText}>{`${props.prefix} ${props.record && props.record.title ? props.record.title : "Dataset"}`}</Typography>;
    }
    else{
        return null
    }

};

export default withStyles(styles)(DatasetTitle)