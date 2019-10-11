import React, { Component } from 'react';
import { BooleanInput, SaveButton, SimpleForm, TextInput, Toolbar } from "react-admin";
import * as Constants from "../_constants/index"
import { getAPIEndpoint, radiamRestProvider, httpClient } from '../_tools';
import { getAsyncValidateNotExists } from "../_tools/asyncChecker";
import { email, maxLength, minLength, required, GET_LIST, GET_ONE } from 'ra-core';
import { toastErrors, getUserGroups } from '../_tools/funcs';
import { Prompt } from 'react-router';
import UserGroupsDisplay from './UserGroupsDisplay';

const validateUsername = [required('en.validate.user.username'), minLength(5), maxLength(20)];
const validateEmail = [required('en.validate.user.email'), email()];

//we want a horizontal display to match our other chip displays elsewhere in the application.
const styles = theme => ({
    chipDisplay: {
        display: 'flex',
        justifyContent: 'left',
        flexWrap: 'wrap',
    },
});
class UserEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = { ...props.record, groupMembers: [], isFormDirty: false }
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
            //TODO: logout the user.
            toastErrors(
                Constants.warnings.NO_AUTH_TOKEN
            );
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
                    this.props.history.push("/users");
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
            toastErrors("Please enter your Username and Email Address.");
        }
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
        const {groupMembers} = this.state
        return (<React.Fragment>
            <SimpleForm
                onSubmit={this.handleSubmit}
                resource={Constants.models.USERS}
                toolbar={null}
                asyncValidate={asyncValidate}
                asyncBlurFields={[Constants.model_fields.USERNAME]} >
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
                    type="email"
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
                {groupMembers && groupMembers.length > 0 && <UserGroupsDisplay classes={styles} groupMembers={groupMembers}/>}

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
export default UserEditForm;