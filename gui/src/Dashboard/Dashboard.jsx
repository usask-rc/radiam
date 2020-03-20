//Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { getRecentProjects, getUsersInMyGroups, getMyGroupIDs } from '../_tools/funcs';
import { Responsive } from 'react-admin';
import ProjectsCard from "./ProjectCards/ProjectsCard"
import WelcomeCards from './Welcome/WelcomeCards';
import { withStyles } from '@material-ui/styles';
import WarningCards from './Welcome/WarningCards';
import {ROLES} from "../_constants/index"
import RelatedUsersDisplay from './RelatedUsersDisplay';


const styles = theme => ({
  root: {
    marginTop: "1em",
  }
})

const Dashboard = ({classes, permissions, ...rest}) => {
  const [hasFiles, setHasFiles] = useState(null)
  const [relatedUsers, setRelatedUsers] = useState(null)
  const [recentProjects, setRecentProjects] = useState(null)

  useEffect(() => {


    getRecentProjects().then(data => {
      //console.log("getrecentprojects returned: ", data)
      setRecentProjects(data.projects)
      setHasFiles(data.hasFiles)
    })
    .catch(err => {
      console.error("Error in getRecentProjects: ", err)
    })

    getMyGroupIDs().then(myGroups => {
      getUsersInMyGroups(myGroups).then(data => {
        //console.log("getusersinmygroups data: ", data)
        setRelatedUsers(data)
      }).catch(err => console.error("users in my groups err: ", err))
      return myGroups
    })
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
                    <ProjectsCard projects={recentProjects} />
                  </>
                }
                {relatedUsers && 
                <>
                    <RelatedUsersDisplay relatedUsers={relatedUsers} />
                </>
                }
              </>
            }
          />
        </div>
      );
  }

export default withStyles(styles)(Dashboard);
