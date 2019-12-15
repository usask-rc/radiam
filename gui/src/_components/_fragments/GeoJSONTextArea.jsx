import React, { Component } from 'react';
import {
  TextField,
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Grid,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';

const styles = {
  geoTextArea: {

  }
}

const GeoJSONTextArea = ({ classes, geoText, handleInput, mapTextToGeo }) => {
  return (
    <ExpansionPanel fullWidth>
      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
        <Typography>{`Geo Text Entry - Experimental`}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.geoTextArea}>
        <Grid container>
          <Grid item xs={12}>
            <TextField
              name="geoText"
              fullWidth
              label={'en.models.locations.geo'}
              value={geoText}
              placeholder="geoJSON"
              multiline={true}
              onChange={handleInput}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              name="mapTextToGeo"
              label={'en.models.locations.text_to_geo'}
              onClick={mapTextToGeo}
            >{`Convert geoJSON to Map`}</Button>
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles)(GeoJSONTextArea);
