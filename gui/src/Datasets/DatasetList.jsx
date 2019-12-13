//DatasetList.jsx
import React from 'react';
import {
  Datagrid,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextField,
  TextInput,
} from 'react-admin';
import * as Constants from '../_constants/index';
import CustomPagination from '../_components/CustomPagination';
import ProjectName from "../_components/_fields/ProjectName";
import { withStyles } from '@material-ui/core/styles';

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
      <TextInput
        label={"en.models.filters.search"}
        source="search"
        alwaysOn
      />
      <ReferenceInput
        label={'en.models.datasets.project'}
        source={Constants.model_fk_fields.PROJECT}
        reference={Constants.models.PROJECTS}
        alwaysOn
      >
        <SelectInput optionText={Constants.model_fields.NAME} />
      </ReferenceInput>
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
        bulkActionButtons={false}
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