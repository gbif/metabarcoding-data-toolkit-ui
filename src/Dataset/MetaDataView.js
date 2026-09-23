import React from "react";
import { Anchor, Card, Col, Descriptions, Empty, Row, Steps, Tag, Typography } from "antd";
import withContext from "../Components/hoc/withContext";
import AgentPresentation from "../EmlForm/AgentPresentation";
import Doi from "../EmlForm/Doi";
import { dateFormatter } from "../Util/formatters";
import _ from "lodash";

const { Paragraph, Text } = Typography;

// The ranks the backend writes into taxonomicCoverage - util/Eml/index.js TAX_COVERAGE_RANKS
const TAX_RANKS = ["kingdom", "phylum", "class", "order", "family"];

const isPresent = (value) => {
    if (value === null || value === undefined) return false;
    if (_.isArray(value)) return value.filter(v => !_.isEmpty(v) || _.isNumber(v)).length > 0;
    if (_.isPlainObject(value)) return Object.values(value).some(isPresent);
    return `${value}`.trim() !== "";
};

const asArray = (value) => (_.isArray(value) ? value : isPresent(value) ? [value] : []);

const formatDate = (value) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : dateFormatter.format(date);
};

// faire_description is DocBook, not text - converters/faire.js builds it as
//   <listitem><para><emphasis>TERM</emphasis>: VALUE</para><para>COMMENT</para></listitem>
// with the values XML-escaped. Pulling the pieces out keeps it presentable without having to
// inject markup into the page; the values come from an uploaded FAIRe file and there is no
// sanitiser in this project.
const unescapeXml = (s) =>
    `${s ?? ""}`
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");

const parseFaireDescription = (docbook) => {
    if (!isPresent(docbook)) return [];
    const items = [];
    const listItems = `${docbook}`.match(/<listitem>[\s\S]*?<\/listitem>/g) || [];
    for (const item of listItems) {
        const head = item.match(/<emphasis>([\s\S]*?)<\/emphasis>:\s*([\s\S]*?)<\/para>/);
        if (!head) continue;
        // the comment, when present, is the para that follows the term/value one
        const paras = item.match(/<para>[\s\S]*?<\/para>/g) || [];
        const comment = paras.length > 1
            ? unescapeXml(paras[paras.length - 1].replace(/<\/?para>/g, "")).trim()
            : null;
        items.push({
            term: unescapeXml(head[1]).trim(),
            value: unescapeXml(head[2]).trim(),
            comment,
        });
    }
    return items;
};

// Saved metadata carries both the nested project object and the flat projectTitle /
// projectIdentifier / projectPersonnel keys the form binds to - EmlForm/Form.js getProject()
// builds the nested copy while the flat ones stay in the values. Prefer the nested one so
// nothing is shown twice.
const getProject = (metadata) => {
    const nested = metadata?.project;
    if (isPresent(nested)) return nested;
    const flat = {
        identifier: metadata?.projectIdentifier,
        title: metadata?.projectTitle,
        personnel: metadata?.projectPersonnel,
        description: metadata?.projectDescription,
        funding: metadata?.projectFunding,
        studyAreaDescription: metadata?.projectStudyAreaDescription,
        designDescription: metadata?.projectDesignDescription,
    };
    return isPresent(flat) ? flat : null;
};

// Only rendered when it has something to say, so a sparsely described dataset shows a short
// page rather than a long list of dashes
const Section = ({ id, title, when, children }) =>
    when ? (
        <Card size="small" title={title} id={id} style={{ marginBottom: "16px" }}>
            {children}
        </Card>
    ) : null;

const Agents = ({ label, agents }) => {
    const list = asArray(agents);
    if (list.length === 0) return null;
    return (
        <>
            <Text strong>{label}</Text>
            <div style={{ margin: "4px 0 16px 0" }}>
                {list.map((agent, idx) => (
                    <div key={idx} style={{ marginBottom: "8px" }}>
                        <AgentPresentation agent={agent} />
                    </div>
                ))}
            </div>
        </>
    );
};

const Prose = ({ label, value }) =>
    isPresent(value) ? (
        <>
            <Text strong>{label}</Text>
            <Paragraph style={{ marginTop: "4px" }}>{value}</Paragraph>
        </>
    ) : null;

