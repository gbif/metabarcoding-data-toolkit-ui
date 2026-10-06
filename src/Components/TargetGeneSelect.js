import { useState, useEffect, useMemo } from "react";
import { Select, Typography, Space, Tag } from "antd";
import { WarningOutlined } from '@ant-design/icons';
import { getTargetGeneVocabulary } from "../Api/enum";

const { Text } = Typography;

/**
 * Marker picker constrained to the GBIF target_gene vocabulary.
 *
 * The list used to be nine hardcoded strings ("COI", "ITS", "16S", ...). It is now the
 * vocabulary itself, fetched when the user reaches the mapping step, so MDT stops inventing
 * its own marker names and publishes the term GBIF indexes.
 *
 * What is stored is the concept name (SSU_rRNA_16S_prokaryotic); what is shown is the human
 * label. Searching also matches the alternative labels, which is where the forms people
 * actually write live - someone typing "12S" or "COX1" must find the concept.
 */

// A handful of concepts carry no English label and fall back to the machine name. Showing
// "Protein_coding_gene" twice, once as the label and once as the identifier, reads like a bug.
const displayLabel = (concept) => (
    concept?.label && concept.label !== concept.name
        ? concept.label
        : `${concept?.name ?? ''}`.replace(/_/g, ' ')
);

// The vocabulary is three levels deep. Grouping by immediate parent keeps the dropdown
// navigable; an intermediate concept is both a group heading and an option inside it, because
// some of them (ITS_region) are the right answer for a dataset in their own right.
const buildGroups = (concepts) => {
    const children = new Map();
    concepts.forEach(c => {
        if (c.parent) {
            children.set(c.parent, [...(children.get(c.parent) || []), c]);
        }
    });
    const isGroup = (c) => children.has(c.name);

    const groups = [];
    const walk = (concept) => {
        if (!isGroup(concept)) {
            return;
        }
        const kids = children.get(concept.name) || [];
        groups.push({
            key: concept.name,
            label: displayLabel(concept),
            options: [concept, ...kids.filter(k => !isGroup(k))],
        });
        kids.filter(isGroup).forEach(walk);
    };
    concepts.filter(c => !c.parent).forEach(walk);

    // a concept whose parent is missing from the response would otherwise disappear
    const placed = new Set(groups.flatMap(g => g.options.map(o => o.name)));
    const orphans = concepts.filter(c => !placed.has(c.name));
    if (orphans.length) {
        groups.push({ key: '__other__', label: 'Other', options: orphans });
    }
    return groups;
};

const haystack = (concept) => [
    concept?.name,
    concept?.label,
    ...(concept?.alternativeLabels || []),
].filter(Boolean).join(' | ').toLowerCase();

const TargetGeneSelect = ({ style = { width: 300 }, onChange, initialValue }) => {
    const [value, setValue] = useState(initialValue || undefined);
    const [concepts, setConcepts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                const res = await getTargetGeneVocabulary();
                if (!cancelled) {
                    setConcepts(res?.data?.concepts || []);
                }
            } catch (error) {
                // the backend serves a bundled copy when api.gbif.org is unreachable, so an
                // empty list here means the request itself failed - leave the stored value
                // showing rather than blanking the field
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (initialValue) {
            setValue(initialValue);
        }
    }, [initialValue]);

    const groups = useMemo(() => buildGroups(concepts), [concepts]);

    // A value mapped before the vocabulary was wired in, or one that arrived from a study file,
    // may not be a concept name. Show it rather than silently emptying the field.
    const known = useMemo(() => new Set(concepts.map(c => c.name)), [concepts]);
    const unlistedValue = !!value && concepts.length > 0 && !known.has(value);

    // "12S" is an alternative label for SSU_rRNA_12S_mitochondrial, so the GBIF pipelines index
    // it as that concept and nothing is wrong with the value. Validation normalises it to the
    // concept name anyway, for consistency, but a legacy mapping opened without re-validating
    // still shows the old form - and that needs no action from the user, so say what it resolves
    // to without asking them to change it.
    const synonymOf = useMemo(() => {
        if (!unlistedValue) {
            return null;
        }
        const needle = `${value}`.trim().toLowerCase();
        return concepts.find(c =>
            `${c.label ?? ''}`.toLowerCase() === needle ||
            (c.alternativeLabels || []).some(l => `${l}`.toLowerCase() === needle)
        ) || null;
    }, [unlistedValue, value, concepts]);

    // only a value the vocabulary cannot interpret at all needs picking again
    const needsAttention = unlistedValue && !synonymOf;

    const renderOption = (concept) => (
        <Select.Option
            key={concept.name}
            value={concept.name}
            label={displayLabel(concept)}
            title={concept.definition || displayLabel(concept)}
            search={haystack(concept)}>
            <Space direction="vertical" size={0}>
                <Text>{displayLabel(concept)}</Text>
                {concept.label !== concept.name && (
                    <Text type="secondary" style={{ fontSize: '0.85em' }}>{concept.name}</Text>
                )}
            </Space>
        </Select.Option>
    );

    return (
        <>
            <Select
                showSearch
                loading={loading}
                placeholder="Select a target gene"
                style={style}
                popupMatchSelectWidth={460}
                value={value}
                optionLabelProp="label"
                status={needsAttention ? 'warning' : undefined}
                filterOption={(input, option) => {
                    const needle = `${input}`.trim().toLowerCase();
                    // option.search is absent on the group headings and on the stray-value option
                    return `${option?.search ?? option?.value ?? ''}`.includes(needle);
                }}
                onChange={val => {
                    setValue(val);
                    if (typeof onChange === 'function') {
                        onChange(val);
                    }
                }}>
                {unlistedValue && (
                    <Select.Option key={value} value={value} label={value}>
                        {needsAttention
                            ? <Text type="warning"><WarningOutlined /> {value}</Text>
                            : <Space direction="vertical" size={0}>
                                <Text>{value}</Text>
                                <Text type="secondary" style={{ fontSize: '0.85em' }}>{synonymOf.name}</Text>
                            </Space>}
                    </Select.Option>
                )}
                {groups.map(group => (
                    <Select.OptGroup key={group.key} label={group.label}>
                        {group.options.map(renderOption)}
                    </Select.OptGroup>
                ))}
            </Select>
            {unlistedValue && (
                <div>
                    <Text type={needsAttention ? 'warning' : 'secondary'} style={{ fontSize: '0.85em' }}>
                        {synonymOf
                            ? `Indexed as "${displayLabel(synonymOf)}".`
                            : 'Not a GBIF target_gene term. Pick one from the list.'}
                    </Text>
                </div>
            )}
        </>
    );
};

export default TargetGeneSelect;
