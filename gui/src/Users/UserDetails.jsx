//UserDetails.jsx
import React, { Component } from 'react';
import { BooleanField, EmailField, SimpleShowLayout, TextField } from "react-admin";
import {MODELS, MODEL_FIELDS} from "../_constants/index";
import { getUserGroups } from '../_tools/funcs';
import RelatedGroups from './RelatedGroups';
import UserTitle from './UserTitle';
import { GroupShow } from '../Groups/Groups';
import { Dialog, DialogContent } from '@material-ui/core';

class UserDetails extends Component {

    constructor(props) {
        super(props);
        this.state = { groupMembers: [], viewModal: false }
    }

    componentDidMount() {
        const { record } = this.props
        getUserGroups(record).then(data => this.setState({groupMembers: data}))
    }

    render() {
        const {groupMembers, viewModal} = this.state
        const {setViewModal} = this.props

        return (
            <SimpleShowLayout {...this.props} resource={MODELS.USERS}>
                <UserTitle prefix={"Viewing"}/>
                {groupMembers && groupMembers.length > 0 && <RelatedGroups groupMembers={groupMembers} setViewModal={(data) => {this.setState({viewModal:data})}} inModal={setViewModal === undefined ? false : true}/>}
                <TextField
                    label={"en.models.users.username"}
                    source={MODEL_FIELDS.USERNAME}
                />
                <TextField
                    label={"en.models.users.fname"}
                    source={MODEL_FIELDS.FIRST_NAME}
                />
                <TextField
                    label={"en.models.users.lname"}
                    source={MODEL_FIELDS.LAST_NAME}
                />
                <EmailField
                    label={"en.models.users.email"}
                    source={MODEL_FIELDS.EMAIL}
                />
                <TextField
                    label={"en.models.users.notes"}
                    source={MODEL_FIELDS.NOTES}
                />
                <TextField
                    label={"en.models.users.user_orcid_id"}
                    source={MODEL_FIELDS.ORCID_ID}
                    />
                <BooleanField
                    label={"en.models.generic.active"}
                    source={MODEL_FIELDS.ACTIVE}
                />
                {viewModal &&
                <Dialog fullWidth open={viewModal} onClose={() => {this.setState({viewModal:false})}} aria-label="Add User">
                    <DialogContent>
                        <GroupShow id={viewModal.group.id} basePath="/researchgroups" resource="researchgroups" setViewModal={(data) => {this.setState({viewModal: data})}} inModal={true} record={{...viewModal.group}} />
                    </DialogContent>
                </Dialog>
                }
            </SimpleShowLayout>
        )
    }
}

export default UserDetails