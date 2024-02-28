
import React, { useEffect, useState, useRef } from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, Progress, Timeline, Typography, Modal, message } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import config from "../config";
import FilesAvailable from '../Components/FilesAvailable'
import Help from "../Components/Help";
import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
const { Title } = Typography;
const Publish = ({ setDataset, dataset }) => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [failed, setFailed] = useState(dataset?.dwc?.steps?.find(s => s.status === 'failed') || false);
  const [finished, setFinished] = useState(dataset?.dwc?.steps?.find(s => s.status === 'finished') || false);
  const [registering, setRegistering] = useState(false);
  const [gbifKey, setGbifKey] = useState(dataset?.publishing?.gbifDatasetKey);
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  let hdl = useRef();
  let refreshUserHdl = useRef();

  useEffect(() => {
    if (!!dataset) {
      setFailed(dataset?.dwc?.steps?.find(s => s.status === 'failed') || false)
      setFinished(dataset?.dwc?.steps[dataset?.dwc?.steps.length - 1].status === 'finished' || false)
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

    } catch (error) {
      alert(error)
      console.log(error)
      setError(error)
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
      message.info("Registering dataset in GBIF-UAT");

      const registerRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/register-in-gbif`);

      if (registerRes?.data?.publishing?.gbifDatasetKey) {
        setGbifKey(registerRes?.data?.publishing?.gbifDatasetKey)
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
                                  <a href="https://gcube.wiki.gcube-system.org/gcube/Darwin_Core_Terms" target="_blank">More about Darwin Core Archives.</a>
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
          <Button loading={registering}  disabled={registering || !finished  } type="primary" onClick={() => registerData(dataset?.id) } >Publish to GBIF test environment (UAT)</Button>
        </Col>
        <Col>
          {gbifKey && <Button type="link" href={`https://www.gbif-uat.org/dataset/${gbifKey}`}>Dataset at gbif-uat.org</Button>}
        </Col>
      </Row>
      <Modal title="Info" open={showRegisterModal && gbifKey} onOk={() => setShowRegisterModal(false)} onCancel={() => setShowRegisterModal(false)}>
        <p>Your data is being processed. Depending on the data volume, it may take from 15 minutes to a an hour before it is finished. This means that you may initally see "0 occurrences" on the new <a  href={`https://www.gbif-uat.org/dataset/${gbifKey}`}>dataset page</a> if it is accessed before the processing has finished.</p>
        
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

export default withContext(mapContextToProps)(Publish);

