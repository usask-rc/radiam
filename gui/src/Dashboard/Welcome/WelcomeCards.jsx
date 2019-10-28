import React from 'react';
import AgentInstall from './AgentInstall';
import Welcome from './Welcome';
import { Grid } from '@material-ui/core';

const WelcomeCards = () => (
    <Grid
        direction="row"
        alignItems="flex-start"
        container
        spacing={3}
    >
        
        <Grid item xs={6}>
            <Welcome />
        </Grid>
        <Grid item xs={6}>
            <AgentInstall />
        </Grid>
    </Grid>
)

export default WelcomeCards