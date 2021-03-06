//Projects.jsx
import React, {Component, useEffect, useState} from "react";
import {
  Create,
  Datagrid,
  Edit,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  ShowController,
  Tab,
  TabbedShowLayout,
  TextField,
  TextInput,
  translate,
  withTranslate,
} from 'react-admin';
import { withStyles } from "@material-ui/core/styles";
import {AVATAR_HEIGHT, MODEL_FIELDS, ROLE_USER, MODEL_FK_FIELDS, MODELS, RESOURCE_OPERATIONS} from "../_constants/index";
import BrowseTab from './Browse/BrowseTab';
import CustomPagination from "../_components/CustomPagination";
import { ProjectName } from "../_components/_fields/ProjectName.jsx";
import { UserShow } from "../_components/_fields/UserShow";
import "../_components/components.css";
import compose from "recompose/compose";
import MapView from '../_components/_fragments/MapView';
import RelatedDatasets from '../Datasets/RelatedDatasets';
import { isAdminOfAParentGroup, getRelatedDatasets} from "../_tools/funcs";
import { Typography, Toolbar, Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import { EditButton } from "ra-ui-materialui/lib/button";
import { DatasetForm, DatasetModalShow } from "../Datasets/Datasets";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import KeywordsChip from "./KeywordsChip";
import { ProjectForm } from "./ProjectForm";
import { MetadataEditActions, ShowMetadata } from "../_components/Metadata";
import { DefaultToolbar } from "../_components";

const styles = {
  actions: {
    backgroundColor: 'inherit',
  },
  keywordChip: {
    marginRight: "0.5em",
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
  },
  mapFormHeader: {
    paddingBottom: "1em",
    marginTop: "1em",
  },
  preMapArea: {
    marginBottom: "1em",
  },
  columnHeaders: {
    fontWeight: "bold",
  },
  //different widths in create / edit form.  Why?  I dunno.
  selectPCU: {
    width: "18.5em"
  },
  selectPCUEdit: {
    width: "23em",
  }
};

const filterStyles = {
  form: {
    backgroundColor: 'inherit',
  },
};

// eslint-disable-next-line no-unused-vars
const validateGroup = required('en.validate.project.group');
// eslint-disable-next-line no-unused-vars
const validateName = required('en.validate.project.name');
// eslint-disable-next-line no-unused-vars
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
      actions: classes.actions,
    }}
    exporter={false}
    filters={<ProjectFilter />}
    sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: 'DESC' }}
    perPage={10}
    bulkActionButtons={false}
    pagination={<CustomPagination />}
  >
    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW} classes={{headerCell: classes.columnHeaders}}>
      <ProjectName label={'en.models.projects.name'} />
      <ReferenceField
        link={false}
        label={'en.models.projects.primary_contact_user'}
        source={MODEL_FIELDS.PRIMARY_CONTACT_USER}
        reference={MODELS.USERS}
      >
        <UserShow />
      </ReferenceField>
      <ReferenceField
        link={false}
        label={'en.models.projects.group'}
        source={MODEL_FK_FIELDS.GROUP}
        reference={MODELS.GROUPS}
      >
        <TextField source={MODEL_FIELDS.NAME} />
      </ReferenceField>

      <KeywordsChip {...props}
      classes={classes}
      label={"en.models.projects.keywords"}
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
    //console.log("data in useeffect projectshowactions: ", data)
    if (data && !showEdit){
      isAdminOfAParentGroup(data.group).then(data => {
        setShowEdit(data)
        setCanEditModal(data)
      }
      
      )
    }
  }, [data,showEdit,setCanEditModal])

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
    //console.log("ProjectShow props: ", props)
    //select all datasets where project = project id

    const [projectDatasets, setProjectDatasets] = useState([])
    const [projectName, setProjectName] = useState("")
    const [createModal, setCreateModal] = useState(false)
    const [viewModal, setViewModal] = useState(false)
    const [editModal, setEditModal] = useState(false)
    const [canEditModal, setCanEditModal] = useState(false) //this is used to pass into RelatedDatasets to decide whether or not to make the dataset editable

    let _isMounted = false
    useEffect(() => {
      //console.log("projectshow record, props:", props)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      _isMounted = true
      if (props.id){
        getRelatedDatasets(props.id).then(data => {
          //console.log("getrelateddatasets returns: ", data)
          if (_isMounted){
            setProjectDatasets(data)
          }
          return data
        }).catch(err => console.error(err))
      }  
      return function cleanup() {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        _isMounted = false;
      }
    }, [createModal, editModal, viewModal])

    if (permissions){
      return (<Show actions={<ProjectShowActions setCanEditModal={setCanEditModal}/>}  {...props} >
        <TabbedShowLayout>
          <Tab label={'summary'}>
            {projectDatasets && <RelatedDatasets setCreateModal={setCreateModal} setEditModal={setEditModal} setViewModal={setViewModal} projectDatasets={projectDatasets} canEditModal={canEditModal} {...props} /> }
            <ProjectName label={'en.models.projects.name'} />
            
            <KeywordsChip {...props}
              classes={classes}
              label={"en.models.projects.keywords"}
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
                    <Dialog className={classes.modalContainer}fullWidth open={createModal} onClose={() => {setCreateModal(false)}} aria-label="Add User">
                      <DialogTitle>{`Add Dataset`}</DialogTitle>
                      <DialogContent>
                        <DatasetForm project={props.id} setCreateModal={setCreateModal} {...props} />
                      </DialogContent>
                    </Dialog>
                  }
                  {editModal && 
                  <Dialog className={classes.modalContainer}fullWidth open={editModal} onClose={() => {setEditModal(false)}} aria-label="Add User">
                    <DialogTitle>{`Update Dataset`}</DialogTitle>
                    <DialogContent>
                      <DatasetForm basePath="/datasets" resource="datasets" project={props.id} setEditModal={setEditModal} record={{...editModal}} />
                    </DialogContent>
                  </Dialog>
                  }

                  {viewModal && <Dialog className={classes.modalContainer}fullWidth open={viewModal} onClose={() => {setViewModal(false)}} aria-label="Add User">
                    <DialogContent>
                      <DatasetModalShow basePath="/datasets" resource="datasets" id={viewModal.id} setViewModal={setViewModal} record={{...viewModal}} />
                    </DialogContent>
                  </Dialog>}
                </>

              )}
            </ShowController>
            <ShowController {...props}>
              {controllerProps => (controllerProps.record && 
              controllerProps.record.geo && 
              controllerProps.record.geo.geojson && 
              controllerProps.record.geo.geojson.features.length > 0 ?
              <MapView {...controllerProps}/>
              : null
              )}
            </ShowController>
          </Tab>
          <Tab label={MODEL_FIELDS.FILES} path={MODEL_FIELDS.FILES}>
            <ProjectName label={'en.models.projects.name'} setProjectName={setProjectName} />
            <BrowseTab projectID={props.id} projectName={projectName} />
          </Tab>
        </TabbedShowLayout>
      </Show>
    );
    }
    else{
      return <Typography>Waiting to load Permissions...</Typography>
    }
}));

export const ProjectCreate = withTranslate(
  withStyles(styles)(({ classes, translate, ...props }) => (
    <Create submitOnEnter={false} {...props}>
      <ProjectForm classes={classes} translate={translate} {...props} />
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
    const { classes, permissions, record, translate, ...others } = this.props;
    getAsyncValidateNotExists({ id: MODEL_FIELDS.ID, name: MODEL_FIELDS.NAME, reject: "There is already a project with this name. Please pick another name." }, MODELS.PROJECTS);
    return (<Edit actions={<MetadataEditActions />} submitOnEnter={false} toolbar={<DefaultToolbar {...this.props} />} {...others}>
      <ProjectForm classes={classes} translate={translate} {...this.props} />
    </Edit>);
  }
};


const enhance = compose(
  translate,
  withStyles(styles),
);

export const ProjectEdit = enhance(BaseProjectEdit);
