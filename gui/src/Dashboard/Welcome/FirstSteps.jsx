//FirstSteps.jsx
import React from "react";
import { CardContent, Card, Typography, Button } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import compose from "recompose/compose";
import { translate } from "react-admin";
import { withStyles } from "@material-ui/core/styles";
import * as Constants from "../../_constants/index"
import GroupAddIcon from "@material-ui/icons/GroupAdd"


const styles = {
    headlineTop: {
      backgroundColor: "#688db2",
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
    titleIcon: {
      marginRight: "8px",
      marginBottom: "-5px",
      height: "28px",
      width: "28px",
    },
    container: {
      width: "36em",
      margin: "1em",
      textAlign: "flex-start",
      minHeight: "12em",
    },
    button: {
      margin: '1em',
    }
  };
/*
`on the home dashboard, if the user is not a member of any groups:
Regular users / Mid Level - `you are not a member of any groups.  ask your group admin to add you to a group`
Group Admins: `you are not a member of any research groups.  Please add yourself to at least one group. (and create if no such group exists)


`next steps` afterwards?
*/
const FirstSteps = ({ classes, userType, translate }) => (
    <Card className={classes.container}>
      <CardContent>
        <Typography className={classes.headlineTop} variant="h5" component="h5">
          <GroupAddIcon className={classes.titleIcon} />
          {translate(`en.dashboard.first_steps.subtitle`)}
        </Typography>
        <Typography variant="body2" component="p">
          {translate(`en.dashboard.first_steps.${userType}.content`)}
        </Typography>
        <Button variant="contained" color="primary" href="/#/researchgroups/create" className={classes.button}>{`Create a Research Group`}</Button>
      </CardContent>
    </Card>
  );
  
  const enhance = compose(
    withStyles(styles),
    translate
  );
  
  export default enhance(FirstSteps);
  