import { useState, useEffect } from "react";
import {  Space, Typography, Select, Divider } from "antd"

const { Text, Link } = Typography;
const exampleLengthLimit = 40;

const HeaderSelect = ({ exampleData, headers = [], style = { width: 300 }, onChange, term, value }) => {
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
        filterOption={(input, option) => (option?.value ?? '').toLowerCase().includes((input ?? '').toLowerCase())}
        filterSort={(optionA, optionB) =>
            (optionA?.value ?? '').toLowerCase().localeCompare((optionB?.value ?? '').toLowerCase())
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
            {!!exampleData && <div>
                <Text type="secondary">Source sample: </Text><br/>
                <Text style={{fontSize: "9px"}} type="danger" italic>{exampleData.map(e => exampleLengthLimit < e.length ? e.slice(0, exampleLengthLimit)+"..." : e).join(" | ")}
               </Text>
                </div>}
    </>

}

export default HeaderSelect