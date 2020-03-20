import React, { useState, useEffect } from "react"
import { withStyles } from "@material-ui/styles"
import { getMaxUserRole, getGroupMembers } from "../../_tools/funcs"
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

const getUsersInMyGroups = (groups) => {
    return new Promise((resolve, reject) => {

        if (!groups){
            resolve([])
        }
        const promises = []
        groups.map(group => {

            //console.log("group being checked for users is: ", group)

            let params = {
                is_active: true,
                id: group,
            }

            promises.push(
                getGroupMembers(params)
                .then(data => {
                    //console.log("getusersingroup : ", group, "is: ", data)
                    return data
                })
                .catch(err => reject(err))
            )
            return group
        })

        //given multiple lists of users due to one list per promise
        Promise.all(promises).then(userLists => {
            const usersInMyGroups = {}

            //
            userLists.map(userList => {
                userList.forEach(record => {
                    //console.log("record in userList: ", record)
                    usersInMyGroups[record.user.id] = record
                })
                return userList
            })
            resolve(usersInMyGroups)
            return userLists
        })
        .catch(err => reject(err))
        })
    }

const WarningCards = ({classes, ...props}) => {
    const [userManagedGroups, setUserManagedGroups] = useState([])
    const user = JSON.parse(localStorage.getItem(ROLES.USER));

    //TODO: this should move up to Dashboard rather than being down here in welcome cards.
    useEffect(() => {
        //GOAL: find how many users are in each group, if our user is not a base level user
        //if i'm the superuser, I don't care if a group doesn't have a user.  This is up to a Group Admin or a Data Manager to rectify.
        //TODO: protect against memory leakage
        if (user){

            let userRole = getMaxUserRole()
            if (userRole === ROLES.USER || userRole === ROLES.ANONYMOUS){
                //do not query for groups
            }
            else{
                getUsersInMyGroups(user.groupAdminships)
                .then(data => {
                    //receive a list of users underneath me
                    //TODO: determine user count in each group, probably on the next level up
                    //do we care about user permission levels?
                    //console.log("users in my managed groups: ", data)
                })
                getUsersInMyGroups(user.dataManagerships)
                .then(data => {
                })
            }
        }
        
        else{
            //punt to front page - no user cookie available
            window.location.hash = "#/login"
        }
    }, [user])

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