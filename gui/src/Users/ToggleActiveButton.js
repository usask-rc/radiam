import React, { Component } from 'react'

import { Button, crudUpdateMany } from "react-admin";
import { connect } from "react-redux"

class ToggleActiveButton extends Component{
    handleClick = () => {
      const {basePath, crudUpdateMany, resource, selectedIds} = this.props;

      console.log("props in toggleactivebutton are: ", this.props)
      
      if (this.props.filterValues && this.props.filterValues.is_active)
      {
        crudUpdateMany(resource, selectedIds, {is_active: false }, basePath)    
      }
      else{
        crudUpdateMany(resource, selectedIds, {is_active: true }, basePath)    
      }
    }
  
    render() {
      return(
        <Button label="Toggle Active Status" onClick={this.handleClick} />
      )
    }
  }
  
export default connect(undefined, { crudUpdateMany })(ToggleActiveButton)