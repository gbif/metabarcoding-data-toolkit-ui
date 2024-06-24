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
  message,
  notification,
} from "antd";

import OrganisationAutoComplete from "./OrganisationAutocomplete";
import config from "../config";

import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
import {getExistingOrgEmailBody, getNewOrgEmailBody} from "./EmailTemplate";

const { Text } = Typography;

const Publish = ({ setDataset, dataset, user, installationSettings }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [registering, setRegistering] = useState(false);
  const [gbifProdKey, setGbifProdKey] = useState(
    dataset?.publishing?.gbifProdDatasetKey
  );
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [organisationsResolved, setOrganisationsResolved] = useState(false);
  const [installationContactEmail, setInstallationContactEmail] = useState(null)
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedPendingOrg, setSelectedPendingOrg] = useState(null)
  const [userAgreedToterms, setUserAgreedToterms] = useState(false)
  const [tab, setTab] = useState("1")

  useEffect(() => {
    getOrganizations();
  }, []);

 

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
        `${config.backend}/dataset/${key}/register-in-gbif-prod?organizationKey=${selectedOrg?.key}`
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
                <div>{!!selectedPendingOrg &&  <a href={`mailto:${installationSettings?.installationContactEmail}?subject=${encodeURIComponent("eDNA dataset publishing")}&body=${
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
                        <a href={`mailto:${installationSettings?.installationContactEmail}?subject=${encodeURIComponent("eDNA dataset publishing")}&body=${
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
            label: 'Publish data',
            children: <>
              
        {organisations.length > 0 && (
        <> 
        <Row>
          <Col span={18}>
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
            
            </Row>
          </Col>
          <Col><Button onClick={() => registerData(dataset?.id) }  loading={registering} type="primary" disabled={!!installationSettings?.termsLink && !userAgreedToterms}>Publish to gbif.org</Button>
             <br /> 
             {installationSettings?.termsLink && <Checkbox style={{marginTop: "10px"}} value={userAgreedToterms} onChange={e => setUserAgreedToterms(!!e?.target?.checked)}>I have read and agree to the <a target="_blank" href={installationSettings?.termsLink} rel="noreferrer">terms</a></Checkbox>}</Col>
        </Row>
        
            </> 
        )}
        {organisations.length === 0 && (
        <> <Row>
            
            <Col >
              <Text>You have not yet been affiliated with a GBIF pubilishing institution. Please <Button style={{padding: 0}} type="link" onClick={() => setTab("1")}>go back to the registration page.</Button></Text><br />
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

const mapContextToProps = ({ user, login, logout, dataset, setDataset, installationSettings }) => ({
  user,
  login,
  logout,
  dataset,
  setDataset,
  installationSettings
});

export default withContext(mapContextToProps)(Publish);
