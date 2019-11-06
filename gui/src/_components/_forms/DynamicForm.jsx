import React, { useState } from 'react'
import { AddCircleOutline, RemoveCircleOutline } from '@material-ui/icons'
import { Button, Divider, FormControl, IconButton, TextField,  } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles"
//a form that can contain an indefinite number of inputs, expanded and contracted with + and -, made to be displayed in a Modal.

const styles = {
    featureItem: {
        display: "flex",
        flexDirection: "row",
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

    //TODO: does not update dynamically after adding a new parameter.
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

        <Divider/>
        <Button variant="contained" color="primary" onClick={e => setProperties(featureParams)}>Confirm</Button>  
    </FormControl>)

    
    
};

export default withStyles(styles)(DynamicForm)