import React, { Component } from "react";
import { Button, CardActions, TextField, Typography } from "@material-ui/core";
import * as Constants from "../../_constants/index";
import { getAPIEndpoint, toastErrors } from "../../_tools/funcs";
import { radiamRestProvider, httpClient } from "../../_tools";
import { Responsive } from "ra-ui-materialui/lib/layout";
import { toast, ToastContainer } from "react-toastify";
import { UPDATE } from "ra-core";

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
        const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
        const params = { data: this.state, id: this.state.id }

        dataProvider(UPDATE, Constants.models.USERS, params).then(response => {
            toast.success("Account information successfully updated.")
        }).catch(err => {
            toastErrors("Error in updating your information: ", err)
        })
        event.preventDefault();
    };

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
        event.preventDefault();
    }

    getUserDetails() {
        const dataProvider = radiamRestProvider(getAPIEndpoint(), httpClient);
        dataProvider("CURRENT_USER", Constants.models.USERS).then(response => {
            const localID = JSON.parse(localStorage.getItem("user")).id

            console.log("id as stored in local storage is: ", localID)
            if (response.data.id === localID) {
                this.setState(response.data)
            }
            else {
                //TODO: user in storage does not match.  Log the user out.  Figure out how to do that.
                toastErrors("Could not authenticate.  Please log out and back in, then try again.")
            }
        }).catch(err => {
            toastErrors("Could not connect to server.  Please refresh the page and then try again.")
        }
        );
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = { username: "", email: "", first_name: "", last_name: "", notes: "" }
    }

    componentDidMount() {
        this.getUserDetails();
    }
    //existing user details should be grabbed and displayed for the user to modify.
    render() {
        return (
            <Responsive
                medium={
                    <React.Fragment>
                        <div style={styles.flex}>
                            <div style={styles.leftCol}>
                                <form style={styles.flex} onSubmit={this.handleSubmit}>
                                    <Typography component={"h4"} variant={"h4"}
                                        className={styles.title}
                                    >{`User Details:`}</Typography>

                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.USERNAME}
                                            label={Constants.model_fields.USERNAME}
                                            value={this.state.username}
                                            onChange={this.handleChange('username')}
                                        />
                                    </div>
                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.FIRST_NAME}
                                            label={Constants.model_fields.FIRST_NAME}
                                            value={this.state.first_name}
                                            onChange={this.handleChange('first_name')}
                                        />
                                    </div>
                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.LAST_NAME}
                                            label={Constants.model_fields.LAST_NAME}
                                            value={this.state.last_name}
                                            onChange={this.handleChange('last_name')}
                                        />
                                    </div>
                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.EMAIL}
                                            label={Constants.model_fields.EMAIL}
                                            value={this.state.email}
                                            onChange={this.handleChange('email')}
                                            type={"email"} />
                                    </div>
                                    <div className={styles.input}>
                                        <TextField
                                            id={Constants.model_fields.NOTES}
                                            label={Constants.model_fields.NOTES}
                                            value={this.state.notes || ""}
                                            onChange={this.handleChange('notes')}
                                        />
                                    </div>

                                    <CardActions className={styles.actions}>
                                        <Button
                                            variant="outlined"
                                            type={Constants.fields.SUBMIT}
                                            color="primary"
                                        >
                                            {"Update Details"}
                                        </Button>
                                    </CardActions>
                                </form>
                            </div>
                        </div>
                        <ToastContainer />
                    </React.Fragment>
                }
            />
        );
    }
}

export default ChangeDetails;
