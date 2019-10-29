import React, { useState, useEffect } from 'react';

import * as Constants from '../_constants/index';
import '../_components/components.css';
import { Chip, Typography } from '@material-ui/core';
import { getRelatedDatasets } from '../_tools/funcs';
import { Link } from  "react-router-dom";


const RelatedDatasets = ({ record }) => {
    const styles = theme => ({
        chipDisplay: {
            display: 'flex',
            justifyContent: 'left',
            flexWrap: 'wrap',

        },
        relatedDSContainer: {
            marginLeft: '1em'
        }
    });
  
    const [datasets, setDatasets] = useState([])
  
    useEffect(() => {
      if (record){
        getRelatedDatasets(setDatasets, record)
      }
    }, [record])
  
    return(
      <div className={styles.relatedDSContainer}>
      {datasets && datasets.length > 0 && <Typography component="p" variant="p">{`Related Datasets: `}</Typography> }
      {datasets && datasets.map(dataset => {
        return( //TODO: display number of files in each dataset in the chip
          <Chip className={styles.chipDisplay} variant="outlined" key={dataset.id}
          label={`${dataset.title}`}
          href={`/#/${Constants.models.DATASETS}/${dataset.id}/${Constants.resource_operations.SHOW}`} component="a" clickable />
        )
      })}
        <Link to={{pathname:`/${Constants.models.DATASETS}/Create`, project: record.id}}>
          <Chip label={`+ New Dataset`} className={styles.chipDisplay} variant="outlined" key={"newDatasetChip"} clickable/>
        </Link>
      </div>
    )
  }

export default RelatedDatasets