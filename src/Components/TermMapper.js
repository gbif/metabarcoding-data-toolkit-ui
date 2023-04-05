import { useEffect, useState, useReducer } from "react";
import { Table, Popover, Typography, Row, Col, theme, Button, message } from "antd"
import HeaderSelect from "./HeaderSelect";
import DefaultValueSelect from "./DefaultValueSelect";
import { InfoCircleOutlined } from '@ant-design/icons';
import withContext from "./hoc/withContext"
import config from "../config";
import { axiosWithAuth } from "../Auth/userApi";
import {useNavigate, useMatch} from 'react-router-dom'
const { useToken } = theme;
const { Title } = Typography

/**
 * Todo: Allow user to search for remaining terms they would like to add (i.e. non mandatory and without a direct match in their own headers)
 */

const reducer = (state, action) => {
    switch (action.type) {
        case 'mapTaxonTerm':
            return { ...state, taxa: {...state.taxa, [action.payload.term]: action.payload.value}};
        case 'mapSampleTerm':
            return { ...state, samples: {...state.samples, [action.payload.term]: action.payload.value}};
        case 'createDefaultValue':
            return {...state, defaultValues: {...state.defaultValues, [action.payload.term]: action.payload.value}}
        case 'loadStoredMapping':
            return action.payload
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
  }; 

const initialState = {taxa: {}, samples: {}, defaultValues: {}};

const TermMapper = ({ dwcTerms, requiredTerms, dataset }) => {
    const { token } = useToken();
    const navigate = useNavigate()
    const match = useMatch(`/dataset/:key/term-mapping`)
    const [termMap, setTermMap] = useState(new Map(Object.keys(dwcTerms).map(t => [t, dwcTerms[t]])))
    const [sampleTerms, setSampleTerms] = useState([]);
    const [taxonTerms, setTaxonTerms] = useState([]);
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        setTermMap(new Map(Object.keys(dwcTerms).map(t => [t, dwcTerms[t]])))
        if (termMap.size > 0 && requiredTerms?.sample && dataset?.sampleHeaders) {
            const reqSampleTerms = new Set(requiredTerms?.sample.map(t => t.name))
            setSampleTerms([...requiredTerms?.sample.map(t => {
                if (t.name !== 'id' && termMap.has(t.name)) {
                    return { ...t, ...termMap.get(t.name) }
                } else {
                    return t
                }
            }), ...dataset?.sampleHeaders?.filter(h => !reqSampleTerms.has(h) && termMap.has(h)).map(h => termMap.get(h))])
        }
        if (termMap.size > 0 && requiredTerms?.taxon && dataset?.taxonHeaders) {
            const reqTaxonTerms = new Set(requiredTerms?.taxon.map(t => t.name))
            setTaxonTerms([...requiredTerms?.taxon.map(t => {
                if (t.name !== 'id' && termMap.has(t.name)) {
                    return { ...t, ...termMap.get(t.name) }
                } else {
                    return t
                }
            }), ...dataset?.taxonHeaders?.filter(h => !reqTaxonTerms.has(h) && termMap.has(h)).map(h => termMap.get(h))])
        }

        if(dataset?.mapping){
            dispatch({ type: 'loadStoredMapping', payload: dataset?.mapping })

        }

    }, [dwcTerms, requiredTerms, dataset])

    useEffect(() => {
    }, [dataset])

    const saveMapping = async () => {

        console.log(state)
       
            try {
                setLoading(true)
                const taxaMapping = Object.keys(state.taxa).reduce((acc, key) => {
                    if(!!state.taxa[key]){
                        acc[key] = state.taxa[key]
                    }
                    return acc
                }, {})
                const samplesMapping = Object.keys(state.samples).reduce((acc, key) => {
                    if(!!state.samples[key]){
                        acc[key] = state.samples[key]
                    }
                    return acc
                }, {})
                const res = await axiosWithAuth.post(`${config.backend}/dataset/${dataset?.id}/mapping`, {taxa: taxaMapping, samples: samplesMapping})
                message.success("Mapping saved")
                setError(null) 
                setLoading(false)
            } catch (error) {
                message.error("Ouch - Something went wrong, the mapping was not saved")
                setError(error)
                setLoading(false)
    
            }
        

    }

    const columns = [{
        width: 250,
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, term) => <>
            <Popover placement="rightTop" trigger="click" title={text} content={term?.['dc:description'] || term?.description}>
                <InfoCircleOutlined /> </Popover> {text} {!!term.isRequired ? <span style={{ color: token.colorError }}>*</span> : ""}
        </>
    }
    ]
    const getMappingColumn = (headers,type) => (
        {
            title: 'Mapping',
            dataIndex: 'mapping',
            key: 'mapping',
            render: (text, term) => {
                let val;
                if(type === 'taxon' && state?.taxa?.[term.name]){
                    val =  state?.taxa?.[term.name]
                } else if(type === 'sample' && state?.samples?.[term.name]){
                    val =  state?.samples?.[term.name]
                }
                return (<HeaderSelect term={term} headers={headers} val={val} onChange={ val => {
                    /* console.log('update '+term.name)
                    console.log('Value '+val) */
                    if(type === 'taxon'){
                        dispatch({ type: 'mapTaxonTerm', payload: {term: term.name, value: val} })
                    } else if(type === 'sample'){
                        dispatch({ type: 'mapSampleTerm', payload: {term: term.name, value: val} })
                    }
                }
                } />)
            }
        }
    )

    const getDefaultValueColumn = () => (
        {
            title: 'Default value',
            dataIndex: 'defaultValue',
            key: 'defaultValue',
            render: (text, term) => <DefaultValueSelect term={term} onChange={ val => {
               
                    dispatch({ type: 'createDefaultValue', payload: {term: term.name, value: val} })
                
            }
            } />
        }
    )

    return <>
        <Row>
            <Col flex="auto"></Col>
            <Col><Button onClick={saveMapping}>Save mapping</Button><Button style={{marginLeft: "10px"}} onClick={() => navigate(`/dataset/${match?.params?.id}/process`)}>Proceed to processing</Button></Col>
        </Row>
        <><Title level={5}>Sample</Title>
            <Table
                dataSource={sampleTerms} columns={[...columns, getMappingColumn(dataset?.sampleHeaders, 'sample'), getDefaultValueColumn()]}
                size="small"
                showHeader={false}
                pagination={false}
            />
        </>

        <><Title level={5} style={{ marginTop: '10px' }}>Taxon</Title>

            <Table
                dataSource={taxonTerms} columns={[...columns, getMappingColumn(dataset?.taxonHeaders, 'taxon'), getDefaultValueColumn()]}
                size="small"
                showHeader={false}
                pagination={false}
            />
        </>
    </>

}

const mapContextToProps = ({ user, login, logout, dataset, dwcTerms, requiredTerms }) => ({
    user,
    login,
    logout,
    dataset,
    dwcTerms,
    requiredTerms
});

export default withContext(mapContextToProps)(TermMapper);
