import {Tabs} from "antd"

const SectionTabs = ({onChange}) => {

    return <Tabs
    tabPosition={'left'}
    defaultActiveKey="basic"
    items={[
        {
            label: "Basic Metadata",
            key: "basic"
        },
        {
            label: "Geographic Coverage",
            key: "geographic_coverage"
        },
        {
            label: "Taxonomic Coverage",
            key: "taxonomic_coverage"
        },
        {
            label: "Temporal Coverage",
            key: "temporal_coverage"
        },
        {
            label: "Keywords",
            key: "keywords"
        },
        {
            label: "Associated Parties",
            key: "associated_parties"
        },
        {
            label: "Project Data",
            key: "project_data"
        },
        {
            label: "Sampling Methods",
            key: "sampling_methods"
        },
        {
            label: "Citations",
            key: "citations"
        },
        {
            label: "External link",
            key: "external_link"
        },
    ]}
    onChange={onChange}
  />
} 

export default SectionTabs;