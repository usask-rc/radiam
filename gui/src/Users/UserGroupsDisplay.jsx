//UserGroupsDisplay.jsx
import React from 'react';
import { Chip } from '@material-ui/core';
import * as Constants from "../_constants/index"
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    chipDisplay: {
        display: 'flex',
        justifyContent: 'left',
        flexWrap: 'wrap',
    },
});


//TODO: refactor these chips to display `group admin` instead of `admin` and potentially change the labeling of `member`.
const UserGroupsDisplay = ({ classes, groupMembers }) => {
    return (
        <div className={classes.chipDisplay}>            
            {groupMembers.map(groupMember => {
                if (groupMember && groupMember.group_role && groupMember.group_role.label){
                    //TODO: below string label translation is hardcoded to our API format and shouldn't be - it should be run through translate.
                    let groupRoleTextArr = groupMember.group_role.label.split(".")
                    let groupRoleValue=""

                    if (groupRoleTextArr.length === 4) {
                        groupRoleValue=groupRoleTextArr[groupRoleTextArr.length - 2] + ": "
                    }
                    return (
                        <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id} 
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

export default withStyles(styles)(UserGroupsDisplay)