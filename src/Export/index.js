
import React, { useEffect, useState, useRef } from "react";
import axios from "axios"
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Row, Col, Alert, Button, Progress, Timeline, Typography, Modal, message, notification } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined,  } from '@ant-design/icons';
import config from "../config";
import FilesAvailable from '../Components/FilesAvailable'
import Help from "../Components/Help";
import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
const { Title, Text } = Typography;
const Export = ({ setDataset, dataset, setLoginFormVisible }) => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [failed, setFailed] = useState(dataset?.dwc?.steps?.find(s => s.status === 'failed') || false);
  const [finished, setFinished] = useState(dataset?.dwc?.steps?.find(s => s.status === 'finished') || false);
  const [dwcdpFinished, setDwcDpFinished] = useState(dataset?.dwcdp?.steps?.find(s => s.status === 'finished') || false);
  const [dwcdpFailed, setDwcDpFailed] = useState(dataset?.dwcdp?.steps?.find(s => s.status === 'failed') || false);
  const [dwcdpLoading, setDwcDpLoading] = useState(false)

  const [registering, setRegistering] = useState(false);
  const [gbifUatKey, setGbifUatKey] = useState(dataset?.publishing?.gbifDatasetKey || dataset?.publishing?.gbifDatasetKey);
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validationId, setValidationId] = useState(dataset?.publishing?.validationId || null)
  const [processingButtonClicked, setProcessingButtonClicked] = useState(false);
  const navigate = useNavigate()

  const POLL_INTERVAL = 1000;

  // Reading a step list is only meaningful when there is one - steps[steps.length - 1] on an
  // empty array is undefined, and reading .status off that throws
  const lastStatus = (steps) => Array.isArray(steps) && steps.length > 0 ? steps[steps.length - 1]?.status : undefined;
  const stepsFinished = (steps) => lastStatus(steps) === 'finished';
  const stepsFailed = (steps) => Array.isArray(steps) && steps.some(s => s?.status === 'failed');
  const stepsDone = (steps) => stepsFinished(steps) || stepsFailed(steps);

  const pollingDwc = useRef(false);
  const pollingDwcDp = useRef(false);
  const dwcDpStarted = useRef(false);
  // setDataset from the context is not a functional setter, so the latest value has to be
  // kept somewhere the poll loops can read it
  const datasetRef = useRef(dataset);

  useEffect(() => { datasetRef.current = dataset }, [dataset]);

  // stop the loops if the user navigates away mid run
  useEffect(() => () => { pollingDwc.current = false; pollingDwcDp.current = false }, []);

  // Each endpoint returns the whole report with only its own job taken from memory - the other
  // one is read from disk, which is only written when a run ends and so can still describe the
  // previous one. Applying a response wholesale lets the two pollers overwrite each other.
  const keepIfAhead = (mine, theirs, stillPolling) =>
    (stillPolling || (stepsFinished(mine?.steps) && !stepsFinished(theirs?.steps))) ? (mine ?? theirs) : theirs;

  const applyDwcResponse = (data) =>
    setDataset({ ...data, dwcdp: keepIfAhead(datasetRef.current?.dwcdp, data?.dwcdp, pollingDwcDp.current) })

  const applyDwcDpResponse = (data) =>
    setDataset({ ...data, dwc: keepIfAhead(datasetRef.current?.dwc, data?.dwc, pollingDwc.current) })

  useEffect(() => {
    if (!!dataset) {
      setFailed(stepsFailed(dataset?.dwc?.steps))
      setFinished(stepsFinished(dataset?.dwc?.steps))
      setGbifUatKey(dataset?.publishing?.gbifUatDatasetKey || dataset?.publishing?.gbifDatasetKey)
    }
  }, [dataset])

  useEffect(() => {
    if(processingButtonClicked && finished && !!dataset?.id && !dwcDpStarted.current) {
      dwcDpStarted.current = true;
      setDwcDpFailed(false)
      setDwcDpFinished(false)
      axiosWithAuth.post(`${config.backend}/dataset/${dataset?.id}/dwc-dp`);
      pollDwcDp(dataset?.id)
    }
  }, [processingButtonClicked, finished, dataset?.id]);

  // Self scheduling rather than setInterval: one request in flight at a time, and the next is
  // only scheduled once the previous answer has been applied. With an interval a slow response
  // could be overtaken by a newer one, and then land last - leaving the page showing a state
  // the run had already moved past, with nothing still polling to correct it.
  const pollDwc = async (key) => {
    if (pollingDwc.current) {
      return
    }
    pollingDwc.current = true;
    try {
      while (pollingDwc.current) {
        try {
          setLoading(true)
          const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/dwc`)
          setLoading(false)
          if (!pollingDwc.current) {
            return
          }
          const steps = res?.data?.dwc?.steps;
          applyDwcResponse(res?.data)
          setFailed(stepsFailed(steps))
          setFinished(stepsFinished(steps))
          if (stepsDone(steps)) {
            return
          }
        } catch (error) {
          setLoading(false)
          console.log("Could not read the DWC status, trying again:")
          console.log(error)
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    } finally {
      pollingDwc.current = false;
    }
  }

  const pollDwcDp = async (key) => {
    if (pollingDwcDp.current) {
      return
    }
    pollingDwcDp.current = true;
    try {
      while (pollingDwcDp.current) {
        try {
          setDwcDpLoading(true)
          const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/dwc-dp`)
          setDwcDpLoading(false)
          if (!pollingDwcDp.current) {
            return
          }
          const steps = res?.data?.dwcdp?.steps;
          applyDwcDpResponse(res?.data)
          setDwcDpFailed(stepsFailed(steps))
          setDwcDpFinished(stepsFinished(steps))
          if (stepsDone(steps)) {
            return
          }
        } catch (error) {
          setDwcDpLoading(false)
          console.log("Could not read the DWC data package status, trying again:")
          console.log(error)
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    } finally {
      pollingDwcDp.current = false;
    }
  }

  const processData = async key => {
    setProcessingButtonClicked(true);
    setFailed(false)
    setFinished(false)
    dwcDpStarted.current = false;
    try {
      const processRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/dwc`);
      message.info("Processing data");

      pollDwc(key)

    } catch (error) {
      if(error?.response?.status > 399 && error?.response?.status < 404){
        setLoginFormVisible(true)
      }
    message.error(error?.message || error);     
      //setError(error)
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

  const validateDWCa = async (key) => {
      
    try {
      setValidating(true)
      const validateRes = await axiosWithAuth.post(`${config.backend}/dataset/${key}/data-validator`);
        console.log(validateRes)
        setValidationId(validateRes?.data?.key)
        setDataset({...dataset, publishing: {...dataset.publishing || {}, validationId: validateRes?.data?.key}})
        notification.open({
          message: 'Validation started',
          description:
            'You will receieve an email when the validation has finished.',
        });
        setValidating(false)
      } catch (error) {
        try {
          console.log(error)
          notification.error({
            message: 'Error',
            description:
              error?.response?.data || error?.message,
          })
          setValidating(false)
        } catch (error_) {
          console.log(error_)
        }
        

      }
  }
  const hasDWC = dataset?.filesAvailable?.find(f => f?.format === "DWC")
  return (
    <Layout><PageContent>
      {error && <Alert type="error" >{error}</Alert>}
      <Row>
        <Col span={6}>
          <Button style={{ marginBottom: "24px" }} onClick={() => processData(dataset?.id)} type="primary" >Create Darwin Core Archive</Button> 
          <Help style={{marginLeft: '8px'}} title="Darwin Core" content={<>
          <div>This will create a Darwin Core Archive – the file archive that can be published to GBIF. The Darwin Core Standard (DwC) offers a stable, straightforward and flexible framework for compiling biodiversity data from varied and variable sources. The majority of the datasets shared through GBIF.org are published using the Darwin Core Archive format (DwC-A).
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
{dataset?.dwcdp?.steps && dataset?.dwcdp?.steps?.length > 0 && <Title level={5}>Darwin Core Data Package</Title>}
{dataset?.dwcdp?.steps && dataset?.dwcdp?.steps?.length > 0 && <Timeline
            items={
              dataset?.dwcdp?.steps.map((s, idx) => ({
                dot: s.status === "finished" ? <CheckCircleOutlined /> : s.status === "pending" ? <ClockCircleOutlined /> : null,
                color: getStatusColor(s.status),
                children: (s.status === "finished" && idx === dataset?.dwcdp?.steps?.length - 1) ? "Finished" :
                  <>
                    {`${s.status === "processing" ? s.message : s.messagePending}${s.subTask && idx === dataset?.dwcdp?.steps.length - 1 ? " - " + s.subTask : ""}`}
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
           {<Row><Button
                         disabled={!hasDWC}
                         type="primary"
                         onClick={ () => navigate(`/dataset/${dataset?.id}/publish`)}
                       >
                         Proceed
                       </Button></Row> }
          <Row><Button  style={{marginTop: "10px"}} loading={registering}  disabled={ registering || !finished  } onClick={() => registerData(dataset?.id) } >TEST publication</Button><Help style={{marginLeft: "8px"}} title="Publishing" content={<Text>You can "publish" your Darwin Core Archive to the GBIF test environment. In TEST, the data will be indexed and processed almost exactly as on GBIF.org, and it allows you to verify that the data looks as you expect and is being indexed correctly. The indexing takes some time, and not all elements are added immediately (e.g. the map of the samples).</Text>} /></Row>
          <Row><Button style={{marginTop: "10px"}} loading={validating} disabled={!hasDWC} onClick={() => validateDWCa(dataset?.id)} >Validate DWC archive</Button><Help style={{marginLeft: "8px", marginTop: "10px"}} title="Publishing" content={<Text>You can validate the Darwin Core Archive using the GBIF data validator. The GBIF data validator is a service that allows anyone with a GBIF-relevant dataset to receive a report on the syntactical correctness and the validity of the content contained within the dataset. By submitting a dataset to the validator, you can go through the validation and interpretation procedures usually associated with publishing in GBIF and quickly determine potential issues in data - without having to publish it.</Text>} /></Row>
       </Col>
        <Col>
        <Row> {gbifUatKey && <Button  type="link" target="_blank" href={`https://www.gbif-test.org/dataset/${gbifUatKey}`}>See test publication</Button>}</Row>
        <Row> {validationId && <Button  type="link" target="_blank" href={`https://www.gbif.org/tools/data-validator/${validationId}`}>Validation report</Button>}</Row> 
        </Col>
      </Row>
      <Modal title="Info" open={showRegisterModal && gbifUatKey} onOk={() => setShowRegisterModal(false)} onCancel={() => setShowRegisterModal(false)}>
        <p>Your data is being processed and "published" on the test environment. Depending on the data volume, it may take from 15 minutes to a an hour before it is finished. This means that you may initally see "0 occurrences" on the new <a  href={`https://www.gbif-uat.org/dataset/${gbifUatKey}`}>dataset page</a> if it is accessed before the processing has finished. You can also find the link to the dataset on the test environment (gbif-uat) in the list of datasets in your user profile.</p>
        
      </Modal>

    </PageContent></Layout>
  );
}


const mapContextToProps = ({ user, login, logout, dataset, setDataset, setLoginFormVisible }) => ({
  user,
  login,
  logout,
  dataset, setDataset, setLoginFormVisible
});

export default withContext(mapContextToProps)(Export);

