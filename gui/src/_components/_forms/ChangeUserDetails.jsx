import React, { Component } from "react";
import { Button, CardActions, TextField, Typography } from "@material-ui/core";
import * as Constants from "../../_constants/index";
import { getAPIEndpoint, toastErrors, getUserDetails } from "../../_tools/funcs";
import { radiamRestProvider, httpClient } from "../../_tools";
import { Redirect } from "react-router"
import { Responsive } from "ra-ui-materialui/lib/layout";
import { toast, ToastContainer } from "react-toastify";
import { UPDATE, regex } from "ra-core";
import englishMessages from "../../_constants/i18n/en"
import UserEditForm from "../../Users/UserEditForm";
import { UserEdit, UserEditWithDeletion } from "../../Users/Users";

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

        dataProvider(UPDATE, Constants.models.USERS, params).then(response => {
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
        const { mounted } = this.state
        getUserDetails().then(data => 
        {
            if (mounted){
                this.setState(data)
            }
            else{
                this.setState({redirect: true})
            }
            return data
        })
        .catch(err => 
            {
                if (mounted)
                {
                    this.setState({redirect: true})
                }
            }
        )
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        const user = JSON.parse(localStorage.getItem(Constants.ROLE_USER))
        this.state = {user: user, username: "", email: "", first_name: "", last_name: "", notes: "", user_orcid_id: "", redirect: null, mounted: false }
    }

    componentDidMount() {
        this.setState({mounted: true})
        this.getCurrentUserDetails();
    }

    componentWillUnmount(){
        this.setState({mounted: false})
    }
    //existing user details should be grabbed and displayed for the user to modify.
    render() {
        const { user, redirect } = this.state
        return (
            <Responsive
                medium={
                    <React.Fragment>
                        <UserEditWithDeletion basePath="/users" resource="users" id={user.id}  />
                        <ToastContainer />
                        {redirect && <Redirect to="/login"/>}
                    </React.Fragment>
                }
            />
        );
    }
}

export default ChangeDetails;