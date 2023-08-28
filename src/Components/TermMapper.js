import { useEffect, useState, useReducer } from "react";
import { Table, Popover, Typography, Row, Col, theme, Button, message } from "antd"
import HeaderSelect from "./HeaderSelect";
import DefaultValueSelect from "./DefaultValueSelect";
import DwcTermSelect from "./DwcTermSelect";
import { InfoCircleOutlined } from '@ant-design/icons';
import withContext from "./hoc/withContext"
import config from "../config";
import { axiosWithAuth } from "../Auth/userApi";
import {useNavigate, useMatch} from 'react-router-dom'
const { useToken } = theme;
const { Title } = Typography


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

const TermMapper = ({ dwcTerms, requiredTerms, defaultTerms, dataset }) => {
    const { token } = useToken();
    const navigate = useNavigate()
    const match = useMatch(`/dataset/:key/term-mapping`)
    const [termMap, setTermMap] = useState(new Map(Object.keys(dwcTerms).map(t => [t, dwcTerms[t]])))
    const [defaultTermMap, setDefaultTermMap ] = useState(new Map())
    const [sampleTerms, setSampleTerms] = useState([]);
    const [taxonTerms, setTaxonTerms] = useState([]);
    const [state, dispatch] = useReducer(reducer, (dataset?.mapping || initialState));
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        setTermMap(new Map(Object.keys(dwcTerms).map(t => [t, dwcTerms[t]])))
        if (termMap.size > 0 && requiredTerms?.sample && dataset?.sampleHeaders) {
            const reqSampleTerms = new Set(requiredTerms?.sample.map(t => t.name))
            const otherFieldsAndDefaultVals = new Set([...dataset?.sampleHeaders, ...(dataset?.mapping?.defaultValues ? Object.keys(dataset?.mapping?.defaultValues): [])])
           // console.log(...otherFieldsAndDefaultVals)
            setSampleTerms([...requiredTerms?.sample.map(t => {
                if (t.name !== 'id' && termMap.has(t.name)) {
                    return { ...t, ...termMap.get(t.name) }
                } else {
                    return t
                }
            }), ...[...otherFieldsAndDefaultVals].filter(h => !reqSampleTerms.has(h) && termMap.has(h)).map(h => termMap.get(h))])
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

        if(defaultTerms || dataset?.mapping?.defaultValues){

            let additionalDefaults = !dataset?.mapping?.defaultValues ? [] : Object.keys(dataset?.mapping?.defaultValues).filter(t => termMap.has(t)).map(t => [t, termMap.get(t)])
            setDefaultTermMap(new Map([...additionalDefaults, ...defaultTerms.map(t => [t.name, t])]))
        }

        if(dataset?.mapping){
            dispatch({ type: 'loadStoredMapping', payload: dataset?.mapping })

        }

    }, [dwcTerms, requiredTerms, defaultTerms, dataset])

    useEffect(() => {
    }, [dataset])

    const saveMapping = async () => {

       // console.log(state)
       
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
                const defaultValues = Object.keys(state.defaultValues).reduce((acc, key) => {
                    if(!!state.defaultValues[key]){
                        acc[key] = state.defaultValues[key]
                    }
                    return acc
                }, {})
                const res = await axiosWithAuth.post(`${config.backend}/dataset/${dataset?.id}/mapping`, {taxa: taxaMapping, samples: samplesMapping, defaultValues: defaultValues})
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
        width: 300,
        title: 'Standardised field name (DwC term)',
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
            title: 'Map to field in your data',
            dataIndex: 'mapping',
            key: 'mapping',
            width: "30%",
            render: (text, term) => {
                let val;
                if(type === 'taxon' && state?.taxa?.[term.name]){
                    val =  state?.taxa?.[term.name]
                } else if(type === 'sample' && state?.samples?.[term.name]){
                    val =  state?.samples?.[term.name]
                }
                // first check special case when a fasta file is given
                return dataset?.files?.format.endsWith('_FASTA') && term.name === 'DNA_sequence' ? "Retrieved from fasta file" : (<HeaderSelect term={term} headers={headers} val={val} onChange={ val => {
                    /*  console.log('update '+term.name)
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
            title: 'or select/enter a Default value',
            dataIndex: 'defaultValue',
            key: 'defaultValue',
            render: (text, term) =>  defaultTermMap.has(term?.name)  ? <DefaultValueSelect initialValue={state?.defaultValues?.[term?.name]} vocabulary={defaultTermMap.get(term?.name)?.vocabulary} ontology={defaultTermMap.get(term?.name)?.ontology} term={term} onChange={ val => {
               
                    dispatch({ type: 'createDefaultValue', payload: {term: term.name, value: val} })
                
            }
            } /> : null
        }
    )

    const getDeleteRowColumn = (type) => (
        {
            title: '',
            key: 'action',
            render: (text, term) => !!term.isRequired ? null : <Button type="link" onClick={() => {
                if(type === 'taxon'){
                    setTaxonTerms(taxonTerms.filter(t => t?.name !== term?.name))
                } else if(type === 'sample'){
                    setSampleTerms(sampleTerms.filter(t => t?.name !== term?.name))
                }
            }}>Delete</Button>,
          }
    )

    return <>
        <Row>
            <Col flex="auto"></Col>
            <Col>
            <Button onClick={saveMapping}>Save mapping</Button>
            <Button style={{marginLeft: "10px"}} type="primary"
                onClick={async () => { 
                    await saveMapping()
                    navigate(`/dataset/${dataset?.id}/process`)}}>Proceed to processing</Button></Col>
            </Row>
        <><Title level={5}>Sample</Title>
            <Table
                dataSource={sampleTerms} columns={[...columns, getMappingColumn(dataset?.sampleHeaders, 'sample'), getDefaultValueColumn(), getDeleteRowColumn('sample')]}
                size="small"
                pagination={false}
            />
            
            <DwcTermSelect 
                style={{width: 500, marginTop: "10px"}} 
                placeholder={"Add mapping for another sample field"} 
                dwcTerms={dwcTerms} 
                omitGroups={['Taxon']} 
                onSelect={val => {
                    if(!defaultTermMap.has(val)){
                        defaultTermMap.set(val, termMap.get(val))
                    }  
                    setSampleTerms([...sampleTerms, termMap.get(val)])
                } }/>
        </>

        <><Title level={5} style={{ marginTop: '10px' }}>Taxon</Title>

            <Table
                dataSource={taxonTerms} columns={[...columns, getMappingColumn(dataset?.taxonHeaders, 'taxon'), getDefaultValueColumn(), getDeleteRowColumn('taxon')]}
                size="small"
                pagination={false}
            />
            
            <DwcTermSelect style={{width: 500, marginTop: "10px"}} placeholder={"Add mapping for another Taxon/ASV field"} dwcTerms={dwcTerms} filterToGroups={['Taxon']}  onSelect={val => setTaxonTerms([...taxonTerms, termMap.get(val)])}/>

        </>
    </>

}

const mapContextToProps = ({ user, login, logout, dataset, dwcTerms, requiredTerms, defaultTerms }) => ({
    user,
    login,
    logout,
    dataset,
    dwcTerms,
    requiredTerms,
    defaultTerms
});

export default withContext(mapContextToProps)(TermMapper);
