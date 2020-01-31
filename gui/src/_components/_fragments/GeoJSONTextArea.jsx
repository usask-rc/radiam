import React, { Component } from 'react';
import TextField from "@material-ui/core/TextField"
import Button from from "@material-ui/core/Button"
import ExpansionPanel from "@material-ui/core/ExpansionPanel"
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary"
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"
import ExpandMore from "@material-ui/icons/ExpandMore"
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
