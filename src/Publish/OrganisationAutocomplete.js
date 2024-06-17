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


const OrganisationAutoComplete = ({onSelectOrganisation= () => {}, defaultValue, disabled, style}) => {

    const [options, setOptions] = useState([])
    const [value, setValue] = useState(defaultValue || "")
    const onSelectOrganisation_ = (val, obj) => {
        setValue(obj?.label)
        onSelectOrganisation({ key: obj.value, title: obj.label });
      };
    let getData = async (q) => {

        try {
            const res = await axios.get(`${config.backend}/organization/suggest?q=${encodeURIComponent(q)}`)
            setOptions(res?.data?.map(e => ({label: e.title, value: e?.key})))
        } catch (error) {
            
        }
    }
    getData = debounce(getData, 500)

    

    return <AutoComplete
    disabled={disabled}
    onSelect={onSelectOrganisation_}
    onSearch={getData/* () => debounce(getData, 500) */ }
    options={options}
    placeholder={"Type to find your organisation"}
    style={style ? style : { width: "100%" }}
    onChange={setValue}
    onClear={() => onSelectOrganisation(null)}
    value={value}
    allowClear
  />
}


export default OrganisationAutoComplete;



