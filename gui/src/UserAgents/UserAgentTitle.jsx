//UserAgentTitle.jsx
import React from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const UserAgentTitle = ({ prefix="", record, classes }) => {
    return <Typography className={classes.titleText}>{`${prefix}`}</Typography>;
};

export default withStyles(styles)(UserAgentTitle)