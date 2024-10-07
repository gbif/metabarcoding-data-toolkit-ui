import React, { useEffect, useState, useRef } from "react";
import withContext from "../Components/hoc/withContext";
import { Table, Card , Row, Col, Button, Modal, Alert, Popconfirm, Result, notification} from "antd";
import {getEmailBodyForNonPublishingMDTs} from "./EmailTemplate"

const ProdPublishingNotEnabled = ({installationSettings, user, dataset}) => {

    return <Result
    status="404"
    title={<>This MDT installation is not enabled for publishing directly to <a target="_blank"  href="https://www,gbif.org" rel="noreferrer">GBIF.org</a> </>}
    subTitle={<Row>
      <Col flex="auto"></Col>
      <Col style={{textAlign: "left"}}>
      <ul>
        <li>Ready to publish a dataset? <a href={`mailto:${installationSettings?.installationContactEmail}?subject=${encodeURIComponent("DNA Metabarcoding dataset publishing")}&body=${
                    encodeURIComponent(getEmailBodyForNonPublishingMDTs(
                      {
                        ednaDatasetID: dataset?.id, 
                        gbifUatKey: dataset?.publishing?.gbifUatDatasetKey || dataset?.publishing?.gbifDatasetKey, 
                        toolBaseUrl: window.location.protocol +"//"+ window.location.hostname, 
                        registryBaseUrl: installationSettings?.gbifRegistryBaseUrl,
                        user: user
                        }))}`} target="_blank" rel="noreferrer" >Reach out to the administrator for assistance. </a></li>
        <li>Need help with using this MDT? <a target="_blank" href={`mailto:${installationSettings?.installationContactEmail}`} rel="noreferrer">Contact the administrator directly.</a></li>
        <li>Have general questions about GBIF publishing? Get in touch with <a target="_blank" href={`mailto:helpdesk@GBIF.org`} rel="noreferrer">helpdesk@GBIF.org</a></li>
      </ul>
      </Col>
      <Col flex="auto"></Col>
     </Row>}
  />

}


const mapContextToProps = ({ user, login, logout, dataset, setDataset, installationSettings }) => ({
    user,
    login,
    logout,
    dataset,
    setDataset,
    installationSettings
  });
  
  export default withContext(mapContextToProps)(ProdPublishingNotEnabled);