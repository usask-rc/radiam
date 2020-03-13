//RelatedUsers.jsx
import React, { useState, useEffect } from 'react'
import {ROLE_GROUP_ADMIN, ROLE_DATA_MANAGER, ROLE_MEMBER} from "../_constants/index";
import '../_components/components.css';
import Chip from "@material-ui/core/Chip"
import Tooltip from "@material-ui/core/Tooltip"
import UserAvatar from "react-user-avatar";
import { withStyles } from '@material-ui/styles';
import Edit from '@material-ui/icons/Edit';
import { withTranslate } from 'ra-core';
import { compose } from 'recompose';
import moment from 'moment';


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

const roleTooltip = (translate, groupMember) => {
  const memberSince = moment(groupMember.date_created).format("YYYY-MM-DD")
  const memberUntil = groupMember.date_expires ? moment(groupMember.date_expires).format("YYYY-MM-DD") : ""

  return `${translate(`en.${groupMember.group_role.label}`)} Since ${memberSince}${memberUntil ? `, Expires at ${memberUntil}` : ``}`
}

const RelatedUsers = ({translate, classes, setCreateModal, groupMembers, setEditModal=null, setViewModal=null, inModal=false, ...props}) => {
  
  return(
      <div className={classes.container}>
          <>
            {groupMembers && groupMembers.length > 0 && 
                <div className={classes.roleDisplayContainer}>
                  {groupMembers.map(groupMember => {
                    const roleDisplay = roleTooltip(translate, groupMember)
                    return(
                      <Tooltip title={roleDisplay}>
                      <Chip className={classes.chipDisplay} aria-label={"admin"} variant="outlined" key={groupMember.id} avatar={
                            <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                        }
                        label={`${groupMember.user.username}`}
                        clickable={inModal ? false : true}
                        onDelete={setEditModal && !inModal ? () => setEditModal(groupMember) : null}
                        onClick={() => {if (!inModal && setViewModal !== null) {
                            setViewModal(groupMember)
                        }}}
                        deleteIcon={<Edit />}
                      />
                      </Tooltip>
                    )
                  })
                }
                </div>
            }
            {setCreateModal && !inModal && 
                <Chip label={`+ Add User`} className={classes.newUserChipDisplay} variant="outlined" key={"newUserChip"} clickable onClick={() => setCreateModal(true)}/>
            }
          </>
      </div>
    )
  }

const enhance = compose(withStyles(styles), withTranslate)
export default enhance(RelatedUsers)