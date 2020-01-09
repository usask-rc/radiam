import React from 'react';
import {MODEL_FK_FIELDS, MODELS, RESOURCE_OPERATIONS} from '../../_constants/index';
import { formatBytes } from '../../_tools/funcs';
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { LocationShow } from '../_fields/LocationShow';
import moment from 'moment';
import ReferenceField from 'ra-ui-materialui/lib/field/ReferenceField';
import Description from "@material-ui/icons/Description"
import FolderOpen from "@material-ui/icons/FolderOpen"
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

//TODO: get count of both folders and files and display both counts.

const FilePanelSummary = ({ classes, file, caller }) => (
  <Grid container direction="row" alignItems="center">
    <Grid item className={classes.item} xs={5} md={4}>
      <Typography className={classes.fileDisplay}>
        {file.type === "file" ? <Description className={classes.folderIcon}/>
        : <FolderOpen className={classes.folderIcon} /> }
        {`${file.name}`}
      </Typography>
    </Grid>
    <Grid item className={classes.item} xs={2} md={2}>
      {file.filesize && formatBytes(file.filesize, 2)}
    </Grid>
    <Grid item className={classes.item} xs={2} md={3}>
      {caller !== 'browser' && (
        <ReferenceField
          label={'en.models.agents.location'}
          source={MODEL_FK_FIELDS.LOCATION}
          reference={MODELS.LOCATIONS}
          linkType={RESOURCE_OPERATIONS.SHOW}
          basePath={`/${MODELS.PROJECTS}`}
          resource={MODELS.PROJECTS}
          record={file}
        >
          <LocationShow />
        </ReferenceField>
      )}
    </Grid>
    <Grid item className={classes.item} xs={2} md={3}>
      {`Indexed ${moment().diff(
        moment(file.indexed_date).toISOString(),
        'days'
      )} days ago`}
    </Grid>
  </Grid>
)
export default withStyles(styles)(FilePanelSummary)