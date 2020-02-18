//RelatedUsers.jsx
import React, { useState, useEffect } from 'react'
import {ROLE_GROUP_ADMIN, ROLE_DATA_MANAGER, ROLE_MEMBER, MODELS, RESOURCE_OPERATIONS } from "../_constants/index";
import '../_components/components.css';
import Chip from "@material-ui/core/Chip"
import Tooltip from "@material-ui/core/Tooltip"
import UserAvatar from "react-user-avatar";
import { Link } from  "react-router-dom";
import { withStyles } from '@material-ui/styles';
import Edit from '@material-ui/icons/Edit';


const styles = theme => ({
  chipDisplay: {
      marginRight: "1em",
  },
  container: {
    justifyContent: "left",
    display: "flex",
  },
  roleDisplayContainer: {
    marginRight: "1em",
    display: "flex",
  },
  groupRoleContainer: {
    marginBottom: "1em",
    display: "flex",
    alignItems: "center",
  },
  groupRoleText: {
    fontSize: "0.9em",
    marginRight: "1em",
  },
  newUserChipDisplay: {
    backgroundColor: "beige",
  },
});


const RelatedUsers = ({classes, setCreateModal, groupMembers, setEditModal=null, setViewModal=null, inModal=false, ...props}) => {

  const [groupAdmins, setGroupAdmins] = useState([])
  const [dataManagers, setDataManagers] = useState([])
  const [members, setMembers] = useState([])
  const [unknown, setUnknown] = useState([])
  const [loading, setLoading] = useState(true)
  let _isMounted = true
  useEffect(() => {
    let tempGA = []
    let tempDM = []
    let tempM = []
    let tempU = []
    //sort groupmembers into different categories
    groupMembers.map(groupMember => {
      if (groupMember.group_role.id === ROLE_GROUP_ADMIN){
        tempGA.push(groupMember)
      }
      else if (groupMember.group_role.id === ROLE_DATA_MANAGER){
        tempDM.push(groupMember)
      }
      else if (groupMember.group_role.id === ROLE_MEMBER){
        tempM.push(groupMember)
      }
      else{
        tempU.push(groupMember)
      }
    })
    
    if (_isMounted){
      setGroupAdmins(tempGA)
      setDataManagers(tempDM)
      setMembers(tempM)
      setUnknown(tempU)
      setLoading(false)
    }
    return function cleanup() {
      _isMounted = false
    }
  }, [groupMembers])

  return(
      <div className={classes.container}>
        {loading ? `Loading...` :
          <>
            {groupAdmins && groupAdmins.length > 0 &&

            <div className={classes.roleDisplayContainer}>
              {groupAdmins.map(groupMember => {
                return(
                  <Tooltip title="Group Admin">
                  <Chip className={classes.chipDisplay} aria-label={"admin"} variant="outlined" key={groupMember.id} avatar={
                        <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                    }
                    label={`${groupMember.user.username}`}
                    clickable={inModal ? false : true}
                    onDelete={setEditModal && !inModal && _isMounted ? () => setEditModal(groupMember) : null}
                    onClick={() => {if (!inModal && setViewModal !== null && _isMounted) {
                        setViewModal(groupMember)
                    }}}
                    deleteIcon={<Edit />}
                  />
                  </Tooltip>
                )
              })}
            </div>
              }
            {dataManagers && dataManagers.length > 0 &&
              <div className={classes.roleDisplayContainer}>
                {dataManagers.map(groupMember => {
                  return(
                    <Tooltip title="Data Manager">
                      <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                          <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                        }
                        label={`${groupMember.user.username}`}
                        clickable={inModal ? false : true}
                        onDelete={setEditModal && !inModal && _isMounted ? () => setEditModal(groupMember) : null}
                        onClick={() => {if (!inModal && setViewModal !== null && _isMounted) {
                          setViewModal(groupMember)
                        }}}
                        deleteIcon={<Edit />}
                      />
                    </Tooltip>
                  )
                })}
              </div>
            }
            {members && members.length > 0 &&

              <div className={classes.roleDisplayContainer}>
                {members.map(groupMember => {
                  return(
                    <Tooltip title="Member">
                      <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                          <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                      }
                      label={`${groupMember.user.username}`}
                      clickable={inModal ? false : true}
                      onDelete={setEditModal && !inModal && _isMounted ? () => setEditModal(groupMember) : null}
                      onClick={() => {if (!inModal && setViewModal !== null && _isMounted) {
                        setViewModal(groupMember)
                      }}}
                      deleteIcon={<Edit />}
                      />
                    </Tooltip>
                  )
                })}
              </div>
            }
            {unknown && unknown.length > 0 &&
              <div className={classes.roleDisplayContainer}>
                  {unknown.map(groupMember => {
                  return(
                    <Tooltip title="Other Role">
                      <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                          <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                      }
                      label={`${groupMember.user.username}`}
                      clickable={inModal ? false : true}
                      onDelete={setEditModal && !inModal && _isMounted ? () => setEditModal(groupMember) : null}
                      onClick={() => {if (!inModal && setViewModal !== null && _isMounted) {
                        setViewModal(groupMember)
                      }}}
                      deleteIcon={<Edit />}
                      />
                    </Tooltip>
                  )
                })}
              </div>
            }
            {setCreateModal && !inModal && 
                <Chip label={`+ Add User`} className={classes.newUserChipDisplay} variant="outlined" key={"newUserChip"} clickable onClick={() => setCreateModal(true)}/>
            }
          </>
        }
      </div>
    )
  }

export default withStyles(styles)(RelatedUsers)