import React from 'react';
import { Grid } from '@material-ui/core';
import RelatedUsersList from './UserList/RelatedUsersList';

const UserCards = ({ relatedUsers }) => 
{
    const relatedUsersList = Object.keys(relatedUsers).map(key => {
        return relatedUsers[key]
    })
    return(
        <Grid
            direction="row"
            justify="flex-start"
            container
        >
            {
                relatedUsersList &&
                relatedUsersList.length > 0 &&
                <RelatedUsersList relatedUsers={relatedUsersList} />
            }
        </Grid>
    )
}
export default UserCards