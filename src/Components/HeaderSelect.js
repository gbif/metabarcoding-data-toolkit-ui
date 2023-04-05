import { useState, useEffect } from "react";
import { Form, Space, Typography, Select, theme } from "antd"

const { Text, Divider, Link } = Typography;

const HeaderSelect = ({ headers, style = { width: 300 }, onChange, term , val}) => {
    const [matchedHeaders, setMatchedHeaders] = useState([])
    const [value, setValue] = useState(null)
    useEffect(() => {
        if (term?.synonyms) {
            setMatchedHeaders(headers.filter(s => !!s && term?.synonyms.indexOf(s.toLowerCase()) > -1))
        }
        const matchedTerm = headers.find(matchTerm)
        if (matchTerm && matchedTerm) {
            setValue(matchedTerm)
            if (typeof onChange === 'function') {
                onChange(matchedTerm)
            }
        }

    }, [headers, term])

    useEffect(() => {
        if(val){
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

    return <><Select style={style} value={value} onChange={val => {
        setValue(val)
    }}>
        {headers?.map(h => <Select.Option key={h} value={h}>{h}</Select.Option>)}
    </Select>
        {matchedHeaders.length > 0 && <><br /> <Text type="secondary">Use </Text> <Space split={<Divider type="vertical" />}>{matchedHeaders.map(h => <Link onClick={() => setValue(h)}>{h}</Link>)}</Space></>}
    </>

}

export default HeaderSelect