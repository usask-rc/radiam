import React, { Component } from 'react';
import { BooleanField, EmailField, SimpleShowLayout, TextField } from "react-admin";
import * as Constants from "../_constants/index"
import { getAPIEndpoint, radiamRestProvider, httpClient } from '../_tools';
import { GET_LIST, GET_ONE, } from 'ra-core';
import { toastErrors, getUserGroups } from '../_tools/funcs';
import UserGroupsDisplay from './UserGroupsDisplay';
import { withStyles } from '@material-ui/styles';
import { isObject } from 'util';

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

    async componentDidMount() {
        let abc = await getUserGroups(this.props.record)
        this.setState({groupMembers: abc})
    }

    render() {
        const {groupMembers} = this.state

        console.log("groupMembers in render is: ", groupMembers)

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


