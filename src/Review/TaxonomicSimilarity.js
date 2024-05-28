 import React, { useState, useEffect, useRef, useMemo } from "react";
import { Row, Col, Spin, Select, Typography } from "antd";
import Highcharts, { setOptions } from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import HC_sunburst from "highcharts/modules/sunburst";
import HC_colorAxis from "highcharts/modules/coloraxis"
import HighchartsReact from "highcharts-react-official";
import withContext from "../Components/hoc/withContext";
import Help from "../Components/Help"
import config from "../config";
import { values } from "lodash";
import axios from "axios";
const {Text} = Typography
HC_exporting(Highcharts);
HC_colorAxis(Highcharts)

const getChartOptions = (data, type, onSampleClick) => {
  
       //  console.log(JSON.stringify(data))
  let options = {
    colorAxis: {
      
        min: Math.min(...data.map(e => e.colorValue)), 
        max: Math.max(...data.map(e => e.colorValue)),
        },

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
       /* legend: {
        enabled: false
      },  */
        plotOptions: {
        scatter: {

          colorKey: 'colorValue',
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
         type: 'scatter',
         colorKey: 'colorValue',

          name: "Sample",
         
          turboThreshold: 5000,

        
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
          },
          data: data,
        }]
    };
  // console.log(JSON.stringify(options))
    return options
  
};

const TaxonomyChart = ({loading, onSampleClick, selectedSample, sampleLabels, jaccard, brayCurtis, sampleHeaders, datasetKey}) => {
  const [error, setError] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [indexType, setIndexType] = useState('jaccard');
  const [colorBy, setColorBy] = useState(null)
  const [colorByData, setColorByData] = useState(null)
  // const options = useMemo(() => !(sparseMatrix && sampleLabels) ? null : getChartOptions(getDataForDissimilarityPlot(sparseMatrix, indexType, sampleLabels) ,indexType, onSampleClick), [sparseMatrix, indexType, sampleLabels]);
  const jaccardOptions = useMemo(() => !(jaccard && sampleLabels) ? null : getChartOptions(jaccard.map((e,i) => colorByData ? {...e, colorValue: Number(colorByData?.[i])} : e), "jaccard" , onSampleClick), [jaccard, sampleLabels, colorByData]);
  const brayCurtisOptions = useMemo(() => !(brayCurtis && sampleLabels) ? null : getChartOptions(brayCurtis.map((e,i) => colorByData ? {...e, colorValue: Number(colorByData?.[i])} : e), "bray-curtis" , onSampleClick), [brayCurtis, sampleLabels, colorByData]);

   const chartRef = useRef()
   useEffect(() => {
    if(!!colorBy){
      getSampleMetadataColumn(colorBy)
    } else {
      setColorByData(null)
    }
  }, [colorBy])

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

 const getSampleMetadataColumn = async (column) => {
    try {
      
      const data = await axios.get(`${config.backend}/dataset/${datasetKey}/data/sample/metadata/${column}`);

      setColorByData(data?.data)
    } catch (error) {
      console.log(error)
    }

 }

      return loading  ? (
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
        <Col style={{marginRight: "10px"}}>Color by:</Col>
          <Col>
            <Select value={colorBy} onChange={setColorBy} style={{width: 200}} options={(sampleHeaders || []).map(h => ({value: h, label: h}))}></Select>
          </Col>
          <Col flex="auto"></Col>
         <Col style={{marginRight: "10px"}}>Choose distance metric:</Col>
          <Col >
            <Select style={{width: 200}} value={indexType} onChange={setIndexType}>
              <Select.Option value={"jaccard"}>Jaccard index</Select.Option>
              <Select.Option value={"bray-curtis"}>Bray-Curtis Dissimilarity</Select.Option>
            </Select> <Help title="" content={<ul>
              <li>The <a href="https://en.wikipedia.org/wiki/Jaccard_index" target="_blank">Jaccard index</a> is purely presence/absence based and does not take abundance into account.</li>
              <li><a href="https://en.wikipedia.org/wiki/Bray%E2%80%93Curtis_dissimilarity" target="_blank">Bray-Curtis dissimilarity</a> integrates information about species abundance. This plot is based on relative abundances. To adjust influence of high numbers, the fourth root of each value is used: <Text code>(readCount / totalReadCountInSample * 100) ^0.25</Text></li>
            </ul>}/>
          </Col>
        </Row>
       {indexType === "jaccard" && <HighchartsReact ref={chartRef} highcharts={Highcharts} options={jaccardOptions} />} 
       {indexType === "bray-curtis" && <HighchartsReact ref={chartRef} highcharts={Highcharts} options={brayCurtisOptions} />} 
{/*         <HighchartsReact ref={chartRef} highcharts={Highcharts} options={brayCurtisOptions} />
 */}        </>
      );
}

const mapContextToProps = ({ dataset, rank }) => ({
    dataset,
    rank,
  });
  
  export default withContext(mapContextToProps)(TaxonomyChart);