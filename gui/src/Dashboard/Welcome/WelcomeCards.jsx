import React, { useState, useEffect } from 'react';
import AgentInstall from './AgentInstall';
import Welcome from './Welcome';
import { Grid } from '@material-ui/core';
import * as Constants from "../../_constants/index"
import { getUserGroups, getUsersInGroup, getAPIEndpoint } from '../../_tools/funcs';
import FirstSteps from './FirstSteps';
import SecondSteps from './SecondSteps';
import { radiamRestProvider, httpClient } from '../../_tools';
import { GET_LIST } from 'ra-core';


const WelcomeCards = () => {

    let _isMounted = false
    const [userType, setUserType] = useState(null)
    const [userGroups, setUserGroups] = useState(null)
    const [managedGroups, setManagedGroups] = useState([])
    const [error, setError] = useState(null)

///groupMemberships is given to us from the server on login.  Using this data, we can identify the groups that a user is in and query for all users in said groups
//if there are no users and the role is sufficiently high (refer to constants file to see if it is), we tell the user to add users to the group
//if the user has no groupmemberships we tell the user to associate them with some group, or to ask a superior to do so
//this data exists in groupMemberships, and said data can be cross-referenced with groups which is also in storage.

    //Get Users in groups that this user is a group admin or data manager of.
    const getManagedGroups = () => {

        const role_group_admin = Constants.ROLE_GROUP_ADMIN
        const user_id = JSON.parse(localStorage.getItem(Constants.ROLE_USER)).id

        console.log("in getAssociatedUsers, role_group_admin and user_id are: ", role_group_admin, user_id)
        
        const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

        dataProvider(GET_LIST, Constants.models.GROUPMEMBERS, {
        filter: {
            user: user_id, //TODO: this is somehow wrong - is the User.Id value in Storage incorrect somehow???!?!?!?
            group_role: role_group_admin,
            is_active: true
        },
        sort: { field: Constants.model_fields.ID, order: 'DESC' },
        pagination: { page: 1, perPage: 1000},
        }).then(response => {
        console.log("user is group admin in groups: ", response.data)

        if (response.data.length > 0){
            let userGroups = new Set()
            response.data.map(groupMember => {
            userGroups.add(groupMember.group)
            })
            userGroups = [...userGroups]

            getAssociatedUsers(userGroups)
            return userGroups
        }
        else{
            //this user is not a group admin of any groups.  They are not an elevated user.
        }
        })
    }

    const getAssociatedUsers = (groups) => {
        let userManagedGroups = []
        groups.map(group => {
        //TODO: refactor this so we either have the record, or we only need to send the id.
        getUsersInGroup({id: group, is_active: true}).then(data => {

            let newGroup = group
            newGroup.users = data
            userManagedGroups.append(newGroup)

            setManagedGroups(userManagedGroups)
        }).catch(err => console.error("error returned from getUsersInGroup is: ",err))
        })
    }

    //TODO: this should move up to Dashboard rather than being down here in welcome cards.
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

                    getManagedGroups()
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
        { false && //to be replaced once we know what's going here.
            <Grid item xs={4}>
                <SecondSteps userType={userType}/>
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