import React, { useState, useEffect, useMemo, useRef } from "react";
import { Row, Col, Spin, Select, Checkbox, Typography } from "antd";
import axios from "axios";
import Highcharts from "highcharts";
import config from "../config";

import HC_exporting from "highcharts/modules/exporting";
import HighchartsReact from "highcharts-react-official";
import _ from 'lodash'
import withContext from "../Components/hoc/withContext";

const { Text } = Typography;
HC_exporting(Highcharts);

const configOptions = [
    { byAbundance: true, stacking: 'percent', label: 'Relative read abundance' },
    { byAbundance: true, stacking: 'normal', label: 'Absolute read abundance' },
    { byAbundance: false, stacking: 'percent', label: 'Relative OTU/ASV abundance' },
    { byAbundance: false, stacking: 'normal', label: 'Absolute OTU/ASV abundance' }];

const TaxonomyBarplot = ({ dataset, onSampleClick, selectedSample, taxonomyDataMap, taxonomyBySampleDataMap, taxonomyLoading: loading }) => {
    const [data, setData] = useState(null)
    const [options, setOptions] = useState(null)
  //  const [loading, setLoading] = useState(false)
    const [rank, setRank] = useState('class')
    const [chartConfig, setChartConfig] = useState(configOptions[0])
    const [hoverPoint, setHoverPoint] = useState(null);
    const chartRef = useRef()

    useEffect(() => {
        if (dataset?.id && taxonomyDataMap && taxonomyBySampleDataMap) {
            initChart()
        }
    }, [dataset?.id, taxonomyDataMap, taxonomyBySampleDataMap])

    useEffect(() => {
        if (taxonomyDataMap && taxonomyBySampleDataMap) {
            initChart(rank)
        }
    }, [rank, chartConfig.byAbundance, chartConfig.stacking, taxonomyDataMap, taxonomyBySampleDataMap])


    useEffect(() => {
        const chart = chartRef.current?.chart;

        if (selectedSample && chart) {
            if (hoverPoint) {
                hoverPoint.setState()
            }

            const point = chart.series[0]?.data.find(d => d?.category === selectedSample);
            if (point) {
                point.setState('hover');
                setHoverPoint(point)
                chart.tooltip.refresh(point);

            }
        }
    }, [selectedSample])


    const getChartData = (rank,  byAbundance) => {
        try {
            const dataMap = taxonomyDataMap[rank]
           
            const sortedData = Object.keys(dataMap).map(key => {
               return { name: key, value: byAbundance ? dataMap[key].readCount :  dataMap[key].value}
            }).sort((a, b) => b.value - a.value);
            const topTaxa = sortedData.slice(0, 10).map(e => e.name);
            const topTaxaSet = new Set(topTaxa);
            const categories = Object.keys(taxonomyBySampleDataMap);
            console.log(topTaxa)
            const series = [...topTaxa, 'Other taxa'].map(taxon => ({
                name: taxon,
                data: categories.map(sampleID => {
                    const sample = taxonomyBySampleDataMap[sampleID][rank];
                    return taxon !== 'Other taxa' ? 
                    ((byAbundance ? sample?.[taxon]?.readCount : sample?.[taxon]?.value )|| 0) 
                    : Object.keys(sample).reduce((acc, cur) => (topTaxaSet.has(cur) ? acc : acc + (byAbundance ? sample?.[taxon]?.readCount : sample?.[taxon]?.value )), 0)
                }),
                point: {
                    events: {
                        click: (e) => {
                            console.log(e)
                            if (typeof onSampleClick === "function" && e?.point?.category) {
                                onSampleClick(e?.point?.category)
                            }

                        },
                    },
                }
            }))

            return {
                series,
                categories
            }
        } catch (error) {
            console.log(error)
        }


    }

    const initChart = ( rank = "class") => {
        console.log("INIT")
        const { byAbundance, stacking } = chartConfig;
        const { series, categories } = getChartData( rank, byAbundance);
        const options = {
            chart: {
                type: 'column',
                zoomType: 'x'

            },
            title: {
                text: '',
                align: 'center'
            },
            subtitle: {
                text: 'Click to inspect a sample'
              },
            xAxis: {
                categories
            },
            yAxis: {
                min: 0,
                title: {
                    text: byAbundance ? 'Read count' : 'ASV count'
                },
                stackLabels: {
                    enabled: false
                }
            },

            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                itemMarginTop: 4,
                itemMarginBottom: 0,
                itemStyle: {
                    "width": 80,
                    "fontSize": "8px",
                    "textOverflow": "ellipsis"
                }
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            plotOptions: {
                column: {
                    stacking: stacking,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series
        }

        setOptions(options)

    }

    return loading || !options ? (
        <Row style={{ padding: "48px" }}>
            <Col flex="auto"></Col>
            <Col>
                <Spin size="large" />
            </Col>
            <Col flex="auto"></Col>
        </Row>
    ) : (
        <>
            <Row>
            <Col >
                    <Select style={{ marginLeft: "8px" }}  value={chartConfig} onChange={val => {
                        const option = configOptions.find(o => o.label === val)
                        if (option) {
                            setChartConfig(option)
                        }
                    }

                    }>
                        {configOptions.map(o => <Select.Option value={o.label} key={o.label}>
                            {o.label}
                        </Select.Option>)}


                    </Select>
                </Col>
                <Col flex="auto"></Col>

                <Col>
                    <Text>Taxon rank:</Text>
                    <Select style={{ marginLeft: '8px', width: "200px" }} value={rank} onChange={setRank}>
                        {['phylum', 'class', 'order', 'family', 'genus'].map(r => <Select.Option value={r} key={r}>{r}</Select.Option>)}

                    </Select>
                </Col>
                
                
            </Row>
            <Row>
                <Col span={24}>
                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
                </Col>
            </Row></>
    );


}

const mapContextToProps = ({ dataset, rank }) => ({
    dataset,
    rank,
});

export default withContext(mapContextToProps)(TaxonomyBarplot);
