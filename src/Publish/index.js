import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import {
  Row,
  Col,
  Select,
  Alert,
  Button,
  Progress,
  Timeline,
  Typography,
  Modal,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import OrganisationAutoComplete from "./OrganisationAutocomplete";
import config from "../config";
import FilesAvailable from "../Components/FilesAvailable";
import Help from "../Components/Help";
import withContext from "../Components/hoc/withContext";
import { axiosWithAuth } from "../Auth/userApi";
const { Text } = Typography;

const Publish = ({ setDataset, dataset }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [registering, setRegistering] = useState(false);
  const [gbifProdKey, setGbifProdKey] = useState(
    dataset?.publishing?.gbifDatasetKey
  );
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [organisationsResolved, setOrganisationsResolved] = useState(false);

  const [selectedOrg, setSelectedOrg] = useState(null);

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
      message.info("Registering dataset in GBIF-Prod");

      const registerRes = await axiosWithAuth.post(
        `${config.backend}/dataset/${key}/register-in-gbif-prod`
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

  return (
    <Layout>
      <PageContent>
        {error && <Alert type="error">{error}</Alert>}

        {organisations.length === 0 && organisationsResolved &&
            <>
            <Row>
                <Col span={8} style={{paddingRight: "20px"}}>
                    <Text>In order to publish your dataset to GBIF, your institution/organisation must be registered as a data publisher in GBIF. Use the search box on the right to see of your institution is already registered.</Text>
                </Col>
                <Col>
                <OrganisationAutoComplete />
                </Col>
            </Row>
            </>
        }

        {!!selectedOrg && organisations.length > 1 && (
          <Row>
            <Col>
              <Select
                value={selectedOrg}
                onChange={setSelectedOrg}
                style={{ width: "400px" }}
                options={organisations.map((o) => ({
                  value: o.key,
                  label: o.name,
                }))}
              />
            </Col>
          </Row>
        )}
        {!!selectedOrg && organisations.length === 1 && (
        <> <Row>
            <Col span={4} style={{textAlign: "right", paddingRight: "20px"}}><Text >You are ready to publish the dataset: </Text></Col>
            <Col span={20}>
              
              <Text strong>{dataset?.metadata?.title}.</Text></Col>
              <Col></Col>
              <Col span={4} style={{textAlign: "right", paddingRight: "20px"}}><Text>The publishing institution will be: </Text></Col>
            <Col span={20}>
              <Text strong>{organisations[0].name}</Text>
            </Col>
            </Row>
            <Row>
            
          </Row></> 
        )}
      </PageContent>
    </Layout>
  );
};

const mapContextToProps = ({ user, login, logout, dataset, setDataset }) => ({
  user,
  login,
  logout,
  dataset,
  setDataset,
});

export default withContext(mapContextToProps)(Publish);
