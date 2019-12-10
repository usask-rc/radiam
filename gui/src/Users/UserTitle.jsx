import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const UserTitle = ({ prefix="", record, classes }) => {
    console.log("record in usertitle: ", record)
    return <Typography className={classes.titleText}>{`${prefix} ${record ? `${record.first_name} ${record.last_name} : <${record.username}>` : ""}`}</Typography>;
  };
  
export default withStyles(styles)(UserTitle)