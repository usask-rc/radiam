import React from 'react';
import {
  CardContent,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid
} from '@material-ui/core';
import FileDetails from './FileDetails';
import FilePanelSummary from './FilePanelSummary';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  card: {
    marginBottom: '0.5em',
    marginLeft: '0.5em',
    marginRight: '1em',
  },
  expandedCard: {},
  content: {
    height: '2em',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  filename: {
    color: 'rgba(0, 0, 0, 0.95)',
  },
  item: {
    textAlign: 'left',
    /* https://stackoverflow.com/questions/1638223/is-there-a-way-to-word-wrap-long-words-in-a-div */
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    paddingLeft: '10px',
  },
  parentPath: {
    color: 'rgba(0, 0, 0, 0.50)',
  },
});

function getJsonKeys(json) {
  const keys = [];
  Object.keys(json).forEach(function (key) {
    keys.push(key);
  });
  return keys;
}

const ReducedExpansionPanelSummary = withStyles(() => ({
  root: {
    height: '50%',
    width: 'inherit',
  },
  expanded: {
    width: 'inherit',
  },
}))(ExpansionPanelSummary);

const ReducedExpansionPanel = withStyles(() => ({
  root: {
    height: '50%',
    width: 'inherit',
  },
  expanded: {
    height: '50%',
    width: 'inherit',
  },
}))(ExpansionPanel);

class FileSummary extends React.Component {
  state = { expanded: false };

  handleExpandClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  render() {
    const { classes, item, caller } = this.props;

    return (
      <ReducedExpansionPanel className={classes.card}>
        <ReducedExpansionPanelSummary className={classes.content}>
          <FilePanelSummary classes={classes} file={item} caller={caller} />
        </ReducedExpansionPanelSummary>
        <ExpansionPanelDetails>
          <CardContent>
            <Grid item className={classes.item} xs={10}>
              <FileDetails item={item} getJsonKeys={getJsonKeys} />
            </Grid>
          </CardContent>
        </ExpansionPanelDetails>
      </ReducedExpansionPanel>
    );
  }
}

FileSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  caller: PropTypes.string.isRequired,
};

export default withStyles(styles)(FileSummary);
