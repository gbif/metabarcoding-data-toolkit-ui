import { useState, useEffect } from "react";
import { Row, Col, Typography, Modal, Button, Select, Input, theme } from "antd"

const { Text, Divider, Link } = Typography;

const OntologySelect = ({style = { width: 300 }, onChange, term, ontology = null, initialValue }) => {
    const [value, setValue] = useState(initialValue || null)
    useEffect(() => {
        
    }, [ontology, term])

    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange(value)
        }
    }, [value])
    

    return <>
    
    </>

}

export default OntologySelect