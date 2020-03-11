//UserEditForm.jsx
import React, { Component } from 'react';
import { BooleanInput, SaveButton, SimpleForm, TextInput } from "react-admin";
import {WEBTOKEN, WARNINGS, MODELS, METHODS, MODEL_FIELDS} from "../_constants/index";
import { getAPIEndpoint } from '../_tools';
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { email, maxLength, minLength, required, FormDataConsumer, regex } from 'ra-core';
import { toastErrors, getUserGroups } from '../_tools/funcs';
import { Redirect } from 'react-router';
import RelatedGroups from './RelatedGroups';
import UserTitle from './UserTitle';
import { Dialog, DialogContent, Toolbar } from '@material-ui/core';
import { GroupShow } from '../Groups/Groups';
import { toast } from 'react-toastify';
import { UserToolbar } from '../_components/Toolbar';

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
        console.log("usereditform cdm state: ", this.state)
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
        const token = localStorage.getItem(WEBTOKEN);
        if (token) {
            const parsedToken = JSON.parse(token);
            headers.set("Authorization", `Bearer ${parsedToken.access}`);
        } else {
            toastErrors(
                WARNINGS.NO_AUTH_TOKEN
            );
            this.setState({redirect: true})
        }

        const request = new Request(
            getAPIEndpoint() + `/${MODELS.USERS}/${id}/`, {
                method: METHODS.PUT,
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
                    history.push(`/${MODELS.USERS}`)
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
        const {setViewModal, record} = this.props
        return (<>
            <SimpleForm
                save={this.handleSubmit}
                resource={MODELS.USERS}
                asyncValidate={asyncValidate}
                toolbar={<UserToolbar />}
                asyncBlurFields={[MODEL_FIELDS.USERNAME]} {...this.props}>
                
                <FormDataConsumer>
                    {({formData }) => 
                    {
                        return(<UserTitle record={formData} prefix={"Updating"} />)}
                    }
                </FormDataConsumer>

                {groupMembers && groupMembers.length > 0 && <RelatedGroups groupMembers={groupMembers} setViewModal={(data) => {this.setState({viewModal:data})}} inModal={setViewModal === undefined ? false : true}/>}
                <TextInput
                    label={"en.models.users.username"}
                    source={MODEL_FIELDS.USERNAME}
                    onChange={this.handleChange}
                    validate={validateUsername}
                    defaultValue={username}
                    disabled
                />
                <TextInput
                    label={"en.models.users.fname"}
                    source={MODEL_FIELDS.FIRST_NAME}
                    onChange={this.handleChange}
                    validate={validateFirstName}
                    defaultValue={first_name}
                />
                <TextInput
                    label={"en.models.users.lname"}
                    source={MODEL_FIELDS.LAST_NAME}
                    onChange={this.handleChange}
                    validate={validateLastName}
                    defaultValue={last_name}
                />
                <TextInput
                    type={MODEL_FIELDS.EMAIL}
                    label={"en.models.users.email"}
                    source={MODEL_FIELDS.EMAIL}
                    onChange={this.handleChange}
                    validate={validateEmail}
                    defaultValue={email}
                />
                <TextInput
                    label={"en.models.users.notes"}
                    source={MODEL_FIELDS.NOTES}
                    onChange={this.handleChange}
                    defaultValue={notes}
                />
                <TextInput
                    label={"en.models.users.user_orcid_id"}
                    source={MODEL_FIELDS.ORCID_ID}
                    onChange={this.handleChange}
                    defaultValue={user_orcid_id}
                    validate={validateOrcid}
                />
                <BooleanInput
                    label={"en.models.generic.active"}
                    source={MODEL_FIELDS.ACTIVE}
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
            {redirect && <Redirect to="/login"/>}
        </>
        );
    }
}

/**
 * Check with the API whether a Group Name has already been used.
 */
const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID,  name: MODEL_FIELDS.USERNAME, reject: "There is already a user with this username. Please pick another username." }, MODELS.USERS);
export default UserEditForm;
