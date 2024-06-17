import React, { useEffect, useState, useRef } from "react";
// import { MapContainer } from 'react-leaflet/MapContainer'
import { Alert } from "antd";
import _ from "lodash"
import OrganisationAutoComplete from "../Publish/OrganisationAutocomplete";

/**
 * A custom Ant form control built as it shown in the official documentation
 * https://ant.design/components/form/#components-form-demo-customized-form-controls
 * Based on built-in Tag https://ant.design/components/tag/#components-tag-demo-control
 */
class OrganizationControl extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component
    if ("value" in nextProps) {
      let value = nextProps.value;

      return { organizationName: value };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
        organizationName: props?.value || "",
      error: null
    };
  }

  triggerChange = (org) => {
    // Should provide an event to pass value to Form
    const onChange = this.props.onChange;
    const setOrganizationKey = this.props.setOrganizationKey
    if (onChange) {
      onChange(org?.title || "");
    }
    if(setOrganizationKey){
        setOrganizationKey(org?.key || null)
    }
  };

  setError = (err) => this.setState({error: err})


  render() {
    const { organizationName, error } = this.state;

   
    return (
      <>
        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: "10px" }}
          />
        )}
    
    <OrganisationAutoComplete disabled={this?.props?.disabled} defaultValue={organizationName} onSelectOrganisation={this.triggerChange} />
        
      </>
    );
  }
}

export default OrganizationControl;
