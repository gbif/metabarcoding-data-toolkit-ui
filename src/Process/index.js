
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, Timeline, Progress, Statistic, Space, Typography, List, message } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";
const { Title } = Typography;
const DataUpload = ({ user,
    login,
    logout,
    dataset,
    setDataset }) => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [failed, setFailed] = useState(false);
    const [finished, setFinished] = useState(false);

    let hdl = useRef();
    let refreshUserHdl = useRef();

    useEffect(() => {
        return () => {
            if (hdl.current) {
                clearInterval(hdl.current);
            }
            if (refreshUserHdl.current) {
                clearInterval(refreshUserHdl.current);
            }
        };
    }, [])

    useEffect(() => {
        
        setFailed(false)
        setFinished(false)
        if (!!dataset?.steps) {
            const isFinished = dataset.steps[dataset.steps.length - 1].status === 'finished';
            const isFailed = !!dataset.steps.find(s => s.status === 'failed');
            setFailed(isFailed)
            setFinished(isFinished)
            if (!isFinished && !isFailed) {
                if (hdl.current) {
                    clearInterval(hdl.current);
                }
                hdl.current = setInterval(() => getData(dataset?.id, hdl.current), 1000);
            }
        } 

    }, [dataset]);


    const isValidForProcessing = () => {
        if (!dataset) {
            return false
        } else {
            return dataset?.files?.format === 'TSV_3_FILE' || dataset?.files?.format === 'XLSX'
        }
    }


    const processData = async key => {
        if (isValidForProcessing()) {
            setFailed(false)
            setFinished(false)
            try {
                const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/process`);
                message.info("Processing data");

                hdl.current = setInterval(() => getData(key, hdl.current), 500);
                refreshUserHdl = setInterval(refreshLogin, 900000);

            } catch (error) {
                setError(error)
            }

        }
    }
    const getData = async (key, hdl) => {
        try {
            setLoading(true)
            const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/process`)
           // setData(res?.data)
            setDataset(res?.data)
            setLoading(false)
            const isFinished = res?.data?.steps[res?.dataset?.steps.length - 1].status === 'finished';
            const isFailed = !!res?.data?.steps.find(s => s.status === 'failed');
            if (hdl && (isFinished || isFailed)) {
                clearInterval(hdl);
            }
            setFailed(isFailed)
            setFinished(isFinished)


        } catch (error) {
            setLoading(false)

        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "processing":
                return '#108ee9'
            case "finished":
                return 'green'
            case "failed":
                return 'red'
            default:
                return 'grey'
        }

    }

    return (
        <Layout>
            <PageContent>
                {error && <Alert type="error" >{error}</Alert>}
                <Row>
                    <Col span={6}>
                        <Button style={{ marginBottom: "24px" }} onClick={() => processData(dataset?.id)} disabled={!isValidForProcessing() || (!!dataset?.steps && !(failed || finished))} loading={!!dataset?.steps && !(failed || finished)}>Process data</Button>

                        {dataset?.steps && dataset?.steps?.length > 0 && <Timeline
                            items={
                                dataset?.steps.map((s, idx) => ({
                                    dot: s.status === "finished" ? <CheckCircleOutlined /> : s.status === "pending" ? <ClockCircleOutlined /> : null,
                                    color: getStatusColor(s.status),
                                    children: (s.status === "finished" && idx === dataset?.steps?.length - 1) ? "Finished" :
                                        <>
                                            {`${s.status === "processing" ? s.message : s.messagePending}${s.subTask && idx === dataset?.steps.length - 1 ? " - " + s.subTask : ""}`}
                                            {s.total && s.progress && s.status === "processing" &&
                                                <div
                                                    style={{
                                                        width: 200,
                                                    }}
                                                >
                                                    <Progress size="small" percent={Math.round(s.progress / s.total * 100)} />
                                                </div>}
                                        </>

                                }))
                            }
                        />}

                    </Col>
                    <Col span={6}>
                       {dataset?.summary?.sampleCount && <Title level={3}>Data collected</Title>}
                        <Row >
                            <Space>
                                {dataset?.summary?.sampleCount && <Statistic title="Samples" value={dataset?.summary?.sampleCount} />}
                                {dataset?.summary?.taxonCount && <Statistic title="Taxa" value={dataset?.summary?.taxonCount} />}
                            </Space>
                        </Row>

                    </Col>
                    {dataset?.filesAvailable && dataset?.filesAvailable.length > 0 && <Col span={6}>
                        <Title level={3}>Files generated</Title>
                        <List
                            itemLayout="horizontal"
                            dataSource={dataset?.filesAvailable}
                            renderItem={(file) => (
                                <List.Item
                                    actions={[<Button type="link" download={file.fileName} href={`${config.backend}/dataset/${dataset?.id}/file/${file.fileName}`}><DownloadOutlined /></Button>]}
                                >
                                    <List.Item.Meta
                                        title={file.fileName}
                                        description={`${file?.format} - ${file?.mimeType} - ${Math.round(file.size * 10) / 10} mb`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Col>}
                    <Col flex="auto"></Col>
                    <Col><Button onClick={() => navigate(`/dataset/${dataset?.id}/review`)} disabled={!finished}>Proceed to review</Button></Col>
                </Row>
           
            </PageContent>
        </Layout>
    );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset }) => ({
    user,
    login,
    logout,
    dataset, setDataset
});

export default withContext(mapContextToProps)(DataUpload);
