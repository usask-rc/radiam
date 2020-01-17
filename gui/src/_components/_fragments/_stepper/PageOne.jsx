import React, { useState, Component } from 'react'
import {compose} from 'recompose/compose'
import { translate } from "ra-core"
import { required } from "react-admin"
import { withStyles } from '@material-ui/core/styles';
import { getAsyncValidateNotExists } from '../../../_tools/asyncChecker';
import { SimpleForm, SaveButton, TextInput, Toolbar,  ReferenceInput, SelectInput, DisabledInput } from "react-admin"
import { MODELS, WARNINGS, MODEL_FIELDS } from "../../../_constants/index"
import { Prompt } from 'react-router';
import { ImageField } from 'ra-ui-materialui/lib/field/ImageField';
import Button from '@material-ui/core/Button';
import NextButton from "../../ProjectStepper"

const styles =  {

}

/**
 * Check with the API whether a project with the name has already been created.
 */
const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID, name: MODEL_FIELDS.NAME, reject: "There is already a project with this name. Please pick another name." }, MODELS.PROJECTS);
const validateName = required('en.validate.project.name');

const validateAvatar = required('en.validate.project.avatar');

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

const PageOne = ({ translate, classes, values, handleNext, ...props }) => 
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

const enhance = compose(
    withStyles(styles),
    translate
);

export default enhance(PageOne)