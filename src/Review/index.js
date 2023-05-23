
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
import _ from "lodash"
import {getPromiseState} from "../Util/promises"
import withContext from "../Components/hoc/withContext";
const ORDINATION_MAX_CARDINALITY = 2500000;
const {Title} = Typography;

const Review = ({dataset}) => {
  const match = useMatch('/dataset/:key/review');
  const navigate = useNavigate()
  const [geoJson, setGeoJson] = useState(null)
  const [gsPromise, setGsPromise] = useState(Promise.resolve())
  const [samplIdToArrayIndex, setSamplIdToArrayIndex] = useState(new Map())
  const [samples, setSamples] = useState({});
  const [samplePromise, setSamplePromise] = useState(Promise.resolve())

  const [selectedSample, setSelectedSample] = useState(null)
  const [ordination, setOrdination] = useState(null)
  const [ordinationPromise, setOrdinationPromise] = useState(Promise.resolve())

  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if(dataset){
      if(!geoJson){
        getGeoJson(dataset?.id)
      }
     if(!samples || _.isEmpty(samples)){
      getSampleData(dataset?.id)
     }
      if(!ordination && ((dataset?.summary?.sampleCount * dataset?.summary?.taxonCount) < ORDINATION_MAX_CARDINALITY)){
        getOrdination(dataset?.id)
      }
      
    }

  }, [dataset])

  useEffect(()=>{
console.log(selectedSample)

  },[selectedSample])

  const getGeoJson = async (key) => {
    try {
      const status = await getPromiseState(gsPromise)
      if(status === "pending"){
        return;
      }
      setLoading(true)
      const p = axios.get(`${config.backend}/dataset/${key}/data/geojson`);
      setGsPromise(p)
      const res = await  p; // axios.get(`${config.backend}/dataset/${key}/data/geojson`)

     setGeoJson(res?.data)
     // setSamplIdToArrayIndex(new Map(res?.data?.features.map((f, idx) => ([f.properties.id, idx]))))
     setLoading(false)



    } catch (error) {
      setLoading(false)

    }
  }

  const getSampleData = async (key) => {
    try {
      const status = await getPromiseState(samplePromise)
      if(status === "pending"){
        return;
      }
      setLoading(true)
      const p = axios.get(`${config.backend}/dataset/${key}/data/samples`);
      setSamplePromise(p)
      const res = await  p; //axios.get(`${config.backend}/dataset/${key}/data/samples`)

     setSamples(res?.data)
     setSamplIdToArrayIndex(new Map(res?.data?.id.map((f, idx) => ([f, idx]))))

     setLoading(false)

    } catch (error) {
      setLoading(false)

    }
  }

  const getOrdination = async (key) => {
    try {
      const status = await getPromiseState(ordinationPromise)
      if(status === "pending"){
        return;
      }
      setLoading(true)
      const p = axios.get(`${config.backend}/dataset/${key}/data/ordination`);
      setOrdinationPromise(p)
      const res = await  p;// axios.get(`${config.backend}/dataset/${key}/data/ordination`)
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
