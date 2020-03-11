import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import RelatedUsersList from './UserList/RelatedUsersList';
import { withStyles } from '@material-ui/styles';

const styles = () => ({
    container: {
        marginTop: "2em",
    },
    titleText: {

    }
})

const RelatedUsersDisplay = ({ classes, relatedUsers }) => 
{
    const relatedUsersList = Object.keys(relatedUsers).map(key => {
        return relatedUsers[key]
    })
    return(
        <div className={classes.container}>
            <Typography className={classes.titleText}
            variant={"h5"} 
            gutterBottom>
                {`Collaborators in your Groups`}
            </Typography>
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
        </div>

    )
}
export default withStyles(styles)(RelatedUsersDisplay)