
import React, { useEffect, useState, useRef, useReducer } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import _ from "lodash"
import { Row, Col, Alert, Button, List, Typography, Popconfirm, Tag, Tour, Select, theme, message, notification } from "antd"
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    FileExcelOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import Uploader from "./Upload"
import FileView from "./FileView";
import WorkBookView from "./WorkBookView";
import Help from "../Components/Help";
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
const { useToken } = theme;

const { Text } = Typography;

const reducer = (state, action) => {
   
    switch (action.type) {
        case 'mapFileToEntity':
            let newState = {...state}
            for (var property in newState) {
                if (newState[property] === action.payload.entity) {
                    delete newState[property];
                }
            }
            return { ...newState, [action.payload.file]: action.payload.entity, revalidationNeeded: true};
        case 'initMapping':
            return { ...action.payload, revalidationNeeded: false};
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
  }; 

const DataUpload = ({ user,
    login,
    logout,
    format,
    dataset,
    setDataset, setLoginFormVisible, fileTypes }) => {
    const { token } = useToken();

    const match = useMatch('/dataset/:key/upload');
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [valid, setValid] = useState(false);
    const [dataFormat, setDataFormat] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [open, setOpen] = useState(false)
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);

    const [state, dispatch] = useReducer(reducer, {});

 
    const steps = [
        {
            title: "About the OTU table templates",
            description: <><span>Each templates has three (or four) tables and and an optional fasta file. The tables are either sheets in an Excel workbook or separate text (tsv) files. We provide four different templates.
            The tables of each template are:
            <ul>
                <li>OTU_table: a matrix with Sample IDs as column headers and OTU IDs as row identifiers</li>
                <li>Taxonomy: DNA sequence and taxonomic information if available</li>
                <li>Samples: Sample metadata, e.g. spatiotemporal information.</li>
                <li>Study (Optional): Defaults for the whole study, e.g. primer information and target gene.</li>
                <li>Seqs.fasta (Optional): Sequences provided as fasta instead on field in Taxonomy table.</li>
            </ul>
             See <a href="https://docs.gbif-uat.org/mdt-user-guide/en/" target="_blank">the guide</a> for templates and information of how to prepare datasets.
        </span></>,
                  target: () => ref1.current,

        },
        {
          title: 'Dataset name',
          description: <>Give your dataset a nickname. You can always change it later.</>,
          target: () => ref2.current,
          placement: "top"
        },
        {
            title: 'Uploading data',
            description: 'Here you can drop/upload your DNA metabarcoding dataset in one of the supported templates.',
            target: () => ref2.current,
            placement: "right"
          },
        {
          title: 'Uploaded files',
          description: <>Uploaded files are listed here. Some basic consistency and formatting checks are performed. A “green signal” will indicate detected format and if your data looks OK. Uploaded files can be inspected in a simple viewer by clicking the eye icon.</>,
          target: () => ref3.current,
        }]

    useEffect(() => {
        const key = match?.params?.key;
        console.log(match?.params?.key)
        if (!dataset && !!key) {
            // this should check that the backend thinks it understands the uploaded files
            validate(key)
        }

        if (dataset?.files?.format && Object.keys(format).includes(dataset?.files?.format)) {
            setDataFormat(format[dataset?.files?.format])
            setValid(dataset?.files?.format !== 'INVALID')
        } else {
            setValid(false)
            setDataFormat(null)
        }

            if(!! dataset?.files?.mapping && !_.isEmpty(dataset?.files?.mapping)){
                    dispatch({ type: 'initMapping', payload: dataset?.files?.mapping })
                            
            } else {
                const mapping = getMappingFromFileArray(dataset?.files?.files)
                if(!!mapping){
                    dispatch({ type: 'initMapping', payload: mapping })
                }
            }
    }, [dataset, match?.params?.key]);

    useEffect(() => {
        setSelectedFile(null)
    },[dataset?.id])

    useEffect(() => { }, [dataFormat])

    useEffect(() => {
        const keydown = (e) => {
            if (e?.key === 'Escape' && selectedFile) {
                setSelectedFile(null)
            }
        }
        document.addEventListener('keydown', keydown)

        return () => {
            document.removeEventListener('keydown', keydown)
        }
    }, [selectedFile])

    useEffect(()=> {

        const key = match?.params?.key;
        if(!!key){
            saveFileMapping(key, state?.revalidationNeeded)
        }

    }, [state])

    const getMappingFromFileArray = (files) => {
            return _.isArray(files) ? files.reduce((acc, cur) => {
                 if(!!cur?.type){
                     acc[cur?.name] = cur?.type
                 };
                 return acc;
             }, {}) : null
            
    }
    const saveFileMapping = async (key, mustRevalidate = false) => {

        if(!_.isEmpty(state)){
            try {
                // We will not send the revalidationNeeded to the backend - this is pure frontend logic
                const {revalidationNeeded, ...rest} = state;
                await axiosWithAuth.post(`${config.backend}/dataset/${key}/file-types`, rest)
                if (mustRevalidate){
                    validate(key)
                }
             message.info({content: "Saved file mapping"})
             } catch (error) {
                 message.warning({content: "Could not save file mapping"})
             }
        }
        
    }
    const validate = async (key) => {
        try {
            setLoading(true)
            const res = await axiosWithAuth.get(`${config.backend}/validate/${key}`)
            if (res?.data?.files?.format && Object.keys(format).includes(res?.data?.files?.format)) {
                //const mapping = getMappingFromFileArray(res?.data?.files?.files)
                setValid(res?.data?.files?.format !== 'INVALID')
                setDataset({...res?.data, files: {...res.data.files}})
                setDataFormat(format[res?.data?.files?.format])
            } else {
                setValid(false)
                setDataset(res?.data)
            }
            
            setLoading(false)
        } catch (error) {
            if(error?.response?.status > 399 && error?.response?.status < 404){
                setLoginFormVisible(true)
            }
            else if(error?.response?.status === 422){
                // Refresh dataset if validation was unsuccessful
                 const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/process`)
                 setValid(false)
                 setDataset(res?.data)
            } else {
                setValid(false)
                console.log(error)
            setError(error?.response?.data)
            }
            
            setLoading(false)

        }
    }


    const deleteFile = async (file) => {
        const res = await axiosWithAuth.delete(`${config.backend}/dataset/${match?.params?.key}/file/${file.name}`)
        validate(match?.params?.key)
    }

    return (
        <Layout>
            <PageContent>
            <Tour open={open} onClose={() => setOpen(false)} steps={steps} />

                {error && <Alert type="error" >{error}</Alert>}
                {(selectedFile && (selectedFile?.name?.endsWith('.tsv') || selectedFile?.name?.endsWith('.txt') || selectedFile?.name?.endsWith('.csv'))) 
                && <FileView file={selectedFile} dismiss={() => setSelectedFile(null)} />} 
                {(selectedFile && selectedFile?.sheets) && <WorkBookView sheets={selectedFile?.sheets} dismiss={() => setSelectedFile(null)} />} 

                
                {!selectedFile && <Row>

                    <Col span={12}>
                        <Row>
                            <Col>
                            <Button style={{marginLeft: "-18px"}} type="link" onClick={() => setOpen(true)}><QuestionCircleOutlined /> How to use this</Button>
                            </Col>
                            <Col flex="auto"></Col>
                            <Col>
                            <Button ref={ref1} type="link" style={{ marginBottom: "10px" }} onClick={() => window.open('https://docs.gbif-uat.org/mdt-user-guide/en/#templates', '_blank')}>Templates <FileExcelOutlined /></Button> 

                            </Col>
                        </Row>
                        
                        {/* <Help style={{marginLeft: '8px'}} title="About the OTU table templates" content={<><span>Each templates has three (or four) tables and and an optional fasta file. The tables are either sheets in an Excel workbook or separate text (tsv) files. We provide four different templates.
                                The tables of each template are:
                                <ul>
                                    <li>OTU_table: a matrix with Sample IDs as column headers and OTU IDs as row identifiers</li>
                                    <li>Taxonomy: DNA sequence and taxonomic information if available</li>
                                    <li>Samples: Sample metadata, e.g. spatiotemporal information.</li>
                                    <li>Study (Optional): Defaults for the whole study, e.g. primer information and target gene.</li>
                                    <li>Seqs.fasta (Optional): Sequences provided as fasta instead on field in Taxonomy table.</li>
                                </ul>
                                 See <a href="https://docs.gbif-uat.org/mdt-user-guide/en/" target="_blank">the guide</a> for templates and information of how to prepare datasets.
                            </span></>}/> */}

                       <div ref={ref2}> <Uploader datasetKey={match?.params?.key}
                           
                            
                            onError={(e) => { 
                                if(e?.response?.status > 399 && e?.response?.status < 500){
                                    setLoginFormVisible(true)
                                    notification.warning({
                                        description: "You must login to upload data."
                                    })
                                } else {
                                    message.error(e?.message) }
                                }
                                 
                                }
                            onSuccess={(id) => {
                                if (!match?.params?.key) {
                                    navigate(`/dataset/${id}/upload`)
                                } else {
                                    validate(match?.params?.key)
                                }
                            }}
                        /></div>

                    </Col>
                    <Col span={12} style={{ paddingLeft: "10px" }}>
                        <Row style={{ marginBottom: "10px" }}>
                            <Col flex="auto">
                                {dataFormat?.name && dataFormat?.name !== "Invalid format" && <Tag icon={<CheckCircleOutlined />} color="success">
                                    {dataFormat?.name}
                                </Tag>}
                                {dataFormat?.name && dataFormat?.name === "Invalid format" && <Tag icon={<CloseCircleOutlined />} color="error">
                                    {dataFormat?.name}{dataset?.files?.invalidMessage ? ` - ${dataset?.files?.invalidMessage}`:""}
                                </Tag>}
                            </Col>
                            <Col>
                                <Button onClick={() => navigate(`/dataset/${match?.params?.key}/term-mapping`)} type={valid ? 'primary': 'dashed'} disabled={!valid}>
                                    Proceed
                                </Button>
                            </Col>
                        </Row>
                        { <div ref={ref3}><List
                            loading={loading}
                            itemLayout="horizontal"
                            header={<Text>Files uploaded</Text>}
                            bordered
                            dataSource={_.isArray(dataset?.files?.invalidErrors) ? dataset?.files?.files.map(f => ({...f, errors: [...(f.errors || []), ...dataset?.files?.invalidErrors?.filter(e => e.file === f?.name)]})) : dataset?.files?.files}
                            renderItem={(file) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" disabled={file.name.endsWith('fasta') || file.name.endsWith('.fa') || dataFormat?.name === "Invalid format" }  onClick={() => setSelectedFile(file)}><EyeOutlined /></Button>,
                                        <Button type="link"  download={file.name} href={`${config.backend}/dataset/${dataset?.id}/uploaded-file/${file.name}`}><DownloadOutlined /></Button>,
                                        <Popconfirm
                                            placement="leftTop"
                                            title={`Are you sure you want to delete this file?`}
                                            description={file.name}
                                            onConfirm={() => deleteFile(file)}
                                            okText="Yes"
                                            cancelText="No"><Button type="link"><DeleteOutlined /></Button></Popconfirm>]}
                                >
                                    <List.Item.Meta
                                        title={<Row><Col span={12}><span style={file?.errors?.length >0 ? { color: token.colorWarning } : null}>{file.name}</span></Col><Col>
                                        <Select placeholder="Select entity type" allowClear onChange={val => {
                                             dispatch({ type: 'mapFileToEntity', payload: {file: file.name, entity: val} })
                                        }} value={!!state[file?.name] ? state[file?.name] : null} style={{width: "120px"}} size={"small"} options={fileTypes.map(t => ({value: t, label: t === "taxa" ? "Taxonomy" : _.startCase(t)}))}></Select> 
                                        </Col></Row>}
                                        description={<>
                                            {`${file?.mimeType} - ${Math.round(file.size * 10) / 10} mb`}
                                            
                                            {file?.errors && file?.errors.map(e => <Alert message={e?.message} type="warning" showIcon style={{marginBottom: "8px"}} />)}
                                            
                                        </>}
                                    />
                                </List.Item>
                            )}
                        /></div>}

                    </Col>
                </Row>}
            </PageContent>
        </Layout>
    );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset, format, loginFormVisible, setLoginFormVisible, fileTypes }) => ({
    user,
    login,
    logout,
    dataset, setDataset, format, loginFormVisible, setLoginFormVisible , fileTypes
});

export default withContext(mapContextToProps)(DataUpload);
