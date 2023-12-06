
import React, { useEffect, useState } from "react";
import config from "../config";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button, Row, Col, Typography, Descriptions, Tabs, Select } from "antd";
import TaxonomyChart from "./TaxonomyChart";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import LeafletMap from "./Map";
import TaxonomicSimilarity from "./TaxonomicSimilarity"
import TaxonomyBarplot from "./TaxonomyBarplot";
import { getDataForDissimilarityPlot , getBrayCurtisDistanceMatrix} from "../Util/ordination"
import _ from "lodash"
import { getPromiseState } from "../Util/promises"
import withContext from "../Components/hoc/withContext";
const ORDINATION_MAX_CARDINALITY = 2500000;
const { Title } = Typography;

const DataBrowser = ({ dataset }) => {

    const [geoJson, setGeoJson] = useState(null)
    const [gsPromise, setGsPromise] = useState(Promise.resolve())
    const [samplIdToArrayIndex, setSamplIdToArrayIndex] = useState(new Map())
    const [samples, setSamples] = useState({});
    const [samplePromise, setSamplePromise] = useState(Promise.resolve())
   // const [sparseMatrixPromise, setSparseMatrixPromise]  = useState(Promise.resolve());
    const [selectedSample, setSelectedSample] = useState(null)
   // const [ordination, setOrdination] = useState(null)
  //  const [ordinationPromise, setOrdinationPromise] = useState(Promise.resolve())
    const [taxonomyData, setTaxonomyData] = useState(null)
    const [taxonomyBySampleDataMap, setTaxonomyBySampleDataMap] = useState(null)
    const [taxonomyDataMap, setTaxonomyDataMap] = useState(null)
    const [taxonomyLoading, setTaxonomyLoading] = useState(false)
    const [topTaxa, setTopTaxa] = useState(null)
    const [loading, setLoading] = useState(false)
    const [datasetId, setDatasetId] = useState(null)

    useEffect(() => {

        if (dataset?.id && dataset?.id !== datasetId) {
            setDatasetId(dataset?.id)
            setGeoJson(null)
            getGeoJson(dataset?.id)
            setSamples({})

            getSampleData(dataset?.id)
            getTaxonomyData(dataset?.id)
            /* if (((dataset?.summary?.sampleCount * dataset?.summary?.taxonCount) < ORDINATION_MAX_CARDINALITY)) {
                getOrdination(dataset?.id)
            } */
            /* if (((dataset?.summary?.sampleCount * dataset?.summary?.taxonCount) < ORDINATION_MAX_CARDINALITY)) {
                getSparseMatrix(dataset?.id)
            } */
            /* if (!geoJson) {
                getGeoJson(dataset?.id)
            }
            if (!samples || _.isEmpty(samples)) {
                getSampleData(dataset?.id)
            }
            if (!ordination && ((dataset?.summary?.sampleCount * dataset?.summary?.taxonCount) < ORDINATION_MAX_CARDINALITY)) {
                getOrdination(dataset?.id)
            } */

        }

    }, [dataset?.id])

    useEffect(() => {
        //  console.log(selectedSample)
        //  console.log(`the array index is ${samplIdToArrayIndex.get(selectedSample)}`)
    }, [selectedSample])

    useEffect(()=>{
        if(taxonomyDataMap){
            getDatasetToptaxa()
        }
    },[taxonomyDataMap])

    const getGeoJson = async (key) => {
        try {
            const status = await getPromiseState(gsPromise)
            if (status === "pending") {
                return;
            }
            setLoading(true)
            const p = axios.get(`${config.backend}/dataset/${key}/data/geojson`);
            setGsPromise(p)
            const res = await p; // axios.get(`${config.backend}/dataset/${key}/data/geojson`)

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
            if (status === "pending") {
                return;
            }
            setLoading(true)
            const p = axios.get(`${config.backend}/dataset/${key}/data/samples`);
            setSamplePromise(p)
            const res = await p; //axios.get(`${config.backend}/dataset/${key}/data/samples`)

            setSamples(res?.data)
            setSamplIdToArrayIndex(new Map(res?.data?.id.map((f, idx) => ([f.toString(), idx]))))

            setLoading(false)

        } catch (error) {
            setLoading(false)

        }
    }

    const getTaxonomyData = async (key) => {
        try {
            setTaxonomyLoading(true)
            const res = await axios.get(`${config.backend}/dataset/${key}/data/taxonomy`)
            setTaxonomyData(res?.data)
            prepareTaxonomyData(res?.data)
            setTaxonomyLoading(false)

        } catch (error) {
            setTaxonomyLoading(false)

        }
    }

    const prepareTaxonomyData = (samples) => {
        // We may want to use a web worker here:
        try {
            const dataMap = {
                'kingdom':{},
                 'phylum': {},
                  'class': {},
                   'order': {},
                    'family': {},
                     'genus' : {}
            };
            const dataBySampleMap = {};
            samples.forEach(sample => {
                sample.taxonomy.forEach(row => {
                    ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'].forEach(rank => {
                        if (row?.[rank] && dataMap[rank][row?.[rank]]) {
                            dataMap[rank][row?.[rank]].value += row.value
                            dataMap[rank][row?.[rank]].readCount += row.readCount
                        } else {
                            dataMap[rank][row?.[rank]] = {}
                            dataMap[rank][row?.[rank]].value =  row.value
                            dataMap[rank][row?.[rank]].readCount =  row.readCount
                        }
                        if (!dataBySampleMap[sample?.id]) {
                            dataBySampleMap[sample?.id] = {
                                'kingdom':{},
                                 'phylum': {},
                                  'class': {},
                                   'order': {},
                                    'family': {},
                                     'genus' : {}
                            }
                        }
                        if (row?.[rank] && dataBySampleMap?.[sample?.id]?.[rank]?.[row?.[rank]]) {
                            dataBySampleMap[sample?.id][rank][row?.[rank]].value += row.value
                            dataBySampleMap[sample?.id][rank][row?.[rank]].readCount += row.readCount
                            
                        } else if (row?.[rank] && !dataBySampleMap[sample?.id]?.[rank]?.[row?.[rank]]) {
                            dataBySampleMap[sample?.id][rank][row?.[rank]] = {}
                            dataBySampleMap[sample?.id][rank][row?.[rank]].value = row.value
                            dataBySampleMap[sample?.id][rank][row?.[rank]].readCount = row.readCount
                        }
                    })
                    
                })
            });
            setTaxonomyDataMap(dataMap)
            setTaxonomyBySampleDataMap(dataBySampleMap)

        } catch (error) {
            console.log(error)
        }
    }

    const getDatasetToptaxa = () => {
       const topTenTaxaInHigherRanks = ['kingdom', 'phylum', 'class', 'order'].map(rank => {
            const dataMap = taxonomyDataMap[rank]
           
            if(rank === "kingdom"){
                console.log(Object.keys(dataMap))
            }
            const sortedData = Object.keys(dataMap).filter(key => !!key).map(key => {
               return { name: key, value: dataMap[key].value}
            }).sort((a, b) => b.value - a.value);
            const topTaxa = sortedData.slice(0, 10).map(e => e.name);
            return topTaxa;
        })
        
        setTopTaxa(topTenTaxaInHigherRanks)

    }


 
    return (

        <Row>
            <Col span={12}> {geoJson && <LeafletMap geoJson={geoJson} onFeatureClick={setSelectedSample} selectedSample={selectedSample} />}
                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: `Taxonomy barplot`,
                        children: <TaxonomyBarplot onSampleClick={setSelectedSample} selectedSample={selectedSample} taxonomyBySampleDataMap={taxonomyBySampleDataMap} taxonomyDataMap={taxonomyDataMap} /* taxonomyData={taxonomyData} */ taxonomyLoading={taxonomyLoading}/>,
                    },

                    {
                        key: '2',
                        label: `PCoA/MDS plot`,
                        children: <TaxonomicSimilarity sampleLabels={samples?.id} onSampleClick={setSelectedSample} selectedSample={selectedSample} />,
                    },

                ]} />

            </Col>
            <Col span={12} style={{ paddingLeft: "16px" }}>
                {!isNaN(samplIdToArrayIndex.get((selectedSample || "").toString())) && <Tabs 
                    tabBarExtraContent={<Select options={Object.keys(taxonomyBySampleDataMap).map(s => ({value: s, label: s}))} value={selectedSample} onChange={setSelectedSample} />} defaultActiveKey="1" items={[

                    {
                        key: '1',
                        label: `Taxonomic composition`,
                        children: <TaxonomyChart topTaxa={topTaxa} sampleIndex={samplIdToArrayIndex.get((selectedSample || "").toString())} selectedSample={selectedSample} />,
                    },
                    {
                        key: '2',
                        label: `Sample metadata`,
                        children: <Descriptions column={2} title={`Sample: ${selectedSample}`}>
                            {Object.keys(samples).map(key => <Descriptions.Item key={key} label={key}>{samples[key][samplIdToArrayIndex.get((selectedSample || "").toString())]}</Descriptions.Item>)}

                        </Descriptions>,
                    },
                ]} />}

            </Col>

        </Row>



    );
}


const mapContextToProps = ({ dataset }) => ({
    dataset
});

export default withContext(mapContextToProps)(DataBrowser);
