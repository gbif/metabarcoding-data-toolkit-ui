import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Table, Typography, Card, Result, Button} from "antd";
import { useNavigate } from "react-router-dom";
import { axiosWithAuth } from "../Auth/userApi";
import { LuExternalLink } from "react-icons/lu";
import {dateFormatter, numberFormatter} from '../Util/formatters'
import AdminTabs from "./AdminTabs"
import _ from "lodash";
import withContext from "../Components/hoc/withContext";


import config from "../config";
const { Title, Text } = Typography;
const { Meta } = Card;

function Admin({user, setLoginFormVisible}) {
  const [datasets, setDatasets] = useState([]);
  const [userFilter, setUserFilter] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getDatasets()
  }, []);

  const getDatasets = async () => {

    try {
        setLoading(true)
        const res = await axiosWithAuth.get(`${config.backend}/datasets`)

        setDatasets(res?.data/* .sort((a,b) => (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0)) */)
        setLoading(false)
       const grouped = _.groupBy(res?.data, 'user_name')
       setUserFilter(Object.keys(grouped).map(usr => ({text: `${usr} (${grouped[usr].length})`, value: usr})))
    } catch (error) {
      setLoading(false)
    }

  }
  return (
    <Layout>
      
      <PageContent >
      {user?.isAdmin && <>  <AdminTabs />
{/*         <Title level={4}> All datasets in the tool </Title>
 */}
        <Table 
        loading={loading}
        dataSource={datasets}
        rowKey="dataset_id"
        rowClassName={(record => !!record?.deleted ? 'deleted-record-row' : '')} 
        columns={[
            {
                title: "Title",
                dataIndex: "title",
                key: "title",
                sorter: (a,b) => (a.title < b.title) ? 1 : ((b.title < a.title) ? -1 : 0),
                render: (text, record) =>  <a href="" onClick={()=> navigate(`/dataset/${record.dataset_id}/upload`)}>{text || <LuExternalLink />}</a> 
            },
            {
              title: "",
              dataIndex: "",
              key: "publish",
              render: (text, record) => <>{!!record.dwc_generated && !!record?.occurrence_count && <Button type="primary" size="small" onClick={() => navigate(`/dataset/${record.dataset_id}/publish`)} >Publishing</Button> }</>,
          },
            {
              title: "",
              dataIndex: "log",
              key: "log",
              render: (text, record) => <><Button type="link" href={`${config.backend}/dataset/${record.dataset_id}/log.txt`} target="_blank" rel="noreferrer" >Log</Button>{record?.validation_id && <>|<Button type="link" href={`https://www.gbif.org/tools/data-validator/${record.validation_id}`} target="_blank" rel="noreferrer" >Validation report</Button></> }</>,
          },
            {
                title: "Created",
                dataIndex: "created",
                key: "created",
               // defaultSortOrder: 'ascend',
                sorter: (a,b) => (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0),
                render: (text, record) => dateFormatter.format(new Date(record.created))

            },
            {
                title: "User",
                dataIndex: "user_name",
                key: "user_name",
                filters: userFilter,
                onFilter: (value, record) => record.user_name.indexOf(value) === 0,

            },
            {
                title: "Sample count",
                dataIndex: "sample_count",
                key: "sample_count",
                sorter: (a,b) => (a.sample_count < b.sample_count) ? 1 : ((b.sample_count < a.sample_count) ? -1 : 0),

                render: (text, record) => (record.taxon_count > 0 && record.sample_count > 0) ? <Button style={{padding: 0}} type="link" onClick={()=> navigate(`/dataset/${record.dataset_id}`)}>{numberFormatter.format(record?.sample_count)}</Button> : numberFormatter.format(record?.sample_count)
            },
            {
                title: "Taxon count",
                dataIndex: "taxon_count",
                key: "taxon_count",
                sorter: (a,b) => (a.taxon_count < b.taxon_count) ? 1 : ((b.taxon_count < a.taxon_count) ? -1 : 0),

                render: (text, record) => (record.taxon_count > 0 && record.sample_count > 0) ? <Button style={{padding: 0}} type="link" onClick={()=> navigate(`/dataset/${record.dataset_id}`)}>{numberFormatter.format(record?.taxon_count)}</Button> : numberFormatter.format(record?.taxon_count)

            },
            {
                title: "Occurrence count",
                dataIndex: "occurrence_count",
                key: "occurrence_count",
                sorter: (a,b) => (a.occurrence_count < b.occurrence_count) ? 1 : ((b.occurrence_count < a.occurrence_count) ? -1 : 0),

                render: (text, record) => numberFormatter.format(record?.occurrence_count)

            },
            {
                title: "GBIF UAT",
                dataIndex: "gbif_uat_key",
                key: "gbif_uat_key",
                filters: [
                    {text: "Published", value: true},
                    {text: "Not published", value: false},
                ],
                onFilter: (value, record) => value ? !!record.gbif_uat_key : !record.gbif_uat_key,
                render: (text, record) => !!text ? <Button type="link" href={`https://www.gbif-uat.org/dataset/${text}`} target="_blank" rel="noreferrer" ><LuExternalLink /></Button> : ""

            },
            {
              title: "GBIF",
              dataIndex: "gbif_prod_key",
              key: "gbif_prod_key",
              filters: [
                  {text: "Published", value: true},
                  {text: "Not published", value: false},
              ],
              onFilter: (value, record) => value ? !!record.gbif_prod_key : !record.gbif_prod_key,
              render: (text, record) => !!text ? <Button href={`https://www.gbif${config.env !== "prod" ? "-uat" : ""}.org/dataset/${text}`} target="_blank" rel="noreferrer" ><LuExternalLink /></Button> : ""

          },
            {
              title: "Deleted",
              dataIndex: "deleted",
              key: "deleted",
              filters: [
                {text: "Include deleted", value: true},
            ],
            defaultFilteredValue: [false],
            onFilter: (value, record) => value ? true : !record?.deleted,


              sorter: (a,b) => (a.deleted < b.deleted) ? 1 : ((b?.deleted < a?.deleted) ? -1 : 0),
              render: (text, record) => !!record.deleted ? <Text type="danger">{dateFormatter.format(new Date(record.deleted))}</Text> : null

          }
        ]}
        /></>}
        { !user?.isAdmin && <Result
    status="403"
    title=""
    subTitle="You don´t have access to this page"
    extra={!!user ? null : <Button type="primary" onClick={() => setLoginFormVisible(true)}>Login</Button>}
  />}
      </PageContent>
    </Layout>
  );
}

const mapContextToProps = ({ user, setLoginFormVisible }) => ({
  user,
  setLoginFormVisible
});
export default withContext(mapContextToProps)(Admin);



