import React, { useEffect, useState, useRef } from "react";
// import { MapContainer } from 'react-leaflet/MapContainer'
import { Alert } from "antd";
import _ from "lodash"
import { Checkbox , Descriptions} from "antd";

const TAX_COVERAGE_RANKS = ['kingdom', 'phylum', 'class', 'order', 'family']
const TAX_COVERAGE_LIMIT = 200;

/**
 * A custom Ant form control built as it shown in the official documentation
 * https://ant.design/components/form/#components-form-demo-customized-form-controls
 * Based on built-in Tag https://ant.design/components/tag/#components-tag-demo-control
 */
class TaxonomicCoverage extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component
    if ("value" in nextProps) {
      let value = nextProps.value;

      return { includeTaxonomicCoverage: value };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      includeTaxonomicCoverage: false,
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
    const { includeTaxonomicCoverage, error } = this.state;
    const { taxonomicCoverage} = this.props;
    const hasData = TAX_COVERAGE_RANKS.filter(rank => Object.keys(taxonomicCoverage || {}).includes(rank)).reduce((acc, curr) => (acc || taxonomicCoverage[curr].length > 0 ), false)

    const items = hasData ? 
        TAX_COVERAGE_RANKS
            .filter(rank => Object.keys(taxonomicCoverage || {}).includes(rank))
            .reduce((acc, curr) => (acc.length + taxonomicCoverage[curr].length < TAX_COVERAGE_LIMIT ? [...acc, {key: curr, label: _.startCase(curr), children: taxonomicCoverage[curr].join(", ")}]: acc), [])
             : []
    return (
      <>
        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: "10px" }}
          />
        )}
    <Checkbox style={{marginTop: "6px"}}  checked={includeTaxonomicCoverage} onChange={this.triggerChange} > Include Taxonomic Coverage in Metadata</Checkbox>
        
          
         {taxonomicCoverage &&  <Descriptions column={1} bordered items={items} />}
        
      </>
    );
  }
}

export default TaxonomicCoverage;
