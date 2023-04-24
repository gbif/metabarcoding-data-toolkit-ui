
import React, {useEffect, useState} from "react";
import axios from "axios"
import Layout from "../Layout/Layout";
import PageContent from "../Layout/PageContent";
import {Collapse, Typography} from "antd"
import {marked} from "marked"
const {Title} = Typography
const { Panel } = Collapse;


const Faq =  () => {
    const [faq, setFaq] = useState(null)
    useEffect(() => {
        const getAbout = async () => {
            try {
                const res = await  axios(`/faq.json`)
                setFaq(res.data)
               // console.log(res.data)
            } catch (error) {
                console.log(error)
            }
            
        }
        getAbout()
       

    },[])
  return (
    <Layout><PageContent>
        <Title level={2}>Frequently asked questions</Title>
       {faq && <Collapse  >
       {faq.map((item, idx) => <Panel header={item?.q} key={idx}>
        <p>{item?.a}</p>
      </Panel>)}
      
    </Collapse>}
        </PageContent></Layout>
  );
}

export default Faq;
