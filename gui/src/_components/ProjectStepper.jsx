import React, { Component, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import compose from "recompose/compose";
import { connect } from 'react-redux';
import * as Constants from "../_constants/index";
import { DisabledInput } from 'ra-ui-materialui/lib/input';
import { Field } from 'redux-form'
import { getAPIEndpoint, httpClient, radiamRestProvider } from '../_tools';
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { GET_LIST, GET_ONE } from 'ra-core';
import {
  ImageField,
  ReferenceInput,
  required,
  SaveButton,
  SelectInput,
  SimpleForm,
  TextInput,
  Toolbar,
  translate,
} from "react-admin";
import { InputLabel, MenuItem, Select } from '@material-ui/core';
import MapForm from './_forms/MapForm';
import PropTypes from 'prop-types';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import { submitObjectWithGeo } from '../_tools/funcs';
import "../_components/components.css";
import { Prompt } from 'react-router';

const validateGroup = required('en.validate.project.group');
const validateName = required('en.validate.project.name');
const validatePrimaryContactUser = required('en.validate.project.primary_contact_user');
const validateAvatar = required('en.validate.project.avatar');

/**
 * This view lets us override the standard button submit to let the validation happen
 * but not save the project until the last step.
 */
class NextButtonView extends Component {

  handleClick = () => {
    const { handleNext, handleSubmit } = this.props;

    return handleSubmit(values => {
      handleNext();
    });
  };

  render() {
    const { handleBack, handleNext, handleSubmit, handleSubmitWithRedirect, ...props } = this.props;
    console.log("handleclick render props are: ", this.props)
    return (
      <SaveButton
        handleSubmitWithRedirect={this.handleClick}
        {...props}
      />
    );
  }
}

const NextButton = connect(undefined, {})(NextButtonView);

/**
 * A toolbar to show a next button if not on the last page, a back button if not on the first page
 * and finally a save button if on the last page.
 */
const ProjectStepperToolbar = ({ handleBack, handleNext, doSave, ...props }) => {
  return (
    <Toolbar {...props}>
      {handleBack ?
        <Button onClick={handleBack} >
          Back
          </Button>
        : null}
      {handleNext ?
        <NextButton
          label="Next"
          handleNext={handleNext}
        />
        : null}
      {doSave ?
        <SaveButton
          type="submit"
          {...props} />
        : null}
    </Toolbar>
  )
};

/**
 * Check with the API whether a project with the name has already been created.
 */
const asyncValidate = getAsyncValidateNotExists({ id: Constants.model_fields.ID, name: Constants.model_fields.NAME, reject: "There is already a project with this name. Please pick another name." }, Constants.models.PROJECTS);

const PageOne = ({ classes, values, handleNext, ...props }) => 
{
  const [dirty, setDirty] = useState(false)

  //TODO: make the `on dirty` thing work here.  For some reason, this page gets marked as dirty on entry as handleChange is instantly triggered.  Weird.
  const handleChange=(data) => {
    setDirty(true)
  }

return(
  <React.Fragment>
  <SimpleForm
    toolbar={<ProjectStepperToolbar
      handleNext={handleNext} />}
    asyncValidate={props.record.id ? null : asyncValidate} //validation is off on edits for now, as we have no way currently to enforce unique names and allow edits at the same time.
    asyncBlurFields={[Constants.model_fields.NAME]}
    
  >
    {props.record.id && <DisabledInput className="input-small" label={"en.models.projects.id"} source={Constants.model_fields.ID} defaultValue={props.record.id} />}
    <TextInput
      className="input-small"
      label={"en.models.projects.name"}
      source={Constants.model_fields.NAME}
      validate={validateName}
      defaultValue={props.record.name || ""}
      onChange={handleChange}
    />
    <ReferenceInput
      resource={Constants.models.PROJECTAVATARS}
      className="input-small"
      label="en.models.projects.avatar"
      validate={validateAvatar}
      allowEmpty={false}
      perPage={1000}
      sort={{ field: 'random', order: 'ASC' }}
      source={Constants.model_fields.AVATAR} reference={Constants.models.PROJECTAVATARS}
      defaultValue={props.record.avatar || ""}
    >
      <SelectInput
        source={Constants.model_fields.AVATAR_IMAGE}
        optionText={<ImageField classes={{ image: classes.image }} source={Constants.model_fields.AVATAR_IMAGE} />}
        onChange={handleChange}
         />
    </ReferenceInput>
    <TextInput
      className="input-medium"
      label={"en.models.projects.keywords"}
      source={Constants.model_fields.KEYWORDS}
      defaultValue={props.record.keywords || ""}
      onChange={handleChange}
    />
  </SimpleForm>
  <Prompt when={dirty} message={Constants.warnings.UNSAVED_CHANGES}/>
  </React.Fragment>
)};

//NOTE: what if we use the source parameter like everything else?  will this work???!?

class PageThree extends Component {
  constructor(props){
    super(props)
    this.state = {geo: this.props.record.geo, isDirty: false }
  }

  geoDataCallback = geo => {
    //send our geodata back up to the stepper, we don't have any reason to handle it here.
    console.log("receiving geodata from map in gDC: ", geo)

    if (this.state.geo !== this.props.record.geo){
      this.setState({geo: geo})
      this.setState({isFormDirty: true})
    }
  };

  handleSubmit = data => {
    this.setState({isFormDirty: false}, () => {
      submitObjectWithGeo(data, this.state.geo, this.props)
    }
    )
  };


  handleChange = data => {
    this.setState({isFormDirty: true})
  }

  render(){
    const { handleBack, record } = this.props
    return(
      <React.Fragment>
      <SimpleForm save={this.handleSubmit} redirect={Constants.resource_operations.LIST} onChange={this.handleChange} toolbar={<ProjectStepperToolbar doSave={true} handleBack={handleBack} />}>
        {record && 
          <MapForm content_type={'project'} recordGeo={record.geo} id={record.id} geoDataCallback={this.geoDataCallback}/>
        }
      </SimpleForm>
      <Prompt when={this.state.isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>

</React.Fragment>

    )
  }
}

class PageTwo extends Component {
  constructor(props) {
    super(props);
    this.state = { group: null, groupList: [], isFormDirty: false, userList: new Set() }
  }

  handleChange = (event, index, id, value) => {
    console.log("handlechange in pagetwo trigger")
    this.setState({ group: index, groupList: [], isFormDirty: true, userList: new Set() })
    this.getAllParentGroups(index)
  };

  componentDidMount() {
    //I don't know why this can't use dot notation, but apparently group appears in prop and can only be accessed in Dict notation.
    const { group, primary_contact_user } = this.props.record

    //Accessing in Edit Mode
    if (group) {
      this.setState({ group: group, primary_contact_user: primary_contact_user })
      this.getAllParentGroups(group)
      //TODO: ADM-1153 Despite receiving the Primary Contact User information, the value does not get filled into the drop-down by default.
    }
    else {
      //Accessing in Creation mode - is there anything extra needed here?
    }
  }

  getAllParentGroups = group_id => {
    //get this group and any parent group
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

    //get this group's details, then ascend if it has a parent.
    dataProvider(GET_ONE, Constants.models.GROUPS, { id: group_id }).then(response => {
      const responseGroup = response.data
      this.setState({ groupList: [...this.state.groupList, responseGroup] })

      if (responseGroup.parent_group !== null) {
        this.getAllParentGroups(responseGroup.parent_group);
      }

      this.getUserList(group_id)

    }).catch(err => {
      console.error("Error in getAllParentGroups: ", err)
    })
  };

  //TODO: this can result in duplicate users, but the functionality itself is just fine.  This eventually should be fixed but is just an aesthetic issue.
  getUserList = group => {

    const params = { filter: { group: group }, pagination: { page: 1, perPage: 100 }, sort: { field: Constants.model_fields.ID, order: "DESC" } }
    const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);

    dataProvider(GET_LIST, Constants.models.GROUPMEMBERS, params).then(response => {
      response.data.map(groupMember => {
        dataProvider(GET_ONE, Constants.models.USERS, {
          id: groupMember.user, is_active: groupMember.is_active
        }).then(response => {
          this.setState({ userList: new Set([...this.state.userList, response.data]) })

        })
        return groupMember
      })
    }).catch(err => {
      console.error("in useeffect hook in pagethree, error is: ", err)
    })
  };

  render() {
    const { handleBack, handleNext } = this.props
    const { group, primary_contact_user } = this.props.record
    const { userList } = this.state

    return (
      <React.Fragment>
    <SimpleForm redirect={Constants.resource_operations.LIST} toolbar={<ProjectStepperToolbar handleNext={handleNext} handleBack={handleBack} />}>
      <div>
        <ReferenceInput
          className="input-small"
          label={"en.models.projects.group"}
          reference={Constants.models.GROUPS}
          resource={Constants.models.GROUPS}
          source={Constants.model_fields.GROUP}
          validate={validateGroup}
          onChange={this.handleChange}
          defaultValue={group || ""}
        >
          <SelectInput optionText={Constants.model_fields.NAME} />
        </ReferenceInput>
      </div>
      <div>
        {(primary_contact_user || (userList && userList.size) > 0) &&
          <UserInput
            required
            label={"en.models.projects.primary_contact_user"}
            placeholder={`Primary Contact`}
            validate={validatePrimaryContactUser}
            className="input-small"
            users={userList} id={Constants.model_fields.PRIMARY_CONTACT_USER} name={Constants.model_fields.PRIMARY_CONTACT_USER}
            defaultValue={primary_contact_user} />
        }
      </div>
    </SimpleForm>
    <Prompt when={this.state.isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
    </React.Fragment>
    )
  }
}

const renderUserInput = ({ input, users }) => {
  return (<React.Fragment>
    <InputLabel htmlFor={Constants.model_fields.PRIMARY_CONTACT_USER}>{`Primary Contact`}</InputLabel>
    <Select id={Constants.model_fields.PRIMARY_CONTACT_USER} name={Constants.model_fields.PRIMARY_CONTACT_USER}
      {...input}
    >
      {users && [...users].map(user => {
        return (<MenuItem value={user.id} key={user.id}>{user.username}</MenuItem>)
      })}
    </Select>
  </React.Fragment>)
}

const UserInput = ({ source, ...props }) => <Field name={source} component={renderUserInput} {...props} />

export class ProjectStepper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeStep: 0,
      group: {}
    };
  }

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  render() {
    const { classes, translate } = this.props;
    const steps = [translate('en.models.projects.steps.name'), translate('en.models.projects.steps.researchgroup'), translate('en.models.projects.steps.map')];
    const { activeStep } = this.state;

    return (
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {index === 0 ?
                <PageOne classes={classes} handleNext={this.handleNext} {...this.props} /> :
                index === 1 ? 
                <PageTwo classes={classes} handleNext={this.handleNext} handleBack={this.handleBack} {...this.props} />
                :
                <PageThree classes={classes} handleBack={this.handleBack} mode={this.props.mode} save={this.props.save} {...this.props}/>
              }
            </StepContent>
          </Step>
        ))}
      </Stepper>
    );
  }
}

ProjectStepper.propTypes = {
  translate: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

const enhance = compose(
  translate,
);

export default enhance(ProjectStepper);
