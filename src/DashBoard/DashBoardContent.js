import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Typography, Alert, Divider, Tabs } from 'antd';
import axios from 'axios';
import config from '../config';
import withContext from '../Components/hoc/withContext';
import TaxonomyBarplot from '../Review/TaxonomyBarplot';
import LeafletMap from '../Review/Map';
import AssertionFilter from './AssertionFilter';
import ExploreSunburst from './ExploreSunburst';

const { Title, Text } = Typography;

const RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'];

// ─── Data helpers ─────────────────────────────────────────────────────────────

const prepareTaxonomyData = (rows) => {
    const taxonomyDataMap = Object.fromEntries(RANKS.map(r => [r, {}]));
    const taxonomyBySampleDataMap = {};

    for (const row of rows) {
        const eventID = row.eventID;
        const asvCount = Number(row.asvCount) || 0;
        const readCount = Number(row.readCount) || 0;

        if (!taxonomyBySampleDataMap[eventID]) {
            taxonomyBySampleDataMap[eventID] = Object.fromEntries(RANKS.map(r => [r, {}]));
        }

        for (const rank of RANKS) {
            const taxon = row[rank] || 'Unknown';

            if (!taxonomyDataMap[rank][taxon]) {
                taxonomyDataMap[rank][taxon] = { value: 0, readCount: 0 };
            }
            taxonomyDataMap[rank][taxon].value += asvCount;
            taxonomyDataMap[rank][taxon].readCount += readCount;

            if (!taxonomyBySampleDataMap[eventID][rank][taxon]) {
                taxonomyBySampleDataMap[eventID][rank][taxon] = { value: 0, readCount: 0 };
            }
            taxonomyBySampleDataMap[eventID][rank][taxon].value += asvCount;
            taxonomyBySampleDataMap[eventID][rank][taxon].readCount += readCount;
        }
    }

    return { taxonomyDataMap, taxonomyBySampleDataMap };
};

const buildGeoJson = (rows) => ({
    type: 'FeatureCollection',
    metadata: { errors: [] },
    features: rows.map(r => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [r.decimalLongitude, r.decimalLatitude]
        },
        properties: { id: r.eventID }
    }))
});

/**
 * Build the aggregated taxonomy SQL query.
 * Numeric filters use TRY_CAST … BETWEEN; categorical filters use IN (…).
 * Each active filter adds an EXISTS subquery so events must satisfy ALL conditions.
 */
