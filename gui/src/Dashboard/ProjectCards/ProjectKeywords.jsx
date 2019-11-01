//ProjectKeywords.jsx
import React from 'react';
import { Grid, Chip } from '@material-ui/core';

const ProjectKeywords = ({classes, project} ) => (
    <Grid className={classes.chipContainer} container>
      <Grid item xs={12}>
      {project.keywords && project.keywords.split(",").map(keyword => (
        <Chip key={keyword} label={keyword} className={classes.chipItem} />
      ))}
      </Grid>
    </Grid>

)
export default ProjectKeywords