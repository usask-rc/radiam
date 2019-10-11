import React, { Component } from "react";
import { Button, CardActions, TextField, Typography } from "@material-ui/core";
import * as Constants from "../../_constants/index";
import { getAPIEndpoint, toastErrors } from "../../_tools/funcs";
import { radiamRestProvider, httpClient } from "../../_tools";
import { Responsive } from "ra-ui-materialui/lib/layout";
import { toast, ToastContainer } from "react-toastify";
import { UPDATE } from "ra-core";
import englishMessages from "../../_constants/i18n/en"

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
            const localID = JSON.parse(localStorage.getItem(Constants.ROLE_USER)).id

            console.log("id as stored in local storage is: ", localID)
            if (response.data.id === localID) {
                this.setState(response.data)
            }
            else {
                //TODO: user in storage does not match.  Log the user out.  Figure out how to do that.
                toastErrors(Constants.warnings.NO_AUTH_TOKEN)
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
        this.state = { username: "", email: "", first_name: "", last_name: "", notes: "", user_orcid_id: "" }
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
                                            label={englishMessages.en.models.users.username}
                                            value={this.state.username}
                                            onChange={this.handleChange(Constants.model_fields.USERNAME)}
                                        />
                                    </div>
                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.FIRST_NAME}
                                            label={englishMessages.en.models.users.fname}
                                            value={this.state.first_name}
                                            onChange={this.handleChange(Constants.model_fields.FIRST_NAME)}
                                        />
                                    </div>
                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.LAST_NAME}
                                            label={englishMessages.en.models.users.lname}
                                            value={this.state.last_name}
                                            onChange={this.handleChange(Constants.model_fields.LAST_NAME)}
                                        />
                                    </div>
                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.EMAIL}
                                            label={englishMessages.en.models.users.email}
                                            value={this.state.email}
                                            onChange={this.handleChange(Constants.model_fields.EMAIL)}
                                            type={"email"} />
                                    </div>
                                    <div className={styles.input}>

                                        <TextField
                                            id={Constants.model_fields.ORCID_ID}
                                            label={englishMessages.en.models.users.user_orcid_id}
                                            value={this.state.user_orcid_id}
                                            onChange={this.handleChange(Constants.model_fields.ORCID_ID)}
                                        />
                                    </div>
                                    <div className={styles.input}>
                                        <TextField
                                            id={Constants.model_fields.NOTES}
                                            label={englishMessages.en.models.users.notes}
                                            value={this.state.notes || ""}
                                            onChange={this.handleChange(Constants.model_fields.NOTES)}
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
