import { useEffect, useState, useReducer, useRef } from "react";
import { Table, Popover, Typography, Row, Col,Skeleton, theme, Button, Tour, Tag, message, notification, Input } from "antd"
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
        case 'createMeasurement':
            return {...state, measurements:  action.payload.value ? {...(state.measurements || {}), [action.payload.term]: action.payload.value} : _.omit(state.measurements, action.payload.term)}
        case 'loadStoredMapping':
            return {taxa: {...action.payload.taxa, ...state.taxa}, samples: {...action.payload.samples, ...state.samples}, defaultValues: {...action.payload.defaultValues, ...state.defaultValues}, measurements: {...action.payload.measurements, ...state.measurements}}
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
  }; 

const initialState = {taxa: {}, samples: {}, defaultValues: {}, measurements: {}};

const TermMapper = ({ dwcTerms, requiredTerms, defaultTerms, dataset, fileNameSynonyms }) => {
    const { token } = useToken();
    const navigate = useNavigate()
    const match = useMatch(`/dataset/:key/term-mapping`)
    const [termMap, setTermMap] = useState(new Map(Object.keys(dwcTerms).map(t => [t, dwcTerms[t]])))
    const [defaultTermMap, setDefaultTermMap ] = useState(new Map())
    const [sampleTerms, setSampleTerms] = useState([]);
    const [taxonTerms, setTaxonTerms] = useState([]);
    const [state, dispatch] = useReducer(reducer, (dataset?.mapping ? {...dataset?.mapping}: {...initialState}));
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [open, setOpen] = useState(false);
    const [unMapped, setUnMapped] = useState([]);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);


  const steps = [
    {
      title: 'Field name (term) in Darwin Core',
      description: <>The <a href="http://rs.tdwg.org/dwc" target="_blank" rel="noreferrer">Darwin Core Standard (DwC)</a> offers a stable, straightforward and flexible framework for compiling biodiversity data from varied and variable sources. In order to make your data interpretable for GBIF, you will have to map the columns (fields) in your data onto these standard terms. Full lists of available terms can be found here (<a target="_blank" rel="noreferrer" href="https://rs.gbif.org/core/dwc_occurrence_2022-02-02.xml">Occurrence Core</a>) and here (<a target="_blank" rel="noreferrer" href="https://rs.gbif.org/extension/gbif/1.0/dna_derived_data_2022-02-23.xml">DNA derived data</a>)</>,
      target: () => ref1.current,
    },
    {
        title: 'Adding more fields to your mapping',
        description: 'If you wish to add more DwC terms to your mapping than present in this form by default, you can search and add them here.',
        target: () => ref5.current,
      },
    {
      title: 'Your field name',
      description: <>Select the field in your data that you want to map to the Darwin Core term. For example, you might want to map your field  <Text code>lat</Text> to the Darwin Core term <Text code>decimalLatitude</Text></>,
      target: () => ref2.current,
    },
    {
      title: 'Default/global values',
      description: <>You may also set/select a default (global) value that applies to the entire dataset. Examples of good candidates for default values are <Text code>target_gene</Text> (ITS, COI, 16S, etc), <Text code>pcr_primer_forward</Text>,  <Text code>pcr_primer_reverse</Text>, <Text code>otu_db</Text> </>,
      target: () => ref3.current,
    },
    {
        title: 'Adding measurements',
        description: <>You may have fields that do not fit into the standard set of Darwin Core terms (often various measurements). These can be added to the <a href="https://rs.gbif.org/extension/obis/extended_measurement_or_fact_2023-08-28.xml" target="_blank">Extended Measurement Or Facts</a> extension which is a key/value based extension that allows any measurement type. This is where you can add information about pH, salinity, sample biomass etc.</>,
        target: () => ref6.current,
      },
    {
        title: 'Proceed to the data processing',
        description: 'Once you have mapped the fields in your data to the equivalent Darwin Core terms, you can proceed to the data processing step.',
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
                const measurements = Object.keys(state?.measurements || {}).reduce((acc, key) => {
                    if(!!state.measurements[key]){
                        acc[key] = state.measurements[key]
                    }
                    return acc
                }, {})
                const res = await axiosWithAuth.post(`${config.backend}/dataset/${dataset?.id}/mapping`, {taxa: taxaMapping, samples: samplesMapping, defaultValues: defaultValues, measurements: measurements})
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

    const idsExistsOrHaveMapping = () => {
        const hasSampleID = dataset?.sampleHeaders?.includes('id') || Object.keys(state.samples).includes('id');
        const hasTaxonID = dataset?.taxonHeaders?.includes('id') || Object.keys(state.taxa).includes('id') || dataset?.files?.sequencesAsHeaders;
        if(!hasSampleID || !hasTaxonID ){
            notification.error({
                duration: 0,
                message: 'Attention',
                description: <ul>
                   
                   {!hasSampleID && <li>You have no 'id' field in your sample file and you have not provided a mapping for that field. PLease pick the id in your sample file before proceeding.</li>}
            {!hasTaxonID && <li>You have no 'id' field in your taxon file and you have not provided a mapping for that field. PLease pick the id in your taxon file before proceeding.</li>}
                    </ul>,
              })
        }
        return hasSampleID && hasTaxonID    
    }

    const checkImportantTermsExist = () => {
        const hasLatLon = (dataset?.sampleHeaders.includes('decimalLatitude') || Object.keys(state.samples).includes('decimalLatitude') || Object.keys(state.defaultValues).includes('decimalLatitude')) && (dataset?.sampleHeaders.includes('decimalLongitude') || Object.keys(state.samples).includes('decimalLongitude') || Object.keys(state.defaultValues).includes('decimalLongitude'));
        const hasEventDate = dataset?.sampleHeaders.includes('eventDate') || Object.keys(state.samples).includes('eventDate') || Object.keys(state.defaultValues).includes('eventDate');
        
        const hasSequence = /* dataset?.files?.format.endsWith('_FASTA') */dataset?.files?.files.find(f => f.type === 'fasta') || dataset?.taxonHeaders?.includes('DNA_sequence') || Object.keys(state.taxa).includes('DNA_sequence') || dataset?.files?.sequencesAsHeaders;

        if(!hasSequence || !hasLatLon || !hasEventDate ){
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
            const unMappedSampleTerms = (dataset?.sampleHeaders || []).filter(t => !termMap.has(t) && !mapped.has(t) && !state?.defaultValues?.[t] && t.toLowerCase() !== 'id' ) 
            const unMappedTaxonTerms = (dataset?.taxonHeaders || []).filter(t => !termMap.has(t) && !mapped.has(t) && !state?.defaultValues?.[t] && t.toLowerCase() !== 'id'  );
            const measurementSet = new Set(Object.keys(state?.measurements || {}))
            return [...unMappedSampleTerms, ...unMappedTaxonTerms].filter(t => !measurementSet.has(t))
        } catch (error) {
            console.log(error)
            return []
        }
    }

   
    const getDwcColumn = (ref) => (
        {
            width: 300,
            title:  <span ref={ref}>Standardised field name (DwC term)</span>,
            dataIndex: 'name',
            key: 'name',
            className: "dwc-column",
            render: (text, term) => <>
                <Popover placement="rightTop" trigger="click" title={text} content={term?.description || term?.['dc:description'] }>
                    <InfoCircleOutlined /> </Popover> {text} {!!term.isRequired ? <span style={{ color: token.colorError }}>*</span> : ""}
            </>
        }
    )

    const getExampleData = (fileType, field) => {

        try {
            const file = dataset?.files?.files?.find(f => f?.type === fileType) || dataset?.files?.files?.[0]?.sheets.find(s => fileNameSynonyms[fileType].includes(s?.name?.replace(/[^0-9a-z]/gi, "").toLowerCase()));
            const headerRow = file?.properties?.rows?.[0] || file?.rows?.[0]
            if(headerRow){
                let idx = headerRow.indexOf(field);
                return file?.properties?.rows.slice(1,4).map(e => e[idx]) || file?.rows.slice(1,4).map(e => e[idx])
            } else {
                return null
            }
        } catch (error) {
            return null
        }
    }

    const getMappingColumn = ( headers,type, ref) => (
        {
            title: (<span ref={ref}>Map to field in your data</span>),
            dataIndex: 'mapping',
            key: 'mapping',
            width: "30%",
            render: (text, term) => {
                let val = null;
                let exampleData;
                if(type === 'taxon' && !!state?.taxa?.[term.name]){
                    val =  state?.taxa?.[term.name];
                    exampleData = getExampleData('taxa', val)
                } else if(type === 'sample' && !!state?.samples?.[term.name]){
                    val =  state?.samples?.[term.name]
                    exampleData = getExampleData('samples', val)
                }

                const unmappedSet = new Set(unMapped)                
              //  console.log(exampleData)
                // first check special case when a fasta file is given
                return dataset?.files?.files.find(f => f.type === 'fasta') && term.name === 'DNA_sequence' ? "Retrieved from fasta file" : (<HeaderSelect term={term} exampleData={exampleData} headers={headers.filter(h =>  h === term?.name || unmappedSet.has(h))} value={val} onChange={ value => {
                    
                   
                    if(type === 'taxon'){
                        dispatch({ type: 'mapTaxonTerm', payload: {term: term.name, value: value} })
                    } else if(type === 'sample'){
                        dispatch({ type: 'mapSampleTerm', payload: {term: term.name, value: value} })
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

    return !!dataset ? <>
    <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
        <Row>
            <Col><Button style={{marginLeft: "-18px"}} type="link" onClick={() => setOpen(true)}><QuestionCircleOutlined /> How to use this</Button></Col>
            <Col flex="auto"></Col>
            <Col>
            <Button onClick={() => { 
                if(idsExistsOrHaveMapping() ){ 
                    saveMapping() }}}>
                        Save mapping
                        </Button>
            <Button ref={ref4} style={{marginLeft: "10px"}} type="primary"
                onClick={async () => { 
                    if(idsExistsOrHaveMapping()){ 
                    await saveMapping()
                    navigate(`/dataset/${dataset?.id}/process`)
                }}}>Proceed</Button></Col>
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
                omitTerms={['DNA_sequence']}
                onSelect={val => {
                    if(!defaultTermMap.has(val)){
                        defaultTermMap.set(val, termMap.get(val))
                    }  
                    setSampleTerms([...sampleTerms, termMap.get(val)])
                } }/>
                <Title level={5} style={{ marginTop: '10px' }}>{unMapped.length > 0 ? `Unmapped fields`:`No unmapped fields`} <Popover placement="rightTop" trigger="click" title={"Unmapped fields"} content={<><p>Here is a list of the fields in your data that has not yet been mapped to a standard field name. 
                    </p><p>If you want to map some of these fields, start by selecting their Darwin core or MiXS equivalent in the "Add Field" search box above.</p><p>
        Not all fields does neccessarily map to standard fields in a logical sense.</p><p> Unmapped fields will stil be available in the BIOM files created in the next step, but they will not be in the Darwin Core achive unless you include them as a measurement.</p><p> This can be done at the bottom of this page.</p></>}>
                    <InfoCircleOutlined /> </Popover></Title> 
                <Row>
                

<p>{unMapped.map(t => <Tag style={{marginBottom: "8px"}} >{t}</Tag>)}</p>
</Row>
        </>

        <><Title level={5} style={{ marginTop: '10px' }}>Taxon</Title>

            <Table
                dataSource={taxonTerms} columns={[getDwcColumn(), getMappingColumn(dataset?.taxonHeaders, 'taxon'), getDefaultValueColumn(), getDeleteRowColumn('taxon')]}
                size="small"
                pagination={false}
               
            />
            
            <DwcTermSelect style={{width: 500, marginTop: "10px"}} placeholder={"Add mapping for another Taxon/ASV field"} dwcTerms={dwcTerms} filterToGroups={['Taxon']}  onSelect={val => setTaxonTerms([...taxonTerms, termMap.get(val)])}/>

        </>
        <Title level={5} style={{ marginTop: '10px' }}>Extended Measurement Or Facts <Popover placement="rightTop" trigger="click" title={"Unmapped fields"} content={<><p>Support for generic measurements or facts.</p><p>Click a field to include as a measurement or fact. </p><p> Unmapped fields will stil be available in the BIOM files created in the next step, but they will not be in the Darwin Core achive unless you include them as a measurement.</p></>}>
                    <InfoCircleOutlined /> </Popover></Title> 
                    <Text ref={ref6}>Click a field to include as a measurement. Fields selected as measurements will be included in the <a href="https://rs.gbif.org/extension/obis/extended_measurement_or_fact_2023-08-28.xml" target="_blank">Extended Measurement Or Facts</a> extension for Darwin core</Text>
        <Row>

            <p>{unMapped.map(t => <Tag style={{marginBottom: "8px", cursor: "pointer"}} onClick={() => dispatch({ type: 'createMeasurement', payload: {term: t, value: {measurementType:t}} })}>{t}</Tag>)}</p>
        </Row>
        <Title level={5} style={{ marginTop: '10px' }}>Fields for inclusion in the <a href="https://rs.gbif.org/extension/obis/extended_measurement_or_fact_2023-08-28.xml" target="_blank">Extended Measurement Or Facts</a> extension:  </Title> 
    
        <Table
                dataSource={state?.measurements ? Object.keys(state?.measurements).map(t => state?.measurements[t]) : []} 
                columns={[{
                    title: "Measurement Type",
                    dataIndex: "measurementType",
                    key: "measurementType"
                    
                  }, {
                    title: "Measurement Unit (optional)",
                    dataIndex: "measurementUnit",
                    key: "measurementUnit",
                    width: 150,
                    render: (text, record) => <Input value={record?.measurementUnit} onChange={(e) => dispatch({ type: 'createMeasurement', payload: {term: record.measurementType, value: {...record, measurementUnit: e?.target?.value }} })}/>
                    
                  }, {
                    title: "Measurement Accuracy (optional)",
                    dataIndex: "measurementAccuracy",
                    key: "measurementAccuracy",
                    width: 150,
                    render: (text, record) => <Input value={record?.measurementAccuracy} onChange={(e) => dispatch({ type: 'createMeasurement', payload: {term: record.measurementType, value: {...record, measurementAccuracy: e?.target?.value }} })}/>
                    
                  },{
                    title: "Measurement Method (optional)",
                    dataIndex: "measurementMethod",
                    key: "measurementMethod",
                    render: (text, record) => <Input value={record?.measurementMethod} onChange={(e) => dispatch({ type: 'createMeasurement', payload: {term: record.measurementType, value: {...record, measurementMethod: e?.target?.value }} })}/>
                    
                  },{
                    title: "Measurement Type ID (optional)",
                    dataIndex: "measurementTypeID",
                    key: "measurementTypeId",
                    render: (text, record) => <Input value={record?.measurementTypeID} onChange={(e) => dispatch({ type: 'createMeasurement', payload: {term: record.measurementType, value: {...record, measurementTypeID: e?.target?.value }} })}/>

                    
                  }, {
                    title: "Measurement Unit ID (optional)",
                    dataIndex: "measurementUnitID",
                    key: "measurementUnitID",
                    render: (text, record) => <Input value={record?.measurementUnitID} onChange={(e) => dispatch({ type: 'createMeasurement', payload: {term: record.measurementType, value: {...record, measurementUnitID: e?.target?.value }} })}/>

                    
                  }, {
                    title:"",
                    dataIndex: "",
                    key: "__actions",
                    render: (text, record) => <Button type="link" onClick={() => dispatch({ type: 'createMeasurement', payload: {term: record.measurementType, value: null} })}>Delete</Button>
                  }]}
                size="small"
                pagination={false}
                
            />
{/*             {Object.keys(state?.measurements).map(t => <Tag style={{marginBottom: "8px"}} onClick={() => dispatch({ type: 'createMeasurement', payload: {term: t, value: null} })}>{t}</Tag>)}
 */}            
        <Row style={{marginTop: "10px"}}>
            <Col flex="auto"></Col>
            <Col>
            <Button onClick={saveMapping}>Save mapping</Button>
            <Button style={{marginLeft: "10px"}} type="primary"
                onClick={async () => { 
                    await saveMapping()
                    navigate(`/dataset/${dataset?.id}/process`)}}>Proceed</Button></Col>
            </Row>
    </> : <Skeleton />

}

const mapContextToProps = ({ user, login, logout, dataset, dwcTerms, requiredTerms, defaultTerms, fileNameSynonyms }) => ({
    user,
    login,
    logout,
    dataset,
    dwcTerms,
    requiredTerms,
    defaultTerms,
    fileNameSynonyms
});

export default withContext(mapContextToProps)(TermMapper);
