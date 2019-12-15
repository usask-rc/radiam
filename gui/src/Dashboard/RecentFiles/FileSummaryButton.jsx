import React from 'react';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

const styles = {
    summaryButton: { float: "right" }
}
const FileSummaryButton = ({ classes, nbFiles, handleRedirect, translate }) => (

    <Button
        variant="contained"
        onClick={handleRedirect}
        color="primary"
        className={classes.summaryButton}
    >
        {`${translate(
            'en.dashboard.show_all'
        )} ${nbFiles} ${translate('en.dashboard.files')}`}
    </Button>

)
export default withStyles(styles)(FileSummaryButton)