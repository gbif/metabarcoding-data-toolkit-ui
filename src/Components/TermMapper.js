import { useEffect, useState, useReducer, useRef } from "react";
import { Table, Popover, Typography, Row, Col, theme, Button, Tour, Tag, message, notification } from "antd"
import HeaderSelect from "./HeaderSelect";
import DefaultValueSelect from "./DefaultValueSelect";
import DwcTermSelect from "./DwcTermSelect";
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import withContext from "./hoc/withContext"
import config from "../config";
import { axiosWithAuth } from "../Auth/userApi";
import {useNavigate, useMatch} from 'react-router-dom'
import _ from 'lodash'
const { useToken } = theme;
const { Title, Text } = Typography


const reducer = (state, action) => {
    switch (action.type) {
        case 'mapTaxonTerm':
            return { ...state, taxa: action.payload.value ? {...state.taxa, [action.payload.term]: action.payload.value} : _.omit(state.taxa, action.payload.term)};
        case 'mapSampleTerm':
            return { ...state, samples: action.payload.value ? {...state.samples, [action.payload.term]: action.payload.value} : _.omit(state.samples, action.payload.term)};
        case 'createDefaultValue':
            return {...state, defaultValues:  action.payload.value ? {...state.defaultValues, [action.payload.term]: action.payload.value} : _.omit(state.defaultValues, action.payload.term)}
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
    const [open, setOpen] = useState(false);
    const [unMapped, setUnMapped] = useState([])

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);

  const steps = [
    {
      title: 'Field name in Darwin Core',
      description: <>The <a href="http://rs.tdwg.org/dwc">Darwin Core Standard (DwC)</a> offers a stable, straightforward and flexible framework for compiling biodiversity data from varied and variable sources. In order to make your data interpretable for GBIF, you will have to map the columns in your data onto these standard fields. Full lists of available fieldnames can be found here <a href="https://rs.gbif.org/core/dwc_occurrence_2022-02-02.xml">Occurrence</a> and here <a href="https://rs.gbif.org/extension/gbif/1.0/dna_derived_data_2022-02-23.xml">DNA derived data</a></>,
      target: () => ref1.current,
    },
    {
        title: 'Adding more fields to your mapping',
        description: 'If you want to add more DWC fields to your mapping than present in the table by defualt, you can search and add them here.',
        target: () => ref5.current,
      },
    {
      title: 'Your field name',
      description: <>Select the field in your data that you want to map to the Darwin Core field. For example, you might want to map your field <Text code>lat</Text> to the Darwin Core term <Text code>decimalLatitude</Text></>,
      target: () => ref2.current,
    },
    {
      title: 'Default values',
      description: <>You may also set/select a default value that applies to the entire dataset. Examples of good candidates for defualt values are <Text code>target_gene</Text> (ITS, COI, 16S, etc), <Text code>pcr_primer_forward</Text>,  <Text code>pcr_primer_reverse</Text>, <Text code>otu_db</Text> (the reference database used for taxonomic annotation) </>,
      target: () => ref3.current,
    },
    {
        title: 'Proceed to the data processing',
        description: 'Once you have mapped the fields in your data to the equivalent Darwin core fields, you can proceed to the data processing step',
        target: () => ref4.current,
      },
  ];

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
        if(dataset){
            setUnMapped(getUnMappedFields())
        }
    }, [dataset, state])

   
    const saveMapping = async () => {

       // console.log(state)
       checkImportantTermsExist()
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
                const defaultValues = Object.keys(state?.defaultValues || {}).reduce((acc, key) => {
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
                console.log(error)
                setError(error)
                setLoading(false)
    
            }
        

    }

    const checkImportantTermsExist = () => {
        const hasLatLon = (dataset?.sampleHeaders.includes('decimalLatitude') || Object.keys(state.samples).includes('decimalLatitude')) && (dataset?.sampleHeaders.includes('decimalLongitude') || Object.keys(state.samples).includes('decimalLongitude'));
        const hasEventDate = dataset?.sampleHeaders.includes('eventDate') || Object.keys(state.samples).includes('eventDate');
        const hasSequence = dataset?.files?.format.endsWith('_FASTA') || dataset?.taxonHeaders.includes('DNA_sequence') || Object.keys(state.taxa).includes('DNA_sequence');

        if(!hasSequence || !hasLatLon || !hasEventDate){
            notification.warning({
                duration: 0,
                message: 'Attention',
                description: <ul>
                    {!hasLatLon && <li>You have no fields named 'decimalLatitude' and 'decimalLongitude' and you have not provided mappings for those fields.</li>}
                    {!hasEventDate && <li>You have no field named 'eventDate' and you have not provided a mapping for that field.</li>}
                    {!hasSequence && <li>You have no field named 'DNA_sequence' and you have not provided a mapping for that field.</li>}
                    </ul>,
              })
        }

    }

    const getUnMappedFields = () => {
        try {
            const mapped = new Set([...Object.keys(state?.samples).map(s => state?.samples?.[s]), ...Object.keys(state?.taxa).map(s => state?.taxa?.[s]) ])
            const unMappedSampleTerms = dataset?.sampleHeaders.filter(t => !termMap.has(t) && !mapped.has(t) && !state?.defaultValues?.[t] && t.toLowerCase() !== 'id' ) 
            const unMappedTaxonTerms = dataset?.taxonHeaders.filter(t => !termMap.has(t) && !mapped.has(t) && !state?.defaultValues?.[t] && t.toLowerCase() !== 'id'  );
            return [...unMappedSampleTerms, ...unMappedTaxonTerms]
        } catch (error) {
            console.log(error)
        }
    }

   
    const getDwcColumn = (ref) => (
        {
            width: 300,
            title:  <span ref={ref}>Standardised field name (DwC term)</span>,
            dataIndex: 'name',
            key: 'name',
            render: (text, term) => <>
                <Popover placement="rightTop" trigger="click" title={text} content={term?.description || term?.['dc:description'] }>
                    <InfoCircleOutlined /> </Popover> {text} {!!term.isRequired ? <span style={{ color: token.colorError }}>*</span> : ""}
            </>
        }
    )
    const getMappingColumn = (headers,type, ref) => (
        {
            title: <span ref={ref}>Map to field in your data</span>,
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

    const getDefaultValueColumn = (ref) => (
        {
            title: <span ref={ref}>or select/enter a Default value</span>,
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
                if(state.taxa[term?.name]){
                    dispatch({ type: 'mapTaxonTerm', payload: {term: term.name, value: null} })
                }
                if(state.samples[term?.name]){
                    dispatch({ type: 'mapSampleTerm', payload: {term: term.name, value: null} })
                }
                if(state.defaultValues[term?.name]){
                    dispatch({ type: 'createDefaultValue', payload: {term: term.name, value: null} })
                }
            }}>Delete</Button>,
          }
    )

    return <>
    <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
        <Row>
            <Col><Button style={{marginLeft: "-18px"}} type="link" onClick={() => setOpen(true)}><QuestionCircleOutlined /> How to use this form</Button></Col>
            <Col flex="auto"></Col>
            <Col>
            <Button onClick={saveMapping}>Save mapping</Button>
            <Button ref={ref4} style={{marginLeft: "10px"}} type="primary"
                onClick={async () => { 
                    await saveMapping()
                    navigate(`/dataset/${dataset?.id}/process`)}}>Proceed</Button></Col>
            </Row>
        <><Title level={5}>Sample</Title>
            <Table
                dataSource={sampleTerms} columns={[getDwcColumn(ref1), getMappingColumn(dataset?.sampleHeaders, 'sample', ref2), getDefaultValueColumn(ref3), getDeleteRowColumn('sample')]}
                size="small"
                pagination={false}
                
            />
            
            <DwcTermSelect 
               ref={ref5}
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
                dataSource={taxonTerms} columns={[getDwcColumn(), getMappingColumn(dataset?.taxonHeaders, 'taxon'), getDefaultValueColumn(), getDeleteRowColumn('taxon')]}
                size="small"
                pagination={false}
               
            />
            
            <DwcTermSelect style={{width: 500, marginTop: "10px"}} placeholder={"Add mapping for another Taxon/ASV field"} dwcTerms={dwcTerms} filterToGroups={['Taxon']}  onSelect={val => setTaxonTerms([...taxonTerms, termMap.get(val)])}/>

        </>
        <Title level={5} style={{ marginTop: '10px' }}>Unmappped fields <Popover placement="rightTop" trigger="click" title={"Unmapped fields"} content={<><p>Here is a list of the fields in your data that has not yet been mapped to a standard field name. </p><p>
        Not all fields does neccessarily map to standard fields in a logical sense.</p><p> Unmapped fields will stil be available in the BIOM files created in the next step, but they will not be in the Darwin Core achive.</p></>}>
                    <InfoCircleOutlined /> </Popover></Title> 
        <Row>

            <p>{unMapped.map(t => <Tag style={{marginBottom: "8px"}}>{t}</Tag>)}</p>
        </Row>
        <Row>
            <Col flex="auto"></Col>
            <Col>
            <Button onClick={saveMapping}>Save mapping</Button>
            <Button style={{marginLeft: "10px"}} type="primary"
                onClick={async () => { 
                    await saveMapping()
                    navigate(`/dataset/${dataset?.id}/process`)}}>Proceed</Button></Col>
            </Row>
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
