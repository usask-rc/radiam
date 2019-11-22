import React from 'react';
import * as Constants from '../../_constants/index';
import { formatBytes } from '../../_tools/funcs';
import { Grid, Typography } from '@material-ui/core';
import { LocationShow } from '../_fields/LocationShow';
import moment from 'moment';
import ReferenceField from 'ra-ui-materialui/lib/field/ReferenceField';
import { Folder, Description } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';

const styles = {
  folderIcon: {
    marginRight: '0.25em',
  },
  item: {
    textAlign: 'left',
    /* https://stackoverflow.com/questions/1638223/is-there-a-way-to-word-wrap-long-words-in-a-div */
    wordBreak: 'break-all',
    wordWrap: 'break-word',
  },
  fileDisplay: {
    display: "flex",
    flexDirection: "row",
  },
  parentPath: {
    color: 'rgba(0, 0, 0, 0.50)',
  },
}

const FilePanelSummary = ({ classes, file, caller }) => (
  <Grid container direction="row" alignItems="center">
    <Grid item className={classes.item} xs={5} md={4}>
      <Typography className={classes.fileDisplay}>
        <Description className={classes.folderIcon}/>
        {`${file.name}`}
      </Typography>
    </Grid>
    <Grid item className={classes.item} xs={2} md={2}>
      {file.filesize > 0 ? formatBytes(file.filesize, 2) : ''}
    </Grid>
    <Grid item className={classes.item} xs={2} md={3}>
      {caller !== 'browser' && (
        <ReferenceField
          label={'en.models.agents.location'}
          source={Constants.model_fk_fields.LOCATION}
          reference={Constants.models.LOCATIONS}
          linkType={Constants.resource_operations.SHOW}
          basePath={`/${Constants.models.PROJECTS}`}
          resource={Constants.models.PROJECTS}
          record={file}
        >
          <LocationShow />
        </ReferenceField>
      )}
    </Grid>
    <Grid item className={classes.item} xs={2} md={3}>
      {`${moment().diff(
        moment(file.indexed_date).toISOString(),
        'days'
      )} days ago`}
    </Grid>
  </Grid>
)
export default withStyles(styles)(FilePanelSummary)