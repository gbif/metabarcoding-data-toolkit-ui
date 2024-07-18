import { useState, useEffect } from "react";
import {  Space, Typography, Select, Divider } from "antd"

const { Text, Link } = Typography;

const HeaderSelect = ({ headers = [], style = { width: 300 }, onChange, term, value }) => {
    const [matchedHeaders, setMatchedHeaders] = useState([])
    useEffect(() => {
        if (term?.synonyms) {
            setMatchedHeaders(headers.filter(s => !!s && term?.synonyms.indexOf(s.toLowerCase()) > -1))
        }
        const matchedTerm = headers.find(matchTerm)
        if (matchedTerm) {
            setValue(matchedTerm)      
        }

    }, [])
     

   const setValue = (v) => {
    if (typeof onChange === 'function') {
        onChange(v)
    }
   }

   
    
    const matchTerm = (header) => {
        return !!header && header.toLowerCase() === term?.name?.toLowerCase()
    }

    return <><Select 
        style={style} 
        value={value} 
        showSearch 
        filterOption={(input, option) =>
            (option?.value ?? '').toLowerCase().startsWith(input.toLowerCase())
          }
        allowClear 
        onChange={setValue}>
        {headers?.map(h => <Select.Option key={h} value={h}>{h}</Select.Option>)}
    </Select>
        {
            matchedHeaders.length > 0 &&
            <div>
                <Text type="secondary">Use </Text>
                <Space split={<Divider type="vertical" />}>{matchedHeaders.map(h => <Link key={h} onClick={() => setValue(h)}>{h}</Link>)}
                </Space>
            </div>}
    </>

}

export default HeaderSelect