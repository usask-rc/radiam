import React from 'react';
import { CardContent, Card, Typography } from '@material-ui/core';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import compose from 'recompose/compose';
import { translate } from 'react-admin';
import { withStyles } from '@material-ui/core/styles';
const styles = {
  headlineTop: {
    backgroundColor: '#688db2',
    color: 'white',
    marginLeft: '-24px',
    marginRight: '-24px',
    marginTop: '-16px !important;',
    marginBottom: '16px',
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  titleIcon: {
    marginRight: '8px',
    marginBottom: '-5px',
    height: "30px",
    width: "30px",
  },
  container: {
    width: '40em',
    margin: '1em',
    textAlign: 'flex-start',
    minHeight: "12em",
  },
};
const AgentInstall = ({ classes, translate }) => (
  <Card className={classes.container}>
    <CardContent>
      <Typography className={classes.headlineTop} variant="h5" component="h5">
        <AddToQueueIcon className={classes.titleIcon} />
        {translate('en.dashboard.agent.subtitle')}
      </Typography>
      <Typography variant="body2" component="p">
        {translate('en.dashboard.agent.description')}
      </Typography>
      <Typography variant="body2" component="p">
        {translate('en.dashboard.agent.available_at')}
        <a
          target="radiamagentinstall"
          href="https://github.com/usask-rc/radiam-agent-releases"
        >
          {translate('en.dashboard.agent.link_text')}
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
