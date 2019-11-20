//RecentFiles.jsx
import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import RecentFilesDisplay from './RecentFilesDisplay';

const RecentFiles = ({ projects, hasFiles }) => (
    
    <Grid
    direction="row"
    alignItems="flex-start"
    container>
        { projects && projects.length > 0 && hasFiles ? (
            <Grid item xs={12}>
                <RecentFilesDisplay projects={projects} />
            </Grid>
        ) : <Typography>No Recent Projects or Files.</Typography>}
    </Grid>
)

export default RecentFiles