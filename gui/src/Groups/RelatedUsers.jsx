import React, { Component, useState, useEffect } from 'react'
import * as Constants from '../_constants/index';
import '../_components/components.css';
import { Chip, Typography } from '@material-ui/core';
import { CreateButton } from 'ra-ui-materialui/lib/button';
import {  getGroupUsers } from '../_tools/funcs';

const RelatedUsers = (record) => {
    const styles = theme => ({
        chipDisplay: {
            display: 'flex',
            justifyContent: 'left',
            flexWrap: 'wrap',

        },
        relatedDSContainer: {
            marginLeft: '1em'
        }
    });
  
    const [groupMembers, setGroupMembers] = useState([])
  
    useEffect(() => {
      getGroupUsers(setGroupMembers, record)
    }, [])

    return(
      <div className={styles.relatedDSContainer}>
      {groupMembers && groupMembers.length > 0 && <Typography component="p" variant="p">{`Group Users: `}</Typography> }
      {groupMembers && groupMembers.map(groupMember => {


        let groupRoleTextArr = groupMember.group_role.label.split(".")
        let groupRoleValue=""

        if (groupRoleTextArr.length === 4) {
            groupRoleValue=groupRoleTextArr[groupRoleTextArr.length - 2] + ": "
        }

        return( //TODO: display number of files in each user in the chip
          <Chip className={styles.chipDisplay} variant="outlined" key={groupMember.id}
          label={`${groupRoleValue}: ${groupMember.user.username}`}
          href={`/#/${Constants.models.USERS}/${groupMember.user.id}/${Constants.resource_operations.SHOW}`} component="a" clickable />
  
        )
      })}
          <CreateButton basePath={`/${Constants.models.USERS}`} label={`New User`}></CreateButton>
      </div>
    )
  }

export default RelatedUsers