//UserDetails.jsx
import React, { Component } from 'react';
import { BooleanField, EmailField, SimpleShowLayout, TextField } from "react-admin";
import * as Constants from "../_constants/index"
import { getUserGroups } from '../_tools/funcs';
import UserGroupsDisplay from './UserGroupsDisplay';
import UserTitle from './UserTitle';

class UserDetails extends Component {

    constructor(props) {
        super(props);
        this.state = { groupMembers: [] }
    }

    componentDidMount() {
        getUserGroups(this.props.record).then(data => this.setState({groupMembers: data}))
    }

    render() {
        const {groupMembers} = this.state

        console.log("UserDetails prop:" , this.props)
        return (
                <SimpleShowLayout {...this.props} resource={Constants.models.USERS}>
                    <UserTitle prefix={"Viewing"}/>
                    <TextField
                        label={"en.models.users.username"}
                        source={Constants.model_fields.USERNAME}
                    />
                    <TextField
                        label={"en.models.users.fname"}
                        source={Constants.model_fields.FIRST_NAME}
                    />
                    <TextField
                        label={"en.models.users.lname"}
                        source={Constants.model_fields.LAST_NAME}
                    />
                    <EmailField
                        label={"en.models.users.email"}
                        source={Constants.model_fields.EMAIL}
                    />
                    <TextField
                        label={"en.models.users.notes"}
                        source={Constants.model_fields.NOTES}
                    />
                    <BooleanField
                        label={"en.models.generic.active"}
                        source={Constants.model_fields.ACTIVE}
                    />
                    {groupMembers && groupMembers.length > 0 && <UserGroupsDisplay groupMembers={groupMembers}/>}
                </SimpleShowLayout>
        )
    }
}

export default UserDetails


