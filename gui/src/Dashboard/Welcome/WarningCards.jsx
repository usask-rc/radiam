import React, { useState, useEffect } from "react"
import { withStyles } from "@material-ui/styles"
import { getGroupData, getUsersInGroup, getMaxUserRole } from "../../_tools/funcs"
import {ROLES} from "../../_constants/index"
import { Grid } from "@material-ui/core"
import FewUsers from "./Warnings/FewUsers"
import NoGroups from "./Warnings/NoGroups"


const styles = () => ({
    container: {
        marginTop: "1em",
        marginBottom: "1em",
    },
})

//calculate various warning states; display if necessary

const WarningCards = ({classes, ...props}) => {
    const [userManagedGroups, setUserManagedGroups] = useState([])

    const user = JSON.parse(localStorage.getItem(ROLES.USER));

    let _isMounted = true
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
        //TODO: protect against memory leakage
        if (user){
            let userRole = getMaxUserRole()
            if (userRole === ROLES.USER || userRole !== ROLES.ANONYMOUS){
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

    console.log("userManagedGroups: ", userManagedGroups)

    return(
        //TODO: there is an issue relating to permissions that causes fewusers to not display
        <Grid className={classes.container} container>
            {user && (user.is_admin || user.is_group_admin ) && userManagedGroups && userManagedGroups.length > 0 && 
                <Grid item xs={4}>
                    <FewUsers userManagedGroups={userManagedGroups} />
                </Grid>
            }
            {user && getMaxUserRole() === ROLES.ANONYMOUS && 
                <Grid item xs={4}>
                    <NoGroups />
                </Grid>
            }
        </Grid>
    )
}

export default withStyles(styles)(WarningCards)