import React from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

const LocationTitle = ({ prefix="", record, classes }) => {
    return <Typography className={classes.titleText}>{`${prefix} ${record && record.display_name ? record.display_name : ""}`}</Typography>;
};

export default withStyles(styles)(LocationTitle)