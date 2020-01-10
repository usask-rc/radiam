import React from 'react';
import { Grid } from '@material-ui/core';
import ProjectList from '../ProjectList/ProjectList';

const ProjectCards = ({ projects }) => 
{
    return(
        <Grid
            direction="row"
            justify="flex-start"
            container
        >
            {
                projects &&
                projects.length > 0 &&
                <ProjectList projects={projects} />
            }
        </Grid>
    )
}
export default ProjectCards