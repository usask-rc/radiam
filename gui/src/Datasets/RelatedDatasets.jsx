import React, { useState, useEffect } from 'react';

import * as Constants from '../_constants/index';
import '../_components/components.css';
import { Chip, Typography } from '@material-ui/core';
import { getRelatedDatasets } from '../_tools/funcs';
import { Link } from  "react-router-dom";
import { withStyles } from '@material-ui/styles';

const styles = theme => ({
  chipDisplay: {
      marginRight: "1em",
  },
  chipContainer: {
    display: "flex",
    justifyContent: "left",
    flexWrap: "wrap",
  },
  relatedDSContainer: {
    marginTop: "1em",
  },
  newDatasetChipDisplay: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    backgroundColor: "beige",
  },
});

const RelatedDatasets = ({classes, setShowModal, projectDatasets}) => {

    return(
      <div className={classes.relatedDSContainer}>
        <div className={classes.chipContainer}>
          {projectDatasets && projectDatasets.map(dataset => {
            return( //TODO: display number of files in each dataset in the chip
              <Chip className={classes.chipDisplay} variant="outlined" key={dataset.id}
              label={`${dataset.title}`}
              href={`/#/${Constants.models.DATASETS}/${dataset.id}/${Constants.resource_operations.SHOW}`} component="a" clickable />
            )
          })}
          {setShowModal && 
              <Chip label={`+ Add Dataset`} className={classes.newDatasetChipDisplay} variant="outlined" key={"newUserChip"} clickable onClick={() => setShowModal(true)}/>
             }
            
        </div>
      </div>
    )
  }

export default withStyles(styles)(RelatedDatasets)

/*
<Link to={{pathname:`/${Constants.models.DATASETS}/Create`, project: record.id}}>
              <Chip label={`+ New Dataset`} className={classes.newDatasetChipDisplay} variant="outlined" key={"newDatasetChip"} clickable/>
            </Link>
*/