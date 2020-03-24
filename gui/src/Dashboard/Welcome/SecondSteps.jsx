//SecondSteps.jsx
import React from "react";
import { CardContent, Card, Typography, Button } from "@material-ui/core";
import compose from "recompose/compose";
import { translate } from "react-admin";
import { withStyles } from "@material-ui/core/styles";
import PersonAdd from "@material-ui/icons/PersonAdd";

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

const SecondSteps = ({ classes, userType, translate }) => {

    return(
      <Card className={classes.container}>
        <CardContent>
          <Typography className={classes.headlineTop} variant="h5" component="h5">
            <PersonAdd className={classes.titleIcon} />
            {translate(`en.dashboard.first_steps.subtitle`)}
          </Typography>
          <Typography variant="body2" component="p">
            {translate(`en.dashboard.first_steps.${userType}.content`)}
          </Typography>
          <Button variant="contained" color="primary" href="/#/researchgroups/create" className={classes.button}>{`Create a Research Group`}</Button>
        </CardContent>
      </Card>
    )};
    
    const enhance = compose(
      withStyles(styles),
      translate
    );
    
    export default enhance(SecondSteps);
    