const buildTaxonomySql = (filters) => {
    const activeFilters = filters.filter(f =>
        f.assertionType && (f.isNumeric ? f.range !== null : f.values.length > 0)
    );

    const whereClauses = activeFilters.map((f, i) => {
        const escapedType = f.assertionType.replace(/'/g, "''");

        const valueClause = f.isNumeric
            ? `TRY_CAST(ea${i}.assertionValue AS DOUBLE) BETWEEN ${f.range[0]} AND ${f.range[1]}`
            : `ea${i}.assertionValue IN (${f.values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')})`;

        return (
            `EXISTS (\n` +
            `  SELECT 1 FROM "event-assertion" ea${i}\n` +
            `  WHERE ea${i}.eventID = na.eventID\n` +
            `    AND ea${i}.assertionType = '${escapedType}'\n` +
            `    AND ${valueClause}\n` +
            `)`
        );
    });

    const where = whereClauses.length > 0
        ? `WHERE ${whereClauses.join('\nAND ')}`
        : '';

    return `
SELECT
  na.eventID,
  COALESCE(i.kingdom,        'Unknown') AS kingdom,
  COALESCE(i.phylum,         'Unknown') AS phylum,
  COALESCE(i."class",        'Unknown') AS "class",
  COALESCE(i."order",        'Unknown') AS "order",
  COALESCE(i.family,         'Unknown') AS family,
  COALESCE(i.genus,          'Unknown') AS genus,
  COUNT(*)                              AS asvCount,
  SUM(CAST(na.readCount AS INTEGER))    AS readCount
FROM "nucleotide-analysis" na
JOIN "identification" i ON na.nucleotideSequenceID = i.nucleotideSequenceID
${where}
GROUP BY
  na.eventID, i.kingdom, i.phylum, i."class", i."order", i.family, i.genus
ORDER BY na.eventID
`.trim();
};

// ─── Component ────────────────────────────────────────────────────────────────

const DashBoardContent = ({ dataset }) => {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [assertionTypes, setAssertionTypes] = useState([]);
    const [filters, setFilters] = useState([]);
    const [taxonomyDataMap, setTaxonomyDataMap] = useState(null);
    const [taxonomyBySampleDataMap, setTaxonomyBySampleDataMap] = useState(null);
    const [selectedSample, setSelectedSample] = useState(null);
    const [error, setError] = useState(null);
    const [eventCount, setEventCount] = useState(null);

    // Map state
    const [allGeoJson, setAllGeoJson] = useState(null);
    const [filteredEventIds, setFilteredEventIds] = useState(null); // null = show all

    const datasetId = dataset?.id;

    // ── Derive map filter function ────────────────────────────────────────────
    // Memoised so its reference only changes when the matched-event set changes,
    // preventing the map from re-filtering on unrelated renders.
    const geoJsonFilter = useMemo(() => {
        if (!filteredEventIds) return null;
        return (feature) => filteredEventIds.has(feature.properties.id);
    }, [filteredEventIds]);

    // ── Fetch all event coordinates (once per dataset) ────────────────────────
    const loadGeoJson = useCallback(async () => {
        if (!datasetId) return;
        try {
            const sql =
                `SELECT eventID, decimalLatitude, decimalLongitude\n` +
                `FROM "event"\n` +
                `WHERE decimalLatitude IS NOT NULL\n` +
                `  AND decimalLongitude IS NOT NULL`;
            const res = await axios.post(
                `${config.backend}/dataset/${datasetId}/explore/query`,
                { sql }
            );
            setAllGeoJson(buildGeoJson(res.data.rows));
        } catch (e) {
            console.log(e);
        }
    }, [datasetId]);

    // ── Fetch distinct assertion types for the filter dropdowns ──────────────
    const loadAssertionTypes = useCallback(async () => {
        if (!datasetId) return;
        try {
            const sql =
                `SELECT DISTINCT assertionType\n` +
                `FROM "event-assertion"\n` +
                `WHERE assertionType IS NOT NULL\n` +
                `ORDER BY assertionType`;
            const res = await axios.post(
                `${config.backend}/dataset/${datasetId}/explore/query`,
                { sql }
            );
            setAssertionTypes(res.data.rows.map(r => r.assertionType));
        } catch (e) {
            console.log(e);
        }
    }, [datasetId]);

    // ── Run the aggregated taxonomy query ────────────────────────────────────
    const runTaxonomyQuery = useCallback(async (activeFilters) => {
        if (!datasetId) return;
        setLoading(true);
        setError(null);
        setSelectedSample(null);
        try {
            const sql = buildTaxonomySql(activeFilters);
            const res = await axios.post(
                `${config.backend}/dataset/${datasetId}/explore/query`,
                { sql, maxRows: 200000 }
            );
            const data = res.data.rows;

            if (data.length === 0) {
                setRows([]);
                setTaxonomyDataMap(null);
                setTaxonomyBySampleDataMap(null);
                setEventCount(0);
                setFilteredEventIds(new Set()); // empty — nothing matches
            } else {
                const { taxonomyDataMap, taxonomyBySampleDataMap } = prepareTaxonomyData(data);
                setRows(data);
                setTaxonomyDataMap(taxonomyDataMap);
                setTaxonomyBySampleDataMap(taxonomyBySampleDataMap);

                const matchedIds = new Set(data.map(r => r.eventID));
                setEventCount(matchedIds.size);

                // Only restrict the map when actual filters are active
                const hasActiveFilter = activeFilters.some(f =>
                    f.assertionType && (f.isNumeric ? f.range !== null : f.values.length > 0)
                );
                setFilteredEventIds(hasActiveFilter ? matchedIds : null);
            }
        } catch (e) {
            console.log(e);
            setError(e?.response?.data?.error || 'Failed to load taxonomy data');
        } finally {
            setLoading(false);
        }
    }, [datasetId]);

    // ── Bootstrap on dataset change ──────────────────────────────────────────
    useEffect(() => {
        if (!datasetId) return;
        loadGeoJson();
        loadAssertionTypes();
        runTaxonomyQuery([]);
    }, [datasetId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handle filter changes ────────────────────────────────────────────────
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        runTaxonomyQuery(newFilters);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div>
            <AssertionFilter
                datasetId={datasetId}
                assertionTypes={assertionTypes}
                filters={filters}
                onFiltersChange={handleFiltersChange}
            />

            {error && (
                <Alert type="error" message={error} style={{ marginBottom: 16 }} />
            )}

            {/* ── Split view: barplot (left) + map (right) ──────────────────── */}
            {(taxonomyDataMap || loading) && (
                <>
                    {eventCount !== null && !loading && (
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                            {eventCount} event{eventCount !== 1 ? 's' : ''} match the current filters
                        </Text>
                    )}
                    <Row gutter={16} align="top">
                        <Col xs={24} xl={14}>
                            <Tabs
                                size="small"
                                items={[
                                    {
                                        key: 'barplot',
                                        label: 'Per event',
                                        children: (
                                            <TaxonomyBarplot
                                                taxonomyDataMap={taxonomyDataMap}
                                                taxonomyBySampleDataMap={taxonomyBySampleDataMap}
                                                taxonomyLoading={loading}
                                                onSampleClick={setSelectedSample}
                                                selectedSample={selectedSample}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'composition',
                                        label: 'Composition',
                                        children: (
                                            <ExploreSunburst rows={rows} />
                                        ),
                                    },
                                ]}
                            />
                        </Col>
                        <Col xs={24} xl={10}>
                            {allGeoJson && (
                                <LeafletMap
                                    geoJson={allGeoJson}
                                    geoJsonFilter={geoJsonFilter}
                                    onFeatureClick={setSelectedSample}
                                    selectedSample={selectedSample}
                                />
                            )}
                        </Col>
                    </Row>
                </>
            )}

            {!taxonomyDataMap && !loading && !error && (
                <Alert
                    type="info"
                    message="No data matches the current filters"
                    style={{ marginTop: 8 }}
                />
            )}

            {/* ── Sunburst for selected event ───────────────────────────────── */}
            {selectedSample && rows.length > 0 && (
                <>
                    <Divider />
                    <Row gutter={24}>
                        <Col xs={24} md={10}>
                            <ExploreSunburst
                                rows={rows}
                                selectedSample={selectedSample}
                            />
                        </Col>
                        <Col xs={24} md={14} style={{ paddingTop: 8 }}>
                            <Title level={5}>{selectedSample}</Title>
                            <Text type="secondary">
                                Click a segment in the sunburst to drill down.
                                Click another bar or map marker to change the selected event.
                            </Text>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

const mapContextToProps = ({ dataset }) => ({ dataset });
export default withContext(mapContextToProps)(DashBoardContent);
