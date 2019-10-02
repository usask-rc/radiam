import React from 'react';
import { Chip, Typography } from '@material-ui/core';
import * as Constants from "../_constants/index"
//TODO: some text here needs to be moved to the constants file
//TODO: eventually want the ability to remove associations from this page.
const UserGroupsDisplay = ({ classes, groupMembers }) => {
    return (
        <div className={classes.chipDisplay}>            
            {groupMembers.map(groupMember => {
                if (groupMember.group_role && groupMember.group_role.label){

                //TODO: below string label translation is hardcoded to our API format and shouldn't be - it should be run through translate.
                let groupRoleTextArr = groupMember.group_role.label.split(".")
                let groupRoleValue=""

                if (groupRoleTextArr.length === 4) {
                    groupRoleValue=groupRoleTextArr[groupRoleTextArr.length - 2] + ": "
                }

                return (
                    <Chip className={classes.chip} variant="outlined" key={groupMember.group.id} 
                    label={`${groupRoleValue}${groupMember.group.name}`}
                    href={`/#/${Constants.models.GROUPS}/${groupMember.group.id}/${Constants.resource_operations.SHOW}`} component="a" clickable />
                )
            }
            else{
                return null
            }
            })
            }
        </div>)
}

export default UserGroupsDisplay