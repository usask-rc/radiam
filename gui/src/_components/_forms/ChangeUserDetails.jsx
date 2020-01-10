import React, { Component } from "react";
import {models, ROLE_USER} from "../../_constants/index";
import { getAPIEndpoint, getCurrentUserDetails } from "../../_tools/funcs";
import { radiamRestProvider, httpClient } from "../../_tools";
import { Responsive } from "ra-ui-materialui/lib/layout";
import { toast, ToastContainer } from "react-toastify";
import { UPDATE } from "ra-core";
import { UserEditWithDeletion } from "../../Users/Users";

const styles = theme => ({
    flex: { display: "flex" },
    flexColumn: { display: "flex", flexDirection: "column" },
    leftCol: { marginTop: "1em", flex: 1, marginRight: "1em" },
    rightCol: { flex: 1, marginLeft: "1em" },
    singleCol: { marginBottom: "2em" },

    main: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
    },
    loading: {
        margin: "1em",
        fontSize: "24px"
    },
    card: {
        minWidth: 300,
        marginTop: "6em"
    },
    form: {
        padding: "0 1em 1em 1em"
    },
    input: {
        marginTop: "1em"
    },
    actions: {
        padding: "0 1em 1em 1em"
    },
    title: {
        padding: "16px 16px"
    },
    button: {
        marginTop: "6em",
        padding: "1em",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "column"
    }
});


//TODO: move api call to the central security provider file if possible once this functionality is completed.
//there HAS to be a way to access the existing cookies / token through authprovider / radiamrestprovider rather than doing it here.  I just can't think of how to go about doing it.
class ChangeDetails extends Component {
    
    handleSubmit = event => {
        const {id} = this.state
        const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
        const params = { data: this.state, id: id }

        dataProvider(UPDATE, models.USERS, params).then(response => {
            toast.success("Account information successfully updated.")
        }).catch(err => {
            console.log("error in user details update is: ", err)
        })
        event.preventDefault();
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
        event.preventDefault();
    }

    getCurrentUserDetails() {
        getCurrentUserDetails().then(data => 
        {
            this.setState(data)
            return data
        })
        .catch(err => 
            {
                console.error("Error in getCurrentUserDetails: ", err)
            }
        )
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        const user = JSON.parse(localStorage.getItem(ROLE_USER))
        this.state = {user: user, username: "", email: "", first_name: "", last_name: "", notes: "", user_orcid_id: "" }
    }

    componentDidMount() {
        this.getCurrentUserDetails();
    }
    //existing user details should be grabbed and displayed for the user to modify.
    render() {
        console.log("CUD props: ", this.props)
        const { user } = this.state
        return (
            <Responsive
                medium={
                    <>
                        <UserEditWithDeletion basePath="/users" resource="users" id={user.id}  />
                        <ToastContainer />
                    </>
                }
            />
        );
    }
}

export default ChangeDetails;