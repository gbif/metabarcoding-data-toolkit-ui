import React, { useEffect, useState } from "react";

import {  Menu, Button} from "antd";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import withContext from "../Components/hoc/withContext";



const AdminTabs = ({user}) => {

    const location = useLocation();
    const navigate = useNavigate()
    const onClick = (e) => {
        console.log('click ', e);
        navigate(e.key);
      };
    return <Menu     
    onClick={onClick}
        mode="horizontal"
        style={{ marginBottom: "10px" }}

        selectedKeys={[location.pathname]}
        items={[
            {label: "All datasets in this tool", key: "/admin"},
            {label: "Manage organizations and users", key: "/admin/organizations"},
            // who administers the installation is only shown to support admins - the
            // endpoint behind the page answers 403 to everyone else
            ...(user?.isSupportAdmin ? [{label: "Administrators", key: "/admin/administrators"}] : []),

        ]}
    ></Menu>
}

const mapContextToProps = ({ user }) => ({ user });

export default withContext(mapContextToProps)(AdminTabs);