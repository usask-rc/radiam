import React, { useState } from 'react';
import AgentInstall from './AgentInstall';
import Welcome from './Welcome';
import { Grid } from '@material-ui/core';
import * as Constants from "../../_constants/index"
import { getUserGroups } from '../../_tools/funcs';
import FirstSteps from './FirstSteps';


const WelcomeCards = () => {

    const [userType, setUserType] = useState(null)
    const [userGroups, setUserGroups] = useState(null)

    const getUserType = (user) => {
        if (user.is_admin){
            return 'admin'
        }else if (user.is_group_admin){
            return 'group_admin'
        }else if (user.is_data_manager){
            return 'data_manager'
        }else{
            return 'user'
        }
    }

    //TODO: protect against memory leakage
    const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
    if (user){
        getUserGroups(user.id).then(data => {
            if (data.length > 0){
                setUserGroups(data)
                setUserType(getUserType(user))
            }else{ 
                //if the user is in no groups, they are only an admin or a base level user to the system at this point.
                setUserGroups([])
                setUserType(getUserType(user))
            }
        }).catch()
    }

    
    return(
    <Grid
        direction="row"
        alignItems="flex-start"
        container
        spacing={3}
    >
        {userGroups !== null && userGroups.length === 0 &&
        <Grid item xs={4}>
            <FirstSteps userType={userType}/>
        </Grid>
        }
        <Grid item xs={4}>
            <Welcome />
        </Grid>
        <Grid item xs={4}>
            <AgentInstall />
        </Grid>
    </Grid>
)}

export default WelcomeCards