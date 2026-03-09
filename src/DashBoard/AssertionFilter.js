import React, { useState, useRef, useEffect } from 'react';
import { Button, Select, Slider, Space, Row, Col, Typography, Tag } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import config from '../config';

const { Text } = Typography;

// ─── Numeric detection helpers ────────────────────────────────────────────────

const isNumericString = (v) => v !== null && v !== '' && !isNaN(Number(v));

const detectNumeric = (values) => values.length > 0 && values.every(isNumericString);

/**
 * Derive a sensible slider step from the actual value strings.
 * Uses the maximum number of decimal places found across all values,
 * so e.g. ["1.5","2.0","3.5"] → step 0.1 and ["60","70","80"] → step 1.
 */
const deriveStep = (values) => {
    const maxDecimals = Math.max(
        ...values.map(v => {
            const dot = v.indexOf('.');
            return dot === -1 ? 0 : v.length - dot - 1;
        })
    );
    return maxDecimals === 0 ? 1 : Math.pow(10, -maxDecimals);
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a list of assertion-type + assertion-value filter rows.
 *
 * Filter shape (passed to onFiltersChange):
 *   {
 *     assertionType : string | null
 *     isNumeric     : boolean
 *     values        : string[]         // categorical multi-select
 *     range         : [number, number] | null  // numeric slider selection
 *   }
 *
 * Props:
 *   datasetId       – current dataset UUID
 *   assertionTypes  – string[] of available assertion types
 *   filters         – filter array (controlled by parent)
 *   onFiltersChange – (newFilters) => void  — also triggers re-query
 */
const AssertionFilter = ({ datasetId, assertionTypes, filters, onFiltersChange }) => {

    // Cache of loaded type info keyed by assertionType
    // { isNumeric, values, min, max, step, loaded, loading }
    const [typeInfo, setTypeInfo] = useState({});

    // Immediate display for the type selector while async load is in flight
    const [pendingTypes, setPendingTypes] = useState({});

    // Local slider positions – updated on every drag tick, NOT propagated to
    // parent until the user releases the handle (onChangeComplete).
    const [sliderDisplay, setSliderDisplay] = useState({});

    // Always-current copy of the filters prop, used inside async callbacks to
    // avoid stale closures.
    const filtersRef = useRef(filters);
    useEffect(() => { filtersRef.current = filters; }, [filters]);

    // ── Load type info ────────────────────────────────────────────────────────

    const loadTypeInfo = async (assertionType) => {
        // Return immediately from cache
        if (typeInfo[assertionType]?.loaded) return typeInfo[assertionType];

        setTypeInfo(prev => ({ ...prev, [assertionType]: { ...prev[assertionType], loading: true } }));

        try {
            const escaped = assertionType.replace(/'/g, "''");
            const sql =
                `SELECT DISTINCT assertionValue\n` +
                `FROM "event-assertion"\n` +
                `WHERE assertionType = '${escaped}'\n` +
                `  AND assertionValue IS NOT NULL\n` +
                `ORDER BY assertionValue`;

            const res = await axios.post(
                `${config.backend}/dataset/${datasetId}/explore/query`,
                { sql }
            );
            const values = res.data.rows.map(r => r.assertionValue);
            const numeric = detectNumeric(values);

            let info;
            if (numeric) {
                const nums = values.map(Number);
                const min = Math.min(...nums);
                const max = Math.max(...nums);
                const step = deriveStep(values);
                info = { isNumeric: true, values, min, max, step, loaded: true, loading: false };
            } else {
                info = { isNumeric: false, values, min: null, max: null, step: null, loaded: true, loading: false };
            }

            setTypeInfo(prev => ({ ...prev, [assertionType]: info }));
            return info;
        } catch (e) {
            console.log(e);
            const fallback = { isNumeric: false, values: [], loaded: true, loading: false };
            setTypeInfo(prev => ({ ...prev, [assertionType]: fallback }));
            return fallback;
        }
    };

    // ── Filter mutations ──────────────────────────────────────────────────────

    const addFilter = () => {
        onFiltersChange([...filters, { assertionType: null, isNumeric: false, values: [], range: null }]);
    };

    const removeFilter = (idx) => {
        onFiltersChange(filters.filter((_, i) => i !== idx));
        setSliderDisplay(prev => { const n = { ...prev }; delete n[idx]; return n; });
        setPendingTypes(prev => { const n = { ...prev }; delete n[idx]; return n; });
    };

    const updateType = async (idx, newType) => {
        // Show the selected type immediately in the selector
        setPendingTypes(prev => ({ ...prev, [idx]: newType }));
        // Reset slider display for this row
        setSliderDisplay(prev => { const n = { ...prev }; delete n[idx]; return n; });

        const info = await loadTypeInfo(newType);

        // Build new filter for this row
        const newFilter = info?.isNumeric
            ? { assertionType: newType, isNumeric: true, values: [], range: [info.min, info.max] }
            : { assertionType: newType, isNumeric: false, values: [], range: null };

        // Use filtersRef to avoid stale closure
        onFiltersChange(filtersRef.current.map((f, i) => i === idx ? newFilter : f));
        setPendingTypes(prev => { const n = { ...prev }; delete n[idx]; return n; });
    };

    const updateValues = (idx, values) => {
        onFiltersChange(filters.map((f, i) => i === idx ? { ...f, values } : f));
    };

    // Called only when slider handle is released — triggers re-query
    const commitRange = (idx, range) => {
        onFiltersChange(filters.map((f, i) => i === idx ? { ...f, range } : f));
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{
            background: '#fafafa',
            border: '1px solid #e8e8e8',
            borderRadius: 6,
            padding: '14px 16px',
            marginBottom: 20
        }}>
            <Row align="middle" style={{ marginBottom: filters.length > 0 ? 12 : 0 }}>
                <Col flex="auto">
                    <Text strong>Filter by event assertions</Text>
                    {filters.length === 0 && (
                        <Text type="secondary" style={{ marginLeft: 10 }}>— showing all events</Text>
                    )}
                </Col>
                <Col>
                    <Button size="small" icon={<PlusOutlined />} onClick={addFilter}>
                        Add filter
                    </Button>
                </Col>
            </Row>

            <Space direction="vertical" style={{ width: '100%' }} size={10}>
                {filters.map((filter, idx) => {
                    // Use pendingTypes[idx] while async load is in flight so the
                    // selector updates immediately
                    const displayType = pendingTypes[idx] !== undefined
                        ? pendingTypes[idx]
                        : filter.assertionType;
                    const info = typeInfo[displayType];
                    const isLoading = info?.loading ?? false;

                    // Slider shows localDragValue while dragging, falls back to
                    // the persisted range once drag ends
                    const sliderValue = sliderDisplay[idx] ?? filter.range;

                    return (
                        <Row key={idx} gutter={8} align="middle" wrap={false}>

                            {/* ── Type selector ────────────────────────────── */}
                            <Col flex="200px">
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Assertion type…"
                                    value={displayType || undefined}
                                    onChange={val => updateType(idx, val)}
                                    options={assertionTypes.map(t => ({ value: t, label: t }))}
                                    showSearch
                                    size="small"
                                />
                            </Col>

                            {/* ── Value control ────────────────────────────── */}
                            <Col flex="auto">
                                {!displayType ? (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Select a type first
                                    </Text>
                                ) : isLoading ? (
                                    <Text type="secondary" style={{ fontSize: 12 }}>Loading…</Text>

                                ) : info?.isNumeric ? (
                                    // ── Range slider for numeric types ────────
                                    <Row gutter={6} align="middle" wrap={false}>
                                        <Col>
                                            <Text style={{ fontSize: 11, color: '#aaa' }}>
                                                {info.min}
                                            </Text>
                                        </Col>
                                        <Col flex="auto">
                                            <Slider
                                                range
                                                min={info.min}
                                                max={info.max}
                                                step={info.step}
                                                value={sliderValue ?? [info.min, info.max]}
                                                onChange={val => {
                                                    // Update local display only — no re-query yet
                                                    setSliderDisplay(prev => ({ ...prev, [idx]: val }));
                                                }}
                                                onChangeComplete={val => {
                                                    setSliderDisplay(prev => ({ ...prev, [idx]: val }));
                                                    commitRange(idx, val);
                                                }}
                                                tooltip={{ formatter: v => v?.toLocaleString() }}
                                                style={{ margin: '0 4px' }}
                                            />
                                        </Col>
                                        <Col>
                                            <Text style={{ fontSize: 11, color: '#aaa' }}>
                                                {info.max}
                                            </Text>
                                        </Col>
                                        <Col>
                                            <Tag color="blue" style={{ fontSize: 11, margin: 0, whiteSpace: 'nowrap' }}>
                                                {sliderValue?.[0]?.toLocaleString()} –{' '}
                                                {sliderValue?.[1]?.toLocaleString()}
                                            </Tag>
                                        </Col>
                                    </Row>

                                ) : (
                                    // ── Multi-select for categorical types ────
                                    <Select
                                        style={{ width: '100%' }}
                                        mode="multiple"
                                        placeholder="Select values…"
                                        value={filter.values}
                                        onChange={val => updateValues(idx, val)}
                                        options={(info?.values || []).map(v => ({ value: v, label: v }))}
                                        size="small"
                                    />
                                )}
                            </Col>

                            {/* ── Remove button ─────────────────────────────── */}
                            <Col flex="32px">
                                <Button
                                    size="small"
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => removeFilter(idx)}
                                />
                            </Col>
                        </Row>
                    );
                })}
            </Space>
        </div>
    );
};

export default AssertionFilter;
