import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Row, Col, Typography, Alert, Divider, Tabs } from 'antd';
import axios from 'axios';
import config from '../config';
import withContext from '../Components/hoc/withContext';
import TaxonomyBarplot from '../Review/TaxonomyBarplot';
import LeafletMap from '../Review/Map';
import AssertionFilter from './AssertionFilter';
import ReadCountFilter from './ReadCountFilter';
import EventDateFilter from './EventDateFilter';
import FilterSqlPreview from './FilterSqlPreview';
import ExploreSunburst from './ExploreSunburst';

const { Title, Text } = Typography;

const RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'];

// ─── Data helpers ─────────────────────────────────────────────────────────────

const buildTaxonomyDataMap = (aggRows) => {
    const map = Object.fromEntries(RANKS.map(r => [r, {}]));
    for (const row of aggRows) {
        const asvCount = Number(row.asvCount) || 0;
        const readCount = Number(row.readCount) || 0;
        for (const rank of RANKS) {
            const taxon = row[rank] || 'Unknown';
            if (!map[rank][taxon]) map[rank][taxon] = { value: 0, readCount: 0 };
            map[rank][taxon].value += asvCount;
            map[rank][taxon].readCount += readCount;
        }
    }
    return map;
};

const buildTaxonomyBySampleMap = (perEventRows) => {
    const map = {};
    for (const row of perEventRows) {
        const { eventID } = row;
        const asvCount = Number(row.asvCount) || 0;
        const readCount = Number(row.readCount) || 0;
        if (!map[eventID]) map[eventID] = Object.fromEntries(RANKS.map(r => [r, {}]));
        for (const rank of RANKS) {
            const taxon = row[rank] || 'Unknown';
            if (!map[eventID][rank][taxon]) map[eventID][rank][taxon] = { value: 0, readCount: 0 };
            map[eventID][rank][taxon].value += asvCount;
            map[eventID][rank][taxon].readCount += readCount;
        }
    }
    return map;
};

const buildGeoJson = (rows) => ({
    type: 'FeatureCollection',
    metadata: { errors: [] },
    features: rows.map(r => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [r.decimalLongitude, r.decimalLatitude] },
        properties: { id: r.eventID }
    }))
});

// ─── SQL builders ─────────────────────────────────────────────────────────────

/**
 * Shared WHERE clause for all taxonomy queries.
 *
 * assertionFilters  – array of { assertionType, isNumeric, values, range }
 * readCountFilter   – { minAbsolute: int|null, minRelative: fraction|null }
 *
 * Assertion filters become correlated EXISTS subqueries (event-level).
 * Read count filters become direct conditions on nucleotide-analysis rows (ASV-level).
 */
