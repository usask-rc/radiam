import React, { Component } from 'react';
import { BooleanInput, SimpleForm, TextInput, SelectInput, ReferenceInput, DateInput, SaveButton, Toolbar } from "react-admin";
import * as Constants from "../_constants/index"
import { getAPIEndpoint } from '../_tools';
import TranslationSelect from '../_components/_fields/TranslationSelect';
import { toast } from 'react-toastify';
import { translateDates, toastErrors } from '../_tools/funcs';
import { required, email, minLength, maxLength } from 'ra-core';
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { Prompt } from 'react-router';

const validateUsername = [required('en.validate.user.username'), minLength(5), maxLength(20)];
const validateEmail = [required('en.validate.user.email'), email()];
const validateGroup = required('en.validate.user.group');
const validateRole = required('en.validate.user.role');

//this exists to combine the User Creation form and the GroupMember Association form into a single page.
class UserFormWithAssoc extends Component {
    constructor(props) {
        super(props);
        this.state = { username: "", first_name: "", last_name: "", email: "", notes: "", isFormDirty: false, is_active: true, group: "", group_role: "", date_expires: null }
    }

    handleSubmit = event => {
        this.setState({isFormDirty: false}, () => { 

        let headers = new Headers({ "Content-Type": "application/json" });

        const token = localStorage.getItem(Constants.WEBTOKEN);

        if (token) {
            const parsedToken = JSON.parse(token);
            headers.set("Authorization", `Bearer ${parsedToken.access}`);
        } else {
            //TODO: logout the user.
            toastErrors(
                Constants.warnings.NO_AUTH_TOKEN
            );
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
            toastErrors("Please enter your Username and Email Address.");
        }
    })
    };

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });
        this.setState({isFormDirty: true})
    };

    //strangely, the selects and date need a different change handler.
    handleSelectChange = (key_in_dict, value, prevValue, target) => {
        this.setState({ [target]: value })
        this.setState({isFormDirty: true})

    };


    render() {
        return (<React.Fragment>
            <SimpleForm
                onSubmit={this.handleSubmit}
                resource={Constants.models.USERS}
                toolbar={null}
                asyncValidate={asyncValidate}
                asyncBlurFields={[Constants.model_fields.USERNAME]}
                 >
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
                <BooleanInput
                    label={"en.models.generic.active"}
                    source={Constants.model_fields.ACTIVE}
                    defaultValue={true}
                    onChange={this.handleSelectChange}
                />
                <ReferenceInput
                    label={"en.models.groupmembers.group"}
                    source={Constants.model_fk_fields.GROUP}
                    reference={Constants.models.GROUPS}
                    onChange={this.handleSelectChange}
                >
                    <SelectInput
                        validate={this.state.group_role ? validateGroup : true}
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
                        validate={this.state.group ? validateRole : true}
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
        </React.Fragment>
        );
    }
}

/**
 * Check with the API whether a Group Name has already been used.
 */
const asyncValidate = getAsyncValidateNotExists({ id: Constants.model_fields.ID,  name: Constants.model_fields.USERNAME, reject: "There is already a user with this username. Please pick another username." }, Constants.models.USERS);

export default UserFormWithAssoc;
