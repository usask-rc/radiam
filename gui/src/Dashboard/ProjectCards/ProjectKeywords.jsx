//ProjectKeywords.jsx
import React, { useState } from 'react';
import { Grid, Chip } from '@material-ui/core';

const ProjectKeywords = ({classes, project} ) => {
  const [numKeywords, setNumKeywords] = useState(4)

  return(
    <Grid className={classes.chipContainer} container>
      <Grid item xs={12}>
        {project.keywords && project.keywords.split(",").map((keyword, idx) => {
            if (idx < numKeywords){
              return(
                <Chip key={idx} label={keyword} className={classes.chipItem} />
              )
            }
            else if (idx === numKeywords){
              return(
                <Chip key={idx} label={"...More"} className={classes.moreChips} onClick={() => setNumKeywords(project.keywords.length)} />
              )
            }
            else{
              return null
            }
          }
        )}
      </Grid>
    </Grid>

)}
export default ProjectKeywords