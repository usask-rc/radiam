import React, { useState } from 'react';
import {
  Datagrid,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextField,
  TextInput,
  translate,
} from 'react-admin';
import compose from "recompose/compose";
import * as Constants from '../_constants/index';
import CustomPagination from '../_components/CustomPagination';
import ProjectName from "../_components/_fields/ProjectName";
import {  Route } from "react-router"
import { withStyles } from '@material-ui/core/styles';
import { CardActions } from 'ra-ui-materialui/lib/layout';
import { CreateButton } from 'ra-ui-materialui/lib/button';

const listStyles = {
    actions: {
      backgroundColor: 'inherit',
    },
    header: {
      backgroundColor: 'inherit',
    },
    root: {
      backgroundColor: 'inherit',
    },
    /* https://stackoverflow.com/questions/55940218/preserving-line-breaks-with-react-admin-material-uis-textfields */
    showBreaks: {
      whiteSpace: "pre-wrap",
    },
  };
  
  const filterStyles = {
    form: {
      backgroundColor: 'inherit',
    },
  };
  
  //This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
  const DatasetFilter = withStyles(filterStyles)(({ classes, ...props }) => (
    <Filter classes={classes} {...props}>
      <ReferenceInput
        label={'en.models.datasets.project'}
        source={Constants.model_fk_fields.PROJECT}
        reference={Constants.models.PROJECTS}
      >
        <SelectInput optionText={Constants.model_fields.NAME} />
      </ReferenceInput>
      <TextInput
        label={'en.models.datasets.title'}
        source={Constants.model_fields.TITLE}
      />
      <TextInput
        label={'en.models.datasets.study_site'}
        source={Constants.model_fields.STUDY_SITE}
      />
    </Filter>
  ));

export const DatasetList = withStyles(listStyles)(({ classes, ...props }) => {
    
    return(
      <List
        {...props}
        classes={{
          root: classes.root,
          header: classes.header,
          actions: classes.actions,
        }}
        exporter={false}
        filters={<DatasetFilter />}
        sort={{ field: Constants.model_fields.TITLE, order: 'DESC' }}
        perPage={10}
        pagination={<CustomPagination />}
        
      >
        <Datagrid rowClick={Constants.resource_operations.SHOW}>
          <TextField
            label={'en.models.datasets.title'}
            source={Constants.model_fields.TITLE}
          />
          <ReferenceField
            linkType={false}
            label={"en.models.datasets.project"}
            source={Constants.model_fk_fields.PROJECT}
            reference={Constants.models.PROJECTS}
          >
            <ProjectName label={"en.models.projects.name"}/>
          </ReferenceField>
          <TextField
            label={'en.models.datasets.study_site'}
            source={Constants.model_fields.STUDY_SITE}
          />
        </Datagrid>
      </List>
  )
});