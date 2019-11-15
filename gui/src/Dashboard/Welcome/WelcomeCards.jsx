import React, { useState, useEffect } from 'react';
import AgentInstall from './AgentInstall';
import Welcome from './Welcome';
import { Grid } from '@material-ui/core';
import * as Constants from "../../_constants/index"
import { getUserGroups, getUsersInGroup } from '../../_tools/funcs';
import FirstSteps from './FirstSteps';
import SecondSteps from './SecondSteps';


const WelcomeCards = () => {

    let _isMounted = false
    const [userType, setUserType] = useState(null)
    const [userGroups, setUserGroups] = useState(null)
    const [error, setError] = useState(null)

///groupMemberships is given to us from the server on login.  Using this data, we can identify the groups that a user is in and query for all users in said groups
//if there are no users and the role is sufficiently high (refer to constants file to see if it is), we tell the user to add users to the group
//if the user has no groupmemberships we tell the user to associate them with some group, or to ask a superior to do so
//this data exists in groupMemberships, and said data can be cross-referenced with groups which is also in storage.
    useEffect(() => {
        _isMounted = true
        //TODO: protect against memory leakage
        const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
        if (user){
            
            if (user.is_admin){
                if (user.groupRoles.length === 0){
                    if (_isMounted){
                        setUserGroups([])
                        setUserType('admin')
                    }
                }
                else{
                    //query for the data of said groups so we can warn about missing projects or whatnot
                    const userObj = {id: user.id, is_active: true}
                    getUserGroups(userObj).then(data => {
                        console.log("getUserGroups data is: ", data)
                        if (_isMounted){
                            setUserGroups(data)
                        }

                        data.map(group => {
                            console.log("group user is in is: ", group)
                            getUsersInGroup(group.id).then(data => {
                                const newGroup = group
                                if (data.length > 0){
                                    newGroup.users = data
                                    group = newGroup
                                    return newGroup
                                }else{
                                    newGroup.users = []
                                    return newGroup
                                }
                            })
                        })
                    }).catch(err => {console.error(err); setError(err)})
                }
            }
            else if (!user.is_admin && !user.is_data_manager && !user.is_group_admin){
                if (user.groupRoles.length === 0){
                    if (_isMounted) {
                        setUserGroups([])
                        setUserType('user')
                    }
                }
                else{
                    //you are a member of some group, query for this data 
                    getUserGroups(user.id).then(data => {
                        if (_isMounted){
                            setUserGroups(data)
                        }
                    }).catch(err => {setError(err)})
                }
            }
        }
            
        //when we unmount, lock out the component from being able to use the state
        return function cleanup() {
            _isMounted = false;
        }
    }, [])

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
            <SecondSteps userType={userType}/>
        </Grid>
        
        <Grid item xs={4}>
            <Welcome />
        </Grid>
        <Grid item xs={4}>
            <AgentInstall />
        </Grid>
    </Grid>
)}

export default WelcomeCards