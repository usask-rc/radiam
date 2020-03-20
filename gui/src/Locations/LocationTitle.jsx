import React from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}
//for some reason, record cannot be inherited from LocationForm.  I have no idea why this is.
const LocationTitle = ({ prefix="", record, classes, ...rest }) => {
    //console.log("record in locationtitle: ", record, rest)
    return <Typography className={classes.titleText}>{`${prefix} ${record && record.display_name ? record.display_name : ""}`}</Typography>;
};

export default withStyles(styles)(LocationTitle)