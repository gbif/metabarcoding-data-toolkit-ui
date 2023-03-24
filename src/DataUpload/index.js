
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, List, Typography, Popconfirm, Tag, message } from "antd"
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import Uploader from "./Upload"
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";

const { Text } = Typography;

const DataUpload = ({ user,
    login,
    logout,
    format,
    dataset,
    setDataset }) => {

    const match = useMatch('/dataset/:key/upload');
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null);
    const [error, setError] = useState(null)
    const [valid, setValid] = useState(false);
    const [failed, setFailed] = useState(false);
    const [finished, setFinished] = useState(false);
    const [dataFormat, setDataFormat] = useState(null)
    let refreshUserHdl = useRef();


    useEffect(() => {
        const key = match?.params?.key;
        console.log(match?.params?.key)
        setFailed(false)
        setFinished(false)
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
                <Row>

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
                            dataSource={dataset?.files?.files}
                            renderItem={(file) => (
                                <List.Item
                                    actions={[<Popconfirm
                                        placement="leftTop"
                                        title={`Are you sure you want to delete this file?`}
                                        description={file.name}
                                        onConfirm={() => deleteFile(file)}
                                        okText="Yes"
                                        cancelText="No"><Button type="link">Delete</Button></Popconfirm>]}
                                >
                                    <List.Item.Meta
                                        title={file.name}
                                        description={`${file?.mimeType} - ${Math.round(file.size * 10) / 10} mb`}
                                    />
                                </List.Item>
                            )}
                        />}

                    </Col>
                </Row>
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
