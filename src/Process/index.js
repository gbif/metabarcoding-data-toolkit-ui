
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, message } from "antd"
import { InboxOutlined } from '@ant-design/icons';
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";

const DataUpload = ({ user,
    login,
    logout,
    dataset,
    setDataset,
    setStepState }) => {

    const match = useMatch('/dataset/:key/process');
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null);
    const [error, setError] = useState(null)
    const [valid, setValid] = useState(false);
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
        const key = match?.params?.key;
        console.log(match?.params?.key)
        setFailed(false)
        setFinished(false)
        if (!dataset && key !== 'new') {
            // this should check that the backend thinks it understands the uploaded files
            validate(key)
            // TODO fetch from backend, maybe it has already been processed, then show files etc
        } else if (!!dataset.steps) {
            const isFinished = !!dataset.steps.find(s => s.status === 'finished');
            const isFailed = !!dataset.steps.find(s => s.status === 'failed');
            setFailed(isFailed)
            setFinished(isFinished)
            setData(dataset)
            if (!isFinished && !isFailed) {
                if (hdl.current) {
                    clearInterval(hdl.current);
                }
                hdl.current = setInterval(() => getData(key, hdl.current), 1000);
            }
        } else if (key !== 'new') {
            validate(key)
        }

    }, [dataset, match?.params?.key]);

    useEffect(() => {
        if (finished) {
            setStepState({ reviewDisabled: false, publishDisabled: false, loadingStep: null })
        }
        if (failed) {
            setStepState({ reviewDisabled: true, publishDisabled: true, loadingStep: null })
        }
    }, [finished, failed, setStepState])

    const validate = async (key) => {
        try {
            setLoading(true)
            const res = await axiosWithAuth.get(`${config.backend}/validate/${key}`)
            if (res?.data?.format === 'TSV_3_FILE' || res?.data?.format === 'XLSX') {
                //const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/process`)
                setValid(true)
                // setDataset(res?.data)
            } else {
                setValid(false)
                //   setDataset(res?.data)
            }

            setLoading(false)
        } catch (error) {
            setError(error)
            setLoading(false)

        }
    }

    const processData = async key => {
        if (valid) {
            setFailed(false)
            setFinished(false)
            try {
                const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/process`);
                message.info("Processing data");

                hdl.current = setInterval(() => getData(key, hdl.current), 1000);
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
            setData(res?.data)
            setDataset(res?.data)
            setLoading(false)
            const isFinished = !!res?.data?.steps.find(s => s.status === 'finished');
            const isFailed = !!res?.data?.steps.find(s => s.status === 'failed');
            if (isFinished || isFailed) {
                clearInterval(hdl);
            }
            setFailed(isFailed)
            setFinished(isFinished)


        } catch (error) {
            setLoading(false)

        }
    }


    return (
        <Layout>
            <PageContent>
                {error && <Alert type="error" >{error}</Alert>}
                <Row>
                    <Col flex="auto">                <Button onClick={() => processData(match?.params?.key)} disabled={!valid} loading={!!dataset.steps && !(failed || finished)}>Process data</Button>
                    </Col>
                    <Col><Button onClick={() => navigate(`/dataset/${match?.params?.key}/review`)} disabled={!finished}>Proceed to review</Button></Col>
                </Row>
                <Row>
                    <Col span={16} >
                        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

                    </Col>

                    <Col></Col>
                </Row>
            </PageContent>
        </Layout>
    );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset, stepState, setStepState }) => ({
    user,
    login,
    logout,
    dataset, setDataset,
    stepState,
    setStepState
});

export default withContext(mapContextToProps)(DataUpload);
