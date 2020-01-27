import React from "react";
import { connect } from "react-redux";
import { translate, changeLocale, Title } from "react-admin";
import compose from "recompose/compose";
import { changeTheme } from "./actions";
import ChangePassword from "../_components/_forms/ChangePassword";
import ChangeDetails from "../_components/_forms/ChangeUserDetails";
import ExpansionPanel from "@material-ui/core/ExpansionPanel"
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary"
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails"
import Typography from "@material-ui/core/Typography"
import ExpandMore from "@material-ui/icons/ExpandMore";
import withStyles from "@material-ui/core/styles/withStyles";
import { ToastContainer } from "react-toastify";
import { getTranslation } from "../_tools/funcs"


const styles = {
  label: { width: "10em", display: "inline-block" },
  button: { margin: "1em" }
};

//TODO: this file should contain email / password change components.
const Settings = ({ translate }) => (
  <>
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
        <Typography>
          {getTranslation(translate, "settings.update_password")}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Title title={translate("en.settings.label")} />
        <div>
          <ChangePassword />
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMore />}>
        <Typography>
          {getTranslation(translate, "settings.update_information")}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div>
          <ChangeDetails />
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
    <ToastContainer />
  </>
);

const mapStateToProps = state => ({
  theme: state.theme,
});

const enhance = compose(
  connect(
    mapStateToProps,
    {
      changeLocale,
      changeTheme
    }
  ),
  translate,
  withStyles(styles)
);

export default enhance(Settings);
