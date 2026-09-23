import React from 'react';
import { Collapse, Typography, theme } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import config from '../config';

const { Text, Paragraph } = Typography;

/**
 * Collapsible panel that renders the SQL queries produced by the current
 * filter state, with per-query copy buttons.
 *
 * Props:
 *   queries    – [{ label: string, sql: string }]
 *   datasetId  – UUID of the current dataset (for the dwc-dp.parquet.zip download link)
 */
const FilterSqlPreview = ({ queries, datasetId }) => {
    const { token } = theme.useToken();

    const codeStyle = {
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.5,
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusSM,
        padding: '8px 10px',
        whiteSpace: 'pre',
        overflowX: 'auto',
        margin: 0,
    };

    const intro = (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            The queries below reflect the current filter state and run against the{' '}
            <a href="https://gbif.github.io/dwc-dp/dp/" target="_blank" rel="noreferrer">Darwin Core Data Package</a>{' '}
            Parquet files via{' '}
            <a href="https://duckdb.org/" target="_blank" rel="noreferrer">DuckDB</a>.
            You can reproduce or extend these analyses locally — download the data package and run
            the same SQL in Python, R, or the DuckDB CLI.{' '}
            {datasetId && (
                <a
                    href={`${config.backend}/dataset/${datasetId}/file/dwc-dp.parquet.zip`}
                    download="dwc-dp.parquet.zip"
                >
                    <DownloadOutlined /> Download dwc-dp.parquet.zip
                </a>
            )}
        </Text>
    );

    return (
        <Collapse
            size="small"
            ghost
            style={{ marginBottom: 16 }}
            items={[{
                key: 'sql',
                label: <Text type="secondary" style={{ fontSize: 12 }}>View SQL</Text>,
                children: (
                    <>
                        {intro}
                        <Collapse
                            size="small"
                            accordion
                            defaultActiveKey={[queries[0]?.label]}
                            items={queries.map(({ label, sql }) => ({
                                key: label,
                                label: <Text style={{ fontSize: 12 }}>{label}</Text>,
                                children: (
                                    <Paragraph copyable={{ text: sql }} style={{ marginBottom: 0 }}>
                                        <pre style={codeStyle}>{sql}</pre>
                                    </Paragraph>
                                ),
                            }))}
                        />
                    </>
                ),
            }]}
        />
    );
};

export default FilterSqlPreview;