const MetaDataView = ({ dataset, licenseEnum = {} }) => {
    const { metadata } = dataset || {};

    if (!metadata) {
        return <Empty description="No metadata has been provided for this dataset" />;
    }

    const faireItems = parseFaireDescription(metadata.faire_description);
    const project = getProject(metadata);
    const geo = metadata.geographicCoverage;
    const temporal = metadata.temporalCoverage;
    const taxonomic = metadata.taxonomicCoverage;
    const ranksPresent = TAX_RANKS.filter(r => isPresent(taxonomic?.[r]));
    const hasBoundingBox = isPresent(geo?.northBoundingCoordinate) && isPresent(geo?.westBoundingCoordinate);

    const summary = [
        { label: "License", value: licenseEnum?.[metadata.license]?.url
            ? <a href={licenseEnum[metadata.license].url} target="_blank" rel="noreferrer">{licenseEnum[metadata.license].title || metadata.license}</a>
            : metadata.license },
        { label: "DOI", value: isPresent(metadata.doi) ? <Doi doi={metadata.doi} /> : null },
        { label: "Publisher", value: metadata.publisher },
        { label: "Homepage", value: isPresent(metadata.url)
            ? <a href={metadata.url} target="_blank" rel="noreferrer">{metadata.url}</a> : null },
        { label: "Metadata created", value: isPresent(metadata.createdAt) ? formatDate(metadata.createdAt) : null },
    ].filter(item => !!item.value);

    const sections = [
        { key: "summary", title: "Summary", when: summary.length > 0 },
        { key: "description", title: "Description", when: isPresent(metadata.description) || faireItems.length > 0 },
        { key: "contacts", title: "Contacts", when: isPresent(metadata.contact) || isPresent(metadata.creator) || isPresent(metadata.metadataProvider) || isPresent(metadata.associatedParty) },
        { key: "coverage", title: "Coverage", when: hasBoundingBox || isPresent(geo?.geographicDescription) || isPresent(temporal) || ranksPresent.length > 0 || isPresent(taxonomic?.generalTaxonomicCoverage) },
        { key: "methods", title: "Methods", when: isPresent(metadata.methodSteps) || isPresent(metadata.studyExtent) || isPresent(metadata.samplingDescription) },
        { key: "project", title: "Project", when: isPresent(project) },
        { key: "keywords", title: "Keywords", when: isPresent(metadata.keywords) },
        { key: "bibliography", title: "Bibliography", when: isPresent(metadata.bibliographicReferences) },
    ].filter(s => s.when);

    return (
        <Row gutter={16}>
            <Col xs={24} lg={18}>
                <Section id="summary" title="Summary" when={summary.length > 0}>
                    <Descriptions bordered size="small" column={1}>
                        {summary.map(item => (
                            <Descriptions.Item key={item.label} label={item.label}>
                                {item.value}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                </Section>

                <Section id="description" title="Description"
                    when={isPresent(metadata.description) || faireItems.length > 0}>
                    {isPresent(metadata.description) && <Paragraph>{metadata.description}</Paragraph>}
                    {faireItems.length > 0 && (
                        <>
                            <Text strong>Bioinformatics and screening parameters</Text>
                            <Descriptions bordered size="small" column={1} style={{ marginTop: "8px" }}>
                                {faireItems.map(item => (
                                    <Descriptions.Item key={item.term} label={item.term}>
                                        <div>{item.value}</div>
                                        {item.comment && <Text type="secondary">{item.comment}</Text>}
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </>
                    )}
                </Section>

                <Section id="contacts" title="Contacts"
                    when={isPresent(metadata.contact) || isPresent(metadata.creator) || isPresent(metadata.metadataProvider) || isPresent(metadata.associatedParty)}>
                    <Agents label="Contact" agents={metadata.contact} />
                    <Agents label="Creators" agents={metadata.creator} />
                    <Agents label="Metadata providers" agents={metadata.metadataProvider} />
                    <Agents label="Associated parties" agents={metadata.associatedParty} />
                </Section>

                <Section id="coverage" title="Coverage"
                    when={hasBoundingBox || isPresent(geo?.geographicDescription) || isPresent(temporal) || ranksPresent.length > 0 || isPresent(taxonomic?.generalTaxonomicCoverage)}>
                    <Prose label="Geographic description" value={geo?.geographicDescription} />
                    {hasBoundingBox && (
                        <>
                            <Text strong>Bounding box</Text>
                            <Descriptions bordered size="small" column={2} style={{ margin: "4px 0 16px 0" }}>
                                <Descriptions.Item label="North">{geo.northBoundingCoordinate}</Descriptions.Item>
                                <Descriptions.Item label="South">{geo.southBoundingCoordinate}</Descriptions.Item>
                                <Descriptions.Item label="West">{geo.westBoundingCoordinate}</Descriptions.Item>
                                <Descriptions.Item label="East">{geo.eastBoundingCoordinate}</Descriptions.Item>
                            </Descriptions>
                        </>
                    )}
                    {isPresent(temporal) && (
                        <>
                            <Text strong>Temporal</Text>
                            <Paragraph style={{ marginTop: "4px" }}>
                                {formatDate(temporal.from)} &ndash; {formatDate(temporal.to)}
                            </Paragraph>
                        </>
                    )}
                    <Prose label="Taxonomic description" value={taxonomic?.generalTaxonomicCoverage} />
                    {ranksPresent.length > 0 && (
                        <>
                            <Text strong>Taxonomic</Text>
                            <Descriptions bordered size="small" column={1} style={{ marginTop: "4px" }}>
                                {ranksPresent.map(rank => (
                                    <Descriptions.Item key={rank} label={_.upperFirst(rank)}>
                                        {taxonomic[rank].map(name => <Tag key={name}>{name}</Tag>)}
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </>
                    )}
                </Section>

                <Section id="methods" title="Methods"
                    when={isPresent(metadata.methodSteps) || isPresent(metadata.studyExtent) || isPresent(metadata.samplingDescription)}>
                    {isPresent(metadata.methodSteps) && (
                        <>
                            <Text strong>Steps</Text>
                            <Steps
                                direction="vertical"
                                progressDot
                                current={asArray(metadata.methodSteps).length}
                                style={{ margin: "8px 0 16px 0" }}
                                items={asArray(metadata.methodSteps).map(s => ({ title: s }))}
                            />
                        </>
                    )}
                    <Prose label="Study extent" value={metadata.studyExtent} />
                    <Prose label="Sampling description" value={metadata.samplingDescription} />
                </Section>

                <Section id="project" title="Project" when={isPresent(project)}>
                    {(isPresent(project?.title) || isPresent(project?.identifier)) && (
                        <Descriptions bordered size="small" column={1} style={{ marginBottom: "16px" }}>
                            {isPresent(project?.title) && (
                                <Descriptions.Item label="Title">{project.title}</Descriptions.Item>
                            )}
                            {isPresent(project?.identifier) && (
                                <Descriptions.Item label="Identifier">{project.identifier}</Descriptions.Item>
                            )}
                        </Descriptions>
                    )}
                    <Prose label="Abstract" value={project?.description} />
                    <Prose label="Funding" value={project?.funding} />
                    <Prose label="Study area" value={project?.studyAreaDescription} />
                    <Prose label="Design" value={project?.designDescription} />
                    <Agents label="Personnel" agents={project?.personnel} />
                </Section>

                {/* The thesaurus only appears when the user actually filled the field in on
                    the metadata form - the "N/A" the published EML always carries is a default
                    applied server-side (util/Eml/index.js) and never stored, so it cannot leak
                    into this view */}
                <Section id="keywords" title="Keywords" when={isPresent(metadata.keywords)}>
                    {asArray(metadata.keywords).map(k => <Tag key={k}>{k}</Tag>)}
                    {isPresent(metadata.keywordThesaurus) && (
                        <Paragraph type="secondary" style={{ marginTop: "8px", marginBottom: 0 }}>
                            Thesaurus: {metadata.keywordThesaurus}
                        </Paragraph>
                    )}
                </Section>

                <Section id="bibliography" title="Bibliography" when={isPresent(metadata.bibliographicReferences)}>
                    <ol style={{ paddingLeft: "20px", marginBottom: 0 }}>
                        {asArray(metadata.bibliographicReferences).map((ref, idx) => (
                            <li key={ref?.key || idx} style={{ marginBottom: "8px" }}>
                                {ref?.value}
                                {isPresent(ref?.key) && <Doi doi={ref.key} />}
                            </li>
                        ))}
                    </ol>
                </Section>
            </Col>

            {sections.length > 1 && (
                <Col xs={0} lg={6}>
                    <Anchor
                        affix
                        offsetTop={16}
                        items={sections.map(s => ({ key: s.key, href: `#${s.key}`, title: s.title }))}
                    />
                </Col>
            )}
        </Row>
    );
};

const mapContextToProps = ({ dataset, license }) => ({
    dataset,
    licenseEnum: license,
});

export default withContext(mapContextToProps)(MetaDataView);
