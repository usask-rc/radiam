//ProjectStepper.jsx
import React, { Component, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import compose from "recompose/compose";
import { connect } from 'react-redux';
import {MODEL_FIELDS, MODELS, WARNINGS, RESOURCE_OPERATIONS} from "../_constants/index";
import { DisabledInput } from 'ra-ui-materialui/lib/input';
import { Field } from 'redux-form'
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
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
  FormDataConsumer,
} from "react-admin";
import { InputLabel, MenuItem, Select } from '@material-ui/core';
import MapForm from './_forms/MapForm';
import PropTypes from 'prop-types';
import Typography from "@material-ui/core/Typography"
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import { submitObjectWithGeo,  getPrimaryContactCandidates, getParentGroupList } from '../_tools/funcs';
import "../_components/components.css";
import { Prompt } from 'react-router';
import ProjectTitle from '../Projects/ProjectTitle';

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

export const NextButton = connect(undefined, {})(NextButtonView);

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
const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID, name: MODEL_FIELDS.NAME, reject: "There is already a project with this name. Please pick another name." }, MODELS.PROJECTS);

const PageOne = ({ classes, values, handleNext, ...props }) => 
{
  const [dirty, setDirty] = useState(false)

  //TODO: make the `on dirty` thing work here.  For some reason, this page gets marked as dirty on entry as handleChange is instantly triggered.  Weird.
  const handleChange=(data) => {
    setDirty(true)
  }

return(
  <>
  <SimpleForm
    toolbar={<ProjectStepperToolbar
      handleNext={handleNext} />}
    asyncValidate={props.record.id ? null : asyncValidate} //validation is off on edits for now, as we have no way currently to enforce unique names and allow edits at the same time.
    asyncBlurFields={[MODEL_FIELDS.NAME]}
    
  >
    {props.record.id && <DisabledInput className="input-small" label={"en.models.projects.id"} source={MODEL_FIELDS.ID} defaultValue={props.record.id} />}
    <TextInput
      className="input-small"
      label={"en.models.projects.name"}
      source={MODEL_FIELDS.NAME}
      validate={validateName}
      defaultValue={props.record.name || ""}
      onChange={handleChange}
    />
    <ReferenceInput
      resource={MODELS.PROJECTAVATARS}
      className="input-small"
      label="en.models.projects.avatar"
      validate={validateAvatar}
      allowEmpty={false}
      perPage={1000}
      sort={{ field: 'random', order: 'ASC' }}
      source={MODEL_FIELDS.AVATAR} reference={MODELS.PROJECTAVATARS}
      defaultValue={props.record.avatar || ""}
    >
      <SelectInput
        source={MODEL_FIELDS.AVATAR_IMAGE}
        optionText={<ImageField classes={{ image: classes.image }} source={MODEL_FIELDS.AVATAR_IMAGE} />}
        onChange={handleChange}/>
    </ReferenceInput>
    <TextInput
      className="input-medium"
      label={"en.models.projects.keywords"}
      source={MODEL_FIELDS.KEYWORDS}
      defaultValue={props.record.keywords || ""}
      onChange={handleChange}
    />
  </SimpleForm>
  <Prompt when={dirty} message={WARNINGS.UNSAVED_CHANGES}/>
  </>
)};

const PageTwo = ({classes, translate, handleBack, handleNext }) => {
  const [group, setGroup] = useState(null) //we will never have a group on entry
  const [groupContactList, setGroupContactList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (group){
      setLoading(true)
      getParentGroupList(group).then(data => {
          getPrimaryContactCandidates(data).then(contacts => {
            setGroupContactList(contacts)
            setLoading(false)
          }).catch(err => {
            console.error("in getprimarycontactcandidates, err: ", err)
          })
      }).catch(err => {
        console.error("in pagetwo, err returned from getparentgrouplist: ", err)
      })
    }
  }, [group])

  return (
    <>
  <SimpleForm redirect={RESOURCE_OPERATIONS.LIST} toolbar={<ProjectStepperToolbar handleNext={handleNext} handleBack={handleBack} />}>
    <FormDataConsumer>
    {({formData, ...rest}) => {
        if (formData && formData.group !== group){
          setGroup(formData.group)
        }
        return(
          <div>
            <div>
              <ReferenceInput
                className="input-small"
                label={"en.models.projects.group"}
                reference={MODELS.GROUPS}
                resource={MODELS.GROUPS}
                source={MODEL_FIELDS.GROUP}
                validate={validateGroup}
              >
                <SelectInput optionText={MODEL_FIELDS.NAME} />
              </ReferenceInput>
            </div>
            {!loading && groupContactList.length > 0 ?
            <div>
              <UserInput
                required
                label={"en.models.projects.primary_contact_user"}
                placeholder={`Primary Contact`}
                validate={validatePrimaryContactUser}
                className="input-small"
                users={groupContactList} 
                id={MODEL_FIELDS.PRIMARY_CONTACT_USER} 
                name={MODEL_FIELDS.PRIMARY_CONTACT_USER}
              />
            </div>
            : !loading && !group ? 
            <div>
              {`Select a Research Group to manage this Project`}
            </div>
            : !loading && groupContactList.length === 0 ?
            <div>
              {formData && formData.group && <Typography><a href={`/#/researchgroups/${formData.group}/show`}>{`No users in Group - Click here to add one`}</a></Typography>}
            </div>
            :
            <div>
              {`Loading Associated Users...`}
            </div>
            }
          </div>
        )}}
    </FormDataConsumer>
  </SimpleForm>
  </>
  )
}

const PageThree = ({handleBack, record, classes, translate, ...props}) => {

  const [geo, setGeo] = useState(null)

  const geoDataCallback = callbackGeo => {
    const pageGeo = geo
    if (pageGeo !== callbackGeo){
      setGeo(callbackGeo)
    }
  }

  const handleSubmit = (data) => {
    submitObjectWithGeo(data, geo, props)
  };

  return(
    <>
      <SimpleForm save={handleSubmit} redirect={RESOURCE_OPERATIONS.LIST} toolbar={<ProjectStepperToolbar doSave={true} handleBack={handleBack} />}>
          {record && 
            <MapForm content_type={'project'} recordGeo={geo} id={record.id} geoDataCallback={geoDataCallback}/>
          }
      </SimpleForm>
    </>
  )
}

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

export class ProjectStepper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeStep: 0,
      group: {}
    };
  }

  handleNext = (data) => {
    console.log("handlenext data: ", data)
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
    const { classes, translate, mode, save} = this.props;
    const steps = [translate('en.models.projects.steps.name'), translate('en.models.projects.steps.researchgroup'), translate('en.models.projects.steps.map')];
    const { activeStep } = this.state;

    return (
      <>
        <ProjectTitle prefix={`Creating Project`} />
      <Stepper activeStep={activeStep} orientation="vertical">

        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {index === 0 ?
                <PageOne handleNext={this.handleNext} {...this.props} /> :
                index === 1 ? 
                <PageTwo classes={classes} translate={translate} handleNext={this.handleNext} handleBack={this.handleBack} {...this.props} />
                :
                <PageThree classes={classes} handleBack={this.handleBack} mode={mode} save={save} {...this.props}/>
              }
            </StepContent>
          </Step>
        ))}
      </Stepper>
      </>
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
