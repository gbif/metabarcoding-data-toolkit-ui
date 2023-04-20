 import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Spin } from "antd";
import axios from "axios";
import Highcharts from "highcharts";
import config from "../config";
import {getDataForDissimilarityPlot} from "../Util/ordination"

import HC_exporting from "highcharts/modules/exporting";
import HC_sunburst from "highcharts/modules/sunburst";
import HighchartsReact from "highcharts-react-official";
import _ from 'lodash'
import withContext from "../Components/hoc/withContext";

HC_exporting(Highcharts);
HC_sunburst(Highcharts);

const TaxonomyChart = ({dataset, onSampleClick, selectedSample}) => {
    const [options, setOptions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [hoverPoint, setHoverPoint] = useState(null);
   const chartRef = useRef()
  useEffect(() => {

    if(dataset){
        getData(dataset)
    }
  }, [dataset])

  useEffect(()=>{
    const chart = chartRef.current?.chart;
    
    if(selectedSample && chart){
        if(hoverPoint){
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



  const  getData = async (dataset) => {
    try {
      setLoading(true)
      const res = await axios.get(`${config.backend}/dataset/${dataset.id}/data/ordination`)
      const plotData = getDataForDissimilarityPlot(res?.data);

      initChart(plotData)
     setLoading(false)

    } catch (error) {
      setLoading(false)

    }
  }
  
    
      const initChart = (data) => {
       
    
       
        let options = {
            
            chart: {
                title: "Taxonomic similarity between samples",
              type: 'scatter',
              zoomType: 'xy'
            },
            title: {
                text: "Taxonomic similarity between samples"
              },
            
              subtitle: {
                text: 'Click to inspect a sample'
              },
           /*  xAxis: {
              title: {
                text: 'Height'
              },
              labels: {
                format: '{value} m'
              },
              startOnTick: true,
              endOnTick: true,
              showLastLabel: true
            }, */
            /* yAxis: {
              title: {
                text: 'Weight'
              },
              labels: {
                format: '{value} kg'
              }
            }, */
            legend: {
              enabled: true
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
    
        setOptions(options);
      };

      return invalid ? null : loading || !options ? (
        <Row style={{ padding: "48px" }}>
          <Col flex="auto"></Col>
          <Col>
            <Spin size="large" />
          </Col>
          <Col flex="auto"></Col>
        </Row>
      ) : (
        <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
      );
}

const mapContextToProps = ({ dataset, rank }) => ({
    dataset,
    rank,
  });
  
  export default withContext(mapContextToProps)(TaxonomyChart);