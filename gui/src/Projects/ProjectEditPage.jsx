//Projects.jsx
import React, {Component } from "react";
import {
  Create,
  Datagrid,
  Edit,
  Filter,
  ImageField,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SelectInput,
  Show,
  ShowController,
  SimpleForm,
  Tab,
  TabbedShowLayout,
  TextField,
  TextInput,
  translate,
  withTranslate,
} from 'react-admin';

import { Field } from 'redux-form'
import { withStyles } from "@material-ui/core/styles";
import * as Constants from "../_constants/index";
import { EditMetadata, ConfigMetadata, MetadataEditActions, ShowMetadata } from "../_components/Metadata.jsx";
import "../_components/components.css";
import { getGroupUsers, getGroupData, getUsersInGroup, submitObjectWithGeo } from "../_tools/funcs";
import { InputLabel, Select, MenuItem } from "@material-ui/core";
import MapForm from "../_components/_forms/MapForm";


const styles = {}

const validateGroup = required('en.validate.project.group');
const validateName = required('en.validate.project.name');
const validatePrimaryContactUser = required('en.validate.project.primary_contact_user');

//you'd think there would be an easier way to do this, and I'm sure there is, but sending a hook down here to change the value works.  touch it at your own risk.
    const renderUserInput = ({ input, users, ...props }) => {
    
        const handleChange=(e) => {
            console.log("handlechange in renderuserinput called: ", e)
        }
    
        return (<React.Fragment>
        <InputLabel htmlFor={Constants.model_fields.PRIMARY_CONTACT_USER}>{`Primary Contact`}</InputLabel>
        <Select value={props.defaultValue} onChange={handleChange} id={Constants.model_fields.PRIMARY_CONTACT_USER} name={Constants.model_fields.PRIMARY_CONTACT_USER}
        >
            {users && [...users].map(user => {
            return (<MenuItem value={user.id} key={user.id}>{user.username}</MenuItem>)
            })}
        </Select>
        </React.Fragment>)
    }
    
    const UserInput = ({ source, ...props }) => {
        return(<Field name={source} component={renderUserInput} {...props} />)}

class ProjectEditPage extends Component {
    state = {}
    
    constructor(props){
        super(props)
        this.state = {}
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.getAllParentGroups = this.getAllParentGroups.bind(this)
        this.getPrimaryContactCandidates = this.getPrimaryContactCandidates.bind(this)
        this.geoDataCallback = this.geoDataCallback.bind(this)
        this.handleSelectChange = this.handleSelectChange.bind(this)
    }

    componentDidMount(){
        console.log("this props in cdm is: ", this.props)
        if (this.props.group){
            this.getAllParentGroups(this.props.group)
        }
        this.setState({group:this.props.group, groupContactCandidates: {}, groupList: this.props.group ? this.props.group : [], primary_contact_user: this.props.primary_contact_user, name: this.props.name, avatar: this.props.avatar, keywords: this.props.keywords})
    }

/*
    useEffect(() => {
        _isMounted = true
        if (projectGroup !== null){
          getAllParentGroups(projectGroup)
        }
    
        //if we unmount, lock out the component from being able to use the state
        return function cleanup() {
          _isMounted = false;
        }
      }, [projectGroup])
  */  
      //TODO: handle potential setstate on unmounted component
    getAllParentGroups = group_id => {
        if (group_id !== null){
            getGroupData(group_id).then(
            data => {
                console.log("getgroupdata : ", data)
                let tempGroupList = this.state.groupList //grouplist is a list of all parent groups including the current group
                tempGroupList.push(data)

                this.setState({groupList: tempGroupList})
                this.getAllParentGroups(data.parent_group)

                return data
            }
            ).catch(err => {
            console.error("error returned in getallparentgroups: ", err)})
        }
        else{
            //now get a list of users in each group
            this.getPrimaryContactCandidates()
        }
    };

    getPrimaryContactCandidates = () => {
        if (this.state.groupList){
            let iteratedGroups = []

            

            this.state.groupList.map(group => {
            getUsersInGroup(group).then(data => {

                let tempGroupContactCandidates = this.state.groupContactCandidates

                data.map(item => {
                    tempGroupContactCandidates[item.id] = item
                })

                this.setState({groupContactCandidates: tempGroupContactCandidates})


                iteratedGroups.push(group)

                if (iteratedGroups.length === this.state.groupList.length){
                let groupContactList = []

                Object.keys(tempGroupContactCandidates).map(key => {
                    groupContactList.push(this.state.groupContactCandidates[key])                    
                })

                //TODO: why is this also necessary when considering the candidates list above?
                this.setState({groupContactList: groupContactList})
                }
                
            }).catch(err => console.error('error returned from getgroupusers is: ', err))
            })
        }
        else{
            console.error("no group selected from which to provide candidate contacts")
        }
        }


