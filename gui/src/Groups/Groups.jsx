//Groups.jsx
import React, { Component, useEffect, useState } from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  Edit,
  Filter,
  List,
  TextInput,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  ShowController,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  translate,
  withTranslate,
} from "react-admin";
import compose from "recompose/compose";
import { ConfigMetadata, EditMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import {RESOURCE_OPERATIONS, MODELS, ROLE_USER, MODEL_FK_FIELDS, MODEL_FIELDS} from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import PropTypes from 'prop-types';
import RelatedUsers from "./RelatedUsers";
import { withStyles } from "@material-ui/core/styles";
import GroupTitle from "./GroupTitle.jsx";
import { isAdminOfAParentGroup, getGroupMembers} from "../_tools/funcs.jsx";
import { Toolbar, Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import { EditButton } from "ra-ui-materialui/lib/button";
import { GroupMemberForm } from "../GroupMembers/GroupMembers.jsx";
import UserDetails from "../Users/UserDetails.jsx";
import { DefaultToolbar } from "../_components/Toolbar.jsx";

const styles = {
  actions: {
    backgroundColor: "inherit"
  },
  description: {
    maxWidth: "80%",
  },
  header: {
    backgroundColor: "inherit"
  },
  columnHeaders: {
    fontWeight: "bold",
  },
};
const filterStyles = {
  form: {
    backgroundColor: "inherit"
  }
};

//This does a search SERVER-side, not client side.  However, it currently only works for exact matches.
const GroupFilter = withStyles(filterStyles)(({ classes, ...props }) => (
  <Filter classes={classes} {...props}>
    <TextInput
      label={"en.models.filters.search"}
      source="search"
      alwaysOn
    />
    <ReferenceInput
      label={"en.models.groups.parent_group"}
      source={MODEL_FK_FIELDS.PARENT_GROUP}
      reference={MODELS.GROUPS}
    >
      <SelectInput optionText={MODEL_FIELDS.NAME} />
    </ReferenceInput>
    <BooleanInput
      label={"en.models.groups.active"}
      defaultValue={true}
      source={MODEL_FIELDS.ACTIVE} />
  </Filter>
));

export const GroupList = withStyles(styles)(({ classes, ...props }) => {
  return(
  <List
    {...props}
    classes={{
      root: classes.root,
      actions: classes.actions
    }}
    exporter={false}
    filters={<GroupFilter />}
    sort={{ field: MODEL_FIELDS.DATE_UPDATED, order: "DESC" }}
    perPage={10}
    pagination={<CustomPagination />}
    bulkActionButtons={false}>

    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW} classes={{headerCell: classes.columnHeaders}}>
      <TextField
        label={"en.models.groups.name"}
        source={MODEL_FIELDS.NAME}
      />
      <TextField
        label={"en.models.groups.description"}
        source={MODEL_FIELDS.DESCRIPTION}
      />
      <ReferenceField
        link={false}
        label={"en.models.groups.parent_group"}
        source={MODEL_FK_FIELDS.PARENT_GROUP}
        reference={MODELS.GROUPS}
        allowEmpty
      >
        <TextField
          label={"en.models.groups.name"}
          source={MODEL_FIELDS.NAME}
        />
      </ReferenceField>
    </Datagrid>
  </List>
)
});


const actionStyles = theme => ({
  toolbar:{
    float: "right",
    marginTop: "-20px",
  }
})

//check if this user should have permission to access the edit page.
const GroupShowActions = withStyles(actionStyles)(({basePath, data, classes, ...props}) => {
  const user = JSON.parse(localStorage.getItem(ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)
  useEffect(() => {
    let _isMounted = true
    if (data && !showEdit){
      isAdminOfAParentGroup(data.id).then(data => {
        if (_isMounted){
          setShowEdit(data)
        }
      })
    }
    return function cleanup() {
      _isMounted = false
    }
  }, [data, showEdit])

  const {hasCreate, hasShow, hasEdit, hasList, ...rest} = props
  //console.log("GroupShowActions props: ", props)

  if (showEdit){
    //console.log("in groupShowActions, data is: ", data)
    return(
    <Toolbar className={classes.toolbar}>
      <EditButton basePath={basePath} id={props.id} record={data} {...rest} />
    </Toolbar>
    )
  }
  else{
    return null
  }
})

export const GroupShow = withStyles(styles)(withTranslate(({ classes, permissions, translate, ...props}) => {

  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [groupMembers, setGroupMembers] = useState([])
  const [canEditGroup, setCanEditGroup] = useState(false)

  useEffect(() => {
    let _isMounted = true
    isAdminOfAParentGroup(props.id).then(data => {
      if (_isMounted){
        setCanEditGroup(data)
      }
    })
    return function cleanup() { 
      _isMounted = false;
    }
  }, [props.id])

  useEffect(() => {
    let _isMounted = true
    if (props.id){
      const params={id: props.id, is_active: true}
      getGroupMembers(params).then((data) => {
        //console.log("getGroupMembers returned data: ", data)
        if (_isMounted){
          setGroupMembers(data)
        }
        return data
      }).catch(err => console.error("err: ", err))
    }

    return function cleanup() { 
      _isMounted = false;
    }
  }, [createModal, editModal, viewModal, props.id])

  return(
  <Show actions={!props.inModal && <GroupShowActions {...props} />} {...props}>
    <SimpleShowLayout>
      <GroupTitle prefix={"Viewing"} />
      {groupMembers && <RelatedUsers setCreateModal={canEditGroup ? setCreateModal : null} setEditModal={canEditGroup ? setEditModal : null} setViewModal={setViewModal} groupMembers={groupMembers} inModal={props.inModal}  {...props}  /> }

      <TextField
        label={"en.models.groups.name"}
        source={MODEL_FIELDS.NAME}
      />
      <TextField
        label={"en.models.groups.description"}
        source={MODEL_FIELDS.DESCRIPTION}
      />
      <BooleanField
        label={"en.models.generic.active"}
        source={MODEL_FIELDS.ACTIVE}
      />
      <ReferenceField
        link={false}
        label={"en.models.groups.parent_group"}
        source={MODEL_FK_FIELDS.PARENT_GROUP}
        reference={MODELS.GROUPS}
        allowEmpty
      >
        <TextField
          label={"en.models.groups.name"}
          source={MODEL_FIELDS.NAME}
        />
      </ReferenceField>

      {/** Needs a ShowController to get the record into the ShowMetadata **/}
      <ShowController translate={translate} {...props}>
        { controllerProps => {
          //console.log("controllerprops in group: ", controllerProps)
          //console.log("editModal is: ", editModal)
        return(
          <>
            <ShowMetadata
              type={MODEL_FK_FIELDS.GROUP}
              translate={translate}
              record={controllerProps.record}
              basePath={controllerProps.basePath}
              resource={controllerProps.resource}
              id={controllerProps.record.id}
              props={props}
            />
            {createModal && <Dialog fullWidth open={createModal} onClose={() => {setCreateModal(false)}} aria-label="Add User">
              <DialogTitle>{`Add User`}</DialogTitle>
              <DialogContent>
                <GroupMemberForm group={controllerProps.record.id} setCreateModal={setCreateModal} {...props} />
              </DialogContent>
            </Dialog>
            }
            {editModal && <Dialog fullWidth open={editModal} onClose={() => {setEditModal(false)}} aria-label="Add User">
              <DialogContent>
                <GroupMemberForm basePath="/groupmembers" resource="groupmembers" setEditModal={setEditModal} record={{id: editModal.id, user: editModal.user.id, group: editModal.group.id, group_role: editModal.group_role.id}} />
              </DialogContent>
            </Dialog>
            }
            {viewModal && <Dialog fullWidth open={viewModal} onClose={() => {setViewModal(false)}} aria-label="Add User">
              <DialogContent>
                <UserDetails basePath="/users" resource="users" setViewModal={setViewModal} record={{...viewModal.user}} />
              </DialogContent>
            </Dialog>}
          </>
        )}}
      </ShowController>

      
    </SimpleShowLayout>
  </Show>
)}));

const validateName = required('en.validate.group.group_name');
const validateDescription = required('en.validate.group.description');
const validateParentGroup = (value, allValues) => {
  if (value && allValues.id === value){
    return 'A Group may not be a parent group of itself'
  }
}

const asyncValidate = getAsyncValidateNotExists({id: MODEL_FIELDS.ID, name : MODEL_FIELDS.NAME, reject: "There is already a group with this name. Please pick another name for your group." }, MODELS.GROUPS);

//only used for group creation
const GroupForm = props => 
{

  function handleSubmit(formData) {
    const {name, description} = formData

    if (name && description){
      props.save(formData)
    }
  }

  
  return(
    <SimpleForm
      {...props}
      toolbar={<DefaultToolbar />}
      asyncValidate={asyncValidate}
      asyncBlurFields={[ MODEL_FIELDS.NAME ]}
      save={handleSubmit}
    >
      <GroupTitle prefix={"Creating Group"} />
      <TextInput
        label={"en.models.groups.name"}
        source={MODEL_FIELDS.NAME}
        validate={validateName}
      />
      <TextInput
        label={"en.models.groups.description"}
        source={MODEL_FIELDS.DESCRIPTION}
        validate={validateDescription}
        multiline
      />
      <ReferenceInput
        label={"en.models.groups.parent_group"}
        source={MODEL_FK_FIELDS.PARENT_GROUP}
        reference={MODELS.GROUPS}
        validate={validateParentGroup}
        allowEmpty
      >
        <SelectInput
          label={"en.models.groups.name"}
          optionText={MODEL_FIELDS.NAME}
        />
      </ReferenceInput>
    </SimpleForm>
  )
};

export const GroupCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Create {...props}>
      <GroupForm  {...other} />
    </Create>
  );
}

class BaseGroupEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: false,
    };
  }

  render() {

    const { basePath, record, id } = this.props;

    return (<Edit basePath={basePath} actions={<MetadataEditActions showRelatedUsers={true} />} {...this.props}>
      <SimpleForm
        basePath={basePath}
        toolbar={<DefaultToolbar />}
        redirect={RESOURCE_OPERATIONS.LIST}
      >
        <GroupTitle prefix={"Updating"} />
        <TextInput
          label={"en.models.groups.name"}
          source={MODEL_FIELDS.NAME}
          validate={validateName}
        />
        <TextInput
          label={"en.models.groups.description"}
          source={MODEL_FIELDS.DESCRIPTION}
          validate={validateDescription}
          style={{"max-width": "80%"}}
          multiline
        />
        <BooleanInput
          label={"en.models.generic.active"}
          defaultValue={true}
          source={MODEL_FIELDS.ACTIVE}
        />
        <ReferenceInput
          label={"en.models.groups.parent_group"}
          source={MODEL_FK_FIELDS.PARENT_GROUP}
          reference={MODELS.GROUPS}
          validate={validateParentGroup}
          allowEmpty
        >
          <SelectInput
            label={"en.models.groups.name"}
            optionText={MODEL_FIELDS.NAME}
          />
        </ReferenceInput>
        { id && (
          <>
            <EditMetadata id={id} values={record ? record.metadata : null}  type={MODEL_FK_FIELDS.GROUP}/>
            <ConfigMetadata id={id} type={MODEL_FK_FIELDS.GROUP}/>
          </>
          )}
      </SimpleForm>
    </Edit>)
  }
};

const enhance = compose(
  translate,
  withStyles(styles),
);

BaseGroupEdit.propTypes = {
  translate: PropTypes.func.isRequired,
};


export const GroupEdit = enhance(BaseGroupEdit);
