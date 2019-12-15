//UserEditForm.jsx
import React, { Component } from 'react';
import { BooleanInput, SaveButton, SimpleForm, TextInput, Toolbar } from "react-admin";
import * as Constants from "../_constants/index"
import { getAPIEndpoint } from '../_tools';
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { email, maxLength, minLength, required, FormDataConsumer, regex } from 'ra-core';
import { toastErrors, getUserGroups } from '../_tools/funcs';
import { Prompt, Redirect } from 'react-router';
import RelatedGroups from './RelatedGroups';
import UserTitle from './UserTitle';
import { Dialog, DialogContent } from '@material-ui/core';
import { GroupShow } from '../Groups/Groups';
import { toast } from 'react-toastify';

const validateUsername = [required('en.validate.user.username'), minLength(3), maxLength(12), regex(/^[a-zA-Z0-9]*$/, "Only Letters and Numbers are permitted")];
const validateFirstName = [required('en.validate.user.first_name')]
const validateLastName = [required('en.validate.user.lastname')]
const validateEmail = [required('en.validate.user.email'), email()];
const validateOrcid = [regex(/[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}/g, "invalid orcid, pattern is ####-####-####-####")]



class UserEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = { ...props.record, groupMembers: [], isFormDirty: false, redirect:false, viewModal: false}

        console.log("props in UserEditForm: ", props)
    }

    componentDidMount() {
        const { record } = this.props

        getUserGroups(record).then(data => {
            console.log("user groups are: ", data)
            this.setState({groupMembers: data})
            return data
        })
    }

    handleSubmit = () => {
        const { history } = this.props
        const { id, username, email } = this.state
        let headers = new Headers({ "Content-Type": "application/json" });
        const token = localStorage.getItem(Constants.WEBTOKEN);

        if (token) {
            const parsedToken = JSON.parse(token);
            headers.set("Authorization", `Bearer ${parsedToken.access}`);
        } else {
            toastErrors(
                Constants.warnings.NO_AUTH_TOKEN
            );
            this.setState({redirect: true})
        }

        const request = new Request(
            getAPIEndpoint() + `/${Constants.models.USERS}/${id}/`, {
                method: Constants.methods.PUT,
                body: JSON.stringify({ ...this.state }),
                headers: headers
            }
        )

        if (username && email) {
            this.setState({isFormDirty: false}, () => {
            return fetch(request).then(response => {
                if (response.status === 400 || response.status === 500 || (response.status >= 200 && response.status < 300)) {
                    return response.json();
                }
                throw new Error(response.statusText);
            }).then(data => {
                console.log("data on return : ", data)
                toast.success("User Successfully Updated")
                if (history){
                    history.push(`/${Constants.models.USERS}`)
                }
                else{
                    //accessing from a modal, we don't care about redirection.
                }
            })

                .catch(err => {
                    toastErrors(err)
                    console.error("hit Catch in User Edit request: ", err)
                })
            })
        }
        else {
            toastErrors("Please enter the new User's Username and Email Address.");
        }
    };

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });

        if (e && e.timeStamp){
            this.setState({isFormDirty: true})
        }

        console.log("value of e in handlechange is: ", e)
    };

    //strangely, the selects and date need a different change handler.
    handleSelectChange = (e, value, prevValue, target) => {
        this.setState({ [target]: value })

        if (e && e.timeStamp){
            this.setState({isFormDirty: true})
        }
    };

    render() {
        const {groupMembers, viewModal, username, first_name, last_name, email,  notes, user_orcid_id, is_active, isFormDirty, redirect} = this.state
        const {setViewModal} = this.props
        return (<React.Fragment>
            <SimpleForm
                save={this.handleSubmit}
                resource={Constants.models.USERS}
                asyncValidate={asyncValidate}
                asyncBlurFields={[Constants.model_fields.USERNAME]} >
                
                <FormDataConsumer>
                    {({formData }) => 
                    {
                        return(<UserTitle prefix={"Updating"} record={formData} />)}
                    }
                </FormDataConsumer>

                {groupMembers && groupMembers.length > 0 && <RelatedGroups groupMembers={groupMembers} setViewModal={(data) => {this.setState({viewModal:data})}} inModal={setViewModal === undefined ? false : true}/>}
                <TextInput
                    label={"en.models.users.username"}
                    source={Constants.model_fields.USERNAME}
                    onChange={this.handleChange}
                    validate={validateUsername}
                    defaultValue={username}
                    disabled
                />
                <TextInput
                    label={"en.models.users.fname"}
                    source={Constants.model_fields.FIRST_NAME}
                    onChange={this.handleChange}
                    validate={validateFirstName}
                    defaultValue={first_name}
                />
                <TextInput
                    label={"en.models.users.lname"}
                    source={Constants.model_fields.LAST_NAME}
                    onChange={this.handleChange}
                    validate={validateLastName}
                    defaultValue={last_name}
                />
                <TextInput
                    type={Constants.model_fields.EMAIL}
                    label={"en.models.users.email"}
                    source={Constants.model_fields.EMAIL}
                    onChange={this.handleChange}
                    validate={validateEmail}
                    defaultValue={email}
                />
                <TextInput
                    label={"en.models.users.notes"}
                    source={Constants.model_fields.NOTES}
                    onChange={this.handleChange}
                    defaultValue={notes}
                />
                <TextInput
                    label={"en.models.users.user_orcid_id"}
                    source={Constants.model_fields.ORCID_ID}
                    onChange={this.handleChange}
                    defaultValue={user_orcid_id}
                    validate={validateOrcid}
                />
                <BooleanInput
                    label={"en.models.generic.active"}
                    source={Constants.model_fields.ACTIVE}
                    defaultValue={is_active}
                    onChange={this.handleSelectChange}
                />
                {viewModal &&
                    <Dialog fullWidth open={viewModal} onClose={() => {console.log("dialog close"); this.setState({viewModal:false})}} aria-label="Add User">
                        <DialogContent>
                            <GroupShow id={viewModal.group.id} basePath="/researchgroups" resource="researchgroups" setViewModal={(data) => {this.setState({viewModal: data})}} inModal={true} record={{...viewModal.group}} />
                        </DialogContent>
                    </Dialog>
                }
            </SimpleForm>
            
            <Prompt when={isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
            {redirect && <Redirect to="/login"/>}
        </React.Fragment>
        );
    }
}

/**
 * Check with the API whether a Group Name has already been used.
 */
const asyncValidate = getAsyncValidateNotExists({ id: Constants.model_fields.ID,  name: Constants.model_fields.USERNAME, reject: "There is already a user with this username. Please pick another username." }, Constants.models.USERS);
export default UserEditForm;