    geoDataCallback = geo => {
        if (geo && Object.keys(geo).length > 0) {
    
            this.setState({geo: geo})
            
            //this isn't needed unless we re-introduce the geoJSON text form.
            //this.setState({geoText: JSON.stringify(geo.geojson.features, null, 2)}, () => this.setState({jsonTextFormKey: this.state.jsonTextFormKey + 1})));
        } else {
            //this will likely have to be changed
            this.setState({geo: null})
        }
    }
    handleSubmit(e) {
        console.log('handlesubmit e is: ', e)
        //submitObjectWithGeo()
        }
    
    //this is set to onchange in simpleform - if we dont have a target, all values are sent to handlechange e in the e value with their proper parameters.
    handleChange(e) {
        console.log("handleChange e: ", e)
    }

    handleSelectChange(e, value, prevValue, target){
        if (target === 'group'){
            if (prevValue !== value){
                this.setState({groupContactCandidates: {}, groupContactList: []}, {[target]:value}, this.getAllParentGroups(value))
            }
        }
    }


    render() { 
        console.log("groupContactList is: ", this.state.groupContactList)
        const { classes, permissions, record, ...others } = this.props;
        const { primary_contact_user } = this.state
        
        
        return (<SimpleForm redirect={Constants.resource_operations.LIST} save={this.handleSubmit} onChange={this.handleChange}>
            <TextInput
            className="input-small"
            label={"en.models.projects.name"}
            source={Constants.model_fields.NAME}
            defaultValue={record.name}
            validate={validateName} />
            <ReferenceInput
            resource={Constants.models.PROJECTAVATARS}
            className="input-small"
            label={`Icon`} 
            perPage={100} 
            defaultValue={record.avatar}
            source={Constants.model_fields.AVATAR}  reference={Constants.models.PROJECTAVATARS}>
                <SelectInput source={Constants.model_fields.AVATAR_IMAGE} optionText={<ImageField classes={{image: classes.image}} source={Constants.model_fields.AVATAR_IMAGE} />}/>
            </ReferenceInput>
            <TextInput
            className="input-small"
            label={"en.models.projects.keywords"}
            source={Constants.model_fields.KEYWORDS}
            defaultValue={record.keywords}
            />

            <ReferenceInput
                resource="researchgroups"
                className="input-small"
                label={"en.models.projects.group"}
                source={Constants.model_fields.GROUP}
                reference={Constants.models.GROUPS}
                validate={validateGroup}
                onChange={this.handleSelectChange}
                defaultValue={record.group}>
                <SelectInput optionText={Constants.model_fields.NAME} />
            </ReferenceInput>

    
            { record.id && (
            <div>
                <EditMetadata id={record.id} type={Constants.model_fk_fields.PROJECT}
                />
                <ConfigMetadata id={record.id} type={Constants.model_fk_fields.PROJECT}/>
            </div>
            )}
            {record && 
            <div className={classes.mapView}>
                <MapForm content_type={'project'} recordGeo={record.geo} id={record.id} geoDataCallback={this.geoDataCallback}/>
            </div>
            }
            
            </SimpleForm>)
    }
}

/**
 * 
 * 
            {this.state.groupContactList && <Select 
            value={this.state.primary_contact_user} onChange={this.handleSelectChange}>
            {
                this.state.groupContactList.map(user => {
                    console.log("user in groupcontactlist is; ", user)
                    return (
                        <MenuItem label={user.username} value={user.id} key={user.id}>
                            {user.username}
                        </MenuItem>
                    )
                })
            }
            </Select>}
 * 
 */
/**
 * 
            <UserInput
                required
                label={"en.models.projects.primary_contact_user"}
                placeholder={`Primary Contact`}
                //this blocks form submission , probably because of how gross this UserInput value is. validate={validatePrimaryContactUser}
                className="input-small"
                defaultValue={primary_contact_user}
                users={this.state.groupContactList} id={Constants.model_fields.PRIMARY_CONTACT_USER} name={Constants.model_fields.PRIMARY_CONTACT_USER}
                />
                
 */

export default withStyles(styles)(ProjectEditPage);