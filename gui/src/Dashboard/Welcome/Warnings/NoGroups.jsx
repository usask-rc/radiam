//NoGroups.jsx
import React from "react";
import { withStyles } from "@material-ui/styles";
import { Grid, Typography, Card, CardContent } from "@material-ui/core";
import { classes } from "istanbul-lib-coverage";

const styles = () => ({
    headlineTop: {
        backgroundColor: "#c4bb76",
        color: "white",
        marginLeft: "-24px",
        marginRight: "-24px",
        marginTop: "-16px !important;",
        marginBottom: "16px",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
    },
    cardDetails: {
        textAlign: "left",
    },
    container: {
    },
    
})

const NoGroups = ({classes, ...props}) => {
    return(
        <Card className={classes.container}>
             <CardContent>
                <Typography className={classes.headlineTop} component={"h5"} variant={"h5"}>
                    {`No Group Memberships`}
                </Typography>
                <Typography className={classes.cardDetails} variant="body2" component="p">
                    {`You are not yet in any groups.  Please contact a Group Administrator or superuser and request to be added to a Research Group.`}
                </Typography>
             </CardContent>
        </Card>
    )
}

export default withStyles(styles)(NoGroups)