import React from 'react';
import { Grid } from '@material-ui/core';
import ProjectCardDisplay from './ProjectCardDisplay';

const ProjectCards = ({ loading, projects }) => 
(
    <Grid
        direction="row"
        justify="flex-start"
        container
    >
        {!loading &&
            projects &&
            projects.map(project => {
                
                if (project.nbFiles > 0) {
                    return (
                        <ProjectCardDisplay key={project.id} project={project} />
                    );
                }
                return null
            })}
    </Grid>
)
export default ProjectCards