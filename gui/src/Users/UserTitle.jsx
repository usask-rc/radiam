//UserTitle.jsx
import React from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const UserTitle = ({ prefix="", record, classes }) => {
    return <Typography className={classes.titleText}>{`${prefix} ${record ? record.username : ""}`}</Typography>;
};
  
export default withStyles(styles)(UserTitle)