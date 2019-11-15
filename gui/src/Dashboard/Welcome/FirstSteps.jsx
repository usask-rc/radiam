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

TODO: create an itemized list of helper steps.

```
(Admin)
1. Create Group(s) (Completed)
2. Create Users.
3. Assign Users to associated group(s)
4. Create a Location from which to assign a Crawler.
5. Create a Project with which to Crawl to.
  a. This in turn creates an associated Dataset.
6. Crawl data to the associated Project.
```
(Group Admin)
For GA and DM, in order to have this user role, they must already be assigned to some group.
Therefore the warnings should only be `the group you are in has no users / no data managers other than yourself` or `project has no files` or `project does not exist` sort of thing.

1. Create Group(s) (Completed) 
2. Create Users.
3. Assign Users to associated group(s)
4. Create a Location from which to assign a Crawler.
5. Create a Project with which to Crawl to.
  a. This in turn creates an associated Dataset.
6. Crawl data to the associated Project.

For GA and DM, in order to have this user role, they must already be assigned to some group.
Therefore the warnings should only be `the group you are in has no users / no data managers other than yourself` or `project has no files` or `project does not exist` sort of thing.


(Data Manager)
(review what permissions a DM should have)
1.
2.
3.
4.
5.
6.

(User)
1. n/a
2. n/a
3. `You are not in a group, ask your supervisor`
4. n/a
5. `You have no Project / Project View access.  request this from a supervisor`
6. n/a


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
  
