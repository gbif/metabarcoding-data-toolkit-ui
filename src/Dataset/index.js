import React, { useEffect, useState } from "react";
import FilesAvailable from "../Components/FilesAvailable";
import { Row, Col, Tabs, Typography, Button } from "antd";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import DataBrowser from "../Review/DataBrowser";
import MetaDataView from "./MetaDataView";
import withContext from "../Components/hoc/withContext";
const { Title } = Typography;
const Dataset = ({ dataset }) => {
  return (
    <Layout>
      <PageContent>
        {dataset?.metadata?.title && (
          <Title level={4}>{dataset?.metadata?.title}</Title>
        )}
        <Tabs
          tabBarExtraContent={dataset?.publishing?.gbifDatasetKey ? {
            right: <Button target="_blank" type="link" href={`https://www.gbif-uat.org/dataset/${dataset?.publishing?.gbifDatasetKey}`}>gbif-uat.org</Button>
          } : null}
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: `Browse`,
              children: <DataBrowser />,
            },
            {
              key: "2",
              label: `Metadata`,
              children: <MetaDataView />,
            },
            {
              key: "3",
              label: `Files available`,
              children: <FilesAvailable dataset={dataset} />,
            },
          ]}
        />
      </PageContent>
    </Layout>
  );
};

const mapContextToProps = ({ dataset }) => ({
  dataset,
});

export default withContext(mapContextToProps)(Dataset);
