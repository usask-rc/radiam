//UserForm.jsx
import React, { Component } from 'react';
import { SimpleForm, TextInput, SelectInput, ReferenceInput, DateInput, SaveButton, Toolbar } from "react-admin";
import * as Constants from "../_constants/index"
import { getAPIEndpoint } from '../_tools';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { toast } from 'react-toastify';
import { translateDates, toastErrors } from '../_tools/funcs';
import { required, email, minLength, maxLength, regex } from 'ra-core';
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { Prompt, Redirect } from 'react-router';
import UserTitle from './UserTitle';

//const validateVersion = regex(/^\d+\.\d+\.\d+/, 'en.validate.useragents.version')
const validateUsername = [required('en.validate.user.username'), minLength(3), maxLength(12), regex(/^[a-zA-Z0-9]*$/, "Only Letters and Numbers are permitted")];
const validateEmail = [required('en.validate.user.email'), email()];
const validateGroup = required('en.validate.user.group');
const validateRole = required('en.validate.user.role');

//this exists to combine the User Creation form and the GroupMember Association form into a single page.
class UserFormWithAssoc extends Component {
    constructor(props) {
        super(props);
        console.log("userformwithassoc prop: ", props)
        this.state = { username: "", first_name: "", last_name: "", email: "", notes: "", isFormDirty: false, is_active: true, group: props.location.group || "", group_role: "", date_expires: null, redirect: false }
    }

    handleSubmit = event => {
        this.setState({isFormDirty: false}, () => { 

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

        let { username, email, group, group_role, date_expires } = this.state;


        if (date_expires) {
            date_expires = translateDates(date_expires, Constants.model_fields.DATE_EXPIRES);
        }

        const request = new Request(
            `${getAPIEndpoint()}/${Constants.models.USERS}/`, {
                method: Constants.methods.POST,
                body: JSON.stringify({ ...this.state }),
                headers: headers
            }
        )

        if (username && email) {

            return fetch(request).then(response => {

                if (response.status === 400 || response.status === 500 || (response.status >= 200 && response.status < 300)) {
                    return response.json();
                }
                throw new Error(response.statusText);
            })
                .then(data => {
                    if (data.id) {
                        //create a groupmember with these details
                        const groupMemberRequest = new Request(getAPIEndpoint() + "/groupmembers/", {
                            method: Constants.methods.POST,
                            body: JSON.stringify({ ...this.state, date_expires: date_expires, user: data.id }),
                            headers: headers
                        })

                        if (group_role && group) {

                            return fetch(groupMemberRequest).then(response => {
                                if (response.status >= 200 && response.status < 300) {
                                    return response.json();
                                }
                                throw new Error(response.statusText);
                            })
                                .then(data => {
                                    this.props.history.push(`/${Constants.models.USERS}`);
                                })
                                .catch(err => {
                                    toastErrors(err)
                                    console.log("Error in groupmember creation after new user is: ", err)
                                })
                        }
                        else if (group_role || group) {
                            toastErrors("Due to incomplete form, User: ", username, " was created without a Group.");
                            this.props.history.push(`/${Constants.models.USERS}`);
                        }
                        else {
                            toast.success("User: " + username + " was successfully created.")
                            this.props.history.push(`/${Constants.models.USERS}`);
                        }

                    }
                    //case of 400 or 500 errors
                    else if (data) {
                        toastErrors(data)
                    }

                    //we should never reach this point
                    else {
                        console.log("Something went wrong with groupmember association")
                        toastErrors("GroupMember not created.  Please proceed to the GroupMember page to associate this user with a group.");
                    }
                })
                .catch(err => {
                    toastErrors(err)
                    console.error("hit Catch in User Creation request: ", err)
                })

        }
        else {
            toastErrors("Please enter the new User's Username and Email Address.");            
        }
    })
    };

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });

        if (e && e.timeStamp){
            this.setState({isFormDirty: true})
        }
    };

    //strangely, the selects and date need a different change handler.
    handleSelectChange = (e, value, prevValue, target) => {
        this.setState({ [target]: value })

        if (e && e.timeStamp){
            this.setState({isFormDirty: true})
        }
    };


    render() {
        return (<React.Fragment>
            <SimpleForm
                onSubmit={this.handleSubmit}
                resource={Constants.models.USERS}
                toolbar={null}
                asyncValidate={asyncValidate}
                asyncBlurFields={[Constants.model_fields.USERNAME]}>
                <UserTitle prefix={"Creating User"} />

                <TextInput
                    label={"en.models.users.username"}
                    source={Constants.model_fields.USERNAME}
                    onChange={this.handleChange}
                    validate={validateUsername}
                />
                <TextInput
                    label={"en.models.users.fname"}
                    source={Constants.model_fields.FIRST_NAME}
                    onChange={this.handleChange}
                />
                <TextInput
                    label={"en.models.users.lname"}
                    source={Constants.model_fields.LAST_NAME}
                    onChange={this.handleChange}
                />
                <TextInput
                    type={Constants.model_fields.EMAIL}
                    label={"en.models.users.email"}
                    source={Constants.model_fields.EMAIL}
                    onChange={this.handleChange}
                    validate={validateEmail}
                />
                <TextInput
                    label={"en.models.users.notes"}
                    source={Constants.model_fields.NOTES}
                    onChange={this.handleChange}
                />
                <ReferenceInput
                    label={"en.models.groupmembers.group"}
                    source={Constants.model_fk_fields.GROUP}
                    reference={Constants.models.GROUPS}
                    onChange={this.handleSelectChange}
                    defaultValue={this.state.group}
                >
                    <SelectInput
                        validate={this.state.group_role ? validateGroup : null}
                        optionText={Constants.model_fields.NAME}
                    />
                </ReferenceInput>
                <ReferenceInput
                    label={"en.models.groupmembers.role"}
                    source={Constants.model_fk_fields.GROUP_ROLE}
                    reference={Constants.models.ROLES}
                    resource={Constants.models.ROLES}
                    onChange={this.handleSelectChange}
                >
                    <TranslationSelect
                        validate={this.state.group ? validateRole : null}
                        optionText={Constants.model_fields.LABEL}
                    />
                </ReferenceInput>
                <DateInput
                    label={"en.models.generic.date_membership_expires"}
                    options={{
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }}
                    defaultValue={""}
                    source={Constants.model_fields.DATE_EXPIRES}
                    onChange={this.handleSelectChange}
                />
            </SimpleForm>
            <Toolbar>
                <SaveButton
                    onClick={this.handleSubmit}
                />
            </Toolbar>
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

export default UserFormWithAssoc;
