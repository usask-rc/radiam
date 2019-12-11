import React, { useState, useEffect } from 'react';

import * as Constants from '../_constants/index';
import '../_components/components.css';
import { Chip, Typography } from '@material-ui/core';
import { getRelatedDatasets } from '../_tools/funcs';
import { Link } from  "react-router-dom";
import { withStyles } from '@material-ui/styles';
import { Edit } from '@material-ui/icons';

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
            return( //TODO: display number of files in each dataset in the chip
              <Chip className={classes.chipDisplay} variant="outlined" key={dataset.id}
              label={`${dataset.title}`}
              clickable={inModal ? false : true}
              onDelete={canEditModal && setEditModal && !inModal ? () => {
                
                //NOTE: the array selection fields require a specific formatting to display properly.  This translation satisfies that formatting
                const cpDataset = dataset
                const dcmList = []
                const slList = []

                dataset.data_collection_method.map(item => {
                  dcmList.push(item.id)
                })
                dataset.sensitivity_level.map(item => {
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
            )
          })}
          {canEditModal && setCreateModal && 
            <Chip label={`+ Add Dataset`} className={classes.newDatasetChipDisplay} variant="outlined" key={"newUserChip"} clickable onClick={() => setCreateModal(true)}/>
          }
        </div>
      </div>
    )
  }

export default withStyles(styles)(RelatedDatasets)

/*
href={`/#/${Constants.models.DATASETS}/${dataset.id}/${Constants.resource_operations.SHOW}`} component="a" 

<Typography className={classes.groupRoleText}>{`Group Admins:`}</Typography>
              {groupAdmins.map(groupMember => {
                return(
                  <Chip className={classes.chipDisplay} variant="outlined" key={groupMember.id} avatar={
                      <UserAvatar size={"24"} name={`${groupMember.user.first_name} ${groupMember.user.last_name}`}/>
                  }
                  label={`${groupMember.user.username}`}
                  clickable={inModal ? false : true}
                  onDelete={setEditModal && !inModal ? () => setEditModal(groupMember) : null}
                  onClick={() => {if (!inModal) {
                    setViewModal(groupMember)
                  }}}
                  deleteIcon={<Edit />}

                  />
                )
              })}
            </div>
*/