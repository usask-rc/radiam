//Locations.jsx
import React from 'react';
import {
  Create,
  Datagrid,
  Edit,
  Filter,
  Labeled,
  List,
  ReferenceField,
  ReferenceInput,
  Show,
  SimpleShowLayout,
  TextField,
  TextInput,
} from 'react-admin';
import * as Constants from '../_constants/index';
import CustomPagination from '../_components/CustomPagination';
import LocationForm from './LocationForm';
import MapView from '../_components/_fragments/MapView';
import TranslationField from '../_components/_fields/TranslationField';
import TranslationSelect from '../_components/_fields/TranslationSelect';
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

const showStyles = {
  path: {
    /* https://stackoverflow.com/questions/1638223/is-there-a-way-to-word-wrap-long-words-in-a-div */
    wordBreak: "break-all",
    wordWrap: "break-word",
  },
  /* https://stackoverflow.com/questions/55940218/preserving-line-breaks-with-react-admin-material-uis-textfields */
  showBreaks: {
    whiteSpace: "pre-wrap",
  },
};

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const LocationFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <ReferenceInput
      label={'en.models.locations.type'}
      source={Constants.model_fk_fields.LOCATION_TYPE}
      reference={Constants.models.LOCATIONTYPES}
    >
      <TranslationSelect optionText={Constants.model_fields.LABEL} />
    </ReferenceInput>
    <TextInput
      label={'en.models.locations.name'}
      source={Constants.model_fields.NAME}
    />
  </Filter>
));

export const LocationList = withStyles(listStyles)(({ classes, ...props }) => (
  <List
    {...props}
    classes={{
      root: classes.root,
      header: classes.header,
      actions: classes.actions,
    }}
    exporter={false}
    filters={<LocationFilter />}
    sort={{ field: Constants.model_fields.DATE_UPDATED, order: 'DESC' }}
    perPage={10}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW} {...props}>
      <TextField
        label={'en.models.locations.display_name'}
        source={Constants.model_fields.DISPLAY_NAME}
      />
      <TextField
        label={'en.models.locations.host_name'}
        source={Constants.model_fields.HOST_NAME}
      />
      <ReferenceField
        linkType={false}
        label={'en.models.locations.type'}
        source={Constants.model_fk_fields.LOCATION_TYPE}
        reference={Constants.models.LOCATIONTYPES}
      >
        <TranslationField
          label={'en.models.roles.label'}
          source={Constants.model_fields.LABEL}
        />
      </ReferenceField>
      <TextField
        className={classes.showBreaks}
        label={'en.models.locations.notes'}
        source={'notes'}
      />
    </Datagrid>
  </List>
));

const GlobusEndpointShow = ({ record, ...rest }) =>
  record && record.globus_endpoint
    ? (
      <Labeled label={'en.models.locations.globus_endpoint'}>
        <TextField record={record} source={'globus_endpoint'} {...rest} />
      </Labeled>
    )
    : null

const GlobusPathShow = withStyles(showStyles)(({ classes, record, ...rest }) =>
  record && record.globus_path
    ? (
      <Labeled label={'en.models.locations.globus_path'}>
        <TextField className={classes.path} record={record} source={'globus_path'} {...rest} />
      </Labeled>
    )
    : null
);

const PortalUrlShow = withStyles(showStyles)(({ classes, record, ...rest }) =>
  record && record.portal_url
    ? (
      <Labeled label={'en.models.locations.portal_url'}>
        <TextField className={classes.path} record={record} source={'portal_url'} {...rest} />
      </Labeled>
    )
    : null
);

const NotesShow = withStyles(showStyles)(({ classes, record, ...rest }) =>
  record && record.notes
    ? (
      <Labeled label={'en.models.locations.notes'}>
        <TextField className={classes.showBreaks} record={record} source={'notes'} {...rest} />
      </Labeled>
    )
    : null
);


export const LocationShow = props => 
  {
  return(
  <Show title={<LocationTitle />} {...props}>
    <SimpleShowLayout>
      {console.log("props in simpleshowlayout is: ", props)}
      <TextField
        label={'en.models.locations.display_name'}
        source={Constants.model_fields.DISPLAY_NAME}
      />
      <TextField
        label={'en.models.locations.host_name'}
        source={Constants.model_fields.HOST_NAME}
      />
      <ReferenceField
        linkType={false}
        label={'en.models.locations.type'}
        source={Constants.model_fk_fields.LOCATION_TYPE}
        reference={Constants.models.LOCATIONTYPES}
      >
        <TranslationField
          label={'en.models.roles.label'}
          source={Constants.model_fields.LABEL}
        />
      </ReferenceField>
      <GlobusEndpointShow />
      <GlobusPathShow />
      <PortalUrlShow />
      <NotesShow />
      <MapView/>

      
    </SimpleShowLayout>
  </Show>)
  }
;

export const LocationCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Create {...props}>
      <LocationForm {...other} mode={"create"} />
    </Create>
  );
};

export const LocationTitle = ({ record }) => {
  return <span>Location {record ? `"${record.name}"` : ''}</span>;
};

export const LocationEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Edit title={<LocationTitle />} {...props} >
      <LocationForm {...other} mode={Constants.resource_operations.EDIT} />
    </Edit>
  );
};
