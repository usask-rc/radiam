//RelatedGroups.jsx
import React, { useState, useEffect } from 'react';
import { Chip, Typography } from '@material-ui/core';
import * as Constants from "../_constants/index"
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
    
    container: {
        justifyContent: "left",
        flexWrap: "wrap",
    },
    roleContainer: {
        marginBottom: "1em",
        display: "flex",
        alignItems: "center",
    },
    roleText: {
        fontSize: "0.9em",
        marginRight: "1em",
    },

    chipDisplay: {
        justifyContent: 'left',
        flexWrap: 'wrap',
        marginRight: "1em",
    },
});


//TODO: refactor these chips to display `group admin` instead of `admin` and potentially change the labeling of `member`.
//if this is displaying in modal form, we want to redirect to go to open that page
//if this is NOT displaying in modal form, we want groups clicked on to display in a modal.
const RelatedGroups = ({ classes, groupMembers, inModal=false, setViewModal=null, ...props }) => {

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
                tempU.push(groupMember)
            }
        })
        setGroupAdmins(tempGA)
        setDataManagers(tempDM)
        setMembers(tempM)
        setUnknown(tempU)
    }, [groupMembers])

    console.log("RelatedGroups props: ", props, "inmodal: ", inModal)
    return (
        <div className={classes.container}>   
            {groupAdmins.length > 0 &&
                <div className={classes.roleContainer}>
                    <Typography className={classes.roleText}>{`${Constants.role_labels.ADMIN}:`}</Typography>
                    {groupAdmins.map(groupMember => {
                        return <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                        label={`${groupMember.group.name}`}
                        onClick={() => {
                        if (inModal === false){
                            setViewModal(groupMember)
                        }}}
                        clickable={inModal? false : true} />
                    })
                    }
                </div>
            }
            
            {dataManagers.length > 0 && 
                <div className={classes.roleContainer}>
                    <Typography className={classes.roleText}>{`${Constants.role_labels.DATA_MANAGER}:`}</Typography>
                    {dataManagers.map(groupMember => {
                        return <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                        label={`${groupMember.group.name}`}
                        onClick={() => {
                        if (inModal === false){
                        setViewModal(groupMember)
                        }}}
                        clickable={inModal? false : true} />
                    })
                    }
                </div>
            }

            {members.length > 0 && 
                <div className={classes.roleContainer}>
                    <Typography className={classes.roleText}>{`${Constants.role_labels.MEMBER}:`}</Typography>
                    {members.map(groupMember => {
                        return <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                        label={`${groupMember.group.name}`}
                        onClick={() => {
                        if (inModal === false){
                        setViewModal(groupMember)
                        }}}
                        clickable={inModal? false : true} />
                    })
                    }
                </div>
            }
            {unknown.length > 0 && 
                <div className={classes.roleContainer}>
                    <Typography className={classes.roleText}>{`${Constants.role_labels.UNKNOWN}:`}</Typography>
                    {unknown.map(groupMember => {
                        return <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                        label={`${groupMember.group.name}`}
                        onClick={() => {
                        if (inModal === false){
                        setViewModal(groupMember)
                        }}}
                        clickable={inModal? false : true} />
                    })
                    }
                </div>
            }   
        </div>)
}

export default withStyles(styles)(RelatedGroups)

/*

href={inModal ? null : `/#/${Constants.models.GROUPS}/${groupMember.group.id}/${Constants.resource_operations.SHOW}`} component="a" clickable/>

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
                        href={`/#/${Constants.models.GROUPS}/${groupMember.group.id}/${Constants.resource_operations.SHOW}`} component="a" clickable={inModal ? false : true}/>
                    )
                }
            else{
                return null
            }
            })
            }
*/