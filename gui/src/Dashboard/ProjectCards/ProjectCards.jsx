import React from 'react';
import { Grid } from '@material-ui/core';
import ProjectList from '../ProjectList/ProjectList';

const ProjectCards = ({ loading, projects }) => 
{
    return(
        <Grid
            direction="row"
            justify="flex-start"
            container
        >
            {!loading &&
                projects &&
                projects.length > 0 &&
                <ProjectList loading={loading} projects={projects} />
            }
        </Grid>
    )
}
export default ProjectCards