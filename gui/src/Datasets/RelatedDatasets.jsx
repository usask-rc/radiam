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
  newDatasetChipDisplay: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    backgroundColor: "beige",
  },
});

const RelatedDatasets = ({classes, record }) => {
    
  
    const [datasets, setDatasets] = useState([])
    let _isMounted = false
    useEffect(() => {
      _isMounted = true
      if (record){
        getRelatedDatasets(record)
        .then(data => {
          if (_isMounted){
          setDatasets(data)
          }
          return data
        })
        .catch(err => console.error(err))
      }

      //if we unmount, lock out the component from being able to use the state
      return function cleanup() {
        _isMounted = false;
      }
    }, [record])
  
    return(
      <div className={classes.relatedDSContainer}>
        {datasets && datasets.length > 0 && <Typography component="p" variant="body2">{`Related Datasets: `}</Typography> }
        <div className={classes.chipContainer}>
          {datasets && datasets.map(dataset => {
            return( //TODO: display number of files in each dataset in the chip
              <Chip className={classes.chipDisplay} variant="outlined" key={dataset.id}
              label={`${dataset.title}`}
              href={`/#/${Constants.models.DATASETS}/${dataset.id}/${Constants.resource_operations.SHOW}`} component="a" clickable />
            )
          })}
            <Link to={{pathname:`/${Constants.models.DATASETS}/Create`, project: record.id}}>
              <Chip label={`+ New Dataset`} className={classes.newDatasetChipDisplay} variant="outlined" key={"newDatasetChip"} clickable/>
            </Link>
        </div>
      </div>
    )
  }

export default withStyles(styles)(RelatedDatasets)