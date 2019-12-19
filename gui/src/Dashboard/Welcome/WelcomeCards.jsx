//WelcomeCards.jsx
import React, { useState, useEffect } from 'react';
import AgentInstall from './AgentInstall';
import Welcome from './Welcome';
import { Grid } from '@material-ui/core';
import * as Constants from "../../_constants/index"
import {  getUsersInGroup, getMaxUserRole, getGroupData } from '../../_tools/funcs';
import SecondSteps from './SecondSteps';
import FewUsers from './FewUsers';


const WelcomeCards = ({loading, hasFiles}) => {
    const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
    let _isMounted = false
    const [userManagedGroups, setUserManagedGroups] = useState([])

///groupMemberships is given to us from the server on login.  Using this data, we can identify the groups that a user is in and query for all users in said groups
//if there are no users and the role is sufficiently high (refer to constants file to see if it is), we tell the user to add users to the group
//if the user has no groupmemberships we tell the user to associate them with some group, or to ask a superior to do so
//this data exists in groupMemberships, and said data can be cross-referenced with groups which is also in storage.

    //Get Users in groups that this user is a group admin or data manager of.

    //TODO: protect against leaks using ismounted
    const getAssociatedUsers = (managedGroups) => {
        

        console.log("getassociatedusers managedgroups list: ", managedGroups)
        let managedGroupsList = []

        //first, get this group data by making a call to /researchgroups/{id}/
        //then make this call and append users to this group.
        managedGroups.map(group => {
            //get group data
            getGroupData(group).then(groupData => {
                getUsersInGroup(group).then(users => {

                    const newGroup = groupData
                    newGroup.users = users
                    managedGroupsList = [...managedGroupsList, newGroup]

                    if (_isMounted){
                    setUserManagedGroups(managedGroupsList)
                    }
                })
            })
        })
        

    }

    //TODO: this should move up to Dashboard rather than being down here in welcome cards.
    useEffect(() => {
        //GOAL: find how many users are in each group, if our user is not a base level user
        //if i'm the superuser, I don't care if a group doesn't have a user.  This is up to a Group Admin or a Data Manager to rectify.
        _isMounted = true
        //TODO: protect against memory leakage
        
        if (user){
            let userRole = getMaxUserRole()
            if (userRole === "user"){
                //do not query for groups
            }
            else{
                //TODO: error: attempt to spread noniterable instance
                let managedGroups = []
                if (user.groupAdminships){
                    managedGroups = [...user.groupAdminships]
                }
                if (user.dataManagerships){
                    managedGroups = [...managedGroups, ...user.dataManagerships]
                }
                    if (_isMounted && managedGroups.length > 0){
                        getAssociatedUsers(managedGroups)
                    }
            }
        }
        
        else{
            //punt to front page - no user cookie available
            console.error("No User Cookie Detected - Returning to front page")
            window.location.hash = "#/login"
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
        {user && (user.is_admin || user.is_group_admin ) && userManagedGroups && userManagedGroups.length > 0 && 
            <FewUsers userManagedGroups={userManagedGroups} />
        }
        {
            
            //this should show if the user is an admin AND if there are no groups.
        //there should be another if the user is in no groups
        /*
        
        {userGroups !== null && userGroups.length === 0 &&
            <Grid item xs={4}>
                <FirstSteps />
            </Grid>
            }
            */

        }
        
        { false && //to be replaced once we know what's going here.
            <Grid item xs={4}>
                <SecondSteps />
            </Grid>
        }
        <Grid item xs={4}>
            {/*This should be conditional based on whether a project has files / if there is a group set up with users*/}
            <Welcome />
        </Grid>
        <Grid item xs={4}>
            {/*This should be conditional based on whether or not the user has access to a project with files*/}
            {!loading && !hasFiles && (user.is_admin || user.is_group_admin) && <AgentInstall />}
        </Grid>
    </Grid>
)}

export default WelcomeCards

/*
this isn't needed anymore.
<Grid item xs={4}>
    <Welcome />
</Grid>
*/