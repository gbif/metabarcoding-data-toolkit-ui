import React, {useState} from "react"
import {Row, Col} from "antd"
import Form from "./Form"
import SectionTabs from "./SectionTabs"

const EmlForm = () => {
    const [section, setSection] = useState("basic")

    return <Row><Col span={4} >
    <SectionTabs onChange={setSection} />
    </Col><Col span={20} style={{paddingLeft: "10px"}}>
        <Form section={section} />
    </Col></Row>
}

export default EmlForm;