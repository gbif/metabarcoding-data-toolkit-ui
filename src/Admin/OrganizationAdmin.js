import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import { Table, Typography, Card , Row, Col, Button, Modal, Alert, Popconfirm, Result, notification} from "antd";
import { EditOutlined, DeleteOutlined  } from '@ant-design/icons';

import TagControl from "../EmlForm/TagControl";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { axiosWithAuth } from "../Auth/userApi";
import OrganizationForm from "./OrganizationForm"
import DataBrowser from "../Review/DataBrowser";
import {dateFormatter, numberFormatter} from '../Util/formatters'
import _ from "lodash";
import withContext from "../Components/hoc/withContext";
import AdminTabs from "./AdminTabs"

import config from "../config";
const { Title, Text } = Typography;
const { Meta } = Card;

const OrganizationAdmin = ({user, setLoginFormVisible, installationSettings}) => {
  const [organisations, setOrganisations] = useState([]);
  const [organisationForEdit, setOrganisationForEdit] = useState(null)
  const [data, setData] = useState(null);
  const [formVisible, setFormVisible] = useState(false)
 const  [error, setError] = useState(null)
 const [loading, setLoading] = useState(false)
 const [searchParams, setSearchParams] = useSearchParams()
    let location = useLocation()

    useEffect(() => {
    getOrganisations()
  }, [user?.userName]);

  useEffect(()=>{
    if(!!location.search && !!data){
        const params = new URLSearchParams(location.search)
        if(params.has('organizationKey') && params.has('userName') && !!data[params.get('organizationKey') ]){
            const key = params.get('organizationKey')
            setOrganisationForEdit({key, ...data[key], users: [...(data[key]?.users || []), params.get('userName')]})
            setFormVisible(true)
        } else if(params.has('organizationKey') && params.has('name') && params.has('userName')){
            setOrganisationForEdit({key: params.get('organizationKey'), name: params.get('name'), users: [params.get('userName')]})
            setFormVisible(true)
        }
    }
  }, [location.search, data])
  

  useEffect(() => {
    if(data){
        const orgs = Object.keys(data).map(key => ({key, ...data[key]}))
        setOrganisations(orgs/* .sort((a,b) => (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0)) */)
    }
  }, [data]);

  const getOrganisations = async () => {

    try {
        setLoading(true)
        const res = await axiosWithAuth.get(`${config.backend}/admin/organizations`)
        setData(res?.data?.organizations)
        setLoading(false)

       
/*        setUserFilter(Object.keys(grouped).map(usr => ({text: `${usr} (${grouped[usr].length})`, value: usr})))
 */    } catch (error) {
        console.log(error)
        setLoading(false)

    }
  }

  const updateUsersForOrg = async (users, organizationKey) => {
    try {
        await axiosWithAuth.post(`${config.backend}/admin/organizations`, {organizations: {...data, [organizationKey]: {...data[organizationKey], users}}})
        console.log(`Updated users for orgKey ${organizationKey}`)
        getOrganisations()
    } catch (error) {
        setError(error)

    }
  }

  const addOrUpdateOrganization = async (organization) => {
    try {
        await axiosWithAuth.post(`${config.backend}/admin/organizations`, {organizations: {...data, [organization?.key]: organization}})
        setSearchParams(new URLSearchParams())
        getOrganisations()
        setFormVisible(false)
        setOrganisationForEdit(null)
        notification.open({description: "The organization was saved"})
    } catch (error) {
        setError(error)
        notification.error({description: <>The organization could not be saved. Please file an issue <a target="_blank" href="https://github.com/gbif/metabarcoding-data-toolkit-ui/issues" rel="noreferrer">here.</a></>, duration: 0})

    }
  }

  const deleteOrganisation = async (organization) => {
    try {
        await axiosWithAuth.post(`${config.backend}/admin/organizations`, {organizations: Object.keys(data).filter(k => k !== organization.key).reduce((acc, cur) => { acc[cur] = data[cur]; return acc}, {} )})
        getOrganisations()
      
        notification.open({description: "The organization was deleted"})
    } catch (error) {
        setError(error)
        notification.error({description: <>The organization could not be deleted. Please file an issue <a target="_blank" href="https://github.com/gbif/metabarcoding-data-toolkit-ui/issues" rel="noreferrer">here.</a></>, duration: 0})

    }
  }
  

  return (
    <Layout>
      
      <PageContent >
    {user?.isAdmin && <>
        {!installationSettings.prodPublishingEnabled && <Alert showIcon type="warning" description={<><Text>Publishing to gbif.org is not enabled for this installation. You can configure organizations and users, but this has no effect until the </Text><Text type="code">prodPublishingEnabled</Text><Text> is set in the configuration file.</Text></>}></Alert>}
     <AdminTabs />
        {error && <Alert description={error?.message} closable onClose={()=> setError(null)} />}
        <Row><Col>{/* <Title level={4}>Manage organizations and users</Title> */}</Col><Col flex="auto" /><Col><Button type="primary" style={{marginBottom: "10px"}} onClick={() => setFormVisible(true)}>Add new organization</Button></Col></Row>
            
{        <Table 
        loading={loading}
        dataSource={organisations}
        rowKey="key"
        columns={[
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                defaultSortOrder: 'ascend',
                sorter: (a,b) => (a.name < b.name) ? 1 : ((b.name < a.name) ? -1 : 0)

            },
            {
                title: "Key",
                dataIndex: "key",
                key: "key",
                width: 200
            },
            {
                title: "Token",
                dataIndex: "token",
                key: "token",
                width: 300
            },
            /* {
                title: "Created",
                dataIndex: "created",
                key: "created",
               // defaultSortOrder: 'ascend',
                sorter: (a,b) => (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0),
                render: (text, record) => dateFormatter.format(new Date(record.created))

            }, */
            
            {
                title: "Users",
                dataIndex: "users",
                key: "users",
                render : (text, record) =>  <TagControl removeAll value={record.users} onChange={val => updateUsersForOrg(val, record.key)} />

            },
            {
                title: "",
                dataIndex: "",
                key: "actions",
                render : (text, record) => <><Button type="link" onClick={() => {setOrganisationForEdit(record); setFormVisible(true)}}><EditOutlined /></Button> | <Popconfirm onConfirm={() => deleteOrganisation(record)} description="Do you want to remove this organisation from the tool?"><Button type="link" ><DeleteOutlined /></Button></Popconfirm></> 

            },
          
        ]}
        />}

        <Modal footer={null} title={"Add or edit oganization"} destroyOnClose={true} open={formVisible}  onCancel={() => {setOrganisationForEdit(null); setFormVisible(false)}}
           
        >
            <OrganizationForm initialValues={organisationForEdit} submitData={addOrUpdateOrganization} />
        </Modal></>}
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

const mapContextToProps = ({ user, installationSettings, setLoginFormVisible }) => ({
    user,
    installationSettings,
    setLoginFormVisible
  });
export default withContext(mapContextToProps)(OrganizationAdmin);


