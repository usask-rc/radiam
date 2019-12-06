import React from 'react'
import { withStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';

const styles = {
    titleText: {
        fontSize: "2em",
    }
}

//might want to somehow get the group and dataset translated into the title for display
const GroupViewGrantTitle = ({ prefix="", classes }) => {
    return (
        <Typography className={classes.titleText}>{`${prefix}`}</Typography>
    )
};

export default withStyles(styles)(GroupViewGrantTitle)
