import React, { useEffect, useState } from "react";
import FilesAvailable from "../Components/FilesAvailable";
import { Row, Col, Tabs, Typography, Button } from "antd";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import DataBrowser from "../Review/DataBrowser";
import MetaDataView from "./MetaDataView";
import DashBoardContent from "../DashBoard/DashBoardContent";
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
          // gbifProdDatasetKey is a key in the GBIF production registry, so the link is
          // always www.gbif.org - not derived from config.env the way the admin table does
          // it, which would send a prod key to gbif-uat.org where it does not exist.
          tabBarExtraContent={dataset?.publishing?.gbifProdDatasetKey ? {
            right: <Button target="_blank" rel="noreferrer" type="link" href={`https://www.gbif.org/dataset/${dataset?.publishing?.gbifProdDatasetKey}`}>View at gbif.org</Button>
          } : dataset?.publishing?.gbifDatasetKey ? {
            right: <Button target="_blank" type="link" href={`https://www.gbif-test.org/dataset/${dataset?.publishing?.gbifDatasetKey}`}>gbif-uat.org</Button>
          } : null}
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: `Data`,
              children: <DataBrowser />,
            },
           /*  {
              key: "explore",
              label: `Explore`,
              children: <DashBoardContent />,
            }, */
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
