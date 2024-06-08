import { useState, useEffect } from "react";
import { debounce } from "lodash";

import { Row, Col, Typography, Modal, Button, Table, Input, AutoComplete } from "antd"
import {
    EditOutlined,
    LinkOutlined
} from '@ant-design/icons';
import axios from "axios";
import config from "../config";
const { Search } = Input;


const OrganisationAutoComplete = ({onSelectOrganisation= () => {}}) => {

    const [options, setOptions] = useState([])
    const [value, setValue] = useState("")
    const onSelectOrganisation_ = (val, obj) => {
        console.log(val)
        setValue(val)
        onSelectOrganisation({ key: obj.key, title: val });
      };
    const getData = async (q) => {

        try {
            const res = await axios.get(`${config.backend}/organization/suggest?q=${encodeURIComponent(q)}`)
            setOptions(res?.data?.result)
        } catch (error) {
            
        }
    }

    return <AutoComplete
    onSelect={onSelectOrganisation_}
    onSearch={getData/* () => debounce(getData, 500) */}
    options={options}
    placeholder={"Type to find your organisation"}
    style={{ width: "100%" }}
    onChange={setValue}
    value={value}
  />
}


export default OrganisationAutoComplete;



