import React, { Component } from 'react';
import { BooleanField, EmailField, SimpleShowLayout, TextField } from "react-admin";
import * as Constants from "../_constants/index"
import { getAPIEndpoint, radiamRestProvider, httpClient } from '../_tools';
import { GET_LIST, GET_ONE, } from 'ra-core';
import { toastErrors } from '../_tools/funcs';
import UserGroupsDisplay from './UserGroupsDisplay';
import { withStyles } from '@material-ui/styles';

//we want a horizontal display to match our other chip displays elsewhere in the application.
const styles = theme => ({
    chipDisplay: {
        display: 'flex',
        justifyContent: 'left',
        flexWrap: 'wrap',
    },
});

class UserDetails extends Component {

    constructor(props) {
        super(props);
        this.state = { groupMembers: [] }
    }

    componentDidMount() {
        this.getAllRoles();
    }

    //TODO: make this asynchronous and put it in funcs.jsx
    getAllRoles() {
        const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
        dataProvider(GET_LIST, Constants.models.ROLES).then(response => response.data)
        .then(groupRoles => {

            const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
            const { id, is_active } = this.props.record

            dataProvider(GET_LIST, Constants.models.GROUPMEMBERS, {
                filter: { user: id, is_active: is_active }, pagination: { page: 1, perPage: 1000 }, sort: { field: Constants.model_fields.GROUP, order: "DESC" }
            }).then(response => response.data)
                .then(groupMembers => {
                    this.setState({ groupMembers });

                    groupMembers.map(groupMember => {
                        dataProvider(GET_ONE, Constants.models.GROUPS, {
                            id: groupMember.group
                        }).then(response => {
                            return response.data
                        }).then(researchgroup => {
                            groupMember.group = researchgroup
                            groupMember.group_role = groupRoles.filter(role => role.id === groupMember.group_role)[0]
                            this.setState([...this.state.groupMembers, groupMember])
                        })
                            .catch(err => console.error("error in attempt to get researchgroup with associated groupmember: " + err))
                        return groupMember
                    })
                return groupMembers

                })
                .catch(err => toastErrors("err in attempt to fetch all groupmembers of user: ", err))
        })
    }

    render() {
        const {groupMembers} = this.state

        return (
                <SimpleShowLayout {...this.props} resource={Constants.models.USERS}>
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
                    {groupMembers && groupMembers.length > 0 && <UserGroupsDisplay classes={styles} groupMembers={groupMembers}/>}
                </SimpleShowLayout>
        )
    }
}

export default withStyles(styles)(UserDetails)


