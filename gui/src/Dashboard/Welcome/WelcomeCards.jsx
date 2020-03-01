//WelcomeCards.jsx
import React from 'react';
import AgentInstall from './AgentInstall';
import Welcome from './Welcome';
import { Grid } from '@material-ui/core';
import {ROLE_USER} from "../../_constants/index"
import SecondSteps from './SecondSteps';


const WelcomeCards = ({loading, hasFiles}) => {
    const user = JSON.parse(localStorage.getItem(ROLE_USER));
    let _isMounted = true

///groupMemberships is given to us from the server on login.  Using this data, we can identify the groups that a user is in and query for all users in said groups
//if there are no users and the role is sufficiently high (refer to constants file to see if it is), we tell the user to add users to the group
//if the user has no groupmemberships we tell the user to associate them with some group, or to ask a superior to do so
//this data exists in groupMemberships, and said data can be cross-referenced with groups which is also in storage.

    //Get Users in groups that this user is a group admin or data manager of.

    return(
        <Grid
            direction="row"
            alignItems="flex-start"
            container
            spacing={3}
        >
            <Grid item xs={4}>
            {/*This should be conditional based on whether a project has files / if there is a group set up with users*/}
                <Welcome />
            </Grid>
            
            {/*This should be conditional based on whether or not the user has access to a project with files*/}
            {!loading && !hasFiles && (user.is_admin || user.is_group_admin) && 
                <Grid item xs={4}>
                    <AgentInstall />
                </Grid>
            }
            
            { false && //to be replaced once we know what's going here.
                <Grid item xs={4}>
                    <SecondSteps />
                </Grid>
            }
        </Grid>
)}

export default WelcomeCards

/*
this isn't needed anymore.
<Grid item xs={4}>
    <Welcome />
</Grid>
*/