
import React, {useEffect, useState} from "react";
import config from "../config";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button, Row, Col, Typography, Descriptions, Tabs } from "antd";
import TaxonomyChart from "./TaxonomyChart";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import LeafletMap from "./Map";
import TaxonomicSimilarity from "./TaxonomicSimilarity"
import {getDataForDissimilarityPlot} from "../Util/ordination"
import withContext from "../Components/hoc/withContext";

const {Title} = Typography;

const Review = ({dataset}) => {
  const match = useMatch('/dataset/:key/review');
  const navigate = useNavigate()
  const [geoJson, setGeoJson] = useState(null)
  const [samplIdToArrayIndex, setSamplIdToArrayIndex] = useState(new Map())
  const [samples, setSamples] = useState({});
  const [selectedSample, setSelectedSample] = useState(null)
  const [ordination, setOrdination] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if(dataset){
      getGeoJson(dataset?.id)
      getSampleData(dataset?.id)
      getOrdination(dataset?.id)
    }

  }, [dataset])

  useEffect(()=>{
console.log(selectedSample)

  },[selectedSample])

  const getGeoJson = async (key) => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.backend}/dataset/${key}/data/geojson`)

     setGeoJson(res?.data)
     // setSamplIdToArrayIndex(new Map(res?.data?.features.map((f, idx) => ([f.properties.id, idx]))))
     setLoading(false)



    } catch (error) {
      setLoading(false)

    }
  }

  const getSampleData = async (key) => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.backend}/dataset/${key}/data/samples`)

     setSamples(res?.data)
     setSamplIdToArrayIndex(new Map(res?.data?.id.map((f, idx) => ([f, idx]))))

     setLoading(false)

    } catch (error) {
      setLoading(false)

    }
  }

  const getOrdination = async (key) => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.backend}/dataset/${key}/data/ordination`)
      //getDataForDissimilarityPlot(res?.data)
      const plotData = getDataForDissimilarityPlot(res?.data);
     setOrdination(plotData)
     setLoading(false)

    } catch (error) {
      setLoading(false)

    }
  }
  return (
    <Layout><PageContent>
      <Row>
        <Col flex="auto"></Col>
        <Col><Button onClick={() => navigate(`/dataset/${match?.params?.key}/metadata`)}>Done</Button></Col>
      </Row>
       <Row>
          <Col span={12}> {geoJson && <LeafletMap geoJson={geoJson} onFeatureClick={setSelectedSample} selectedSample={selectedSample}/>}
         {ordination && <TaxonomicSimilarity onSampleClick={setSelectedSample} selectedSample={selectedSample} />} 
          </Col>
          <Col span={12} style={{paddingLeft: "16px"}}>
          {!isNaN(samplIdToArrayIndex.get(selectedSample)) &&    <Tabs defaultActiveKey="1" items={[

{
  key: '1',
  label: `Taxonomic composition`,
  children: <TaxonomyChart sampleIndex={samplIdToArrayIndex.get(selectedSample)} selectedSample={selectedSample} />,
},
{
  key: '2',
  label: `Sample metadata`,
  children: <Descriptions column={2} title={`Sample: ${selectedSample}`}>
  {Object.keys(samples).map(key => <Descriptions.Item label={key}>{samples[key][samplIdToArrayIndex.get(selectedSample)]}</Descriptions.Item>)}

</Descriptions>,
},
          ]}  />}
         {/*  {!isNaN(samplIdToArrayIndex.get(selectedSample)) && 
            <TaxonomyChart sampleIndex={samplIdToArrayIndex.get(selectedSample)} sampleId={selectedSample} /> }
            {!isNaN(samplIdToArrayIndex.get(selectedSample)) && 
             <Descriptions column={2} title={`Sample: ${selectedSample}`}>
                {Object.keys(samples).map(key => <Descriptions.Item label={key}>{samples[key][samplIdToArrayIndex.get(selectedSample)]}</Descriptions.Item>)}
            
           </Descriptions>} */}
            </Col>
       
       </Row>
       


        </PageContent></Layout>
  );
}


const mapContextToProps = ({  dataset}) => ({

  dataset
});

export default withContext(mapContextToProps)(Review);
