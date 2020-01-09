import React from 'react';
import Grid from '@material-ui/core/Grid';

const FileListColumnHeaders = ({ classes, translate }) => (
    <>
        <Grid item className={classes.heading} xs={5} md={4}>
            {translate('en.dashboard.file_name')}
        </Grid>
        <Grid item className={classes.heading} xs={2} md={2}>
            {translate('en.dashboard.file_size')}
        </Grid>
        <Grid item className={classes.heading} xs={2} md={3}>
            {translate('en.dashboard.location')}
        </Grid>
        <Grid item className={classes.heading} xs={2} md={3}>
            {translate('en.dashboard.indexed')}
        </Grid>
        <Grid item className={classes.heading} xs={1} />
    </>
)
export default FileListColumnHeaders