
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import _ from "lodash"
import { Row, Col, Alert, Button, List, Typography, Popconfirm, Tag, theme, message, notification } from "antd"
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined,
    FileExcelOutlined
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

const DataUpload = ({ user,
    login,
    logout,
    format,
    dataset,
    setDataset, setLoginFormVisible }) => {
    const { token } = useToken();

    const match = useMatch('/dataset/:key/upload');
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [valid, setValid] = useState(false);
    const [dataFormat, setDataFormat] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)

   

    useEffect(() => {
        const key = match?.params?.key;
        console.log(match?.params?.key)
        if (!dataset && !!key) {
            // this should check that the backend thinks it understands the uploaded files
            validate(key)
            // TODO fetch from backend, maybe it has already been processed, then show files etc
        }

        if (dataset?.files?.format && Object.keys(format).includes(dataset?.files?.format)) {
            setDataFormat(format[dataset?.files?.format])
            setValid(dataset?.files?.format !== 'INVALID')
        } else {
            setValid(false)
            setDataFormat(null)
        }
    }, [dataset, match?.params?.key]);

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

    const validate = async (key) => {
        try {
            setLoading(true)
            const res = await axiosWithAuth.get(`${config.backend}/validate/${key}`)
            if (res?.data?.files?.format && Object.keys(format).includes(res?.data?.files?.format)) {
                //const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/process`)
                setValid(res?.data?.files?.format !== 'INVALID')
                setDataset(res?.data)
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
                {error && <Alert type="error" >{error}</Alert>}
                {(selectedFile && (selectedFile?.name?.endsWith('.tsv') || selectedFile?.name?.endsWith('.txt') || selectedFile?.name?.endsWith('.csv'))) 
                && <FileView file={selectedFile} dismiss={() => setSelectedFile(null)} />} 
                {(selectedFile && selectedFile?.sheets) && <WorkBookView sheets={selectedFile?.sheets} dismiss={() => setSelectedFile(null)} />} 

                
                {!selectedFile && <Row>

                    <Col span={12}>

                        <Button style={{ marginBottom: "10px" }} href="/templates/edna_template.xlsx">Download template <FileExcelOutlined /></Button> 
                        <Help style={{marginLeft: '8px'}} title="About the data template" content={<><span>The template is an Excel workbook with 4 sheets:
                                <ul>
                                    <li>OTU_table: a matrix with Sample IDs as column headers and OTU IDs as Row identifiers</li>
                                    <li>Taxa: This should include the DNA sequence and taxonomic information about the sequence if available</li>
                                    <li>Sample: Any metadata about the samples, i.e. event date (collection date), decimal latitude and longitude</li>
                                    <li>DefaultValues (Optional): This sheet may contain defaults for the whole study such as target gene, primers, standard operating procedures etc. </li>
                                </ul>
                                 See <a href="https://rs.gbif.org/core/dwc_occurrence_2022-02-02.xml" target="_blank">Darwin Core Occurrence</a> and <a href="https://rs.gbif.org/extension/gbif/1.0/dna_derived_data_2022-02-23.xml" target="_blank">DNA dervied data Darwin Core extension</a> for available fields.
                            </span></>}/>

                        <Uploader datasetKey={match?.params?.key}
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
                        />

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
                        {/* {dataset && <pre>{JSON.stringify(dataset, null, 2)}</pre>} */}
                        { <List
                            loading={loading}
                            itemLayout="horizontal"
                            header={<Text>Files uploaded</Text>}
                            bordered
                            dataSource={_.isArray(dataset?.files?.invalidErrors) ? dataset?.files?.files.map(f => {
                                f.errors = dataset?.files?.invalidErrors?.filter(e => e.file === f?.name)
                                return f;
                            }) : dataset?.files?.files}
                            renderItem={(file) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" disabled={file.name.endsWith('fasta') || file.name.endsWith('.fa')}  onClick={() => setSelectedFile(file)}><EyeOutlined /></Button>,
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
                                        title={<span style={file?.errors?.length >0 ? { color: token.colorWarning } : null}>{file.name}</span>}
                                        description={<>
                                            {`${file?.mimeType} - ${Math.round(file.size * 10) / 10} mb`}
                                            {file?.errors && file?.errors.map(e => <Alert message={e?.message} type="warning" showIcon style={{marginBottom: "8px"}} />)}
                                        </>}
                                    />
                                </List.Item>
                            )}
                        />}

                    </Col>
                </Row>}
            </PageContent>
        </Layout>
    );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset, format, loginFormVisible, setLoginFormVisible }) => ({
    user,
    login,
    logout,
    dataset, setDataset, format, loginFormVisible, setLoginFormVisible 
});

export default withContext(mapContextToProps)(DataUpload);
