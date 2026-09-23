import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Typography, List, Card, Row, Col, Result, Button, Alert, Spin } from "antd";
import { axiosWithAuth } from "../Auth/userApi";
import withContext from "../Components/hoc/withContext";
import AdminTabs from "./AdminTabs";
import config from "../config";

const { Title, Text } = Typography;

// User accounts are always managed in the GBIF production registry - the backend logs in and
// resolves tokens against gbifRegistryBaseUrl.prod regardless of which environment this
// installation publishes to (see Auth/user.model.js) - so this link is correct everywhere.
const REGISTRY_USER_URL = "https://registry.gbif.org/user/";

const AdminList = ({ title, userNames, loading }) => (
  <Card size="small" title={title}>
    <List
      size="small"
      loading={loading}
      dataSource={userNames || []}
      locale={{ emptyText: "None configured" }}
      renderItem={(userName) => (
        <List.Item>
          <a
            href={`${REGISTRY_USER_URL}${encodeURIComponent(userName)}`}
            target="_blank"
            rel="noreferrer"
          >
            {userName}
          </a>
        </List.Item>
      )}
    />
  </Card>
);

const Administrators = ({ user, setLoginFormVisible, installationSettings }) => {
  const [admins, setAdmins] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // the endpoint answers 403 to anyone but a support admin, so do not even ask otherwise
    if (user?.isSupportAdmin) {
      getAdmins();
    }
  }, [user?.userName, user?.isSupportAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAdmins = async () => {
    setLoading(true);
    try {
      const res = await axiosWithAuth.get(`${config.backend}/installation-admins`);
      setAdmins(res?.data);
      setError(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "The list of administrators could not be loaded",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContent>
        {user?.isSupportAdmin && (
          <>
            <AdminTabs />
            <Title level={4}>Administrators</Title>

            {error && (
              <Alert
                type="error"
                message={error}
                style={{ marginBottom: "16px" }}
              />
            )}

            <Row gutter={16}>
              <Col xs={24} md={8} style={{ marginBottom: "16px" }}>
                <Card size="small" title="Installation contact">
                  {installationSettings?.installationContactEmail ? (
                    <a href={`mailto:${installationSettings.installationContactEmail}`}>
                      {installationSettings.installationContactEmail}
                    </a>
                  ) : (
                    <Text type="secondary">Not configured</Text>
                  )}
                </Card>
              </Col>
            </Row>

            <Spin spinning={loading}>
              <Row gutter={16}>
                <Col xs={24} md={8} style={{ marginBottom: "16px" }}>
                  <AdminList
                    title="Installation administrators"
                    userNames={admins?.installationAdmins}
                  />
                </Col>
                <Col xs={24} md={8} style={{ marginBottom: "16px" }}>
                  <AdminList
                    title="Support administrators"
                    userNames={admins?.supportAdmins}
                  />
                </Col>
              </Row>
            </Spin>
          </>
        )}

        {!user?.isSupportAdmin && (
          <Result
            status="403"
            title=""
            subTitle="You don´t have access to this page"
            extra={
              !!user ? null : (
                <Button type="primary" onClick={() => setLoginFormVisible(true)}>
                  Login
                </Button>
              )
            }
          />
        )}
      </PageContent>
    </Layout>
  );
};

const mapContextToProps = ({ user, setLoginFormVisible, installationSettings }) => ({
  user,
  setLoginFormVisible,
  installationSettings,
});

export default withContext(mapContextToProps)(Administrators);
