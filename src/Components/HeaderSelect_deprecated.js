import { useState, useEffect } from "react";
import {  Space, Typography, Select, Divider } from "antd"

const { Text, Link } = Typography;

const HeaderSelect = ({ headers = [], style = { width: 300 }, onChange, term, val }) => {
    const [matchedHeaders, setMatchedHeaders] = useState([])
    const [value, setValue] = useState(null)
    useEffect(() => {
        if (term?.synonyms) {
            setMatchedHeaders(headers.filter(s => !!s && term?.synonyms.indexOf(s.toLowerCase()) > -1))
        }
        const matchedTerm = headers.find(matchTerm)
        if (!val && matchedTerm) {
            setValue(matchedTerm)
            if (typeof onChange === 'function') {
                onChange(matchedTerm)
            }
        }

    }, [headers, onChange, term, val])

    useEffect(() => {
        if (val) {
            setValue(val)
        }
    }, [val])

    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange(value)
        }
    }, [value])
    
    const matchTerm = (header) => {
        return !!header && header.toLowerCase() === term?.name?.toLowerCase()
    }

    return <><Select style={style} value={value} allowClear onChange={v => {
        setValue(v)
    }}>
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