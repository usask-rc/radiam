//ToggleForgot.jsx
import React from 'react'
import { withStyles, Link } from '@material-ui/core'
import compose from "recompose/compose"
import { translate } from "ra-core";
const styles = () => ({
    forgotContainer: {
        alignItems: "center",
        textAlign: "center",
      },
})

const ToggleForgot = ({forgotText, classes, translate, toggleForgotPassword}) => {
    return(
          <div className={classes.forgotContainer}>
            <Link
              href="#"
              onClick={toggleForgotPassword}
            >
              {translate(forgotText)}
            </Link>
          </div>
    )
}


const enhance = compose(
    translate,
    withStyles(styles)
);

export default enhance(ToggleForgot)