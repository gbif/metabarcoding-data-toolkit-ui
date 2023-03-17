
import React, {useEffect, useState, useRef} from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import {marked} from "marked"
import { Row, Col, Alert, Button, message } from "antd"
import { InboxOutlined } from '@ant-design/icons';
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";

const Publish = ({setDataset, dataset}) => {
  const match = useMatch('/dataset/:key/publish');
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null);
  const [error, setError] = useState(null)
  const [valid, setValid] = useState(false);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);
  
  let hdl = useRef();
  let refreshUserHdl = useRef();

  const processData = async key => {
    
        setFailed(false)
        setFinished(false)
        try {
            const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/dwc`);
            message.info("Processing data");
            
             hdl.current = setInterval(() => getData(key, hdl.current), 1000);
             refreshUserHdl = setInterval(refreshLogin, 900000);

        } catch (error) {
          alert(error)
            console.log(error)
            setError(error)
        }
        
    
}

const getData  = async (key, hdl) => {
  try {
      setLoading(true)
      const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/dwc`)
      setData(res?.data)
      if(dataset?.id === match?.params?.id){
        setDataset({...res?.data, ...dataset})
      }
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
} 
  return (
    <Layout><PageContent>
        {error && <Alert type="error" >{error}</Alert>}
                <Button onClick={() => processData(match?.params?.key)} >Create DWC and publish</Button>
                <Row>
                    <Col span={24} >
                        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

                    </Col>
                    
                </Row>
        </PageContent></Layout>
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

export default withContext(mapContextToProps)(Publish);

