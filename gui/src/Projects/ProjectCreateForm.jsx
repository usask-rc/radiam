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
import { getUsersInGroup, submitObjectWithGeo, toastErrors } from "../_tools/funcs";
import { Typography } from "@material-ui/core";
import MapForm from "../_components/_forms/MapForm";
import { FormDataConsumer, required } from "ra-core";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import ProjectTitle from "./ProjectTitle";
import ChipInput from "material-ui-chip-input"
import {Redirect} from "react-router-dom"
import { toast } from "react-toastify"


const validateGroup = required('en.validate.project.group');
const validateName = required('en.validate.project.name');
const validatePrimaryContactUser = required('en.validate.project.primary_contact_user');

export const ProjectCreateForm = ({classes, translate, mode, save, ...props}) => {
    const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID, name: MODEL_FIELDS.NAME, reject: "There is already a project with this name. Please pick another name." }, MODELS.PROJECTS);
    const [groupContactList, setGroupContactList] = useState([])
    const [loading, setLoading] = useState(false)
    const [group, setGroup] = useState(props.record ? props.record.group : null)
    const [error, setError] = useState(null)
    const [geo, setGeo] = useState(props.record ? props.record.geo : null)
    const [keywords, setKeywords] = useState(props.record && props.record.keywords ? props.record.keywords.split(",") : "")
    const [redirect, setRedirect] = useState(null)
    const handleChipChange = (data) => {
      console.log("chip change data: ", data)
      setKeywords(data)
    }

    const handleChipAdd = (data) => {
      console.log("keywords added, set to: ", [...keywords, data])

      setKeywords([...keywords, data])
    }
    const handleChipDelete = (data, idx) => {
      let tempKeywords = [...keywords]
      tempKeywords.splice(idx, 1)
      console.log("keywords deleted, set to: ", tempKeywords)
      setKeywords(tempKeywords)
    }

    const handleSubmit=(data) => {

      const { record } = props
      console.log("keywords in submit is: ", keywords)
      let tempKeywords = keywords.join(",")
      data.keywords = tempKeywords
      props.resource = "projects"

      data.number = null
      data.metadata = null

      if (record.number){
        data.number = record.number
      }
      if (record.metadata){ //TODO: no, because it could have updated.
        data.metadata = record.metadata
      }
      if (record.id){
        data.id = record.id
      }

      delete data.geo

      if (!props.record){
        submitObjectWithGeo(data, geo, props).then(data => {
          toast.success("Project successfully created")
          setRedirect("/projects")
        })
        .catch(err => {
          console.log("error in creating geo: ", err)
          toast.error("Error Updating Project, please ensure the form is fully completed.")

        })

      }
      else{
        submitObjectWithGeo(data, geo, props).then(data => {
          toast.success("Project successfully updated")
          setRedirect("/projects")
        })
        .catch(err => 
          {
            console.log("error in updating geo: ", err)
            toast.error("Error Updating Project, please ensure the form is fully completed.")
          })
      }
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

    const { record } = props

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
          defaultValue={record ? record.name : ""}
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
          defaultValue={record ? record.avatar : null}
        >
          <SelectInput
            source={MODEL_FIELDS.AVATAR_IMAGE}
            optionText={<ImageField classes={{image: classes.image}} source={MODEL_FIELDS.AVATAR_IMAGE} />}
          />
        </ReferenceInput>
        <ChipInput
          label={translate("en.models.projects.keywords")} //typically dont need to invoke translate, this is custom so we do.
          newChipKeys={[',']}
          onAdd={(data) => handleChipAdd(data)}
          onDelete={(data, idx) => handleChipDelete(data, idx)}
          onChange={handleChipChange}
          value={keywords}
        />
        <ReferenceInput
          resource={MODELS.GROUPS}
          className="input-small"
          label={"en.models.projects.group"}
          source={MODEL_FIELDS.GROUP}
          reference={MODELS.GROUPS}
          onChange={(data) => groupChange(data)}
          defaultValue={record ? record.group : null}
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
              defaultValue={record ? record.primary_contact_user : null}
          />
          }
        }}
        </FormDataConsumer>
        <FormDataConsumer>
          {({formData, ...rest} ) =>
          {
            return(
              <>
              <div>
                <Typography className={classes.mapFormHeader}>{`GeoLocation Information`}</Typography>
              </div>
              <div>
                <MapForm content_type={'project'} recordGeo={geo} id={record && record.id ? record.id : null} geoDataCallback={setGeo}/>
              </div>
              </>
            )
          }
          }
        </FormDataConsumer>
        {redirect && <Redirect to={redirect} /> }
      </SimpleForm>
    )
  }