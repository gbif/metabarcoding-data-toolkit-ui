
import React, { useEffect, useState, useRef } from "react";
import { useMatch, useNavigate } from "react-router-dom"
import { Alert, Button, Space, Spin, Typography } from "antd";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import withContext from "../Components/hoc/withContext";
import TermMapper from "../Components/TermMapper";
import { axiosWithAuth } from "../Auth/userApi";
import config from "../config";

const { Title, Text } = Typography;

const POLL_INTERVAL = 3000;
// how many polls with no validation running before we stop waiting and call it a failure
const IDLE_POLLS_BEFORE_GIVING_UP = 3;

const tableName = {
  sampleHeaders: "sample table",
  taxonHeaders: "taxon table"
}

const missingTables = (missing = []) => missing.map(m => tableName[m] || m).join(" and ");

const TermMapping = ({ dataset, setDataset }) => {

  const match = useMatch('/dataset/:key/term-mapping');
  const key = match?.params?.key;
  const navigate = useNavigate();
  const [givenUp, setGivenUp] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const idlePolls = useRef(0);

  // The field names of the uploaded files are written to the processing report by validation,
  // and only on a run where the files have been typed - so arriving here straight after an
  // upload can mean the report has no headers yet and nothing to map. Poll until they land
  // rather than rendering a mapper that cannot be filled in. The first poll doubles as a
  // refresh of the snapshot this route inherited from the previous page.
  useEffect(() => {
    if (!key) {
      return
    }
    let stopped = false;
    idlePolls.current = 0;

    const poll = async () => {
      if (stopped) {
        return
      }
      try {
        const res = await axiosWithAuth.get(`${config.backend}/dataset/${key}/process`);
        if (stopped) {
          return
        }
        setDataset(res?.data)
        if (res?.data?.mappingReady) {
          return
        }
        idlePolls.current = res?.data?.validationRunning ? 0 : idlePolls.current + 1;
      } catch (error) {
        if (stopped) {
          return
        }
        idlePolls.current = idlePolls.current + 1;
      }

      if (idlePolls.current >= IDLE_POLLS_BEFORE_GIVING_UP) {
        setGivenUp(true)
        return
      }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      poll()
    }

    poll();

    return () => { stopped = true }
  }, [key, attempt, setDataset]);

  const checkAgain = () => {
    setGivenUp(false);
    setAttempt(attempt + 1)
  }

  const missing = missingTables(dataset?.mappingMissing);

  return (
    <Layout><PageContent>
      {dataset?.mappingReady ? <TermMapper /> :
        givenUp ?
          <Alert
            type="error"
            showIcon
            message="The field names of your files are not available"
            description={<>
              <p>Validation did not finish writing the field names of your {missing || "files"} to this dataset, so there is nothing to map yet.</p>
              <p>Go back to the upload step and check that every file has been recognised, then try again.</p>
              <Space>
                <Button type="primary" onClick={() => navigate(`/dataset/${key}/upload`)}>Back to upload</Button>
                <Button onClick={checkAgain}>Check again</Button>
              </Space>
            </>}
          /> :
          <>
            <Title level={4}>Waiting for validation to finish</Title>
            <Text>The field names of your {missing || "files"} are not in the processing report yet, so the fields cannot be mapped. This page will continue by itself as soon as they are.</Text>
            <div style={{ marginTop: "16px" }}>
              <Space>
                <Spin size="small" />
                <Text type="secondary">{dataset?.validationRunning ? "Validating..." : "Checking..."}</Text>
              </Space>
            </div>
            <div style={{ marginTop: "16px" }}>
              <Button onClick={() => navigate(`/dataset/${key}/upload`)}>Back to upload</Button>
            </div>
          </>}
    </PageContent></Layout>
  );
}

const mapContextToProps = ({ user, login, logout, dataset, setDataset }) => ({
  user,
  login,
  logout,
  dataset, setDataset
});

export default withContext(mapContextToProps)(TermMapping);
