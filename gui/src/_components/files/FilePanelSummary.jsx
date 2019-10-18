import React from 'react';
import * as Constants from '../../_constants/index';
import { formatBytes } from '../../_tools/funcs';
import { Grid } from '@material-ui/core';
import { LocationShow } from '../_fields/LocationShow';
import moment from 'moment';
import ReferenceField from 'ra-ui-materialui/lib/field/ReferenceField';


const FilePanelSummary = ({ classes, file, caller }) => (
  <Grid container direction="row" alignItems="center">
    <Grid item className={classes.item} xs={5} md={4}>
      <span className={classes.parentPath}>{file.name}</span>
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
export default FilePanelSummary