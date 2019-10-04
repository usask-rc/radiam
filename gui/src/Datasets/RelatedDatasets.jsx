import React, { useState, useEffect } from 'react';

import * as Constants from '../_constants/index';
import '../_components/components.css';
import { GET_LIST } from 'ra-core';
import { radiamRestProvider, getAPIEndpoint, httpClient } from '../_tools';
import { Chip, Typography } from '@material-ui/core';

const RelatedDatasets = ({ projectID }) => {
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
      const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
      dataProvider(GET_LIST, Constants.models.DATASETS, {filter: { project: projectID, is_active: true}, pagination: {page:1, perPage: 1000}, sort: {field: Constants.model_fields.TITLE, order: "DESC"}}).then(response => response.data)
      .then(assocDatasets => {
        setDatasets(assocDatasets)
      })
    }, [])
  
    return(
      <div className={styles.relatedDSContainer}>
      {datasets && <Typography component="p" variant="p">{`Related Datasets: `}</Typography>}
      {datasets && datasets.map(dataset => {
        return( //TODO: display number of files in each dataset in the chip
          <Chip className={styles.chipDisplay} variant="outlined" key={dataset.id}
          label={`${dataset.title}`}
          href={`/#/${Constants.models.DATASETS}/${dataset.id}/${Constants.resource_operations.SHOW}`} component="a" clickable />
  
        )
      })}
      </div>
    )
  }

export default RelatedDatasets