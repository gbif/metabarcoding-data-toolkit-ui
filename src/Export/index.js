
import React, { useEffect, useState, useRef } from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, Progress, Timeline, Typography, Modal, message } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined,  } from '@ant-design/icons';
import config from "../config";
import FilesAvailable from '../Components/FilesAvailable'
import Help from "../Components/Help";
import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
const { Title, Text } = Typography;
const Export = ({ setDataset, dataset }) => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [failed, setFailed] = useState(dataset?.dwc?.steps?.find(s => s.status === 'failed') || false);
  const [finished, setFinished] = useState(dataset?.dwc?.steps?.find(s => s.status === 'finished') || false);
  const [registering, setRegistering] = useState(false);
  const [gbifUatKey, setGbifUatKey] = useState(dataset?.publishing?.gbifDatasetKey || dataset?.publishing?.gbifDatasetKey);
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [organisations, setOrganisations] = useState([])
  let hdl = useRef();
  let refreshUserHdl = useRef();

  useEffect(()=>{
    getOrganizations()
  },[])
  useEffect(() => {
    if (!!dataset) {
      setFailed(dataset?.dwc?.steps?.find(s => s.status === 'failed') || false)
      setFinished(dataset?.dwc?.steps[dataset?.dwc?.steps.length - 1].status === 'finished' || false)
      setGbifUatKey(dataset?.publishing?.gbifUatDatasetKey || dataset?.publishing?.gbifDatasetKey)
    }
  }, [dataset])

  const processData = async key => {

    setFailed(false)
    setFinished(false)
    try {
      const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/dwc`);
      message.info("Processing data");

      hdl.current = setInterval(() => getData(key, hdl.current), 1000);

    } catch (error) {
      alert(error)
      console.log(error)
      setError(error)
    }


  }

  const getOrganizations = async () => {
    try {
      const res = await axiosWithAuth.get(`${config.backend}/user/organizations`)
     
      setOrganisations(res?.data)

    } catch (error) {

    }
  }

  const getData = async (key, hdl) => {
    try {
      setLoading(true)
      const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/dwc`)
      setDataset(res?.data)

      setLoading(false)
      const isFinished = res?.data?.dwc?.steps[res?.data?.dwc?.steps.length - 1].status === 'finished';
      const isFailed = !!res?.data?.dwc?.steps.find(s => s.status === 'failed');
      if (isFinished || isFailed) {
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
      message.info("Registering dataset in GBIF-UAT (Test environment)");

      const registerRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/register-in-gbif-uat`);
      // Legacy: the key was just called gbifDatasetKey before
      if (registerRes?.data?.publishing?.gbifUatDatasetKey || registerRes?.data?.publishing?.gbifDatasetKey) {
        setGbifUatKey(registerRes?.data?.publishing?.gbifUatDatasetKey || registerRes?.data?.publishing?.gbifDatasetKey)
      }
      setShowRegisterModal(true); 
      setDataset(registerRes?.data)
      setRegistering(false)
    } catch (error) {
      alert(error)
      console.log(error)
      setRegistering(false)
      setError(error)
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
    <Layout><PageContent>
      {error && <Alert type="error" >{error}</Alert>}
      <Row>
        <Col span={6}>
          <Button style={{ marginBottom: "24px" }} onClick={() => processData(dataset?.id)} type="primary" >Create Darwin Core Archive</Button> 
          <Help style={{marginLeft: '8px'}} title="Darwin Core" content={<>
          <div>The Darwin Core Standard (DwC) offers a stable, straightforward and flexible framework for compiling biodiversity data from varied and variable sources. The majority of the datasets shared through GBIF.org are published using the Darwin Core Archive format (DwC-A).
          </div>
                                  <a href="https://gcube.wiki.gcube-system.org/gcube/Darwin_Core_Terms" target="_blank" rel="noreferrer">More about Darwin Core Archives.</a>
                            </>}/>
          {dataset?.dwc?.steps && dataset?.dwc?.steps?.length > 0 && <Timeline
            items={
              dataset?.dwc?.steps.map((s, idx) => ({
                dot: s.status === "finished" ? <CheckCircleOutlined /> : s.status === "pending" ? <ClockCircleOutlined /> : null,
                color: getStatusColor(s.status),
                children: (s.status === "finished" && idx === dataset?.dwc?.steps?.length - 1) ? "Finished" :
                  <>
                    {`${s.status === "processing" ? s.message : s.messagePending}${s.subTask && idx === dataset?.dwc?.steps.length - 1 ? " - " + s.subTask : ""}`}
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
        {dataset?.filesAvailable && dataset?.filesAvailable.length > 0 && <Col span={6}>
                        <FilesAvailable dataset={dataset}/>
                    </Col>}
        <Col flex="auto"></Col>
        <Col>
          <Button  loading={registering}  disabled={ registering || !finished  } type="primary" onClick={() => registerData(dataset?.id) } >Publish to GBIF test environment (UAT)</Button><Help style={{marginLeft: "8px"}} title="Publishing" content={<Text>You can "publish" your Darwin Core Archive to the GBIF test environment, also known as the User Acceptance Testing (UAT) environment. In UAT, the data will be indexed and processed almost exactly as on GBIF.org, and it allows you to verify that the data looks as you expect and is being indexed correctly. The indexing takes some time, and not all elements are added immediately (e.g. the map of the samples).</Text>} />
{/*           <Alert type="warning" style={{marginTop: "10px"}} description={`Publishing to the test environment is currently disabled as GBIF is updating core software parts`}/>
 */}        </Col>
        <Col>
          {gbifUatKey && <Button  type="link" href={`https://www.gbif-uat.org/dataset/${gbifUatKey}`}>Dataset at gbif-uat.org</Button>}
          
        </Col>
      </Row>
      <Modal title="Info" open={showRegisterModal && gbifUatKey} onOk={() => setShowRegisterModal(false)} onCancel={() => setShowRegisterModal(false)}>
        <p>Your data is being processed and "published" on the test environment.. Depending on the data volume, it may take from 15 minutes to a an hour before it is finished. This means that you may initally see "0 occurrences" on the new <a  href={`https://www.gbif-uat.org/dataset/${gbifUatKey}`}>dataset page</a> if it is accessed before the processing has finished. You can also find the link to the dataset on the test environment (gbif-uat) in the list of datasets in your user profile.</p>
        
      </Modal>

    </PageContent></Layout>
  );
}


const mapContextToProps = ({ user, login, logout, dataset, setDataset }) => ({
  user,
  login,
  logout,
  dataset, setDataset
});

export default withContext(mapContextToProps)(Export);

