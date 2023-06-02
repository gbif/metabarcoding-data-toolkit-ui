import { useState, useEffect } from "react";
import { Row, Col, Typography, Modal, Button, Table, Input, theme } from "antd"
import {
    EditOutlined,
    LinkOutlined
} from '@ant-design/icons';
import axios from "axios";
import config from "../config";
const { Search } = Input;

const { Text, Divider, Link } = Typography;

const LIMIT = 1000;

const OntologySelect = ({ onChange, term, ontology = null, initialValue }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({})
    useEffect(() => {

    }, [ontology, term])

   

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const getData = async (q) => {
        try {
            setLoading(true)
            const res = await axios.get(`${config.backend}/ontology/${ontology}?q=${q}&groupField=iri&start=0&rows=${LIMIT}`)
            setData(res?.data)

            setLoading(false)


        } catch (error) {
            setLoading(false)

        }
    }
    return (
        <>
           {initialValue ? <>{initialValue} <Button type="link" onClick={showModal}><EditOutlined /></Button></> : <Button  onClick={showModal}>
                Browse {ontology.toUpperCase()} ontology
            </Button>} 
            <Modal width={"90%"} title={`${ontology.toUpperCase()} ontology`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Search 
                style={{marginTop: '10px', marginBottom: '10px', width: 400}} 
                allowClear 
                placeholder="Search the ontology" 
                
                onSearch={val => getData(val)}
                 />
                <Table
                    loading={loading}
                    dataSource={data?.response?.docs?.length > 0 ? data?.response?.docs : []} columns={[
                        {
                            title: '',
                            key: 'selectVal',
                            render: (text, item) =>  <Button onClick={() => {
                                onChange(`${item?.label} [${item?.obo_id}]`)
                                handleCancel()
                            }}>Select</Button>
                            
                        },
                        {
                            title: 'OBO ID',
                            dataIndex: 'obo_id',
                            key: 'obo_id',
                            width: 200,
                            render: (text, item) => <>{text} <Button href={item?.iri} target="_blank" type="link"><LinkOutlined/></Button></>
                        },
                        {
                            title: 'Label',
                            dataIndex: 'label',
                            key: 'label'
                        },
                        {
                            title: 'Description',
                            dataIndex: 'description',
                            key: 'description',
                            render: (text, item) => item?.description?.[0] || item?.description
                        }
                    ]}
                    size="small"
                />


            </Modal>
        </>
    );

}

export default OntologySelect