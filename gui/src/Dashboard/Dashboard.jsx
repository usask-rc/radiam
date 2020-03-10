//Dashboard.jsx
import React, { PureComponent, useState, useEffect } from 'react';
import { getRecentProjects, getGroupMembers } from '../_tools/funcs';
import { Responsive } from 'react-admin';
import ProjectCards from "./ProjectCards/ProjectCards"
import WelcomeCards from './Welcome/WelcomeCards';
import { withStyles } from '@material-ui/styles';
import WarningCards from './Welcome/WarningCards';
import {ROLES, MODELS} from "../_constants/index"
import { Typography } from '@material-ui/core';
import GroupUsers from './Welcome/GroupUsers';
import UserCards from './UserCards';



const styles = theme => ({
  root: {
    marginTop: "1em",
  }
})
/*
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
                    //do we care about user permission levels?
                    setManagedUsers(data)
                })
                getUsersInMyGroups(user.dataManagerships)
                .then(data => {
                    setPeerUsers(data)
                })
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
*/


const getUsersInMyGroups = (groups) => {
  return new Promise((resolve, reject) => {
      if (!groups){
          resolve([])
      }
      const promises = []
      groups.map(group => {

          console.log("group being checked for users is: ", group)

          let params = {
              is_active: true,
              id: group,
          }

          promises.push(
              getGroupMembers(params)
              .then(data => {
                  console.log("getusersingroup : ", group, "is: ", data)
                  return data
              })
              .catch(err => reject(err))
          )
      })

      //TODO: this is wrong - in promise hell here, we need to attach the Group to the User if we want to list the list of groups they are in
      //given multiple lists of users due to one list per promise
      Promise.all(promises).then(userLists => {
          const usersInMyGroups = {}

          userLists.map(userList => {
              userList.map(record => {
                  //need a filtering mechanism to remove duplicate users
                  if (usersInMyGroups.hasOwnProperty(record.user.id))
                  {
                    usersInMyGroups[record.user.id].group.push(record.group)
                  }
                  else{
                    usersInMyGroups[record.user.id] = record
                    usersInMyGroups[record.user.id].group = [record.group]
                  }
              })
          })
          resolve(usersInMyGroups)
      })
      .catch(err => reject(err))
      })
  }


const Dashboard = ({classes, permissions, ...rest}) => {
  const [hasFiles, setHasFiles] = useState(null)
  const [relatedUsers, setRelatedUsers] = useState(null)
  const [recentProjects, setRecentProjects] = useState(null)
  const user = JSON.parse(localStorage.getItem(ROLES.USER));

  useEffect(() => {
    getRecentProjects().then(data => {
      console.log("getrecentprojects returned: ", data)
      setRecentProjects(data.projects)
      setHasFiles(data.hasFiles)
    })
    .catch(err => {
      console.error("Error in getRecentProjects: ", err)
    })

    const myGroups = user.groupAdminships.concat(user.dataManagerships)

    getUsersInMyGroups(myGroups).then(data => {
      console.log("getusersinmygroups data: ", data)
      setRelatedUsers(data)
    }).catch(err => console.log("users in my groups err: ", err))
  }, [])

  return(
        <div className={classes.root}>
          <Responsive
            medium={
              <>
                <WelcomeCards hasFiles={hasFiles}  />
                <WarningCards />
                {recentProjects &&
                  <>
                    <ProjectCards projects={recentProjects} />
                  </>
                }
                {relatedUsers && 
                <>
                    <UserCards relatedUsers={relatedUsers} />
                </>
                }
              </>
            }
          />
        </div>
      );
  }

export default withStyles(styles)(Dashboard);
