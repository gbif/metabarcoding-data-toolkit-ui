import React, { useEffect, useState, useRef } from 'react'
// import { MapContainer } from 'react-leaflet/MapContainer'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { Alert } from 'antd';
import bbox from 'geojson-bbox';

import { useMap } from 'react-leaflet/hooks'
import L from 'leaflet';
import MarkerCluster from 'leaflet.markercluster';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;
var geojsonMarkerOptions = {
  radius: 4,
  fillColor: "#021691",
  color: "#021691",
  weight: 1,
  opacity: 1,
  fillOpacity: 1
};

/* import DrawTools from './DrawTools';
 */const css = {
  width: '100%',
  height: '400px',
  overflow: 'hidden',
  position: 'relative',
  marginBottom: '24px'
}

const MapContent = ({ geoJson, onFeatureClick, selectedSample, setError }) => {
  const map = useMap()
  const geoJsonRef = useRef();
  const [lastSelected, setLastSelected] = useState(selectedSample)
  useEffect(() => {
    try {
      if (selectedSample && lastSelected !== selectedSample) {

        const layers = geoJsonRef.current.getLayers();
        const selectedLayer = layers.find(l => l?.feature?.properties?.id == selectedSample);
        const lastSelectedLayer = layers.find(l => l?.feature?.properties?.id == lastSelected);
        if(lastSelectedLayer){
          lastSelectedLayer.closePopup()
        }
          
        if (selectedLayer) {
          
           map.flyTo([selectedLayer?.feature?.geometry?.coordinates[1],selectedLayer?.feature?.geometry?.coordinates[0]], 14)
           selectedLayer.openPopup()
        }
        setLastSelected(selectedSample)
  
      }
    } catch (error) {
      console.log(error) 
    }

  }, [selectedSample, map])

  useEffect(() => {

    try {
      const onEachFeature = (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(`Sample ${feature.properties.id}`)
        }
  
  
        if (typeof onFeatureClick === "function") {
          layer.on({
  
            click: () => {
              onFeatureClick(feature.properties.id)
            }
          });
  
        }
      }
      const markers = L.markerClusterGroup();
  
      const geoJsonLayer = L.geoJson(geoJson, {
        onEachFeature,
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, geojsonMarkerOptions)
        }
      });
      geoJsonRef.current = geoJsonLayer;
  
      markers.addLayer(geoJsonLayer);
      markers.on('mouseover', function (a) {
        a.layer.openPopup();
      });
      map.addLayer(markers);
      map.fitBounds(markers.getBounds());
    } catch (error) {
      console.log(error.message)
      setError(error.message)
    }

  }, [geoJson])


  // return geoJson ?  <GeoJSON ref={geoJsonRef} key="whatever" data={geoJson} pointToLayer={pointToLayer}  onClick={console.log} onEachFeature={onEachFeature} /> : null;
  return <></>
}

const LeafletMap = ({ geoJson, onFeatureClick, selectedSample }) => {
  const [extent, setExtent] = useState([])
  const [error, setError] = useState(null)


useEffect(()=> {
  console.log(error)
}, [error])
  useEffect(() => {
    if (geoJson) {
      console.log(bbox(geoJson))
      setExtent(bbox(geoJson))
    }
  }, [geoJson])




  return <div style={{ minWidth: "300px", height: "450px" }}>
                    {error && <Alert type="error" message={error} style={{marginBottom: "10px"}}/>}

    {extent.length > 0 &&
      <MapContainer  style={css} center={[0, 0]} zoom={1} maxZoom={18} scrollWheelZoom={false} whenReady={e => {
        /* mapRef = e.target; */
        try {
          e.target.flyToBounds([
            [extent[1], extent[0]],
            [extent[3], extent[2]]

          ]);
        } catch (error) {
          console.log(error)
        }

      }}>
        <MapContent setError={setError} geoJson={geoJson} onFeatureClick={onFeatureClick} selectedSample={selectedSample} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


      </MapContainer>}</div>

}

export default LeafletMap;