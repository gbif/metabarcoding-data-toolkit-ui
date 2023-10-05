 import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Spin, Select } from "antd";
import axios from "axios";
import Highcharts, { setOptions } from "highcharts";
import config from "../config";
import {getDataForDissimilarityPlot} from "../Util/ordination"
import HC_exporting from "highcharts/modules/exporting";
import HC_sunburst from "highcharts/modules/sunburst";
import HighchartsReact from "highcharts-react-official";
import _ from 'lodash'
import withContext from "../Components/hoc/withContext";
import Help from "../Components/Help"

HC_exporting(Highcharts);
HC_sunburst(Highcharts);

const getChartOptions = (data, indexType, onSampleClick) => {
         
  let options = {
      
      chart: {
        type: 'scatter',
        zoomType: 'xy'
      },
      title: {
          text: ""
        },
      
        subtitle: {
          text: 'Click to inspect a sample'
        },
       xAxis: {
        title: {
          text: 'Axis 1'
        }
      },
       yAxis: {
        title: {
          text: 'Axis 2'
        }
      }, 
      legend: {
        enabled: false
      },
      plotOptions: {
        scatter: {
          marker: {
            radius: 2.5,
            symbol: 'circle',
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          }
        }
      },
     
      series: [{
         // color: 'rgba(152,0,67,0.1)',
          name: "Sample",
          data: data,
          turboThreshold: 2500,
         /*  marker: {
            radius: 0.5
          }, */
          point: {
              events: {
                click: (e) => {
                  if(typeof onSampleClick === "function" && e?.point?.Sample){
                      onSampleClick(e?.point?.Sample)
                  } 
                  
                },
              },
            },
          tooltip: {
            followPointer: false,
            pointFormat: '{point.Sample}'
          }
        }]
    };
    return options
};

const TaxonomyChart = ({dataset, onSampleClick, selectedSample, sampleLabels}) => {
  const [options, setOptions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [indexType, setIndexType] = useState('jaccard');
  // const [jaccardOptions, setJaccardOptions] = useState(null);
 // const [brayCurtisOptions, setBrayCurtisOptions] = useState(null)
  const [sparseMatrix, setSparseMatrix] = useState(null)
  const [datasetID, setDatasetID] = useState(null)

  // const options = useMemo(() => !(sparseMatrix && sampleLabels) ? null : getChartOptions(getDataForDissimilarityPlot(sparseMatrix, indexType, sampleLabels) ,indexType, onSampleClick), [sparseMatrix, indexType, sampleLabels]);
  const jaccardOptions = useMemo(() => !(sparseMatrix && sampleLabels) ? null : getChartOptions(getDataForDissimilarityPlot(sparseMatrix, "jaccard", sampleLabels) ,indexType, onSampleClick), [sparseMatrix, sampleLabels]);
  const brayCurtisOptions = useMemo(() => !(sparseMatrix && sampleLabels) ? null : getChartOptions(getDataForDissimilarityPlot(sparseMatrix, "bray-curtis", sampleLabels) ,indexType, onSampleClick), [sparseMatrix, sampleLabels]);

   const chartRef = useRef()
  useEffect(() => {

    if(dataset?.id){
       /*  if(datasetID !== dataset?.id){
          setBrayCurtisData(null)
          setJaccardData(null)
          setOptions(null)
          setDatasetID(dataset?.id)
        } */
        //getData(dataset)
        getSparseMatrix()
    }
  }, [dataset?.id])

  useEffect(()=>{
    const chart = chartRef.current?.chart;
    
    if(selectedSample && chart){
        if(typeof hoverPoint?.setState === 'function'){
            hoverPoint.setState()
        }

        const point = chart.series[0]?.data.find(d => d?.Sample === selectedSample);
        if(point){
            point.setState('hover');
            setHoverPoint(point)
            chart.tooltip.refresh(point);

        }
    }
  }, [selectedSample])

    useEffect(()=> {
    const chart = chartRef.current?.chart;
    
     if(chart && indexType === "jaccard" && jaccardOptions){
      chart.update(jaccardOptions)
      
    } else if(chart && indexType === "bray-curtis" && brayCurtisOptions){
      chart.update(brayCurtisOptions)
    }
    if(indexType === "jaccard" && jaccardOptions){
      setOptions(jaccardOptions)
    } else if(indexType === "bray-curtis" && brayCurtisOptions){
      setOptions(brayCurtisOptions)
    }

    
    
    
  }, [indexType, jaccardOptions, brayCurtisOptions/* , sparseMatrix, sampleLabels */])

  const getSparseMatrix = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.backend}/dataset/${dataset.id}/data/sparse-matrix`);
      setSparseMatrix(res?.data)
      setLoading(false)
    } catch (error) {
      setError(error)
      setLoading(false)
    }

  }
/* 
  const  getData = async (dataset) => {

    let plotData;
      if(indexType === 'jaccard' && jaccardData){
        plotData = [...jaccardData]
      } else if(indexType === 'bray-curtis' && brayCurtisData){
        plotData = [...brayCurtisData]
      } else {
        try {
          setLoading(true)
          const res =  indexType === 'jaccard' ? await axios.get(`${config.backend}/dataset/${dataset.id}/data/ordination`) :  await axios.get(`${config.backend}/dataset/${dataset.id}/data/sparse-matrix`)
          plotData = getDataForDissimilarityPlot(res?.data, indexType, sampleLabels);
          if(indexType === 'jaccard'){
            setJaccardData(plotData)
          } else if(indexType === 'bray-curtis') {
            setBrayCurtisData(plotData)
          }
          
         setLoading(false)
    
        } catch (error) {
          setLoading(false)
    
        }
      }

      if(plotData){
        const options = getChartOptions(plotData, indexType)
        setOptions(options);

      }
    
  } */


    


      return invalid ? null : (loading || !options) ? (
        <Row style={{ padding: "48px" }}>
          <Col flex="auto"></Col>
          <Col>
            <Spin size="large" />
          </Col>
          <Col flex="auto"></Col>
        </Row>
      ) : (
        <>
        <Row >
          <Col flex="auto"></Col>
         <Col style={{marginRight: "10px"}}>Choose distance metric:</Col>
          <Col >
            <Select style={{width: 200}} value={indexType} onChange={setIndexType}>
              <Select.Option value={"jaccard"}>Jaccard index</Select.Option>
              <Select.Option value={"bray-curtis"}>Bray-Curtis Dissimilarity</Select.Option>
            </Select> <Help title="" content={<ul>
              <li>The <a href="https://en.wikipedia.org/wiki/Jaccard_index" target="_blank">Jaccard index</a> is purely presence/absence based and does not take abundance into account.</li>
              <li><a href="https://en.wikipedia.org/wiki/Bray%E2%80%93Curtis_dissimilarity" target="_blank">Bray-Curtis dissimilarity</a> integrates information about species abundance</li>
            </ul>}/>
          </Col>
        </Row>
        <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
        </>
      );
}

const mapContextToProps = ({ dataset, rank }) => ({
    dataset,
    rank,
  });
  
  export default withContext(mapContextToProps)(TaxonomyChart);