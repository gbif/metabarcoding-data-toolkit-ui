import React, { useEffect, useState, useRef } from "react";
// import { MapContainer } from 'react-leaflet/MapContainer'
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Alert } from "antd";
import bbox from "geojson-bbox";

import { useMap } from "react-leaflet/hooks";
import L from "leaflet";
import MarkerCluster from "leaflet.markercluster";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Checkbox } from "antd";
import { error } from "highcharts";

/* import DrawTools from './DrawTools';
 */const css = {
    width: '100%',
    minWidth: "300px",
    height: '400px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '24px'
  }

const MapContent = ({
    geographicCoverage,
  setError,
}) => {
  const map = useMap();
  
 
  const geographicCoverageToLeafletPolygon = (geographicCoverage_)=> {

    const {northBoundingCoordinate, eastBoundingCoordinate, southBoundingCoordinate, westBoundingCoordinate} = geographicCoverage_;

    return L.polygon([[northBoundingCoordinate, eastBoundingCoordinate], [northBoundingCoordinate, westBoundingCoordinate], [southBoundingCoordinate, westBoundingCoordinate], [southBoundingCoordinate, eastBoundingCoordinate]])

  }
  

  useEffect(() => {
    try {
       const polygon = geographicCoverageToLeafletPolygon(geographicCoverage)
     
      map.addLayer(polygon);
      map.fitBounds(polygon.getBounds());
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  }, [geographicCoverage, map]);

 

  // return geoJson ?  <GeoJSON ref={geoJsonRef} key="whatever" data={geoJson} pointToLayer={pointToLayer}  onClick={console.log} onEachFeature={onEachFeature} /> : null;
  return <></>;
};

/**
 * A custom Ant form control built as it shown in the official documentation
 * https://ant.design/components/form/#components-form-demo-customized-form-controls
 * Based on built-in Tag https://ant.design/components/tag/#components-tag-demo-control
 */
class GeographicCoverage extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component
    if ("value" in nextProps) {
      let value = nextProps.value;

      return { includeGeographicCoverage: value };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      includeGeographicCoverage: false,
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
    const { includeGeographicCoverage, error } = this.state;
    const { geographicCoverage} = this.props;

    return (
      <div style={{ minWidth: "300px", height: "450px" }}>
        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: "10px" }}
          />
        )}
    <Checkbox  style={{marginTop: "6px"}} checked={includeGeographicCoverage} onChange={this.triggerChange} > Include Geographic Coverage in Metadata</Checkbox>
        
          <MapContainer
            style={css}
            center={[0, 0]}
            zoom={1}
            maxZoom={18}
            scrollWheelZoom={false}
           
          >
         {geographicCoverage &&   <MapContent
            setError={this.setError}
              geographicCoverage={geographicCoverage}
              
            />}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        
      </div>
    );
  }
}

export default GeographicCoverage;
