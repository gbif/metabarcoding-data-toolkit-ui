import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Select } from 'antd';
import axios from 'axios';
import config from '../config';

const { Text } = Typography;

const MONTH_OPTIONS = [
    { label: 'January',   value: 1  },
    { label: 'February',  value: 2  },
    { label: 'March',     value: 3  },
    { label: 'April',     value: 4  },
    { label: 'May',       value: 5  },
    { label: 'June',      value: 6  },
    { label: 'July',      value: 7  },
    { label: 'August',    value: 8  },
    { label: 'September', value: 9  },
    { label: 'October',   value: 10 },
    { label: 'November',  value: 11 },
    { label: 'December',  value: 12 },
];

/**
 * Year and month selectors derived from event.eventDate.
 *
 * Props:
 *   datasetId      – current dataset UUID
 *   onFilterChange – ({ years: number[], months: number[] }) => void
 *                    empty arrays mean "no filter" (show all)
 */
const EventDateFilter = ({ datasetId, onFilterChange }) => {
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);

    useEffect(() => {
        if (!datasetId) return;
        setSelectedYears([]);
        setSelectedMonths([]);

        const sql = `
SELECT DISTINCT
  EXTRACT(YEAR FROM TRY_CAST(eventDate AS DATE))::INTEGER AS year
FROM "event"
WHERE eventDate IS NOT NULL
ORDER BY year`.trim();

        axios.post(`${config.backend}/dataset/${datasetId}/explore/query`, { sql })
            .then(res => {
                const years = res.data.rows
                    .map(r => r.year)
                    .filter(y => y != null);
                setAvailableYears(years);
            })
            .catch(console.log);
    }, [datasetId]);

    const handleYearChange = (years) => {
        setSelectedYears(years);
        onFilterChange({ years, months: selectedMonths });
    };

    const handleMonthChange = (months) => {
        setSelectedMonths(months);
        onFilterChange({ years: selectedYears, months });
    };

    return (
        <div style={{
            background: '#fafafa',
            border: '1px solid #e8e8e8',
            borderRadius: 6,
            padding: '14px 16px',
            marginBottom: 20,
        }}>
            <Text strong>Filter by date</Text>
            <Row gutter={16} style={{ marginTop: 10 }}>
                <Col xs={24} sm={12}>
                    <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Year</Text>
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="All years"
                        style={{ width: '100%' }}
                        value={selectedYears}
                        onChange={handleYearChange}
                        options={availableYears.map(y => ({ label: String(y), value: y }))}
                    />
                </Col>
                <Col xs={24} sm={12}>
                    <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Month</Text>
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="All months"
                        style={{ width: '100%' }}
                        value={selectedMonths}
                        onChange={handleMonthChange}
                        options={MONTH_OPTIONS}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default EventDateFilter;
