//ProjectForm.jsx
import React, {useEffect, useState} from "react";
import {
  ImageField,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from 'react-admin';
import { MODEL_FIELDS, MODEL_FK_FIELDS, MODELS, RESOURCE_OPERATIONS} from "../_constants/index";
import "../_components/components.css";
import { getUsersInGroup, submitObjectWithGeo } from "../_tools/funcs";
import { Typography, Button } from "@material-ui/core";
import MapForm from "../_components/_forms/MapForm";
import { FormDataConsumer, required } from "ra-core";
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import ProjectTitle from "./ProjectTitle";
import ChipInput from "material-ui-chip-input"
import {Redirect} from "react-router-dom"
import { toast } from "react-toastify"
import { EditMetadata, ConfigMetadata } from "../_components/Metadata";


const validateGroup = required('en.validate.project.group');
const validateName = required('en.validate.project.name');
const validatePrimaryContactUser =[required()]

export const ProjectForm = ({classes, translate, mode, save, ...props}) => {
    const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID, name: MODEL_FIELDS.NAME, reject: "There is already a project with this name. Please pick another name." }, MODELS.PROJECTS);
    const [groupContactList, setGroupContactList] = useState([])
    const [loading, setLoading] = useState(false)
    const [group, setGroup] = useState(props.record ? props.record.group : null)
    const [geo, setGeo] = useState(props.record ? props.record.geo : null)
    const [keywords, setKeywords] = useState(props.record && props.record.keywords ? props.record.keywords.split(",") : [])
    const [redirect, setRedirect] = useState(null)
    const [showMap, setShowMap] = useState(props.record && props.record.geo && props.record.geo.geojson && props.record.geo.geojson.features.length > 0 ? true : false)
    
    const handleChipChange = (data) => {
      setKeywords(data)
    }

    const handleChipAdd = (data) => {
      setKeywords([...keywords, data])
    }
    
    const handleChipDelete = (data, idx) => {
      let tempKeywords = [...keywords]
      tempKeywords.splice(idx, 1)
      setKeywords(tempKeywords)
    }

    const handleSubmit=(data) => {
      const { record } = props
      props.resource = "projects"
      data.keywords = keywords ? keywords.join(",") : ""
      data.number = null

      //what is this field?
      if (record.number){
        data.number = record.number
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
          console.error("error in creating geo: ", err)
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
            console.error("error in updating geo: ", err)
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
            //console.log("getusersingroup result: ", contacts)
            setGroupContactList(contacts)
            setLoading(false)
          }
        }).catch(err => {
          console.error("in useEffect, err: ", err)
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
        <ProjectTitle prefix={record && record.name ? `Updating Project` : `Creating Project`} />
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

        {!loading && group && groupContactList.length === 0 &&
              <Typography><a href={`/#/${MODELS.GROUPS}/${group}/${RESOURCE_OPERATIONS.SHOW}`}>{`There are no users in the selected Group - Click here to add one`}</a></Typography>
        }
        <SelectInput 
            source={"primary_contact_user"} 
            label={"en.models.projects.primary_contact_user"}
            optionText={"username"} 
            optionValue={"id"} 
            className={classes.selectPCU}
            choices={groupContactList}
            disabled={groupContactList.length === 0 ? true : false}
            validate={validatePrimaryContactUser} //this input has troubles showing an error message when invalid
            defaultValue={record ? record.primary_contact_user : null}
          />
        { record && (
          <>
            <EditMetadata record={record} type={MODEL_FK_FIELDS.PROJECT}/>
            <ConfigMetadata record={record} type={MODEL_FK_FIELDS.PROJECT}/>
          </>
        )}
        <FormDataConsumer>
          {({formData, ...rest} ) =>
          {
            return(
              <>
              <div className={classes.preMapArea}>
                <Typography className={classes.mapFormHeader}>{``}</Typography>
                <Button variant="contained" color={showMap ? "secondary" : "primary"} onClick={() => setShowMap(!showMap)}>{showMap ? `Hide Map Form` : `Show Map Form`}</Button>
              </div>
              {showMap && 
              <div>
                <MapForm content_type={'project'} recordGeo={geo} id={record && record.id ? record.id : null} geoDataCallback={setGeo}/>
              </div>
              }
              </>
            )
          }
          }
        </FormDataConsumer>
        {redirect && <Redirect to={redirect} /> }
      </SimpleForm>
    )
  }
