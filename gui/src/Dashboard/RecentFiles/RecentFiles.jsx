import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import RecentFilesDisplay from './RecentFilesDisplay';

const RecentFiles = ({ loading, projects, hasFiles, handleDateLimitChange }) => (
    <React.Fragment>
        {!loading && projects && projects.length > 0 && hasFiles ? (
            <Grid
                direction="row"
                alignItems="flex-start"
                xs={12}
                container
            >
                <RecentFilesDisplay projects={projects} handleDateLimitChange={handleDateLimitChange} />
            </Grid>
        ) : <Typography>No Recent Projects or Files.</Typography>}
    </React.Fragment>
)

export default RecentFiles