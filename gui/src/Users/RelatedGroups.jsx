//RelatedGroups.jsx
import React, { useState, useEffect } from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import {ROLE_GROUP_ADMIN, ROLE_DATA_MANAGER, ROLE_MEMBER} from "../_constants/index";
import { withStyles } from '@material-ui/styles';
import { Redirect } from "react-router-dom"

const styles = theme => ({
    
    container: {
        justifyContent: "left",
        display: "flex",
    },
    roleContainer: {
        float: "left",
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


const RelatedGroups = ({ classes, groupMembers, inModal=false, setViewModal=null, ...props }) => {

    const [groupAdmins, setGroupAdmins] = useState([])
    const [dataManagers, setDataManagers] = useState([])
    const [members, setMembers] = useState([])
    const [unknown, setUnknown] = useState([])
    const [redirect, setRedirect] = useState(false)
  
    useEffect(() => {
        let tempGA = []
        let tempDM = []
        let tempM = []
        let tempU = []
        //sort groupmembers into different categories
        groupMembers.forEach(groupMember => {
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
        setGroupAdmins(tempGA)
        setDataManagers(tempDM)
        setMembers(tempM)
        setUnknown(tempU)
    }, [groupMembers])

    //console.log("RelatedGroups props: ", props, "inmodal: ", inModal)
    return (
        <div className={classes.container}>   
            {groupAdmins.length > 0 &&
                <div className={classes.roleContainer}>
                    {groupAdmins.map(groupMember => {
                        return <Tooltip title="Group Admin">
                            <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                            label={`${groupMember.group.name}`}
                            onClick={() => {
                            if (inModal === false){
                                return setRedirect(groupMember.group.id)

                            }}}
                            clickable={inModal? false : true} />
                        </Tooltip>
                    })
                    }
                </div>
            }
            
            {dataManagers.length > 0 && 
                <div className={classes.roleContainer}>
                    {dataManagers.map(groupMember => {
                        return <Tooltip title="Data Manager">
                            <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                            label={`${groupMember.group.name}`}
                            onClick={() => {
                            if (inModal === false){
                                return setRedirect(groupMember.group.id)

                            }}}
                            clickable={inModal? false : true} />
                        </Tooltip>
                    })
                    }
                </div>
            }

            {members.length > 0 && 
                <div className={classes.roleContainer}>
                    {members.map(groupMember => {
                        return <Tooltip title="Member">
                            <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                            label={`${groupMember.group.name}`}
                            onClick={() => {
                            if (inModal === false){
                                return setRedirect(groupMember.group.id)

                            }}}
                            clickable={inModal? false : true} />
                        </Tooltip>
                    })
                    }
                </div>
            }
            {unknown.length > 0 && 
                <div className={classes.roleContainer}>
                    {unknown.map(groupMember => {
                        return <Tooltip title="Other">
                            <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.group.id}
                            label={`${groupMember.group.name}`}
                            onClick={() => {
                            if (inModal === false){
                                return setRedirect(groupMember.group.id)

                            }}}
                            clickable={inModal? false : true} />
                        </Tooltip>
                    })
                    }
                </div>
            }
            {redirect && <Redirect
                to={{
                    pathname: `/researchgroups/${redirect}/show`,
                }}
            />}
        </div>)
}

export default withStyles(styles)(RelatedGroups)