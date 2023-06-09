
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import _ from "lodash"
import { Row, Col, Alert, Button, List, Typography, Popconfirm, Tag, theme, message } from "antd"
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EyeOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import Uploader from "./Upload"
import FileView from "./FileView";
import WorkBookView from "./WorkBookView";
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
    setDataset }) => {
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
            setError(error)
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
                {(selectedFile && dataset?.files?.format?.startsWith('TSV')) && <FileView file={selectedFile} dismiss={() => setSelectedFile(null)} />} 
                {(selectedFile && selectedFile?.sheets) && <WorkBookView sheets={selectedFile?.sheets} dismiss={() => setSelectedFile(null)} />} 

                
                {!selectedFile && <Row>

                    <Col span={12}>

                        <Uploader datasetKey={match?.params?.key}
                            onError={(e) => { message.error(e?.message) }}
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
                                    {dataFormat?.name}
                                </Tag>}
                            </Col>
                            <Col>
                                <Button onClick={() => navigate(`/dataset/${match?.params?.key}/term-mapping`)} disabled={!valid}>
                                    Proceed to term/field mapping
                                </Button>
                            </Col>
                        </Row>
                        {/* {dataset && <pre>{JSON.stringify(dataset, null, 2)}</pre>} */}
                        {dataset?.files?.files && <List
                            itemLayout="horizontal"
                            header={<Text>Files uploaded</Text>}
                            bordered
                            dataSource={_.isArray(dataset?.files?.invalidErrors) ? dataset?.files?.files.map(f => {
                                f.errors = dataset?.files?.invalidErrors?.find(e => e.file === f?.name)
                                return f;
                            }) : dataset?.files?.files}
                            renderItem={(file) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" loading={loading} onClick={() => setSelectedFile(file)}><EyeOutlined /></Button>,
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
                                        title={<span style={file?.errors ? { color: token.colorError } : null}>{file.name}</span>}
                                        description={<>
                                            {`${file?.mimeType} - ${Math.round(file.size * 10) / 10} mb`}
                                            {file?.errors && <Alert message={file?.errors.message} type="error" showIcon />}
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

const mapContextToProps = ({ user, login, logout, dataset, setDataset, format }) => ({
    user,
    login,
    logout,
    dataset, setDataset, format
});

export default withContext(mapContextToProps)(DataUpload);
