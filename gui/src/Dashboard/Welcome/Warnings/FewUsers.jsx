//FewUsers.jsx
import React from "react";
import { CardContent, Card, Typography, Chip } from "@material-ui/core";
import { Link } from  "react-router-dom";
import compose from "recompose/compose";
import { translate } from "react-admin";
import { withStyles } from "@material-ui/core/styles";
import {MODELS} from "../../../_constants/index"
import GroupAddIcon from "@material-ui/icons/GroupAdd"


const styles = {
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
    titleIcon: {
      marginRight: "8px",
      marginBottom: "-5px",
      height: "28px",
      width: "28px",
    },
    card: {
      minHeight: "11em",
      minWidth: "15em",
    },
    container: {
      textAlign: "flex-start",
      marginRight: "1em",
    },
    groupDetails: {
      textAlign: "left",
      marginTop: "8px",
    },
    button: {
      margin: '1em',
    },
    addUserChipDisplay: {
      marginLeft: "1em",
      backgroundColor: "beige",
    },
    groupDisplay: {
      textAlign: "right",

      alignItems: "flex-end",
    }
  };
  
const FewUsers = ({ classes, userManagedGroups, translate }) => {
  
  const groupList = userManagedGroups.filter(group => group.users.length <= 3)

  if (groupList.length > 0){
    return(
        <Card className={classes.container}>
          <CardContent>

            <Typography className={classes.headlineTop} variant="h5" component="h5">
              <GroupAddIcon className={classes.titleIcon} />
              {translate(`en.dashboard.fewUsers.subtitle`)}
            </Typography>
            <Typography className={classes.groupDetails} variant="body2" component="p">
              {translate(`en.dashboard.fewUsers.content`)}
            </Typography>

            {groupList && groupList.map(group => {
              return(
                <div className={classes.groupDisplay}>
                  <Typography key={group.id} className={classes.groupDetails} variant="body2" component="p">
                    {`${group.name} : ${group.users.length} users`}
                    <Link to={{pathname: `/${MODELS.GROUPMEMBERS}/Create`, group: group.id}}>
                      <Chip label={`+ Add User`} className={classes.addUserChipDisplay} variant="outlined" key={`${group.id}_adduser`} clickable />
                    </Link>
                  </Typography>
                </div>
              )
            })}
          </CardContent>
        </Card>
    )
  }
  else{
    return null;
  }
};  

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(FewUsers);
  