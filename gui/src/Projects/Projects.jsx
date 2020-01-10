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
import {AVATAR_HEIGHT, MODEL_FIELDS, ROLE_USER, MODEL_FK_FIELDS, MODELS, RESOURCE_OPERATIONS} from "../_constants/index";
import BrowseTab from './Browse/BrowseTab';
import FilesTab from "./Files/FilesTab";
import { EditMetadata, ConfigMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import CustomPagination from "../_components/CustomPagination";
import { ProjectName } from "../_components/_fields/ProjectName.jsx";
import { ProjectStepper } from "../_components/ProjectStepper.jsx";
import { UserShow } from "../_components/_fields/UserShow";
import "../_components/components.css";
import compose from "recompose/compose";
import MapView from '../_components/_fragments/MapView';
import RelatedDatasets from '../Datasets/RelatedDatasets';
import { isAdminOfAParentGroup, getGroupData, getUsersInGroup, getRelatedDatasets, getPrimaryContactCandidates } from "../_tools/funcs";
import { InputLabel, Select, MenuItem, Typography, Toolbar, Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import MapForm from "../_components/_forms/MapForm";
import { FormDataConsumer } from "ra-core";
import ProjectTitle from "./ProjectTitle";
import { EditButton } from "ra-ui-materialui/lib/button";
import { DatasetForm, DatasetShow } from "../Datasets/Datasets";

const styles = {
  actions: {
    backgroundColor: 'inherit',
  },
  header: {
    backgroundColor: 'inherit',
  },
  image: {
    height: `${AVATAR_HEIGHT}`,
  },
  root: {
    backgroundColor: 'inherit',
  },
  modalContainer: {
    paddingRight: "1em",
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
    <TextInput
      label={"en.models.filters.search"}
      source="search"
      alwaysOn
    />
    <ReferenceInput
      label={'en.models.projects.group'}
      source={MODEL_FK_FIELDS.GROUP}
      reference={MODELS.GROUPS}
      alwaysOn
    >
      <SelectInput optionText={MODEL_FIELDS.NAME} />
    </ReferenceInput>
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
    sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: 'DESC' }}
    perPage={10}
    bulkActionButtons={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
      <ProjectName label={'en.models.projects.name'} />
      <ReferenceField
        linkType={false}
        label={'en.models.projects.primary_contact_user'}
        source={MODEL_FIELDS.PRIMARY_CONTACT_USER}
        reference={MODELS.USERS}
        allowEmpty
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        linkType={false}
        label={'en.models.projects.group'}
        source={MODEL_FK_FIELDS.GROUP}
        reference={MODELS.GROUPS}
      >
        <TextField source={MODEL_FIELDS.NAME} />
      </ReferenceField>
      <TextField
        label={'en.models.projects.keywords'}
        source={MODEL_FIELDS.KEYWORDS}
      />
    </Datagrid>
  </List>
));

const actionStyles = theme => ({
  toolbar:{
    float: "right",
    marginTop: "-20px",
  }
})

const ProjectShowActions = withStyles(actionStyles)(({ basePath, data, setCanEditModal, classes}) => 
{
  const user = JSON.parse(localStorage.getItem(ROLE_USER));
  const [showEdit, setShowEdit] = useState(user ? user.is_admin : false)

  useEffect(() => {
    console.log("data in useeffect projectshowactions: ", data)
    if (data && !showEdit){
      isAdminOfAParentGroup(data.group).then(data => {
        setShowEdit(data)
        setCanEditModal(data)
      }
      
      )
    }
  }, [data])

  if (showEdit){
    return(
    <Toolbar className={classes.toolbar}>
      <EditButton basePath={basePath} record={data} />
    </Toolbar>
    )
  }
  else{
    return null
  }
})


export const ProjectShow = withTranslate(withStyles(styles)(
  ({ classes, permissions, translate, ...props }) => {

    //select all datasets where project = project id

    const [projectDatasets, setProjectDatasets] = useState([])
    const [createModal, setCreateModal] = useState(false)
    const [viewModal, setViewModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [canEditModal, setCanEditModal] = useState(false) //this is used to pass into RelatedDatasets to decide whether or not to make the dataset editable

    let _isMounted = false
    useEffect(() => {
      console.log("projectshow record, props:", props)
      _isMounted = true
      if (props.id){
        getRelatedDatasets(props.id).then(data => {
          console.log("getrelateddatasets returns: ", data)
          if (_isMounted){
            setProjectDatasets(data)
          }
          return data
        }).catch(err => console.error(err))
      }  
      return function cleanup() {
        _isMounted = false;
      }
    }, [createModal, editModal, viewModal])

    if (permissions){
      return (<Show actions={<ProjectShowActions setCanEditModal={setCanEditModal}/>}  {...props} >
        <TabbedShowLayout>
          <Tab label={'summary'}>
            {projectDatasets && <RelatedDatasets setCreateModal={setCreateModal} setEditModal={setEditModal} setViewModal={setViewModal} projectDatasets={projectDatasets} canEditModal={canEditModal} {...props} /> }
            <ProjectName label={'en.models.projects.name'} />
            <TextField
              label={'en.models.projects.keywords'}
              source={MODEL_FIELDS.KEYWORDS}
            />
            <ReferenceField
              label={'en.models.projects.primary_contact_user'}
              source={MODEL_FIELDS.PRIMARY_CONTACT_USER}
              reference={MODELS.USERS}
            >
              <UserShow />
            </ReferenceField>
            <ReferenceField
              label={'en.models.projects.group'}
              source={MODEL_FIELDS.GROUP}
              reference={MODELS.GROUPS}
            >
              <TextField source={MODEL_FIELDS.NAME} />
            </ReferenceField>
            {/** Needs a ShowController to get the record into the ShowMetadata **/}
            <ShowController translate={translate} {...props}>
              { controllerProps => (
                <>
                  <ShowMetadata
                    type={MODEL_FK_FIELDS.PROJECT}
                    translate={translate}
                    record={controllerProps.record}
                    basePath={controllerProps.basePath}
                    resource={controllerProps.resource}
                    id={controllerProps.record.id}
                    props={props}
                  />
                  {createModal && 
                    <Dialog className={classes.modalContainer}fullWidth open={createModal} onClose={() => {console.log("dialog close"); setCreateModal(false)}} aria-label="Add User">
                      <DialogTitle>{`Add Dataset`}</DialogTitle>
                      <DialogContent>
                        <DatasetForm project={props.id} setCreateModal={setCreateModal} {...props} />
                      </DialogContent>
                    </Dialog>
                  }
                  {console.log("editModal: ", editModal)}
                  {editModal && 
                  <Dialog className={classes.modalContainer}fullWidth open={editModal} onClose={() => {console.log("dialog close"); setEditModal(false)}} aria-label="Add User">
                    <DialogTitle>{`Update Dataset`}</DialogTitle>
                    <DialogContent>
                      <DatasetForm basePath="/datasets" resource="datasets" project={props.id} setEditModal={setEditModal} record={{...editModal}} />
                    </DialogContent>
                  </Dialog>
                  }

                  {viewModal && <Dialog className={classes.modalContainer}fullWidth open={viewModal} onClose={() => {console.log("dialog close"); setViewModal(false)}} aria-label="Add User">
                    <DialogContent>
                      <DatasetShow basePath="/datasets" resource="datasets" id={viewModal.id} setViewModal={setViewModal} record={{...viewModal}} />
                    </DialogContent>
                  </Dialog>}
                  
                </>

              )}
            </ShowController>
            <MapView/>
          </Tab>
          <Tab label={MODEL_FIELDS.FILES} path={MODEL_FIELDS.FILES}>
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
    }
    else{
      return <Typography>Waiting to load Permissions...</Typography>
    }
}));



const renderUserInput = ({ input, users }) => {
  return (<>
    <InputLabel htmlFor={MODEL_FIELDS.PRIMARY_CONTACT_USER}>{`Primary Contact`}</InputLabel>
    <Select id={MODEL_FIELDS.PRIMARY_CONTACT_USER} name={MODEL_FIELDS.PRIMARY_CONTACT_USER}
      {...input}
    >
      {users && [...users].map(user => {
        return (<MenuItem value={user.id} key={user.id}>{user.username}</MenuItem>)
      })}
    </Select>
  </>)
}

const UserInput = ({ source, ...props }) => <Field name={source} component={renderUserInput} {...props} />

export const ProjectEditInputs = withStyles(styles)(({ classes, permissions, record, state }) => {
  const [groupList, setGroupList] = useState([])
  const [projectGroup, setProjectGroup] = useState(null)
  const [groupContactList, setGroupContactList] = useState([])
  const [status, setStatus] = useState({error: false, loading: true})
  let _isMounted = false


  const handleSelectChange = (e, value, prevValue, target) => {
    console.log("handlechange e: ", e, value, prevValue, target, "ismounted: ", _isMounted)
    if (target === 'group' && value !== prevValue){
      setStatus({loading: true})
      setGroupList([])
      setProjectGroup(value)
    }
  }

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

          setGroupList(tempGroupList)
          getAllParentGroups(data.parent_group)

          return data
        }
      ).catch(err => {
        console.error("error returned in getallparentgroups: ", err)
      })
    }
    else{
      //now get a list of users in each group
      getPrimaryContactCandidates(groupList).then(data => setGroupContactList(data))
    }
  };

  if (record && isAdminOfAParentGroup(record.group)) {
    if (projectGroup === null){
      setProjectGroup(record.group)
    }

    return <CardContentInner>
      <div>
        <TextInput
          className="input-small"
          label={"en.models.projects.name"}
          source={MODEL_FIELDS.NAME}
          validate={validateName} />
      </div>
        <ReferenceInput
          resource={MODELS.PROJECTAVATARS}
          className="input-small"
          perPage={1000}

          label={MODEL_FIELDS.AVATAR} 
          source={MODEL_FIELDS.AVATAR}  reference={MODELS.PROJECTAVATARS}>
            <SelectInput source={MODEL_FIELDS.AVATAR_IMAGE} optionText={<ImageField classes={{image: classes.image}} source={MODEL_FIELDS.AVATAR_IMAGE} />}/>
        </ReferenceInput>
      <div>
        <TextInput
          className="input-small"
          label={"en.models.projects.keywords"}
          source={MODEL_FIELDS.KEYWORDS} />
      </div>
      <div>
        <ReferenceInput
          resource="researchgroups"
          className="input-small"
          label={"en.models.projects.group"}
          source={MODEL_FIELDS.GROUP}
          reference={MODELS.GROUPS}
          onChange={handleSelectChange}
          validate={validateGroup}>
          <SelectInput optionText={MODEL_FIELDS.NAME} />
        </ReferenceInput>
        { groupContactList.length > 0 ?
          (<div>
            <UserInput
              required
              label={"en.models.projects.primary_contact_user"}
              placeholder={`Primary Contact`}
              validate={validatePrimaryContactUser}
              className="input-small"
              users={groupContactList} id={MODEL_FIELDS.PRIMARY_CONTACT_USER} name={MODEL_FIELDS.PRIMARY_CONTACT_USER}
              />
          </div>)
          :
          !status.loading && groupContactList.length === 0 ? 
          (<div>
          <Typography>{`No Eligible Users were found in the selected Group. Primary Contact will remain as the previously set user.`}</Typography>
          </div>)
          :
          status.loading ? 
          (<div>
            <Typography>{`Loading Associated Users...`}</Typography>
          </div>)
          :
          <div>
            <Typography>{`Error loading users: ${status.error}`}</Typography>
          </div>
        }
        { record.id && (
          <div>
            <EditMetadata id={record.id} type={MODEL_FK_FIELDS.PROJECT}/>
            <ConfigMetadata id={record.id} type={MODEL_FK_FIELDS.PROJECT}/>
          </div>
        )}

        <FormDataConsumer>
          {({formData, ...rest} ) =>
          {
            //NOTE: This FormDataConsumer area is required for the map implementation.
            const geoDataCallback = geo => {
              formData.geo = geo
            };

            return(
              <div>
                <MapForm content_type={'project'} recordGeo={record.geo} id={record.id} geoDataCallback={geoDataCallback}/>
              </div>
            )
          }
          }
        </FormDataConsumer>

      </div>
      
    </CardContentInner>;
  }
});

//TODO: geojson object does not properly update afterwards.
//it doesn't send in the appropriate geojson in the PUT - it either doesn't get it from the map, or it doesnt send it properly in the update function.
//this functionality works in DATASETS but not here.  The data never gets sent to the API, so it must never be scalped from the map.
export const ProjectCreate = withTranslate(
  withStyles(styles)(({ classes, translate, ...props }) => (
    <Create submitOnEnter={false} {...props}>
      <ProjectStepper classes={classes} translate={translate} {...props} />
    </Create>
  ))
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

    return (<Edit actions={<MetadataEditActions />} {...others}>
      <SimpleForm redirect={RESOURCE_OPERATIONS.LIST} submitOnEnter={false}>
        <ProjectTitle prefix={`Updating`} />
        <ProjectEditInputs classes={classes} permissions={permissions} record={record} state={this.state} />
      </SimpleForm>
    </Edit>);
  }
};

const enhance = compose(
  translate,
  withStyles(styles),
);

export const ProjectEdit = enhance(BaseProjectEdit);
