//RelatedUsers.jsx
import React, { useState, useEffect } from 'react'
import * as Constants from '../_constants/index';
import '../_components/components.css';
import { Chip, Typography } from '@material-ui/core';
import {  getGroupUsers } from '../_tools/funcs';
import UserAvatar from "react-user-avatar";
import { Link } from  "react-router-dom";
import { withStyles } from '@material-ui/styles';
import { Edit } from '@material-ui/icons';


const styles = theme => ({
  chipDisplay: {
      marginRight: "1em",
  },
  container: {
    justifyContent: "left",
    flexWrap: "wrap",
  },
  roleDisplayContainer: {
    display: "relative",
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


const RelatedUsers = ({classes, setShowModal, groupMembers, setEditModal=null, setViewModal=null, inModal=false, ...props}) => {

  const [groupAdmins, setGroupAdmins] = useState([])
  const [dataManagers, setDataManagers] = useState([])
  const [members, setMembers] = useState([])
  const [unknown, setUnknown] = useState([])

  useEffect(() => {
    let tempGA = []
    let tempDM = []
    let tempM = []
    let tempU = []
    //sort groupmembers into different categories
    groupMembers.map(groupMember => {
      console.log("groupMember: ", groupMember)
      if (groupMember.group_role.id === Constants.ROLE_GROUP_ADMIN){
        tempGA.push(groupMember)
      }
      else if (groupMember.group_role.id === Constants.ROLE_DATA_MANAGER){
        tempDM.push(groupMember)
      }
      else if (groupMember.group_role.id === Constants.ROLE_MEMBER){
        tempM.push(groupMember)
      }
      else{
        console.error("unknown role type associated with group.")
        tempU.push(groupMember)
      }
    })
    setGroupAdmins(tempGA)
    setDataManagers(tempDM)
    setMembers(tempM)
    setUnknown(tempU)
  }, [groupMembers])

  console.log("RelatedUsers props: ", props, "inmodal: ", inModal)

  return(
      <div className={classes.container}>

        <div className={classes.roleDisplayContainer}>
          {groupAdmins && groupAdmins.length > 0 &&
            <div className={classes.groupRoleContainer}>
              <Typography className={classes.groupRoleText}>{`Group Admins:`}</Typography>
              {groupAdmins.map(groupMember => {
                return(
                  <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                      <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                  }
                  label={`${groupMember.user.username}`}
                  clickable={inModal ? false : true}
                  onDelete={setEditModal && !inModal ? () => setEditModal(groupMember) : null}
                  onClick={() => {if (!inModal) {
                    setViewModal(groupMember)
                  }}}
                  deleteIcon={<Edit />}

                  />
                )
              })}
            </div>
          }
        </div>
        <div className={classes.roleDisplayContainer}>
          {dataManagers && dataManagers.length > 0 &&
            <div className={classes.groupRoleContainer}>
              <Typography className={classes.groupRoleText}>{`Data Managers:`}</Typography>
              {dataManagers.map(groupMember => {
                return(
                  <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                      <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                  }
                  label={`${groupMember.user.username}`}
                  clickable={inModal ? false : true}
                  onDelete={setEditModal && !inModal ? () => setEditModal(groupMember) : null}
                  onClick={() => {if (!inModal) {
                    setViewModal(groupMember)
                  }}}
                  deleteIcon={<Edit />}
                  />
                )
              })}
            </div>
          }
        </div>
        <div className={classes.roleDisplayContainer}>

          {members && members.length > 0 &&
          
            <div className={classes.groupRoleContainer}>
              <Typography className={classes.groupRoleText}>{`Members:`}</Typography>
                {members.map(groupMember => {
                return(
                  <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                      <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                  }
                  label={`${groupMember.user.username}`}
                  clickable={inModal ? false : true}
                  onDelete={setEditModal && !inModal ? () => setEditModal(groupMember) : null}
                  onClick={() => {if (!inModal) {
                    setViewModal(groupMember)
                  }}}
                  deleteIcon={<Edit />}
                  />
                )
            })}
            </div>
          }
          {setShowModal && !inModal && 
            <Chip label={`+ Add User`} className={classes.newUserChipDisplay} variant="outlined" key={"newUserChip"} clickable onClick={() => setShowModal(true)}/>
          }
          
        </div>

        <div className={classes.roleDisplayContainer}>
          {unknown && unknown.length > 0 &&
            
            <div className={classes.groupRoleContainer}>
              <Typography className={classes.groupRoleText}>{`Unknown:`}</Typography>
                {unknown.map(groupMember => {
                return(
                  <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                      <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                  }
                  label={`${groupMember.user.username}`}
                  clickable={inModal ? false : true}
                  onDelete={setEditModal && !inModal ? () => setEditModal(groupMember) : null}
                  onClick={() => {if (!inModal) {
                    setViewModal(groupMember)
                  }}}
                  deleteIcon={<Edit />}

                  />
                )
            })}
            </div>
          }
        </div>
      </div>
    )
  }

export default withStyles(styles)(RelatedUsers)

/*
//previous chip line where we provided a link to the user's show page.
//can restore this in future but would rather put in edit functionality for now
href={`/#/${Constants.models.USERS}/${groupMember.user.id}/${Constants.resource_operations.SHOW}`} component="a" clickable
*/
