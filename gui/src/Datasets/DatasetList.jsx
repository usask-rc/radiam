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
import {RESOURCE_OPERATIONS, MODELS, MODEL_FK_FIELDS, MODEL_FIELDS} from "../_constants/index";
import CustomPagination from '../_components/CustomPagination';
import ProjectName from "../_components/_fields/ProjectName";
import { withStyles } from '@material-ui/core/styles';
import Search from '@material-ui/icons/Search';
import DatasetListTitle from './DatasetListTitle';

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
    columnHeaders: {
      fontWeight: "bold",
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
        source={MODEL_FK_FIELDS.PROJECT}
        reference={MODELS.PROJECTS}
        alwaysOn
      >
        <SelectInput optionText={MODEL_FIELDS.NAME} />
      </ReferenceInput>
    </Filter>
  ));

export const DatasetList = withStyles(listStyles)(({ classes, ...props }) => {
    
    return(
      <List
        {...props}
        classes={{
          root: classes.root,
          actions: classes.actions,
        }}
        exporter={false}
        filters={<DatasetFilter />}
        sort={{ field: MODEL_FIELDS.TITLE, order: 'DESC' }}
        perPage={10}
        pagination={<CustomPagination />}
        bulkActionButtons={false}
      >
        <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW} classes={{headerCell: classes.columnHeaders}}>
          <DatasetListTitle
            label={'en.models.datasets.title'}
            source={MODEL_FIELDS.TITLE}
            classes={classes}
          />
          <ReferenceField
            link={false}
            label={"en.models.datasets.project"}
            source={MODEL_FK_FIELDS.PROJECT}
            reference={MODELS.PROJECTS}
          >
            <ProjectName label={"en.models.projects.name"}/>
          </ReferenceField>
          <TextField
            label={'en.models.datasets.study_site'}
            source={MODEL_FIELDS.STUDY_SITE}
          />
        </Datagrid>
      </List>
  )
});