import {Tabs, Badge} from "antd"

// A required field on an inactive section is rendered but hidden, so nothing on screen says
// that section still needs something. The count makes the tab itself carry that.
const withBadge = (label, count) => count > 0
    ? <>{label} <Badge count={count} size="small" style={{marginLeft: "6px"}} /></>
    : label;

const SectionTabs = ({onChange, activeKey, missingBySection = {}}) => {

    return <Tabs
    tabPosition={'left'}
    // controlled, so the rail follows when the form jumps to the section holding the first
    // unfilled field - uncontrolled it would keep highlighting the tab the user left
    activeKey={activeKey}
    onChange={onChange}
    items={[
        {
            label: withBadge("Basic Metadata", missingBySection["basic"]),
            key: "basic"
        },
        {
            label: withBadge("Contacts", missingBySection["contacts"]),
            key: "contacts"
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
       /*  {
            label: "Associated Parties",
            key: "associated_parties"
        }, */
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
  />
} 

export default SectionTabs;