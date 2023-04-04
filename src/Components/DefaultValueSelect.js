import { useState, useEffect } from "react";
import { Form, Space, Typography, Select, Input, theme } from "antd"

const { Text, Divider, Link } = Typography;

const DefaultValueSelect = ({style = { width: 300 }, onChange, term, vocabulary = null }) => {
    const [value, setValue] = useState(null)
    useEffect(() => {
        
    }, [vocabulary, term])

    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange(value)
        }
    }, [value])
    

    return <>
    {vocabulary ? <Select style={style} value={value} onChange={val => {
        setValue(val)
    }}>
        {vocabulary?.map(h => <Select.Option key={h} value={h}>{h}</Select.Option>)}
    </Select> : 
    <Input onChange={val => {
        setValue(val)
    } } />}
    </>

}

export default DefaultValueSelect