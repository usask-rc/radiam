//UserDetails.jsx
import React, { Component } from 'react';
import { BooleanField, EmailField, SimpleShowLayout, TextField } from "react-admin";
import * as Constants from "../_constants/index"
import { getUserGroups } from '../_tools/funcs';
import RelatedGroups from './RelatedGroups';
import UserTitle from './UserTitle';
import { GroupShow } from '../Groups/Groups';
import { Dialog, DialogContent } from '@material-ui/core';

class UserDetails extends Component {

    constructor(props) {
        super(props);
        this.state = { groupMembers: [], viewModal: false, }
    }

    componentDidMount() {
        getUserGroups(this.props.record).then(data => this.setState({groupMembers: data}))
    }

    render() {
        const {groupMembers, viewModal} = this.state
        const {setViewModal} = this.props
        console.log("setViewModal: ", setViewModal)

        console.log("UserDetails prop:" , this.props)
        console.log("this.state: ", this.state)
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
                    {viewModal &&
                    <Dialog fullWidth open={viewModal} onClose={() => {console.log("dialog close"); this.setState({viewModal:false})}} aria-label="Add User">
                        <DialogContent>
                            <GroupShow id={viewModal.group.id} basePath="/researchgroups" resource="researchgroups" setViewModal={(data) => {this.setState({viewModal: data})}} inModal={true} record={{...viewModal.group}} />
                        </DialogContent>
                    </Dialog>
                    }
                    {groupMembers && groupMembers.length > 0 && <RelatedGroups groupMembers={groupMembers} setViewModal={(data) => {this.setState({viewModal:data})}} inModal={setViewModal === undefined ? false : true}/>}
                </SimpleShowLayout>
        )
    }
}

export default UserDetails


//
//<UserDetails basePath="/users" resource="users" setViewModal={setViewModal} record={{...viewModal.user}} />
//