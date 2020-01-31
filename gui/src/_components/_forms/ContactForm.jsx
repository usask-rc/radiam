import React, { Component, useState } from 'react'
import { withStyles } from '@material-ui/styles'

//a form for sending emails to support - no backend equivalent to support this yet.
//https://blog.mailtrap.io/react-contact-form/#Create_the_contact_form
const styles = {

}
handleSubmit = (data) => {
    event.preventDefault();
    console.log("email, name, message: ", email, name, message)
}

const ContactForm = ({ classes, translate }) => {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [message, setMessage] = useState("")



    return(
    <div className={classes.root}>
    <form id="contact-form" onSubmit={this.handleSubmit.bind(this)} method="POST">
        <div className={classes.name}>
            <label htmlFor="name">Name</label>
            <input type="text" className={classes.nameInput} value={name} onChange={(data) => setName(data)} />
        </div>
        <div className={classes.email}>
            <label htmlFor="exampleInputEmail1">Email address</label>
            <input type="email" className={classes.emailInput} aria-describedby="emailHelp" value={email} onChange={(data) => setEmail(data)} />
        </div>
        <div className={classes.message}>

            <label htmlFor="message">Message</label>
            <textarea className={classes.messageInput} rows="5" value={message} onChange={(data) => setMessage(data)} />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    </div>
)}

export default withStyles(styles)(ContactForm)