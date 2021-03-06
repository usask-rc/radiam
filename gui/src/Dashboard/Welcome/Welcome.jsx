//Welcome.jsx
import React from "react";
import { CardContent, Card, Typography } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import compose from "recompose/compose";
import { translate } from "react-admin";
import { withStyles } from "@material-ui/core/styles";
import {LINKS} from "../../_constants/index"
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
    verticalAlign: "middle",

  },
  cardContent: {
    height: "inherit",
    width: "inherit"
  },
  titleIcon: {
    marginRight: "8px",
    verticalAlign: "middle",
    height: "28px",
    width: "28px",
  },
  container: {
    textAlign: "flex-start",
    minHeight: "12em",
  },
};
const Welcome = ({ classes, translate }) => (
  <Card className={classes.container}>
    <CardContent className={classes.cardContent}>
      <Typography className={classes.headlineTop} variant="h5" component="h5">
        <HomeIcon className={classes.titleIcon} />
        {translate("en.dashboard.welcome.subtitle")}
      </Typography>
      <Typography variant="body2" component="p">
        {translate("en.dashboard.welcome.content")}
      </Typography><br/>
      <Typography variant={"body2"} component="p">
        {translate("en.dashboard.welcome.content2")}
        <a href={`..${LINKS.USERMANUALPATH}`} className={classes.link} target="_blank" rel="noopener noreferrer" >
          {translate("en.dashboard.welcome.usermanual")}
        </a>
      </Typography> 
    </CardContent>
  </Card>
);

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(Welcome);
