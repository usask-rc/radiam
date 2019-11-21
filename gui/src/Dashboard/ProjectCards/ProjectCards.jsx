import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import ProjectCardDisplay from './ProjectCardDisplay';

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
                projects.map((project) => {
                    if (project.nbFiles > 0) {
                        return (
                            <ProjectCardDisplay key={project.id} project={project} />
                        );
                    }
                    return null
                })
                }
        </Grid>
    )
}
export default ProjectCards