import React from 'react';
import { Grid, Chip } from '@material-ui/core';

const ProjectKeywords = ({classes, project} ) => (
    <Grid className={classes.chipContainer} container>
          {project.keywords && project.keywords.split(",").map(keyword => (
            <Chip item label={keyword} className={classes.chipItem} />
          ))}
        </Grid>

)
export default ProjectKeywords