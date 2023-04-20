import { useState, useEffect } from "react";
import { Row, Col, Typography, Select, Input, theme } from "antd"

const { Text, Divider, Link } = Typography;

const DefaultValueSelect = ({style = { width: 300 }, onChange, term, vocabulary = null, initialValue }) => {
    const [value, setValue] = useState(initialValue || null)
    useEffect(() => {
        
    }, [vocabulary, term])

    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange(value)
        }
    }, [value])
    

    return <Row>
        <Col>
    {vocabulary ? <Select placeholder="Add default value" style={style} value={value} onChange={val => {
        setValue(val)
    }}>
        {vocabulary?.map(h => <Select.Option key={h} value={h}>{h}</Select.Option>)}
    </Select> : 
    <Input value={value} style={style} placeholder="Add default value" onChange={e => {
        setValue(e?.target?.value)
    } } />}
    </Col><Col flex="auto"></Col>
    </Row>

}

export default DefaultValueSelect