import React from 'react';
import { Chip, Typography } from '@material-ui/core';

//TODO: some text here needs to be moved to the constants file
const UserGroupsDisplay = ({ classes, researchgroups }) => {
    console.log("researchgroups sent to usergroupsdisplay is: ", researchgroups)
    return (
        <div className={classes.chipDisplay}>
            <Typography component={"h5"} variant={"h5"}>User Groups:</Typography>
            {researchgroups.map(researchgroup => {
                return (
                    <Chip className={classes.chip} variant="outlined" key={researchgroup.id} label={researchgroup.name} href={"/#/researchgroups/" + researchgroup.id + "/show"} component="a" clickable />)
            })}
        </div>)
}

export default UserGroupsDisplay