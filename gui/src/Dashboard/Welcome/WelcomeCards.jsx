import React from 'react';
import AgentInstall from './AgentInstall';
import Welcome from './Welcome';
import { Grid } from '@material-ui/core';

const WelcomeCards = () => (
    <Grid
        direction="row"
        alignItems="start"
        container
        spacing={3}
    >
        <Welcome item xs={6} />
        <AgentInstall item xs={6} />
    </Grid>
)

export default WelcomeCards