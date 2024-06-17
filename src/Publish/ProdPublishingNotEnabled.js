import React, { useEffect, useState, useRef } from "react";
import withContext from "../Components/hoc/withContext";
import { Table, Card , Row, Col, Button, Modal, Alert, Popconfirm, Result, notification} from "antd";

const ProdPublishingNotEnabled = ({installationSettings}) => {

    return <Result
    status="404"
    title=""
    subTitle={<>This installation is not enabled for publishing to <a target="_blank"  href="https://www,gbif.org" rel="noreferrer">www.gbif.org</a>.<br />If you have questions about publishing, contact the <a target="_blank" href={`mailto:${installationSettings?.installationContactEmail}`} rel="noreferrer">administrator</a>. </>}
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