import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Collapse,
  Grid,
  Typography,
} from '@material-ui/core';
import { Redirect } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-admin';
import compose from 'recompose/compose';
import FileList from '../../_components/files/FileList';
import * as Constants from '../../_constants/index';
import FileSummaryNameDisplay from './FileSummaryNameDisplay';
import FileSummaryButton from './FileSummaryButton';

const styles = theme => ({
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
  image: {
    height: `${Constants.AVATAR_HEIGHT}`,
    margin: '-6px 6px 0px 0px',
    float: 'left',
  },
  main: {
    flex: '1',
    marginLeft: '1em',
  },
});

class RecentFilesSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      redirect: false,
      files: [],
    };
  }

  handleRedirect = () => {
    this.setState({ redirect: true });
  };

  //TODO: the filesummarybutton is too far to the left - i don't know the css that is causing this, but it requires a fix.
  render() {
    const { id, files, classes } = this.props;
    const { redirect } = this.state
    return (
      <React.Fragment>
        {files && files.length > 0 && (
          <Card>
            <CardContent>
              <Grid className={classes.summary} container direction="row" alignItems="center">
                <FileSummaryNameDisplay {...this.props} />
                <FileSummaryButton {...this.props} handleRedirect={this.handleRedirect} />
              </Grid>
              <Collapse in={true}>
                <CardContent>
                  {files && files.length > 0 ? (
                    <FileList data={files} />
                  ) : (
                      <Typography>No available project files.</Typography>
                    )}
                </CardContent>
              </Collapse>
            </CardContent>
          </Card>
        )}
        {redirect && (
          <Redirect
            to={{
              pathname: `/projects/${id}/show/files`,
              state: { sortType: Constants.model_fields.INDEXED_DATE },
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

RecentFilesSummary.propTypes = {
  translate: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

const enhance = compose(
  withStyles(styles),
  translate
);

export default enhance(RecentFilesSummary);
