//RelatedUsers.jsx
import React, { useState, useEffect } from 'react'
import * as Constants from '../_constants/index';
import '../_components/components.css';
import { Chip, Typography } from '@material-ui/core';
import {  getGroupUsers } from '../_tools/funcs';
import UserAvatar from "react-user-avatar";
import { Link } from  "react-router-dom";

const RelatedUsers = (record) => {
    let _isMounted = false;
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
      _isMounted = true;
      
      getGroupUsers(record).then((data) =>{
        if (_isMounted){
            setGroupMembers(data)
        }
        return data
      }).catch((err => {console.error("error in getGroupUsers fetch is: ", err)}))

      //if we unmount, lock out the component from being able to use the state
      return function cleanup() {
        _isMounted = false;
      }
    }, [])

    return(
      <div className={styles.relatedDSContainer}>
      {groupMembers && groupMembers.length > 0 && <Typography component="p" variant="body2">{`Group Users: `}</Typography> }
      {groupMembers && groupMembers.map(groupMember => {
        let groupRoleTextArr = groupMember.group_role.label.split(".")
        let groupRoleValue=""

        if (groupRoleTextArr.length === 4) {
            groupRoleValue=groupRoleTextArr[groupRoleTextArr.length - 2]
        }

        return(
          <Chip className={styles.chipDisplay} variant="outlined" key={groupMember.id}
          avatar={
            <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
          }
          label={`${groupRoleValue}`}
          href={`/#/${Constants.models.USERS}/${groupMember.user.id}/${Constants.resource_operations.SHOW}`} component="a" clickable>
          </Chip>
  
        )
      })}
        <Link to={{pathname:`/${Constants.models.USERS}/Create`, group: record.id}}>
          <Chip label={`+ New User`} className={styles.chipDisplay} variant="outlined" key={"newUserChip"} clickable/>
        </Link> 
      </div>
    )
  }

export default RelatedUsers