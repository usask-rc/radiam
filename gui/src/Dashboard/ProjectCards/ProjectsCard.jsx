import React from 'react';
import { Grid, Typography, Link } from '@material-ui/core';
import ProjectList from '../ProjectList/ProjectList';
import { withStyles } from '@material-ui/styles';

const styles = () => ({
    container: {
        marginTop: "2em",
    },
    titleText: {

    },
    allProjects: {

    },
})

const ProjectsCard = ({classes, projects }) => 
{
    return(
        <div className={classes.container}>
            <Typography className={classes.titleText}
                variant={"h5"} 
                gutterBottom>
                    {`Recent Projects`}
            </Typography>
            <Grid
                justify="flex-start"
                container
            >
                
                {
                    projects &&
                    projects.length > 0 &&
                    <ProjectList projects={projects} />
                }
            </Grid>
        </div>

    )
}
export default withStyles(styles) (ProjectsCard)