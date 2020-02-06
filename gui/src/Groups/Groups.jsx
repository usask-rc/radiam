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
import {RESOURCE_OPERATIONS, MODELS, WARNINGS, ROLE_USER, MODEL_FK_FIELDS, MODEL_FIELDS} from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import { EditToolbar } from "../_components";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import PropTypes from 'prop-types';
import { Prompt } from 'react-router';
import RelatedUsers from "./RelatedUsers";
import { withStyles } from "@material-ui/core/styles";
import GroupTitle from "./GroupTitle.jsx";
import { isAdminOfAParentGroup, getGroupMembers } from "../_tools/funcs.jsx";
import { Toolbar, Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import { EditButton } from "ra-ui-materialui/lib/button";
import { GroupMemberForm } from "../GroupMembers/GroupMembers.jsx";
import UserDetails from "../Users/UserDetails.jsx";

const styles = {
  actions: {
    backgroundColor: "inherit"
  },
  root: {
    backgroundColor: "inherit"
  },
  header: {
    backgroundColor: "inherit"
  }
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

    <Datagrid rowClick={RESOURCE_OPERATIONS.SHOW}>
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
    if (data && !showEdit){
      isAdminOfAParentGroup(data.id).then(data => {
        setShowEdit(data)
      })
    }
  }, [data, showEdit])

  const {hasCreate, hasShow, hasEdit, hasList, ...rest} = props
  console.log("GroupShowActions props: ", props)

  if (showEdit){
    console.log("in groupShowActions, data is: ", data)
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

  let _isMounted = false
  useEffect(() => {
    _isMounted = true
    isAdminOfAParentGroup(props.id).then(data => {
      if (_isMounted){
        setCanEditGroup(data)
      }
    })
    return function cleanup() { 
      _isMounted = false;
    }
  }, [])

  useEffect(() => {
    _isMounted = true;
    
    if (props.id){
      const params={id: props.id, is_active: true}
      getGroupMembers(params).then((data) => {
        console.log("getGroupMembers returned data: ", data)
        if (_isMounted){
          setGroupMembers(data)
        }
        return data
      }).catch(err => console.error("err: ", err))
    }

    return function cleanup() { 
      _isMounted = false;
    }
  }, [createModal, editModal, viewModal])

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
          console.log("controllerprops in group: ", controllerProps)
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
            {createModal && <Dialog fullWidth open={createModal} onClose={() => {console.log("dialog close"); setCreateModal(false)}} aria-label="Add User">
              <DialogTitle>{`Add User`}</DialogTitle>
              <DialogContent>
                <GroupMemberForm group={controllerProps.record.id} setCreateModal={setCreateModal} {...props} />
              </DialogContent>
            </Dialog>
            }
            {editModal && <Dialog fullWidth open={editModal} onClose={() => {console.log("dialog close"); setEditModal(false)}} aria-label="Add User">
              <DialogContent>
                <GroupMemberForm basePath="/groupmembers" resource="groupmembers" setEditModal={setEditModal} record={{id: editModal.id, user: editModal.user.id, group: editModal.group, group_role: editModal.group_role.id}} />
              </DialogContent>
            </Dialog>
            }
            {viewModal && <Dialog fullWidth open={viewModal} onClose={() => {console.log("dialog close"); setViewModal(false)}} aria-label="Add User">
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

const GroupForm = props => 
{
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [data, setData] = useState({})
  
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      console.log("before save, isformdirty, data: ", isFormDirty, data)
      props.save(data)
    }
  }, [data])

  function handleSubmit(formData) {
    setIsFormDirty(false)
    setData(formData)
  }

  function handleChange(data){
    setIsFormDirty(true)
  }

  return(
    <SimpleForm
      {...props}
      toolbar={<EditToolbar />}
      asyncValidate={asyncValidate}
      asyncBlurFields={[ MODEL_FIELDS.NAME ]}
      onChange={handleChange}
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
      <Prompt when={isFormDirty} message={WARNINGS.UNSAVED_CHANGES}/>
    </SimpleForm>
  )
};

export const GroupCreate = props => {
  const { hasCreate, hasEdit, hasList, hasShow, ...other } = props;
  return (
    <Create {...props}>
      <GroupForm {...other} />
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

    const { basePath, classes, hasCreate, hasEdit, hasList, hasShow, record, translate, id, ...others } = this.props;

    return (<Edit basePath={basePath} actions={<MetadataEditActions showRelatedUsers={true} />} {...this.props}>
      <SimpleForm
        basePath={basePath}
        toolbar={<EditToolbar />}
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
          allowEmpty
        >
          <SelectInput
            label={"en.models.groups.name"}
            optionText={MODEL_FIELDS.NAME}
          />
        </ReferenceInput>
        { id && (
          <>
            <EditMetadata id={id} type={MODEL_FK_FIELDS.GROUP}/>
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
