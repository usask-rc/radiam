//GroupMemberTitle.jsx
import React from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const GroupMemberTitle = ({ prefix="", classes }) => {
    return (<Typography className={classes.titleText}>{`${prefix} User-Group Relation`}</Typography>)
};

export default withStyles(styles)(GroupMemberTitle)