import React from "react";
import { CardContent, Card, Typography } from "@material-ui/core";
import AddToQueueIcon from "@material-ui/icons/AddToQueue";
import compose from "recompose/compose";
import { translate } from "react-admin";
import { withStyles } from "@material-ui/core/styles";
import * as Constants from "../../_constants/index"
const styles = {
  headlineTop: {
    backgroundColor: "#688db2",
    color: "white",
    marginTop: "-16px !important;",
    marginLeft: "-1em",
    paddingLeft: "1em",
    marginBottom: "16px",
    paddingTop: "16px",
    paddingBottom: "16px",
    verticalAlign: "middle",
  },
  cardContent: {
    marginRight: "-2em",
  },
  titleIcon: {
    marginRight: "8px",
    height: "28px",
    width: "28px",
    verticalAlign: "middle",
  },
  container: {
    textAlign: "flex-start",
    minHeight: "12em",
    verticalAlign: "middle",
    marginLeft: "2em",

  },
};
const AgentInstall = ({ classes, translate }) => (
  <Card className={classes.container}>
    <CardContent className={classes.cardContent}>
      <Typography className={classes.headlineTop} variant="h5" component="h5">
        <AddToQueueIcon className={classes.titleIcon} />
        {translate("en.dashboard.agent.subtitle")}
      </Typography>


      <Typography className={classes.body} variant="body2" component="p">
        {translate("en.dashboard.agent.description")}
      </Typography><br/>


      <Typography className={classes.body} variant="body2" component="p">
        {translate("en.dashboard.agent.available_at")}

        

        <a href="https://github.com/usask-rc/radiam-agent-releases" className={classes.link} target="_blank">
          {translate("en.dashboard.agent.link_text")}
        </a>
      </Typography>
    </CardContent>
  </Card>
);

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(AgentInstall);
