import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Typography, Slider, InputNumber, Spin } from 'antd';
import axios from 'axios';
import config from '../config';

const { Text } = Typography;

/**
 * Two sliders for filtering nucleotide-analysis rows by read count:
 *
 *   Absolute  – minimum readCount per (ASV × event) pair
 *   Relative  – minimum readCount / totalReadCount  (shown as %)
 *
 * Props:
 *   datasetId      – current dataset UUID
 *   onFilterChange – ({ minAbsolute: int|null, minRelative: fraction|null }) => void
 *                    called only when a slider handle is released
 */
const ReadCountFilter = ({ datasetId, onFilterChange }) => {
    const [maxReadCount, setMaxReadCount] = useState(null);
    const [loading, setLoading] = useState(false);

    // Local display values – updated on every drag tick, never sent to parent
    const [absDisplay, setAbsDisplay] = useState(1);
    const [relDisplay, setRelDisplay] = useState(0); // stored as % (0–1)

    // Committed values used for Tag colour and passed to parent on release
    const [minAbsolute, setMinAbsolute] = useState(null);
    const [minRelative, setMinRelative] = useState(null);

    // Ref tracks committed values so commit handlers never close over stale state
    const committedRef = useRef({ minAbsolute: null, minRelative: null });

    useEffect(() => {
        if (!datasetId) return;
        setLoading(true);
        const sql = `SELECT MAX(CAST(readCount AS INTEGER)) AS maxRead FROM "nucleotide-analysis"`;
        axios.post(`${config.backend}/dataset/${datasetId}/explore/query`, { sql })
            .then(res => setMaxReadCount(res.data.rows[0]?.maxRead ?? 1000))
            .catch(() => setMaxReadCount(1000))
            .finally(() => setLoading(false));
    }, [datasetId]);

    // Cap the slider track at a readable range; the InputNumber allows any value up to max
    const sliderMax = maxReadCount
        ? Math.min(maxReadCount, Math.max(1000, Math.ceil(maxReadCount / 10)))
        : 1000;

    const commitAbsolute = (val) => {
        const committed = val <= 1 ? null : val;
        committedRef.current = { ...committedRef.current, minAbsolute: committed };
        setMinAbsolute(committed);
        onFilterChange({ ...committedRef.current });
    };

    const commitRelative = (pct) => {
        const committed = pct <= 0 ? null : pct / 100; // % → fraction for SQL
        committedRef.current = { ...committedRef.current, minRelative: committed };
        setMinRelative(committed);
        onFilterChange({ ...committedRef.current });
    };

    return (
        <div style={{
            background: '#fafafa',
            border: '1px solid #e8e8e8',
            borderRadius: 6,
            padding: '14px 16px',
            marginBottom: 20
        }}>
            <Text strong>Filter by read count</Text>

            {loading || !maxReadCount ? (
                <Spin size="small" style={{ marginLeft: 12 }} />
            ) : (
                <>
                    {/* ── Absolute threshold ──────────────────────────────── */}
                    <Row gutter={8} align="middle" style={{ marginTop: 10 }}>
                        <Col flex="190px">
                            <Text style={{ fontSize: 12 }}>Min. reads (absolute)</Text>
                        </Col>
                        <Col flex="auto">
                            <Slider
                                min={1}
                                max={sliderMax}
                                value={Math.min(absDisplay, sliderMax)}
                                onChange={val => { setAbsDisplay(val); }}
                                onChangeComplete={commitAbsolute}
                                tooltip={{ formatter: v => v?.toLocaleString() }}
                                style={{ margin: '0 4px' }}
                            />
                        </Col>
                        <Col>
                            <InputNumber
                                min={1}
                                max={maxReadCount}
                                value={absDisplay}
                                onChange={val => { if (val != null) setAbsDisplay(val); }}
                                onBlur={() => commitAbsolute(absDisplay)}
                                onPressEnter={() => commitAbsolute(absDisplay)}
                                size="small"
                                style={{ width: 90 }}
                                status={minAbsolute ? 'warning' : ''}
                            />
                        </Col>
                    </Row>

                    {/* ── Relative threshold ──────────────────────────────── */}
                    <Row gutter={8} align="middle" style={{ marginTop: 8 }}>
                        <Col flex="190px">
                            <Text style={{ fontSize: 12 }}>Min. relative abundance</Text>
                        </Col>
                        <Col flex="auto">
                            <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                value={relDisplay}
                                onChange={setRelDisplay}
                                onChangeComplete={commitRelative}
                                tooltip={{ formatter: v => `${v?.toFixed(2)}%` }}
                                style={{ margin: '0 4px' }}
                            />
                        </Col>
                        <Col>
                            <InputNumber
                                min={0}
                                max={100}
                                step={0.01}
                                value={relDisplay}
                                onChange={val => { if (val != null) setRelDisplay(val); }}
                                onBlur={() => commitRelative(relDisplay)}
                                onPressEnter={() => commitRelative(relDisplay)}
                                formatter={v => `${v}%`}
                                parser={v => v?.replace('%', '')}
                                size="small"
                                style={{ width: 90 }}
                                status={minRelative ? 'warning' : ''}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default ReadCountFilter;
