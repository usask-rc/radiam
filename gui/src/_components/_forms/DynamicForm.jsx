import React, { useState } from 'react'
import AddCircleOutline from "@material-ui/icons/AddCircleOutline"
import RemoveCircleOutline from "@material-ui/icons/RemoveCircleOutline"
import Button from "@material-ui/core/Button"
import FormControl from "@material-ui/core/FormControl"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import { withStyles } from "@material-ui/core/styles"

//a form that can contain an indefinite number of inputs, expanded and contracted with + and -, made to be displayed in a Modal.
const styles = {
    featureItem: {
        display: "flex",
        flexDirection: "row",
    },
    submitButton: {
        marginTop: "1em",
    }
  };

const DynamicForm = ({classes, prevProperties, setProperties}) => {

    const [featureParamLabel, setFeatureParamLabel] = useState("")
    const [featureParams, setFeatureParams] = useState(Object.keys(prevProperties).length > 0 ? prevProperties :
        {
            name: '', 
            description: '', //use these two by default
        }
    )

    const handleFeatureParamChange = e => {
        setFeatureParamLabel(e.target.value)
    };

    const handleChange = e => {
        const newFeatureParams = {...featureParams}
        newFeatureParams[e.target.name] = e.target.value
        setFeatureParams(newFeatureParams)
    }

    const removeLabel = (e, key) => {
        const newFeatureParams = {...featureParams}
        delete newFeatureParams[key]
        setFeatureParams(newFeatureParams)
    }

    const addLabel = (e) => {
        if (featureParamLabel && featureParamLabel.length > 0)
        {
            const newFeatureParams = featureParams
            newFeatureParams[featureParamLabel] = ""
            setFeatureParams(newFeatureParams)
            setFeatureParamLabel("")
        }
    }

    return(
        <FormControl>
            <div className={classes.featureItem}>
                <TextField key="addFeatureField" type="text" onChange={handleFeatureParamChange} value={featureParamLabel} placeholder="eg: Last Visited" />        
                <IconButton name={"addIconFeatureField"} aria-label="add" onClick={(e) => addLabel(e)}>
                    <AddCircleOutline/>
                </IconButton>
            </div>

            {featureParams && 
            Object.keys(featureParams).map(key => {
                return (
                        <div className={classes.featureItem} key={key}>
                            <TextField type="text" label={key} name={key} key={key} defaultValue={featureParams[key]} onChange={handleChange} />
                            <IconButton name={key} aria-label="remove" onClick={(e) => removeLabel(e, key)}>
                                <RemoveCircleOutline />
                            </IconButton>
                        </div>
                    )
                })
            }
            <Button className={classes.submitButton} variant="contained" color="primary" onClick={() => setProperties(featureParams)}>{`Confirm`}</Button>  
        </FormControl>
    )
};

export default withStyles(styles)(DynamicForm)