import React, { useEffect, useState, useRef } from "react";

import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import ProdPublishingNotEnabled from "./ProdPublishingNotEnabled";
import {
  Row,
  Col,
  Select,
  Alert,
  Button,
  Checkbox,
  Typography,
  Tabs,
  Space,
  Modal,
  Tooltip,
  message,
  notification,
} from "antd";

import OrganisationAutoComplete from "./OrganisationAutocomplete";
import config from "../config";

import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
import {getExistingOrgEmailBody, getNewOrgEmailBody} from "./EmailTemplate";

const { Text } = Typography;

const Publish = ({ setDataset, dataset, user, installationSettings, networks }) => {
  const [error, setError] = useState(null);

  const [registering, setRegistering] = useState(false);
  const [gbifProdKey, setGbifProdKey] = useState(
    dataset?.publishing?.gbifProdDatasetKey
  );
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [organisationsResolved, setOrganisationsResolved] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(dataset?.publishing?.netWorkKey)
  const [addingNetwork, setAddingNetwork] = useState(false)
  const [selectedPendingOrg, setSelectedPendingOrg] = useState(null)
  const [userAgreedToterms, setUserAgreedToterms] = useState(false)
  const [prodEnv, setProdEnv] = useState(null)
  const [tab, setTab] = useState(!!dataset?.publishing?.gbifProdDatasetKey ? "2": "1")

  useEffect(() => {
    getOrganizations();
  }, []);

 useEffect(() => {
  // registryBaseUrl.split(".").slice(1).join(".")
    if(!!installationSettings?.gbifRegistryBaseUrl){
     // console.log(installationSettings?.gbifRegistryBaseUrl.split(".").slice(1).join("."))
      setProdEnv(installationSettings?.gbifRegistryBaseUrl.split(".").slice(1).join("."))
    }
 }, [installationSettings?.gbifRegistryBaseUrl])

 useEffect(() => {
  if(!!dataset?.publishing?.netWorkKey){
    setSelectedNetwork(dataset?.publishing?.netWorkKey)
  }
 }, [dataset?.publishing?.netWorkKey])

 useEffect(() => {
  if(!!dataset?.publishing?.gbifProdDatasetKey){
    setGbifProdKey(dataset?.publishing?.gbifProdDatasetKey)
  }
 }, [dataset?.publishing?.gbifProdDatasetKey])

  const getOrganizations = async () => {
    try {
      const res = await axiosWithAuth.get(
        `${config.backend}/user/organizations`
      );
      setOrganisationsResolved(true);
      setOrganisations(res?.data);
      if (res?.data?.length > 0) {
        setSelectedOrg(res?.data[0]);
      }
    } catch (error) {
      setError(error);
      setOrganisationsResolved(true);
    }
  };

 

  const registerData = async (key) => {
    setRegistering(true);
    try {
      message.info("Registering dataset in GBIF");

      const registerRes = await axiosWithAuth.post(
        `${config.backend}/dataset/${key}/register-in-gbif-prod?organizationKey=${selectedOrg}`
      );
      // Legacy: the key was just called gbifDatasetKey before
      if (registerRes?.data?.publishing?.gbifProdDatasetKey) {
        setGbifProdKey(registerRes?.data?.publishing?.gbifProdDatasetKey);
      }
      setShowRegisterModal(true);
      setDataset(registerRes?.data);
      setRegistering(false);
    } catch (error) {
      alert(error);
      console.log(error);
      setRegistering(false);
      setError(error);
    }
  };

 const onSelectOrganisation = org => {
    if(organisations.length > 0){
      const existing = organisations.find(o => o?.key === org?.key)
      if(existing){
        setSelectedOrg(existing)
        setTab("2")
        notification.info({description: `${existing?.title} is already registered for data publication.`})
      } else {
        setSelectedPendingOrg(org)

      }
    } else {
      setSelectedPendingOrg(org)
    }
  }

  const addNetwork = async () => {
    setAddingNetwork(true);
    try {

      const res = await axiosWithAuth.post(
        `${config.backend}/dataset/${dataset?.id}/network/${selectedNetwork}`
      );
      notification.info({description: `The dataset was successfully associated with the netowork`})
      setAddingNetwork(false);
    } catch (error) {
      console.log(error);
      setAddingNetwork(false);
      setError(error);
    }
  }

  

  return (
    <Layout>
      <PageContent>
        {error && <Alert type="error">{error}</Alert>}
      {!!installationSettings.prodPublishingEnabled ?  <>
        <Tabs activeKey={tab} items={[
          {
            key: '1',
            label: 'Find / register your institution',
            children: <>
            <Row>
                <Col span={8} style={{paddingRight: "20px"}}>
                  {organisations.length === 0 && organisationsResolved && <Text>You have not yet been associated with a publishing organization. </Text>}
                    <Text>In order to publish your dataset to GBIF, your institution/organisation must be registered as a data publisher in GBIF. Use the search box on the right to select your institution, if it is already registered.</Text>
                </Col>
                <Col>
                <OrganisationAutoComplete onSelectOrganisation={onSelectOrganisation} style={{width: "300px"}} /> <br/>
                <Space
    direction="vertical"
    size="middle"
    style={{
      display: 'flex',
    }}
  >
                <div>{!!selectedPendingOrg &&  <a href={`mailto:${installationSettings?.installationContactEmail}?subject=${encodeURIComponent("DNA Metabarcoding dataset publishing")}&body=${
                    encodeURIComponent(getExistingOrgEmailBody(
                      {
                        ednaDatasetID: dataset?.id, 
                        gbifUatKey: dataset?.publishing?.gbifUatDatasetKey || dataset?.publishing?.gbifDatasetKey, 
                        toolBaseUrl: window.location.protocol +"//"+ window.location.hostname, 
                        registryBaseUrl: installationSettings?.gbifRegistryBaseUrl,
                        user: user,
                        publishingOrganizationTitle: selectedPendingOrg?.title,
                        publishingOrganizationKey: selectedPendingOrg?.key,
                        }))}`} target="_blank" rel="noreferrer" >Ask for access to publish under this institution/organisation</a> }
                        <br />
                        </div>
                        <div> <Text style={{marginTop: "24px"}} >Can´t find your institution/organisation?</Text><br />
                        <a href={`mailto:${installationSettings?.installationContactEmail}?subject=${encodeURIComponent("DNA Metabarcoding dataset publishing")}&body=${
                    encodeURIComponent(getNewOrgEmailBody(
                      {
                        ednaDatasetID: dataset?.id, 
                        gbifUatKey: dataset?.publishing?.gbifUatDatasetKey || dataset?.publishing?.gbifDatasetKey, 
                        toolBaseUrl: window.location.protocol +"//"+ window.location.hostname, 
                        registryBaseUrl: installationSettings?.gbifRegistryBaseUrl,
                        user: user
                        }))}`} target="_blank" rel="noreferrer" >Ask for help with registering your institution/organisation</a> </div>
                        </Space>
                </Col>
                <Col style={{paddingLeft: "10px"}}>
                  
                </Col>
            </Row>
            </>,
          },
          {
            key: '2',
            label: !!gbifProdKey ? 'Re-publish data' : 'Publish data',
            children: <>
              
        {organisations.length > 0 && (
        <> 
        <Row>
          <Col span={17}>
          <Row>
            <Col span={6} style={{textAlign: "right", paddingRight: "20px"}}><Text >You are ready to publish the dataset: </Text></Col>
            <Col span={18}>
              
              <Text strong>{dataset?.metadata?.title}.</Text></Col>
              <Col></Col>
              <Col span={6} style={{textAlign: "right", paddingRight: "20px", marginTop: "10px"}}><Text>The publishing institution will be: </Text></Col>
            <Col span={18}>
            <Select
                value={selectedOrg}
                onChange={setSelectedOrg}
                style={{ width: "400px", marginTop: "10px" }}
                options={organisations.map((o) => ({
                  value: o.key,
                  label: o.name,
                }))}
              />
            </Col>
            <Col span={6} style={{textAlign: "right", paddingRight: "20px"}}><Text >Associate a Network with your dataset: </Text></Col>
            <Col span={18} style={{paddingTop: "10px"}}>
            <Space direction="horizontal">
            <Select
                allowClear
                value={selectedNetwork}
                onChange={setSelectedNetwork}
                style={{ width: "336px"}}
                options={networks.map((o) => ({
                  value: o.key,
                  label: o.name,
                }))}
              />
              <Tooltip title="The dataset must be published before adding a network"><Button loading={addingNetwork} type="primary" disabled={!selectedNetwork || !gbifProdKey} onClick={addNetwork}>Add</Button></Tooltip>
              
              </Space>
            </Col>
            
            </Row>
          </Col>
          <Col span={6}>
          <Button onClick={() => registerData(dataset?.id) }  loading={registering} type="primary" disabled={!!installationSettings?.termsLink && !userAgreedToterms}>Publish to gbif.org</Button>
          {gbifProdKey && <Button  type="link" href={`https://www.${prodEnv}dataset/${gbifProdKey}`}>Dataset at gbif.org</Button>}
             <br /> 
             <Checkbox style={{marginTop: "10px"}} value={userAgreedToterms} onChange={e => setUserAgreedToterms(!!e?.target?.checked)}>
             </Checkbox> <span>Confirm that you have read and understood the <a target="_blank" href={`https://www.gbif.org/terms/data-publisher`} rel="noreferrer">GBIF data sharing agreement</a>.{" "}
             You are about to register the dataset in GBIF. Be aware deletion from the GBIF Index is automatic, but cannot be undone without explicit email communication with the <a href="mailto:helpdesk@gbif.org">GBIF Help Desk</a>.
             {installationSettings?.termsLink &&  <> <br/>I have also read and agree to the <a target="_blank" href={installationSettings?.termsLink} rel="noreferrer">terms</a> specific for this installation of the MDT.</>}</span>
             <br /> 
             

             </Col>
        </Row>
        
            </> 
        )}
        {organisations.length === 0 && (
        <> <Row>
            
            <Col >
              <Text>You have not yet been affiliated with a GBIF publishing institution. Please <Button style={{padding: 0}} type="link" onClick={() => setTab("1")}>go back to the registration page.</Button></Text><br />
              <Text>When your institution/organization has been registered, you will be able to do the final data publishing from this page.</Text>
            </Col>
            </Row>
            <Row>
            
          </Row></> 
        )}
            </>,
          },
        ]} onChange={setTab} />
        </> : <ProdPublishingNotEnabled />}
      </PageContent>
      <Modal title="Info" open={showRegisterModal && gbifProdKey} onOk={() => setShowRegisterModal(false)} onCancel={() => setShowRegisterModal(false)}>
        <p>Your data is being published. Depending on the data volume, it may take from 15 minutes to a an hour before it is finished. This means that you may initally see "0 occurrences" on the new <a  href={`https://www.gbif${config?.env !== 'prod' ? '-uat':''}.org/dataset/${gbifProdKey}`}>dataset page</a> if it is accessed before the processing has finished.</p>
        
      </Modal>
    </Layout>
  );
};

const mapContextToProps = ({ user, login, logout, dataset, setDataset, installationSettings, networks }) => ({
  user,
  login,
  logout,
  dataset,
  setDataset,
  installationSettings,
  networks
});

export default withContext(mapContextToProps)(Publish);
