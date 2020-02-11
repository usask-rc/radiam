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
  ChipField,
} from 'react-admin';
import {RESOURCE_OPERATIONS, MODELS, MODEL_FK_FIELDS, MODEL_FIELDS} from "../_constants/index";
import CustomPagination from '../_components/CustomPagination';
import LocationForm from './LocationForm';
import MapView from '../_components/_fragments/MapView';
import TranslationField from '../_components/_fields/TranslationField';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { withStyles } from '@material-ui/core/styles';
import LocationTitle from './LocationTitle';
import ReferenceArrayField from 'ra-ui-materialui/lib/field/ReferenceArrayField';
import { SingleFieldList } from 'ra-ui-materialui/lib/list';
import { ArrayField } from 'ra-ui-materialui/lib/field/ArrayField';


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
    <TextInput
      label={"en.models.filters.search"}
      source="search"
      alwaysOn
    />
    <ReferenceInput
      label={'en.models.locations.type'}
      source={MODEL_FK_FIELDS.LOCATION_TYPE}
      reference={MODELS.LOCATIONTYPES}
      alwaysOn
    >
      <TranslationSelect optionText={MODEL_FIELDS.LABEL} />
    </ReferenceInput>
  </Filter>
));

export const LocationList = withStyles(listStyles)(({ classes, ...props }) => {

  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;

  return(
  <List
    {...props}
    classes={{
      root: classes.root,
      actions: classes.actions,
    }}
    exporter={false}
    filters={<LocationFilter />}
    sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: 'DESC' }}
    perPage={10}
    bulkActionButtons={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW} {...other}>
      <TextField
        label={'en.models.locations.display_name'}
        source={MODEL_FIELDS.DISPLAY_NAME}
      />
      <TextField
        label={'en.models.locations.host_name'}
        source={MODEL_FIELDS.HOST_NAME}
      />
      <ReferenceField
        link={false}
        label={'en.models.locations.type'}
        source={MODEL_FK_FIELDS.LOCATION_TYPE}
        reference={MODELS.LOCATIONTYPES}
      >
        <TranslationField
          label={'en.models.roles.label'}
          source={MODEL_FIELDS.LABEL}
        />
      </ReferenceField>
      <TextField
        className={classes.showBreaks}
        label={'en.models.locations.notes'}
        source={'notes'}
        multiline
      />
       <ArrayField source={"projects"} label={"Projects"}>
        <SingleFieldList>
          <ReferenceField source={"id"} reference={"projects"} link="show">
            <ChipField source={MODEL_FIELDS.NAME} />
          </ReferenceField>
        </SingleFieldList>
      </ArrayField>
    </Datagrid>
  </List>
)});

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
        <TextField className={classes.showBreaks} multiline record={record} source={'notes'} {...rest} />
      </Labeled>
    )
    : null
);


export const LocationDisplay = props => 
  {
    console.log("LocationDisplay data: ", props)
  return(
  <Show {...props}>
    <SimpleShowLayout>
    <LocationTitle prefix={"Viewing"} />
      <TextField
        label={'en.models.locations.display_name'}
        source={MODEL_FIELDS.DISPLAY_NAME}
      />
      <TextField
        label={'en.models.locations.host_name'}
        source={MODEL_FIELDS.HOST_NAME}
      />
      <ReferenceField
        link={false}
        label={'en.models.locations.type'}
        source={MODEL_FK_FIELDS.LOCATION_TYPE}
        reference={MODELS.LOCATIONTYPES}
      >
        <TranslationField
          label={'en.models.roles.label'}
          source={MODEL_FIELDS.LABEL}
        />
      </ReferenceField>
      
      <ArrayField source={"projects"} label={"Projects"}>
        <SingleFieldList>
          <ReferenceField source={"id"} reference={"projects"} link="show">
            <ChipField source={MODEL_FIELDS.NAME} />
          </ReferenceField>
        </SingleFieldList>
      </ArrayField>

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
    <Create submitOnEnter={false} {...props}>
      <LocationForm {...other} mode={"create"} />
    </Create>
  );
};

export const LocationEdit = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Edit submitOnEnter={false} {...props} >
      <LocationForm {...other} mode={RESOURCE_OPERATIONS.EDIT} />
    </Edit>
  );
};
