
import React, { useEffect, useState } from "react";
import config from "../config";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Button, Row, Col, Typography, Descriptions, Tabs, Select, Table } from "antd";
import TaxonomyChart from "./TaxonomyChart";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import LeafletMap from "./Map";
import TaxonomicSimilarity from "./TaxonomicSimilarity"
import TaxonomyBarplot from "./TaxonomyBarplot";
import _ from "lodash"
import { getPromiseState } from "../Util/promises"
import withContext from "../Components/hoc/withContext";
import DnaSequence from "../Components/DnaSequence";
import {dateFormatter, numberFormatter} from '../Util/formatters'



const formatTaxonomy =  (record, truncate = true) => {
    const taxa = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'scientificName'].filter(rank => !!record[rank]).map(rank => record[rank])
    if(taxa.length > 5 && truncate){
        return `${taxa[0]}; ${taxa[1]};...${taxa[taxa.length-3]}; ${taxa[taxa.length-2]}; ${taxa[taxa.length-1]}`
    } else {
        return taxa.join("; ")
    }
};

const expandedRowRender = (record) => <>
<Row><Col style={{marginLeft: "48px"}}>{">"}{record?.id} | {formatTaxonomy(record, false)}</Col></Row>
<Row><Col style={{marginLeft: "48px"}}><DnaSequence sequence={record?.DNA_sequence} /></Col></Row>
 </>

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
    const [taxonomyBySampleDataMap, setTaxonomyBySampleDataMap] = useState({})
    const [taxonomyDataMap, setTaxonomyDataMap] = useState(null)
    const [taxonomyLoading, setTaxonomyLoading] = useState(false)
    const [topTaxa, setTopTaxa] = useState(null)
    const [loading, setLoading] = useState(false)
    const [datasetId, setDatasetId] = useState(null)
    const [metrics, setMetrics] = useState({})
    const [geoJsonFilter, setGeoJsonFilter] = useState(null)
    const [sampleDataTypes, setSampleDataTypes] = useState(null)
    let [searchParams, setSearchParams] = useSearchParams();


    useEffect(() => {
        if(searchParams.has("eventID")){
            setSelectedSample(searchParams.get("eventID"))
        }
        if (dataset?.id && dataset?.id !== datasetId) {
            setDatasetId(dataset?.id)
            setGeoJson(null)
            getGeoJson(dataset?.id)
            setSamples({})

            getSampleData(dataset?.id)
            getTaxonomyData(dataset?.id)
            getSampleDataTypes(dataset?.id)
            if(dataset?.metrics){
                setMetrics(dataset?.metrics)
            }

            
            //console.log(searchParams.get("eventID"))
          //  getMetrics(dataset?.id)
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
        if(selectedSample){
            setSearchParams(new URLSearchParams(`eventID=${selectedSample}`))
            //searchParams.set("eventID", selectedSample)
        }
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

    const getSampleDataTypes = async (key) => {

        try {
            const res = await axios.get(`${config.backend}/dataset/${key}/data/sample/datatypes`);
            setSampleDataTypes(res?.data)
        } catch (error) {
            console.log(error)
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

/*     const getMetrics = async (id) => {

        try {
            const metrics_ = await axios.get(`${config.backend}/dataset/${id}/data/metrics`);
            console.log(metrics_)
            setMetrics(metrics_.data)

        } catch (error) {
            console.log(error)
        }
    } */

const geoJsonFilterFn = (geoJsonFeature) => {
     return !!geoJsonFilter ? geoJsonFilter.includes(samplIdToArrayIndex.get(geoJsonFeature?.properties?.id?.toString())) : true

} 
 const getGeoJsonFilter = async (observationID) => {
    try {
        const res = await axios.get(`${config.backend}/dataset/${dataset.id}/data/observation/${observationID}`)
        setGeoJsonFilter(res?.data)
    } catch (error) {
        
    }
 }
    return (

        <Row>
            <Col span={12}> {geoJson && <LeafletMap geoJson={geoJson} onFeatureClick={setSelectedSample} selectedSample={selectedSample} geoJsonFilter={geoJsonFilterFn}/>}
                <Tabs defaultActiveKey="1" onChange={activeKey => {
                    if(['1', '2'].includes(activeKey)){
                        setGeoJsonFilter(null)
                    }
                }  } items={[
                    {
                        key: '1',
                        label: `Taxonomy barplot`,
                        children: <TaxonomyBarplot onSampleClick={setSelectedSample} selectedSample={selectedSample} taxonomyBySampleDataMap={taxonomyBySampleDataMap} taxonomyDataMap={taxonomyDataMap} /* taxonomyData={taxonomyData} */ taxonomyLoading={taxonomyLoading}/>,
                    },

                    {
                        key: '2',
                        label: `PCoA/MDS plot`,
                        children: <TaxonomicSimilarity 
                                        datasetKey={dataset?.id} 
                                        sampleHeaders={(sampleDataTypes || []).filter(e => e.type.startsWith("<")).map(e => e.key) } loading={!(metrics?.jaccard && metrics?.brayCurtis)} jaccard={metrics?.jaccard} brayCurtis={metrics?.brayCurtis} sampleLabels={samples?.id} onSampleClick={setSelectedSample} selectedSample={selectedSample} />,
                    },
                    {
                        key: '3',
                        label: 'Most frequent OTUs',
                        children: <>{metrics?.sampleCountPrOtu?.mostFrequent &&   <Table expandable={{expandedRowRender}} showHeader={false} pagination={false} dataSource={metrics?.sampleCountPrOtu?.mostFrequent}
                        columns={[{title: 'OTU',
                        dataIndex: 'DNA_sequence',
                        key: 'DNA_sequence',
                        render: (text, record) => formatTaxonomy(record)}, 
                        {
                            title: 'value',
                            dataIndex: 'value',
                            key: 'value'
                        }, 
                    {title: "Count", dataIndex: "val", key: "val", render: (text, record) => <Button type="link" onClick={() => getGeoJsonFilter(record.key)}>{`In ${numberFormatter.format(text)}/${numberFormatter.format(dataset?.summary?.sampleCount)} samples`}</Button>}]} />}</> ,
                      },
                      {
                        key: '4',
                        label: 'Least frequent non-singleton OTUs',
                        children: <>{metrics?.sampleCountPrOtu?.leastFrequent &&   <Table expandable={{expandedRowRender}} showHeader={false} pagination={false} dataSource={metrics?.sampleCountPrOtu?.leastFrequent}
                        columns={[{title: 'OTU',
                        dataIndex: 'DNA_sequence',
                        key: 'DNA_sequence',
                        render: (text, record) => formatTaxonomy(record)}, 
                        {
                            title: 'value',
                            dataIndex: 'value',
                            key: 'value'
                        }, 
                    {title: "Count", dataIndex: "val", key: "val", render: (text, record) => <Button type="link" onClick={() => getGeoJsonFilter(record.key)}>{`In ${numberFormatter.format(text)}/${numberFormatter.format(dataset?.summary?.sampleCount)} samples`}</Button>}]} />}</> ,
                      }

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
