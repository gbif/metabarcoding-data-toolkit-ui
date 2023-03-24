
import React, {useEffect, useState, useRef} from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, message } from "antd"
import config from "../config";
import withContext from "../Components/hoc/withContext";
import { refreshLogin } from "../Auth/userApi";
import { axiosWithAuth } from "../Auth/userApi";

const Publish = ({setDataset, dataset}) => {
  const match = useMatch('/dataset/:key/publish');
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(dataset || null);
  const [error, setError] = useState(null)
  const [valid, setValid] = useState(false);
  const [failed, setFailed] = useState(dataset?.dwc?.steps?.find(s => s.status === 'failed') || false);
  const [finished, setFinished] = useState(dataset?.dwc?.steps?.find(s => s.status === 'finished') || false);
  const [registering, setRegistering] = useState(false);
  const [gbifKey, setGbifKey] = useState(dataset?.publishing?.gbifDatasetKey)
  let hdl = useRef();
  let refreshUserHdl = useRef();

  useEffect(()=>{
    if(!data && !!dataset){
      setData(dataset)
      setFailed(dataset?.dwc?.steps?.find(s => s.status === 'failed') || false)
      setFinished(dataset?.dwc?.steps?.find(s => s.status === 'finished') || false)
      setGbifKey(dataset?.publishing?.gbifDatasetKey)
    }
  }, [dataset])

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
      const isFinished = !!res?.data?.dwc?.steps.find(s => s.status === 'finished');
      const isFailed = !!res?.data?.dwc?.steps.find(s => s.status === 'failed');
      if(isFinished || isFailed){
          clearInterval(hdl);
      }
      setFailed(isFailed)
      setFinished(isFinished)
      
     
  } catch (error) {
      setLoading(false)

  }
} 

const registerData = async key => {
    
  setRegistering(true)
  try {
    message.info("Registering dataset in GBIF");

      const registerRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/register-in-gbif`);
      
      if(registerRes?.data?.publishing?.gbifDatasetKey){
        setGbifKey(registerRes?.data?.publishing?.gbifDatasetKey)
      }
      setDataset(registerRes?.data)
       setRegistering(false)
  } catch (error) {
    alert(error)
      console.log(error)
      setRegistering(false)
      setError(error)
  }
  

}



  return (
    <Layout><PageContent>
        {error && <Alert type="error" >{error}</Alert>}
        <Row>
          <Col><Button onClick={() => processData(match?.params?.key)} >Create DWC archive</Button></Col>
          <Col>
          <Button loading={registering} disabled={registering || !finished || !!gbifKey} onClick={() => registerData(match?.params?.key)} >Publish to GBIF</Button>
          </Col>
          <Col>
            {gbifKey && <Button type="link" href={`https://www.gbif-uat.org/dataset/${gbifKey}`}>Dataset at gbif.org</Button>}
          </Col>
        </Row>
                
                <Row>
                    <Col span={24} >
                        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

                    </Col>
                    
                </Row>
        </PageContent></Layout>
  );
}


const mapContextToProps = ({ user, login, logout, dataset, setDataset}) => ({
  user,
  login,
  logout,
  dataset, setDataset
});

export default withContext(mapContextToProps)(Publish);

