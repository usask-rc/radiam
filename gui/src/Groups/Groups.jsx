//Groups.jsx
import React, { Component, useEffect, useState } from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateInput,
  Edit,
  Filter,
  List,
  LongTextInput,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  ShowController,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  translate,
  withTranslate,
} from "react-admin";
import compose from "recompose/compose";
import { ConfigMetadata, EditMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import * as Constants from "../_constants/index";
import CustomPagination from "../_components/CustomPagination";
import { EditToolbar } from "../_components";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import PropTypes from 'prop-types';
import { Prompt } from 'react-router';
import RelatedUsers from "./RelatedUsers";
import { withStyles } from "@material-ui/core/styles";
import GroupTitle from "./GroupTitle.jsx";
import { FormDataConsumer } from "ra-core";
import { isAdminOfAParentGroup } from "../_tools/funcs.jsx";
import { Toolbar } from "@material-ui/core";
import { EditButton } from "ra-ui-materialui/lib/button";

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
    <DateInput source={Constants.model_fields.DATE_UPDATED} />
    <TextInput
      label={"en.models.groups.name"}
      source={Constants.model_fields.NAME}
    />
    <TextInput
      label={"en.models.groups.description"}
      source={Constants.model_fields.DESCRIPTION}
    />
    <ReferenceInput
      label={"en.models.groups.parent_group"}
      source={Constants.model_fk_fields.PARENT_GROUP}
      reference={Constants.models.GROUPS}
    >
      <SelectInput optionText={Constants.model_fields.NAME} />
    </ReferenceInput>
    <BooleanInput
      label={"en.models.groups.active"}
      defaultValue={true}
      source={Constants.model_fields.ACTIVE} />
  </Filter>
));

export const GroupList = withStyles(styles)(({ classes, ...props }) => {
  return(
  <List
    {...props}
    classes={{
      root: classes.root,
      header: classes.header,
      actions: classes.actions
    }}
    exporter={false}
    filters={<GroupFilter />}
    sort={{ field: Constants.model_fields.DATE_UPDATED, order: "DESC" }}
    perPage={10}
    pagination={<CustomPagination />}
    bulkActionButtons={false}>

    <Datagrid rowClick={Constants.resource_operations.SHOW}>
      <TextField
        label={"en.models.groups.name"}
        source={Constants.model_fields.NAME}
      />
      <TextField
        label={"en.models.groups.description"}
        source={Constants.model_fields.DESCRIPTION}
      />
      <ReferenceField
        linkType={false}
        label={"en.models.groups.parent_group"}
        source={Constants.model_fk_fields.PARENT_GROUP}
        reference={Constants.models.GROUPS}
        allowEmpty
      >
        <TextField
          label={"en.models.groups.name"}
          source={Constants.model_fields.NAME}
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
const GroupShowActions = withStyles(actionStyles)(({basePath, data, classes}) => {
  const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER));
  const [showEdit, setShowEdit] = useState(user.is_admin)

  useEffect(() => {
    if (data && !showEdit){
      isAdminOfAParentGroup(data.id).then(data => {
        setShowEdit(data)
      })
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

export const GroupShow = withStyles(styles)(withTranslate(({ classes, permissions, translate, ...props}) => {
    return(
  <Show actions={<GroupShowActions />} {...props}>
    <SimpleShowLayout>
      <GroupTitle prefix={"Viewing"} />
      <RelatedUsers {...props} />
      <TextField
        label={"en.models.groups.name"}
        source={Constants.model_fields.NAME}
      />
      <TextField
        label={"en.models.groups.description"}
        source={Constants.model_fields.DESCRIPTION}
      />
      <BooleanField
        label={"en.models.generic.active"}
        source={Constants.model_fields.ACTIVE}
      />
      <ReferenceField
        linkType={false}
        label={"en.models.groups.parent_group"}
        source={Constants.model_fk_fields.PARENT_GROUP}
        reference={Constants.models.GROUPS}
        allowEmpty
      >
        <TextField
          label={"en.models.groups.name"}
          source={Constants.model_fields.NAME}
        />
      </ReferenceField>

      {/** Needs a ShowController to get the record into the ShowMetadata **/}
      <ShowController translate={translate} {...props}>
        { controllerProps => (
          <ShowMetadata
            type={Constants.model_fk_fields.GROUP}
            translate={translate}
            record={controllerProps.record}
            basePath={controllerProps.basePath}
            resource={controllerProps.resource}
            id={controllerProps.record.id}
            props={props}
          />
        )}
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

const asyncValidate = getAsyncValidateNotExists({id: Constants.model_fields.ID, name : Constants.model_fields.NAME, reject: "There is already a group with this name. Please pick another name for your group." }, Constants.models.GROUPS);

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
      asyncBlurFields={[ Constants.model_fields.NAME ]}
      onChange={handleChange}
      save={handleSubmit}
    >
      <FormDataConsumer>
        {({formData, ...rest}) => {
          return <GroupTitle prefix={"Creating Group"} />
        }}
      </FormDataConsumer>
      <TextInput
        label={"en.models.groups.name"}
        source={Constants.model_fields.NAME}
        validate={validateName}
      />
      <LongTextInput
        label={"en.models.groups.description"}
        source={Constants.model_fields.DESCRIPTION}
        validate={validateDescription}
      />
      <BooleanInput
        label={"en.models.generic.active"}
        defaultValue={true}
        source={Constants.model_fields.ACTIVE}
      />
      <ReferenceInput
        label={"en.models.groups.parent_group"}
        source={Constants.model_fk_fields.PARENT_GROUP}
        reference={Constants.models.GROUPS}
        validate={validateParentGroup}
        allowEmpty
      >
        <SelectInput
          label={"en.models.groups.name"}
          optionText={Constants.model_fields.NAME}
        />
      </ReferenceInput>
      <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
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

    const { basePath, classes, hasCreate, hasEdit, hasList, hasShow, record, translate, ...others } = this.props;

    return <Edit basePath={basePath} actions={<MetadataEditActions showRelatedUsers={true} {...this.props} />} {...others}>
      <SimpleForm
        basePath={basePath}
        toolbar={<EditToolbar />}
        redirect={Constants.resource_operations.LIST}
      >
        <FormDataConsumer>
          {({formData, ...rest}) => {
            return <GroupTitle record={formData} prefix={"Updating"} />
          }}
        </FormDataConsumer>
        <TextInput
          label={"en.models.groups.name"}
          source={Constants.model_fields.NAME}
          validate={validateName}
        />
        <LongTextInput
          label={"en.models.groups.description"}
          source={Constants.model_fields.DESCRIPTION}
          validate={validateDescription}
          style={{"max-width": "80%"}}
        />
        <BooleanInput
          label={"en.models.generic.active"}
          defaultValue={true}
          source={Constants.model_fields.ACTIVE}
        />
        <ReferenceInput
          label={"en.models.groups.parent_group"}
          source={Constants.model_fk_fields.PARENT_GROUP}
          reference={Constants.models.GROUPS}
          allowEmpty
        >
          <SelectInput
            label={"en.models.groups.name"}
            optionText={Constants.model_fields.NAME}
          />
        </ReferenceInput>
        { this.props.id && (
          <React.Fragment>
            <EditMetadata id={this.props.id} type={Constants.model_fk_fields.GROUP}/>
            <ConfigMetadata id={this.props.id} type={Constants.model_fk_fields.GROUP}/>
          </React.Fragment>
          )}
      </SimpleForm>
    </Edit>
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