const buildWhereClause = (assertionFilters, readCountFilter = {}, dateFilter = {}) => {
    const clauses = [];

    // ── Assertion (event-level) filters ───────────────────────────────────────
    const activeAssertions = assertionFilters.filter(f =>
        f.assertionType && (f.isNumeric ? f.range !== null : f.values.length > 0)
    );
    activeAssertions.forEach((f, i) => {
        const escapedType = f.assertionType.replace(/'/g, "''");
        const valueClause = f.isNumeric
            ? `TRY_CAST(ea${i}.assertionValue AS DOUBLE) BETWEEN ${f.range[0]} AND ${f.range[1]}`
            : `ea${i}.assertionValue IN (${f.values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')})`;
        clauses.push(
            `EXISTS (\n  SELECT 1 FROM "event-assertion" ea${i}\n` +
            `  WHERE ea${i}.eventID = na.eventID\n` +
            `    AND ea${i}.assertionType = '${escapedType}'\n` +
            `    AND ${valueClause}\n)`
        );
    });

    // ── Date (event-level) filters ────────────────────────────────────────────
    if (dateFilter.years?.length > 0 || dateFilter.months?.length > 0) {
        const dateClauses = [];
        if (dateFilter.years?.length > 0) {
            dateClauses.push(
                `EXTRACT(YEAR FROM TRY_CAST(ev.eventDate AS DATE))::INTEGER IN (${dateFilter.years.join(', ')})`
            );
        }
        if (dateFilter.months?.length > 0) {
            dateClauses.push(
                `EXTRACT(MONTH FROM TRY_CAST(ev.eventDate AS DATE))::INTEGER IN (${dateFilter.months.join(', ')})`
            );
        }
        clauses.push(
            `EXISTS (\n  SELECT 1 FROM "event" ev\n` +
            `  WHERE ev.eventID = na.eventID\n` +
            `    AND ${dateClauses.join('\n    AND ')}\n)`
        );
    }

    // ── Read count (ASV-level) filters ────────────────────────────────────────
    if (readCountFilter.minAbsolute != null) {
        clauses.push(`CAST(na.readCount AS INTEGER) >= ${readCountFilter.minAbsolute}`);
    }
    if (readCountFilter.minRelative != null) {
        clauses.push(
            `CAST(na.readCount AS DOUBLE) / NULLIF(CAST(na.totalReadCount AS DOUBLE), 0)` +
            ` >= ${readCountFilter.minRelative}`
        );
    }

    return clauses.length > 0 ? `WHERE ${clauses.join('\nAND ')}` : '';
};

const buildAggregateSql = (assertionFilters, readCountFilter, dateFilter) => {
    const where = buildWhereClause(assertionFilters, readCountFilter, dateFilter);
    return `
SELECT
  COALESCE(i.kingdom, 'Unknown') AS kingdom,
  COALESCE(i.phylum,  'Unknown') AS phylum,
  COALESCE(i."class", 'Unknown') AS "class",
  COALESCE(i."order", 'Unknown') AS "order",
  COALESCE(i.family,  'Unknown') AS family,
  COALESCE(i.genus,   'Unknown') AS genus,
  COUNT(DISTINCT na.nucleotideSequenceID) AS asvCount,
  SUM(CAST(na.readCount AS INTEGER))      AS readCount
FROM "nucleotide-analysis" na
JOIN "identification" i ON na.nucleotideSequenceID = i.nucleotideSequenceID
${where}
GROUP BY i.kingdom, i.phylum, i."class", i."order", i.family, i.genus
ORDER BY asvCount DESC`.trim();
};

const buildEventIdsSql = (assertionFilters, readCountFilter, dateFilter) => {
    const where = buildWhereClause(assertionFilters, readCountFilter, dateFilter);
    return `
SELECT DISTINCT na.eventID
FROM "nucleotide-analysis" na
${where}`.trim();
};

const BARPLOT_EVENT_LIMIT = 200;

const buildPerEventSql = (assertionFilters, readCountFilter, dateFilter) => {
    const where = buildWhereClause(assertionFilters, readCountFilter, dateFilter);
    return `
WITH top_events AS (
  SELECT na.eventID
  FROM "nucleotide-analysis" na
  ${where}
  GROUP BY na.eventID
  ORDER BY COUNT(*) DESC
  LIMIT ${BARPLOT_EVENT_LIMIT}
)
SELECT
  na.eventID,
  COALESCE(i.kingdom, 'Unknown') AS kingdom,
  COALESCE(i.phylum,  'Unknown') AS phylum,
  COALESCE(i."class", 'Unknown') AS "class",
  COALESCE(i."order", 'Unknown') AS "order",
  COALESCE(i.family,  'Unknown') AS family,
  COALESCE(i.genus,   'Unknown') AS genus,
  COUNT(*)                               AS asvCount,
  SUM(CAST(na.readCount AS INTEGER))     AS readCount
FROM "nucleotide-analysis" na
JOIN "identification" i ON na.nucleotideSequenceID = i.nucleotideSequenceID
JOIN top_events te ON na.eventID = te.eventID
${where}
GROUP BY na.eventID, i.kingdom, i.phylum, i."class", i."order", i.family, i.genus
ORDER BY na.eventID`.trim();
};

const EMPTY_RC_FILTER = { minAbsolute: null, minRelative: null };
const EMPTY_DATE_FILTER = { years: [], months: [] };

const hasActiveReadCountFilter = (rcf) =>
    rcf.minAbsolute != null || rcf.minRelative != null;

const hasActiveDateFilter = (df) =>
    df.years?.length > 0 || df.months?.length > 0;

// ─── Component ────────────────────────────────────────────────────────────────

const DashBoardContent = ({ dataset }) => {
    const [loading, setLoading] = useState(false);
    const [aggRows, setAggRows] = useState([]);
    const [perEventRows, setPerEventRows] = useState([]);
    const [availableResources, setAvailableResources] = useState(null); // null = not yet loaded
    const [assertionTypes, setAssertionTypes] = useState([]);
    const [filters, setFilters] = useState([]);
    const [readCountFilter, setReadCountFilter] = useState(EMPTY_RC_FILTER);
    const [dateFilter, setDateFilter] = useState(EMPTY_DATE_FILTER);
    const [taxonomyDataMap, setTaxonomyDataMap] = useState(null);
    const [taxonomyBySampleDataMap, setTaxonomyBySampleDataMap] = useState(null);
    const [selectedSample, setSelectedSample] = useState(null);
    const [sampleRows, setSampleRows] = useState([]);
    const [error, setError] = useState(null);
    const [eventCount, setEventCount] = useState(null);

    // Map state
    const [allGeoJson, setAllGeoJson] = useState(null);
    const [filteredEventIds, setFilteredEventIds] = useState(null);

    const datasetId = dataset?.id;
    const hasDataPackage = dataset?.filesAvailable?.some(f => f.fileName === 'dwc-dp.parquet.zip') ?? false;

    // Refs so async effects always read the latest values without becoming deps
    const perEventRowsRef = useRef([]);
    useEffect(() => { perEventRowsRef.current = perEventRows; }, [perEventRows]);

    const readCountFilterRef = useRef(EMPTY_RC_FILTER);
    useEffect(() => { readCountFilterRef.current = readCountFilter; }, [readCountFilter]);

    // ── Derive map filter function ────────────────────────────────────────────
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

    // ── Fetch which parquet resources exist for this dataset ─────────────────
    const loadAvailableResources = useCallback(async () => {
        if (!datasetId) return new Set();
        try {
            const res = await axios.get(
                `${config.backend}/dataset/${datasetId}/explore/resources`
            );
            const resources = new Set(res.data.resources);
            setAvailableResources(resources);
            return resources;
        } catch (e) {
            console.log(e);
            setAvailableResources(new Set());
            return new Set();
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

    // ── Run the three taxonomy queries in parallel ────────────────────────────
    const runTaxonomyQuery = useCallback(async (
        assertionFilters,
        rcFilter = EMPTY_RC_FILTER,
        dfFilter = EMPTY_DATE_FILTER,
    ) => {
        if (!datasetId) return;
        setLoading(true);
        setError(null);
        setSelectedSample(null);
        try {
            const post = (sql, opts = {}) =>
                axios.post(`${config.backend}/dataset/${datasetId}/explore/query`, { sql, ...opts });

            const [aggRes, eventIdsRes, perEventRes] = await Promise.all([
                post(buildAggregateSql(assertionFilters, rcFilter, dfFilter)),
                post(buildEventIdsSql(assertionFilters, rcFilter, dfFilter)),
                post(buildPerEventSql(assertionFilters, rcFilter, dfFilter), { maxRows: 50000 }),
            ]);

            const aggData = aggRes.data.rows;
            const eventIds = eventIdsRes.data.rows.map(r => r.eventID);
            const perEventData = perEventRes.data.rows;

            if (aggData.length === 0) {
                setTaxonomyDataMap(null);
                setTaxonomyBySampleDataMap(null);
                setAggRows([]);
                setPerEventRows([]);
                setEventCount(0);
                setFilteredEventIds(new Set());
            } else {
                setTaxonomyDataMap(buildTaxonomyDataMap(aggData));
                setTaxonomyBySampleDataMap(buildTaxonomyBySampleMap(perEventData));
                setAggRows(aggData);
                setPerEventRows(perEventData);

                const matchedIds = new Set(eventIds);
                setEventCount(matchedIds.size);

                const hasActiveFilter =
                    assertionFilters.some(f =>
                        f.assertionType && (f.isNumeric ? f.range !== null : f.values.length > 0)
                    ) || hasActiveReadCountFilter(rcFilter) || hasActiveDateFilter(dfFilter);

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
        if (!datasetId || !hasDataPackage) return;
        setReadCountFilter(EMPTY_RC_FILTER);
        setDateFilter(EMPTY_DATE_FILTER);
        setFilters([]);
        setAvailableResources(null);
        loadAvailableResources().then(resources => {
            if (resources.has('event-assertion')) loadAssertionTypes();
        });
        loadGeoJson();
        runTaxonomyQuery([], EMPTY_RC_FILTER, EMPTY_DATE_FILTER);
    }, [datasetId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handle filter changes ────────────────────────────────────────────────
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        runTaxonomyQuery(newFilters, readCountFilter, dateFilter);
    };

    const handleReadCountFilterChange = (newRcFilter) => {
        setReadCountFilter(newRcFilter);
        runTaxonomyQuery(filters, newRcFilter, dateFilter);
    };

    const handleDateFilterChange = (newDfFilter) => {
        setDateFilter(newDfFilter);
        runTaxonomyQuery(filters, readCountFilter, newDfFilter);
    };

    const previewSql = useMemo(() => [
        { label: 'Aggregated taxonomy',                sql: buildAggregateSql(filters, readCountFilter, dateFilter) },
        { label: 'Matched event IDs',                  sql: buildEventIdsSql(filters, readCountFilter, dateFilter) },
        { label: `Per-event taxonomy (top ${BARPLOT_EVENT_LIMIT})`, sql: buildPerEventSql(filters, readCountFilter, dateFilter) },
    ], [filters, readCountFilter, dateFilter]);

    // ── Load taxonomy for the selected event ─────────────────────────────────
    useEffect(() => {
        if (!selectedSample || !datasetId) {
            setSampleRows([]);
            return;
        }

        // Cache hit: event is already in the top-N barplot data
        const cached = perEventRowsRef.current.filter(r => r.eventID === selectedSample);
        if (cached.length > 0) {
            setSampleRows(cached);
            return;
        }

        // On-demand fetch for events outside the top N (e.g. clicked on map)
        let cancelled = false;
        const escaped = selectedSample.replace(/'/g, "''");
        const rcf = readCountFilterRef.current;

        const rcClauses = [];
        if (rcf.minAbsolute != null)
            rcClauses.push(`CAST(na.readCount AS INTEGER) >= ${rcf.minAbsolute}`);
        if (rcf.minRelative != null)
            rcClauses.push(
                `CAST(na.readCount AS DOUBLE) / NULLIF(CAST(na.totalReadCount AS DOUBLE), 0)` +
                ` >= ${rcf.minRelative}`
            );
        const rcWhere = rcClauses.length > 0 ? `\n  AND ${rcClauses.join('\n  AND ')}` : '';

        const sql = `
SELECT
  na.eventID,
  COALESCE(i.kingdom, 'Unknown') AS kingdom,
  COALESCE(i.phylum,  'Unknown') AS phylum,
  COALESCE(i."class", 'Unknown') AS "class",
  COALESCE(i."order", 'Unknown') AS "order",
  COALESCE(i.family,  'Unknown') AS family,
  COALESCE(i.genus,   'Unknown') AS genus,
  COUNT(*)                               AS asvCount,
  SUM(CAST(na.readCount AS INTEGER))     AS readCount
FROM "nucleotide-analysis" na
JOIN "identification" i ON na.nucleotideSequenceID = i.nucleotideSequenceID
WHERE na.eventID = '${escaped}'${rcWhere}
GROUP BY na.eventID, i.kingdom, i.phylum, i."class", i."order", i.family, i.genus`.trim();

        axios.post(`${config.backend}/dataset/${datasetId}/explore/query`, { sql })
            .then(res => { if (!cancelled) setSampleRows(res.data.rows); })
            .catch(() => { if (!cancelled) setSampleRows([]); });

        return () => { cancelled = true; };
    }, [selectedSample, datasetId]);

    // ─────────────────────────────────────────────────────────────────────────
    if (!hasDataPackage) {
        return (
            <Alert
                type="info"
                message="No Darwin Core Data Package available"
                description="This dataset does not yet have a generated data package (dwc-dp.parquet.zip). Complete the processing workflow first to enable data exploration."
                style={{ marginTop: 16 }}
            />
        );
    }

    return (
        <div>
            {availableResources?.has('event-assertion') && (
                <AssertionFilter
                    datasetId={datasetId}
                    assertionTypes={assertionTypes}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />
            )}
            <ReadCountFilter
                key={datasetId}
                datasetId={datasetId}
                onFilterChange={handleReadCountFilterChange}
            />
            <EventDateFilter
                key={`date-${datasetId}`}
                datasetId={datasetId}
                onFilterChange={handleDateFilterChange}
            />

            <FilterSqlPreview queries={previewSql} datasetId={datasetId} />

            {error && (
                <Alert type="error" message={error} style={{ marginBottom: 16 }} />
            )}

            {/* ── Split view: barplot (left) + map (right) ──────────────────── */}
            {(taxonomyDataMap || loading) && (
                <>
                    {eventCount !== null && !loading && (
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                            {eventCount} event{eventCount !== 1 ? 's' : ''} match the current filters
                            {eventCount > BARPLOT_EVENT_LIMIT && (
                                <Text type="secondary">
                                    {' '}— barplot shows top {BARPLOT_EVENT_LIMIT} by ASV count
                                </Text>
                            )}
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
                                            <ExploreSunburst rows={aggRows} eventCount={eventCount} />
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
            {selectedSample && sampleRows.length > 0 && (
                <>
                    <Divider />
                    <Row gutter={24}>
                        <Col xs={24} md={10}>
                            <ExploreSunburst
                                rows={sampleRows}
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
