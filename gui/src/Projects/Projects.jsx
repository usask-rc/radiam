//Projects.jsx
import React, {Component, useEffect, useState} from "react";
import {
  Create,
  Datagrid,
  Edit,
  Filter,
  ImageField,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  ShowController,
  SimpleForm,
  Tab,
  TabbedShowLayout,
  TextField,
  TextInput,
  translate,
  withTranslate,
} from 'react-admin';

import { Field } from 'redux-form'
import { withStyles } from "@material-ui/core/styles";
import { CardContentInner } from "ra-ui-materialui";
import * as Constants from "../_constants/index";
import BrowseTab from './Browse/BrowseTab';
import FilesTab from "./Files/FilesTab";
import { EditMetadata, ConfigMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import CustomPagination from "../_components/CustomPagination";
import { ProjectName } from "../_components/_fields/ProjectName.jsx";
import { ProjectStepper } from "../_components/ProjectStepper.jsx";
import { userSelect, UserShow } from "../_components/_fields/UserShow";
import "../_components/components.css";
import compose from "recompose/compose";
import MapView from '../_components/_fragments/MapView';
import RelatedDatasets from '../Datasets/RelatedDatasets';
import { getGroupUsers, getGroupData, getUsersInGroup, submitObjectWithGeo } from "../_tools/funcs";
import { InputLabel, Select, MenuItem } from "@material-ui/core";
import MapForm from "../_components/_forms/MapForm";

const styles = {
  actions: {
    backgroundColor: 'inherit',
  },
  formDisplay: {
    width: "auto",
  },
  header: {
    backgroundColor: 'inherit',
  },
  image: {
    height: `${Constants.AVATAR_HEIGHT}`,
  },
  root: {
    backgroundColor: 'inherit',
  },
  mapView: {
    width: "100%"
  }
};

const filterStyles = {
  form: {
    backgroundColor: 'inherit',
  },
};

const validateGroup = required('en.validate.project.group');
const validateName = required('en.validate.project.name');
const validatePrimaryContactUser = required('en.validate.project.primary_contact_user');

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const ProjectFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <ReferenceInput
      label={'en.models.projects.group'}
      source={Constants.model_fk_fields.GROUP}
      reference={Constants.models.GROUPS}
    >
      <SelectInput optionText={Constants.model_fields.NAME} />
    </ReferenceInput>
    <TextInput
      label={'en.models.projects.name'}
      source={Constants.model_fields.NAME}
    />
  </Filter>
));
//will need to be updated to look up only groups that the user is in.
export const ProjectList = withStyles(styles)(({ classes, ...props }) => (
  <List
    {...props}
    classes={{
      root: classes.root,
      header: classes.header,
      actions: classes.actions,
    }}
    exporter={false}
    filters={<ProjectFilter />}
    sort={{ field: Constants.model_fields.DATE_UPDATED, order: 'DESC' }}
    perPage={10}
    bulkActionButtons={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <ProjectName label={'en.models.projects.name'} />
      <ReferenceField
        linkType={false}
        label={'en.models.projects.primary_contact_user'}
        source={Constants.model_fields.PRIMARY_CONTACT_USER}
        reference={Constants.models.USERS}
        allowEmpty
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={'en.models.projects.group'}
        source={Constants.model_fk_fields.GROUP}
        reference={Constants.models.GROUPS}
      >
        <TextField source={Constants.model_fields.NAME} />
      </ReferenceField>
      <TextField
        label={'en.models.projects.keywords'}
        source={Constants.model_fields.KEYWORDS}
      />
    </Datagrid>
  </List>
));

export const ProjectShow = withTranslate(withStyles(styles)(
  ({ classes, permissions, translate, ...props }) => {
    return (
      <Show {...props}>
        <TabbedShowLayout>
          <Tab label={'summary'}>
            <ProjectName label={'en.models.projects.name'} />
            <RelatedDatasets projectID={props.id} {...props} />
            <TextField
              label={'en.models.projects.keywords'}
              source={Constants.model_fields.KEYWORDS}
            />
            <ReferenceField
              label={'en.models.projects.primary_contact_user'}
              source={Constants.model_fields.PRIMARY_CONTACT_USER}
              reference={Constants.models.USERS}
            >
              <UserShow />
            </ReferenceField>
            <ReferenceField
              label={'en.models.projects.group'}
              source={Constants.model_fields.GROUP}
              reference={Constants.models.GROUPS}
            >
              <TextField source={Constants.model_fields.NAME} />
            </ReferenceField>
            {/** Needs a ShowController to get the record into the ShowMetadata **/}
            <ShowController translate={translate} {...props}>
              { controllerProps => (
                <ShowMetadata
                  type={Constants.model_fk_fields.PROJECT}
                  translate={translate}
                  record={controllerProps.record}
                  basePath={controllerProps.basePath}
                  resource={controllerProps.resource}
                  id={controllerProps.record.id}
                  props={props}
                />
              )}
            </ShowController>
            <MapView/>
          </Tab>
          <Tab label={Constants.model_fields.FILES} path={Constants.model_fields.FILES}>
            <ProjectName label={'en.models.projects.name'} />
            <FilesTab projectID={props.id} />
          </Tab>
          <Tab label={'browse'} path={'browse'}>
            <ProjectName label={'en.models.projects.name'} />
            <BrowseTab projectID={props.id} />
          </Tab>
        </TabbedShowLayout>
      </Show>
    );
}));


//you'd think there would be an easier way to do this, and I'm sure there is, but sending a hook down here to change the value works.  touch it at your own risk.
const renderUserInput = ({ input, users, ...props }) => {
  
  const handleChange=(e) => {
    props.setPrimaryContactUser(e.target.value)
  }

  return (<React.Fragment>
    <InputLabel htmlFor={Constants.model_fields.PRIMARY_CONTACT_USER}>{`Primary Contact`}</InputLabel>
    <Select value={props.defaultValue} onChange={handleChange} id={Constants.model_fields.PRIMARY_CONTACT_USER} name={Constants.model_fields.PRIMARY_CONTACT_USER}
    >
      {users && [...users].map(user => {
        return (<MenuItem value={user.id} key={user.id}>{user.username}</MenuItem>)
      })}
    </Select>
  </React.Fragment>)
}

const UserInput = ({ source, ...props }) => {
  return(<Field name={source} component={renderUserInput} {...props} />)}

export const ProjectEditForm = withStyles(styles)(({ classes, permissions, record }) => {
  const [groupList, setGroupList] = useState([])
  const [groupContactCandidates, setGroupContactCandidates] = useState({})
  const [projectGroup, setProjectGroup] = useState(null)
  const [groupContactList, setGroupContactList] = useState([])
  const [geo, setGeo] = useState(record.geo ? record.geo : {})
  const [primaryContactUser, setPrimaryContactUser] = useState(record.primary_contact_user)

  let _isMounted = false

  useEffect(() => {
    _isMounted = true
    if (projectGroup !== null){
      getAllParentGroups(projectGroup)
    }

    //if we unmount, lock out the component from being able to use the state
    return function cleanup() {
      _isMounted = false;
    }
  }, [projectGroup])

  //TODO: handle potential setstate on unmounted component
  const getAllParentGroups = group_id => {
    if (group_id !== null){
      getGroupData(group_id).then(
        data => {

          let tempGroupList = groupList
          tempGroupList.push(data)

          if (_isMounted){
            setGroupList(tempGroupList)
            getAllParentGroups(data.parent_group)
          }
          return data
        }
      ).catch(err => {
        console.error("error returned in getallparentgroups: ", err)})
    }
    else{
      //now get a list of users in each group
      getPrimaryContactCandidates()
    }
  };

  const handleSubmit = (e) => {
    console.log('handlesubmit e is: ', e)
    //submitObjectWithGeo()
  }

  const handleChange = (e) => {
    console.log("handleChange e: ", e)
  }


  const geoDataCallback = geo => {
    if (geo && Object.keys(geo).length > 0) {

      setGeo(geo)
      
      //this isn't needed unless we re-introduce the geoJSON text form.
      //this.setState({geoText: JSON.stringify(geo.geojson.features, null, 2)}, () => this.setState({jsonTextFormKey: this.state.jsonTextFormKey + 1})));
    } else {
      //this will likely have to be changed
      setGeo({})
    }
  }
    /*

    //mark as dirty if prop value does not equal state value.  If they're equal, leave isDirty as is.
    if (this.state.geo !== this.props.record.geo) {
      this.setState({ isFormDirty: true });
    }*/

  const getPrimaryContactCandidates = () => {
    if (groupList){
      let iteratedGroups = []

      groupList.map(group => {
        getUsersInGroup(group).then(data => {

          let tempGroupContactCandidates = groupContactCandidates

          data.map(item => {
            tempGroupContactCandidates[item.id] = item
          })

          setGroupContactCandidates(tempGroupContactCandidates)
          iteratedGroups.push(group)

          if (iteratedGroups.length === groupList.length){
            let groupContactList = []
            Object.keys(tempGroupContactCandidates).map(key => {
              groupContactList.push(groupContactCandidates[key])
              
            })

            setGroupContactList(groupContactList)
          }
          
        }).catch(err => console.error('error returned from getgroupusers is: ', err))
      })
    }else{
      console.error("no group selected from which to provide candidate contacts")
    }
  }

  if (canEditProject({ permissions, record })) {
    if (record.group && projectGroup === null){
      setProjectGroup(record.group)
    }
  }
  console.log("primary contact user is: ", record.primary_contact_user)

    return (<SimpleForm redirect={Constants.resource_operations.LIST} save={handleSubmit} onChange={handleChange}>
      <TextInput
        className="input-small"
        label={"en.models.projects.name"}
        source={Constants.model_fields.NAME}
        defaultValue={record.name}
        validate={validateName} />
      <ReferenceInput
        resource={Constants.models.PROJECTAVATARS}
        className="input-small"
        label={`Icon`} 
        perPage={100} 
        defaultValue={record.avatar}
        source={Constants.model_fields.AVATAR}  reference={Constants.models.PROJECTAVATARS}>
          <SelectInput source={Constants.model_fields.AVATAR_IMAGE} optionText={<ImageField classes={{image: classes.image}} source={Constants.model_fields.AVATAR_IMAGE} />}/>
      </ReferenceInput>
      <TextInput
        className="input-small"
        label={"en.models.projects.keywords"}
        source={Constants.model_fields.KEYWORDS}
        defaultValue={record.keywords}
        />

        <ReferenceInput
          resource="researchgroups"
          className="input-small"
          label={"en.models.projects.group"}
          source={Constants.model_fields.GROUP}
          reference={Constants.models.GROUPS}
          validate={validateGroup}
          defaultValue={record.group}>
          <SelectInput optionText={Constants.model_fields.NAME} />
        </ReferenceInput>

        <UserInput
          required
          label={"en.models.projects.primary_contact_user"}
          placeholder={`Primary Contact`}
          //this blocks form submission , probably because of how gross this UserInput value is. validate={validatePrimaryContactUser}
          className="input-small"
          defaultValue={primaryContactUser}
          setPrimaryContactUser={setPrimaryContactUser}
          users={groupContactList} id={Constants.model_fields.PRIMARY_CONTACT_USER} name={Constants.model_fields.PRIMARY_CONTACT_USER}
          />
          
        { record.id && (
          <div>
            <EditMetadata id={record.id} type={Constants.model_fk_fields.PROJECT}
            />
            <ConfigMetadata id={record.id} type={Constants.model_fk_fields.PROJECT}/>
          </div>
        )}
        {record && 
          <div className={classes.mapView}>
            <MapForm content_type={'project'} recordGeo={record.geo} id={record.id} geoDataCallback={geoDataCallback}/>
          </div>
        }
        
      </SimpleForm>)

  
});

export const ProjectCreate = withTranslate(
  withStyles(styles)(({ classes, translate, ...props }) => (
    <Create {...props}>
      <ProjectStepper classes={classes} translate={translate} {...props} />
    </Create>
  ))
);

export const ProjectTitle = ({ record }) => (
  <span>Project {record ? `"${record.name}"` : ''}</span>
);

class BaseProjectEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: false,
    };
  }

  render() {
    const { classes, permissions, record, ...others } = this.props;

    return <Edit title={<ProjectTitle />} actions={<MetadataEditActions />} {...others}>
      <ProjectEditForm classes={classes} permissions={permissions} record={record} {...others} />
    </Edit>;
  }
};

const enhance = compose(
  translate,
  withStyles(styles),
);

export const ProjectEdit = enhance(BaseProjectEdit);

const canEditProject = ({ permissions, record }) => {
  if (!permissions) {
    return false;
  } else if (!record) {
    return false;
  } else if (permissions.is_admin) {
    return true;
  } else if (
    permissions.groupMemberships &&
    permissions.groupMemberships.length > 0
  ) {
    for (var i = 0; i < permissions.groupMemberships.length; i++) {
      var groupMembership = permissions.groupMemberships[i];
      //'if there is a group in this membership, and its ID matches the group we are inspecting, proceed'.
      if (groupMembership.group && groupMembership.group.id === record.group) {
        if (
          groupMembership.group_role.id === Constants.ROLE_DATA_MANAGER ||
          groupMembership.group_role.id === Constants.ROLE_GROUP_ADMIN
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
  } else {
    return false;
  }
};
