import React, { useEffect, useState } from "react";

import {  Menu, Button} from "antd";
import { useNavigate, useLocation, useMatch } from "react-router-dom";



const AdminTabs = () => {

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

        ]}
    ></Menu>
}

export default AdminTabs;