import React from 'react';
import '../_components/components.css';
import Chip from "@material-ui/core/Chip";
import { withStyles } from '@material-ui/styles';
import Edit from '@material-ui/icons/Edit';
import { truncatePath } from '../_tools/funcs';
import { Tooltip } from '@material-ui/core';

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

const RelatedDatasets = ({classes, setCreateModal, projectDatasets, inModal=false, setEditModal, setViewModal, canEditModal, ...props}) => {

    return(
      <div className={classes.relatedDSContainer}>
        <div className={classes.chipContainer}>
          {projectDatasets && projectDatasets.map(dataset => {

            //truncate unreasonably long dataset names - these will usually be caused by auto creation via browse
            let displayTitle = truncatePath(dataset.title)

            //console.log("displayTitle is: ", displayTitle)
            
            return( //TODO: display number of files in each dataset in the chip
              <Tooltip title={dataset.title}>
                <Chip className={classes.chipDisplay} variant="outlined" key={dataset.id}
                  label={`${displayTitle}`}
                  clickable={inModal ? false : true}
                  on
                  onDelete={canEditModal && setEditModal && !inModal ? () => {
                    
                    //NOTE: the array selection fields require a specific formatting to display properly.  This translation satisfies that formatting
                    const cpDataset = dataset
                    const dcmList = []
                    const slList = []

                    dataset.data_collection_method.forEach(item => {
                      dcmList.push(item.id)
                    })
                    dataset.sensitivity_level.forEach(item => {
                      slList.push(item.id)
                    })

                    cpDataset.data_collection_method = dcmList
                    cpDataset.sensitivity_level = slList
                    setEditModal(cpDataset)
                  } : null}
                
                onClick={() => {
                  if (!inModal) {
                    setViewModal(dataset)
                  }
                }}
                deleteIcon={<Edit />}  />
              </Tooltip>
            )
          })}
          {canEditModal && setCreateModal && 
            <Chip label={`+ Add Dataset`} className={classes.newDatasetChipDisplay} variant="outlined" key={"newDatasetChip"} clickable onClick={() => setCreateModal(true)}/>
          }
        </div>
      </div>
    )
  }

export default withStyles(styles)(RelatedDatasets)
