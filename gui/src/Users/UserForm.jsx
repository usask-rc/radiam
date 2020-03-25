//UserForm.jsx
import React, { Component } from 'react';
import { SimpleForm, TextInput, SelectInput, ReferenceInput, DateInput, SaveButton, Toolbar } from "react-admin";
import {WEBTOKEN, WARNINGS, MODEL_FIELDS, MODELS, METHODS, MODEL_FK_FIELDS } from "../_constants/index";
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
const validateOrcid = [regex(/[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}/g, "invalid orcid, pattern is ####-####-####-####")]



//this exists to combine the User Creation form and the GroupMember Association form into a single page.
class UserForm extends Component {
    
    constructor(props) {
        super(props);
        this.state = { username: "", first_name: "", last_name: "", email: "", notes: "", is_active: true, group: props.location ? props.location.group : "", group_role: "", date_expires: null, redirect: false }
    }

    handleSubmit = event => {
        const { history } = this.props

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

        let { username, email, group, group_role, date_expires } = this.state;


        if (date_expires) {
            date_expires = translateDates(date_expires, MODEL_FIELDS.DATE_EXPIRES);
        }

        const request = new Request(
            `${getAPIEndpoint()}/${MODELS.USERS}/`, {
                method: METHODS.POST,
                body: JSON.stringify({ ...this.state }),
                headers: headers
            }
        )

        if (username && email && ((group && group_role) || (!group && !group_role))) {
            return fetch(request).then(response => {

                if (response.status === 400 || response.status === 500 || (response.status >= 200 && response.status < 300)) {
                    //console.log("response after user create: ", response)
                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then(data => {
                //console.log("data after user create: ", data)
                if (data.id) {
                    //create a groupmember with these details
                    const groupMemberRequest = new Request(getAPIEndpoint() + "/groupmembers/", {
                        method: METHODS.POST,
                        body: JSON.stringify({ ...this.state, date_expires: date_expires, user: data.id }),
                        headers: headers
                    })

                    //console.log("groupmemberrequest group_role and group: ", group_role, group)

                    if (group_role && group) {

                        return fetch(groupMemberRequest).then(response => {
                            //console.log("groupmemberrequest response:", response)
                            if (response.status >= 200 && response.status < 300) {
                                return response.json();
                            }
                            throw new Error(response.statusText);
                        })
                            .then(data => {
                                history.push(`/${MODELS.USERS}`);
                            })
                            .catch(err => {
                                toastErrors(err)
                                console.error("Error in groupmember creation after new user is: ", err)
                            })
                    }
                    else if (group_role || group) {
                        toastErrors("Due to incomplete form, User: ", username, " was created without a Group.");
                        history.push(`/${MODELS.USERS}`);
                    }
                    else {
                        toast.success("User: " + username + " was successfully created.")
                        history.push(`/${MODELS.USERS}`);
                    }

                }
                //case of 400 or 500 errors
                else if (data) {
                    toastErrors(data)
                }

                //we should never reach this point
                else {
                    console.error("Something went wrong with groupmember association")
                    toastErrors("GroupMember not created.  Please proceed to the GroupMember page to associate this user with a group.");
                }
            })
            .catch(err => {
                toastErrors(err)
                console.error("hit Catch in User Creation request: ", err)
            })

        }
        else {
            if (!username){
                toastErrors("Please enter a username");
            }
            else if (!email){
                toastErrors("Please enter an email address");
            }
            else if (!group){
                toastErrors("Please select a group role")
            }
            else if (!group_role){
                toastErrors("Please select a group")
            }
        }
    };

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });

    };

    render() {
        const { group, group_role, redirect} = this.state
        
        return (<>
            <SimpleForm
                onSubmit={this.handleSubmit}
                resource={MODELS.USERS}
                toolbar={null}
                asyncValidate={asyncValidate}
                asyncBlurFields={[MODEL_FIELDS.USERNAME]}>
                <UserTitle prefix={"Creating User"} />

                <TextInput
                    label={"en.models.users.username"}
                    source={MODEL_FIELDS.USERNAME}
                    onChange={this.handleChange}
                    validate={validateUsername}
                />
                <TextInput
                    label={"en.models.users.fname"}
                    source={MODEL_FIELDS.FIRST_NAME}
                    onChange={this.handleChange}
                />
                <TextInput
                    label={"en.models.users.lname"}
                    source={MODEL_FIELDS.LAST_NAME}
                    onChange={this.handleChange}
                />
                <TextInput
                    type={MODEL_FIELDS.EMAIL}
                    label={"en.models.users.email"}
                    source={MODEL_FIELDS.EMAIL}
                    onChange={this.handleChange}
                    validate={validateEmail}
                />
                <TextInput
                    label={"en.models.users.notes"}
                    source={MODEL_FIELDS.NOTES}
                    onChange={this.handleChange}
                    multiline
                />
                <TextInput
                    label={"en.models.users.user_orcid_id"}
                    source={MODEL_FIELDS.ORCID_ID}
                    onChange={this.handleChange}
                    validate={validateOrcid}
                />
                <ReferenceInput
                    label={"en.models.groupmembers.group"}
                    source={MODEL_FK_FIELDS.GROUP}
                    reference={MODELS.GROUPS}
                    onChange={this.handleChange}
                    defaultValue={group}
                    required
                >
                    <SelectInput
                        validate={group_role ? validateGroup : null}
                        optionText={MODEL_FIELDS.NAME}
                    />
                </ReferenceInput>
                <ReferenceInput
                    label={"en.models.groupmembers.role"}
                    source={MODEL_FK_FIELDS.GROUP_ROLE}
                    reference={MODELS.ROLES}
                    resource={MODELS.ROLES}
                    onChange={this.handleChange}
                    required
                >
                    <TranslationSelect
                        validate={group ? validateRole : null}
                        optionText={MODEL_FIELDS.LABEL}
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
                    source={MODEL_FIELDS.DATE_EXPIRES}
                    onChange={this.handleChange}
                />
            </SimpleForm>
            <Toolbar>
                <SaveButton
                    handleSubmitWithRedirect={this.handleSubmit}
                />
            </Toolbar>
        </>
        );
    }
}

/**
 * Check with the API whether a Group Name has already been used.
 */
const asyncValidate = getAsyncValidateNotExists({ id: MODEL_FIELDS.ID,  name: MODEL_FIELDS.USERNAME, reject: "There is already a user with this username. Please pick another username." }, MODELS.USERS);

export default UserForm;
