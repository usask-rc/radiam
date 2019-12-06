//UserEditForm.jsx
import React, { Component } from 'react';
import { BooleanInput, SaveButton, SimpleForm, TextInput, Toolbar } from "react-admin";
import * as Constants from "../_constants/index"
import { getAPIEndpoint } from '../_tools';
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { email, maxLength, minLength, required, FormDataConsumer } from 'ra-core';
import { toastErrors, getUserGroups } from '../_tools/funcs';
import { Prompt, Redirect } from 'react-router';
import UserGroupsDisplay from './UserGroupsDisplay';
import UserTitle from './UserTitle';

const validateUsername = [required('en.validate.user.username'), minLength(3), maxLength(12)];
const validateEmail = [required('en.validate.user.email'), email()];

class UserEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = { ...props.record, groupMembers: [], isFormDirty: false, redirect:false }
    }

    async componentDidMount() {
        let abc = await getUserGroups(this.props.record)
        this.setState({groupMembers: abc})
    }

    handleSubmit = () => {
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
            getAPIEndpoint() + `/${Constants.models.USERS}/${this.state.id}/`, {
                method: Constants.methods.PUT,
                body: JSON.stringify({ ...this.state }),
                headers: headers
            }
        )

        if (this.state.username && this.state.email) {
            this.setState({isFormDirty: false}, () => {
            return fetch(request).then(response => {
                if (response.status === 400 || response.status === 500 || (response.status >= 200 && response.status < 300)) {
                    this.props.history.push(`/${Constants.models.USERS}`);
                    return response.json();
                }
                throw new Error(response.statusText);
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
        const {groupMembers} = this.state
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


                <TextInput
                    label={"en.models.users.username"}
                    source={Constants.model_fields.USERNAME}
                    onChange={this.handleChange}
                    validate={validateUsername}
                    defaultValue={this.state.username}
                />
                <TextInput
                    label={"en.models.users.fname"}
                    source={Constants.model_fields.FIRST_NAME}
                    onChange={this.handleChange}
                    defaultValue={this.state.first_name}
                />
                <TextInput
                    label={"en.models.users.lname"}
                    source={Constants.model_fields.LAST_NAME}
                    onChange={this.handleChange}
                    defaultValue={this.state.last_name}
                />
                <TextInput
                    type={Constants.model_fields.EMAIL}
                    label={"en.models.users.email"}
                    source={Constants.model_fields.EMAIL}
                    onChange={this.handleChange}
                    validate={validateEmail}
                    defaultValue={this.state.email}
                />
                <TextInput
                    label={"en.models.users.notes"}
                    source={Constants.model_fields.NOTES}
                    onChange={this.handleChange}
                    defaultValue={this.state.notes}
                />
                <BooleanInput
                    label={"en.models.generic.active"}
                    source={Constants.model_fields.ACTIVE}
                    defaultValue={this.state.is_active}
                    onChange={this.handleSelectChange}
                />
                {groupMembers && groupMembers.length > 0 && <UserGroupsDisplay groupMembers={groupMembers}/>}

            </SimpleForm>
            
            <Prompt when={this.state.isFormDirty} message={Constants.warnings.UNSAVED_CHANGES}/>
            {this.state.redirect && <Redirect to="/login"/>}
        </React.Fragment>
        );
    }
}

/**
 * Check with the API whether a Group Name has already been used.
 */
const asyncValidate = getAsyncValidateNotExists({ id: Constants.model_fields.ID,  name: Constants.model_fields.USERNAME, reject: "There is already a user with this username. Please pick another username." }, Constants.models.USERS);
export default UserEditForm;