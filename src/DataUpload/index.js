
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, message } from "antd"
import { InboxOutlined } from '@ant-design/icons';
import Uploader from "./Upload"
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";

const DataUpload = ({user,
    login,
    logout,
    dataset,
    setDataset,
    setStepState}) => {

    const match = useMatch('/dataset/:key/upload');
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null);
    const [error, setError] = useState(null)
    const [valid, setValid] = useState(false);
    const [failed, setFailed] = useState(false);
    const [finished, setFinished] = useState(false);
   
    let hdl = useRef();
    let refreshUserHdl = useRef();

    useEffect(()=> {
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
        if(!dataset && !!key){
            // this should check that the backend thinks it understands the uploaded files
            validate(key)
            // TODO fetch from backend, maybe it has already been processed, then show files etc
        } 

      }, [dataset, match?.params?.key]);

      useEffect(() => {
        if(finished){
            setStepState({reviewDisabled: false, publishDisabled: false, loadingStep: null})
        }
        if(failed){
            setStepState({reviewDisabled: true, publishDisabled: true, loadingStep: null})
        }
      }, [finished, failed, setStepState])

    const validate  = async (key) => {
        try {
            setLoading(true)
            const res = await axiosWithAuth.get(`${config.backend}/validate/${key}`)
            if(res?.data?.format === 'TSV_3_FILE' || res?.data?.format === 'XLSX' ) {
                //const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/process`)
                setValid(true)
                setDataset(res?.data)
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

/*     const processData = async key => {
        if(valid) {
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
    const getData  = async (key, hdl) => {
        try {
            setLoading(true)
            const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/process`)
            setData(res?.data)
            setDataset(res?.data)
            setLoading(false)
            const isFinished = !!res?.data?.steps.find(s => s.status === 'finished');
            const isFailed = !!res?.data?.steps.find(s => s.status === 'failed');
            if(isFinished || isFailed){
                clearInterval(hdl);
            }
            setFailed(isFailed)
            setFinished(isFinished)
            
           
        } catch (error) {
            setLoading(false)

        }
    }  */


    return (
        <Layout>
            <PageContent>
                {error && <Alert type="error" >{error}</Alert>}
                {<Button onClick={() => navigate(`/dataset/${match?.params?.key}/term-mapping`)} disabled={!valid}>Proceed to term/field mapping</Button>}
                <Row>
                    <Col span={16} >
                        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

                    </Col>
                    <Col span={8}>
                       
                        <Uploader onError={(e) => {message.error(e?.message)}} onSuccess={(id) => {navigate(`/dataset/${id}/upload`)}}/>

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
