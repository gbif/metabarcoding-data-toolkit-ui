import React, {useState} from "react"
import {Row, Col} from "antd"
import Form from "./Form"
import SectionTabs from "./SectionTabs"

const EmlForm = () => {
    const [section, setSection] = useState("basic")
    // how many required fields each section is still missing, reported up by the form so the
    // tab rail can show where the user needs to go
    const [missingBySection, setMissingBySection] = useState({})

    return <Row><Col span={4} >
    <SectionTabs onChange={setSection} activeKey={section} missingBySection={missingBySection} />
    </Col><Col span={20} style={{paddingLeft: "10px"}}>
        <Form section={section} setSection={setSection} onMissingChange={setMissingBySection} />
    </Col></Row>
}

export default EmlForm;