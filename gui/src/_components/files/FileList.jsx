import React from 'react';
import compose from 'recompose/compose';
import { Divider, Grid } from '@material-ui/core';
import FileSummary from './FileSummary';
import { translate } from 'react-admin';
import withStyles from '@material-ui/core/styles/withStyles';
import FileListColumnHeaders from './FileListColumnHeaders';

const styles = theme => ({
  title: {
    fontSize: 16,
    fontDecoration: 'bold',
  },
  value: {
    padding: '0 16px',
    minHeight: 48,
    textAlign: 'right',
  },
  listItemText: {
    paddingRight: 0,
  },
  heading: {
    textAlign: 'left',
    color: 'rgba(0, 0, 0, 0.54)',
  },
  details: {
    flexDirection: 'column',
    textAlign: 'left',
  },
  row: {
    padding: '10px',
  },
  fileListing: {
    marginBottom: '1em',
  },
});

const FileList = ({ classes, translate, data }) => (
  <Grid
    container
    className={classes.fileListing}
    spacing={1}
    direction="row"
    alignItems="flex-start"
  >
    <FileListColumnHeaders classes={classes} translate={translate} />
    <Divider />
    {data &&
      data.map(item => (
        <FileSummary caller={`list`} item={item} key={item.id} />
      ))}
  </Grid>
);
const enhance = compose(
  translate,
  withStyles(styles)
);

export default enhance(FileList);
