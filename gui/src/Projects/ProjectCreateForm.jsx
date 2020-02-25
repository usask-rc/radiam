//ProjectCreateForm.jsx
import React, {useEffect, useState} from "react";
import {
  ImageField,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import { MODEL_FIELDS, MODELS, RESOURCE_OPERATIONS} from "../_constants/index";
import "../_components/components.css";
import { getUsersInGroup, submitObjectWithGeo } from "../_tools/funcs";
import { Typography } from "@material-ui/core";
import MapForm from "../_components/_forms/MapForm";
import { FormDataConsumer, required } from "ra-core";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import ProjectTitle from "./ProjectTitle";

const validateGroup = required('en.validate.project.group');
const validateName = required('en.validate.project.name');
const validatePrimaryContactUser = required('en.validate.project.primary_contact_user');

export const ProjectCreateForm = ({classes, translate, mode, save, ...props}) => {
    const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID, name: MODEL_FIELDS.NAME, reject: "There is already a project with this name. Please pick another name." }, MODELS.PROJECTS);
  
    const [groupContactList, setGroupContactList] = useState([])
    const [loading, setLoading] = useState(false)
    const [group, setGroup] = useState(null)
    const [error, setError] = useState(null)
  
    const handleSubmit=(data) => {
      console.log("handleSubmit data is: ", data)
      props.resource = "projects"
      data.number = null
      data.metadata = null
      const dataGeo = data.geo //this must be excised from dataGeo to prevent a 400 error on submission for a project
      delete data.geo
      submitObjectWithGeo(data, dataGeo, props)
    }

    const groupChange = (data) => {
      setGroup(data.target.value)
    }
  
    useEffect(() => {
      let _isMounted = true
      if (group){
        setLoading(true)
        getUsersInGroup({id: group, is_active: true}).then(contacts => {
          if (_isMounted){
            console.log("getusersingroup result: ", contacts)
            setGroupContactList(contacts)
            setLoading(false)
          }
        }).catch(err => {
          console.error("in getprimarycontactcandidates, err: ", err)
          setError(err)
        })
      }
      //when we unmount, lock out the component from being able to use the state
      return function cleanup() {
        _isMounted = false;
    }
    }, [group])
  
    return(
      <SimpleForm
      asyncValidate={asyncValidate} //validation is off on edits for now, as we have no way currently to enforce unique names and allow edits at the same time.
      asyncBlurFields={[MODEL_FIELDS.NAME]}
      save={handleSubmit}
      >
        <ProjectTitle prefix={`Creating Project`} />
        <TextInput
          className="input-small"
          label={"en.models.projects.name"}
          source={MODEL_FIELDS.NAME}
          validate={validateName}
        />
        <ReferenceInput
          resource={MODELS.PROJECTAVATARS}
          className="input-small"
          label="en.models.projects.avatar"
          required
          allowEmpty={false}
          perPage={1000}
          sort={{ field: 'random', order: 'ASC' }}
          source={MODEL_FIELDS.AVATAR} reference={MODELS.PROJECTAVATARS}
        >
          <SelectInput
            source={MODEL_FIELDS.AVATAR_IMAGE}
            optionText={<ImageField classes={{image: classes.image}} source={MODEL_FIELDS.AVATAR_IMAGE} />}
          />
        </ReferenceInput>
        <TextInput
          className="input-medium"
          label={"en.models.projects.keywords"}
          multiline
          source={MODEL_FIELDS.KEYWORDS}
        />
        <ReferenceInput
          resource={MODELS.GROUPS}
          className="input-small"
          label={"en.models.projects.group"}
          source={MODEL_FIELDS.GROUP}
          reference={MODELS.GROUPS}
          onChange={(data) => groupChange(data)}
          validate={validateGroup}
          required>
          <SelectInput optionText={MODEL_FIELDS.NAME} />
        </ReferenceInput>
        <FormDataConsumer>
          {({formData, ...rest}) => {

            console.log("groupContactList length:", groupContactList.length, groupContactList)
          if (loading){
            return(<div>
              <Typography>{`Loading Associated Users...`}</Typography>
            </div>)
          }
          else if (!loading && formData.group && groupContactList.length === 0){
            return (
            <div>
              <Typography><a href={`/#/${MODELS.GROUPS}/${formData.group}/${RESOURCE_OPERATIONS.SHOW}`}>{`There are no users to select in this Group - Click here to add one`}</a></Typography>
            </div>
            )
          }
          else{
            return <SelectInput 
              source={"primary_contact_user"} 
              label={"en.models.projects.primary_contact_user"}
              optionText={"username"} 
              optionValue={"id"} 
              className={classes.selectPCU}
              choices={groupContactList}
              disabled={formData.group ? false : true}
              validate={validatePrimaryContactUser}
          />
          }
        }}
        </FormDataConsumer>
        <FormDataConsumer>
          {({formData, ...rest} ) =>
          {
            //NOTE: This FormDataConsumer area is required for the map implementation.
            const geoDataCallback = geo => {
              formData.geo = geo
            };
  
            return(
              <>
              <div>
                <Typography className={classes.mapFormHeader}>{`GeoLocation Information`}</Typography>
              </div>
              <div>
                <MapForm content_type={'project'} recordGeo={null} id={null} geoDataCallback={geoDataCallback}/>
              </div>
              </>
            )
          }
          }
        </FormDataConsumer>
      </SimpleForm>
    )
  }