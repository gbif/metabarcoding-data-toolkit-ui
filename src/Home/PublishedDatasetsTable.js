import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";

import { Table, Typography, Card, Result, Button} from "antd";
import { useNavigate } from "react-router-dom";
import { axiosWithAuth } from "../Auth/userApi";
import {dateFormatter, numberFormatter} from '../Util/formatters'
import _ from "lodash";
import withContext from "../Components/hoc/withContext";


import config from "../config";
const { Title, Text } = Typography;
const { Meta } = Card;

function Admin({user, setLoginFormVisible}) {
  const [datasets, setDatasets] = useState([]);
  const [userFilter, setUserFilter] = useState([])
  const [loading, setLoading] = useState(false)
  /* const [pageSize, setPageSize] = useState(20)
  const [offset, setOffset] = useState(0) */
  const navigate = useNavigate()

  useEffect(() => {
    getDatasets()
  }, []);

  const getDatasets = async () => {

    try {
        setLoading(true)
        const res = await axiosWithAuth.get(`${config.backend}/datasets/published`)

        setDatasets(res?.data/* .sort((a,b) => (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0)) */)
        setLoading(false)
       const grouped = _.groupBy(res?.data, 'user_name')
       setUserFilter(Object.keys(grouped).map(usr => ({text: `${usr} (${grouped[usr].length})`, value: usr})))
    } catch (error) {
      setLoading(false)
    }

  }
  return (
   
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
                render: (text, record) => (record.taxon_count > 0 && record.sample_count > 0) ? <Button style={{padding: 0}} type="link" onClick={()=> navigate(`/dataset/${record.dataset_id}`)}>{text}</Button> : text

            },
            {
                title: "DWC generated",
                dataIndex: "dwc_generated",
                key: "dwc_generated",
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
                render: (text, record) => !!text ? <a href={`https://www.gbif-uat.org/dataset/${text}`} target="_blank" rel="noreferrer" >{<FaExternalLinkAlt />
}</a> : ""

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
              render: (text, record) => !!text ? <a href={`https://www.gbif${config.env !== "prod" ? "-uat" : ""}.org/dataset/${text}`} target="_blank" rel="noreferrer" >{<FaExternalLinkAlt />
}</a> : ""

          }
        ]}
        />
  );
}

const mapContextToProps = ({ user, setLoginFormVisible }) => ({
  user,
  setLoginFormVisible
});
export default withContext(mapContextToProps)(Admin);



