import React, { useEffect, useState, useRef } from "react";
// import { MapContainer } from 'react-leaflet/MapContainer'
import { Alert } from "antd";
import _ from "lodash"
import { Checkbox , Descriptions} from "antd";


/**
 * A custom Ant form control built as it shown in the official documentation
 * https://ant.design/components/form/#components-form-demo-customized-form-controls
 * Based on built-in Tag https://ant.design/components/tag/#components-tag-demo-control
 */
class temporalCoverage extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component
    if ("value" in nextProps) {
      let value = nextProps.value;

      return { includeTemporalCoverage: value };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
        includeTemporalCoverage: false,
      error: null
    };
  }

  triggerChange = (e) => {
    // Should provide an event to pass value to Form
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(e?.target?.checked);
    }
  };

  setError = (err) => this.setState({error: err})


  render() {
    const { includeTemporalCoverage, error } = this.state;
    const { temporalCoverage} = this.props;

   
    return (
      <>
        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: "10px" }}
          />
        )}
    <Checkbox style={{marginTop: "6px"}}  checked={includeTemporalCoverage} onChange={this.triggerChange} > Include Temporal Coverage in Metadata</Checkbox>
        
          {!!temporalCoverage && <Descriptions items={[{key: 'tempCovarage', label: 'Start Date / End Date', children: `${temporalCoverage?.from} / ${temporalCoverage.to}`}]}/>}
         
        
      </>
    );
  }
}

export default temporalCoverage;
