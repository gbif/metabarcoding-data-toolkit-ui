import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HC_sunburst from 'highcharts/modules/sunburst';
import HC_exporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import hashCode from '../Util/hashCode';

HC_exporting(Highcharts);
HC_sunburst(Highcharts);

// Default only - the dashboard passes the ranks the dataset actually has, which may be a
// subset. Rendering a level for a rank the rows do not carry produces a chain of "Unknown".
const ALL_RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'];

/**
 * Build a Highcharts sunburst node array from the flat aggregated rows
 * returned by the explore query.
 *
 * Each row: { eventID, kingdom, phylum, class, order, family, genus, asvCount, readCount }
 *
 * The root node has id '0' and parent ''.
 * Each inner / leaf node has id = pipe-joined taxonomy path up to that rank,
 * and parent = id of the node one rank up.
 * Value at every node = cumulative asvCount of all paths passing through it.
 */
const buildSunburstData = (rows, ranks = ALL_RANKS) => {
    const nodeMap = new Map();

    nodeMap.set('0', { id: '0', parent: '', name: 'Root', value: 0 });

    for (const row of rows) {
        const asvCount = Number(row.asvCount) || 1;
        let parentId = '0';
        nodeMap.get('0').value += asvCount;

        for (let i = 0; i < ranks.length; i++) {
            const rank = ranks[i];
            const taxon = row[rank] || 'Unknown';
            // Full path ID guarantees uniqueness across homonymous taxa at different ranks
            const nodeId = ranks.slice(0, i + 1).map(r => row[r] || 'Unknown').join('|');

            if (!nodeMap.has(nodeId)) {
                nodeMap.set(nodeId, { id: nodeId, parent: parentId, name: taxon, value: 0, rank });
            }
            nodeMap.get(nodeId).value += asvCount;
            parentId = nodeId;
        }
    }

    return Array.from(nodeMap.values());
};

/**
 * Sunburst chart built from the pre-loaded parquet rows.
 *
 * Props:
 *   rows           – all aggregated taxonomy rows from the current query
 *   selectedSample – optional eventID string; when omitted, all rows are aggregated
 */
const ExploreSunburst = ({ rows, selectedSample, eventCount: eventCountProp, ranks = ALL_RANKS }) => {
    const { chartData, title, subtitle } = useMemo(() => {
        if (!rows?.length || !ranks?.length) return { chartData: null };

        if (selectedSample) {
            const eventRows = rows.filter(r => r.eventID === selectedSample);
            return {
                chartData: buildSunburstData(eventRows, ranks),
                title: selectedSample,
                subtitle: 'Taxonomic composition (ASVs)',
            };
        }

        const chartData = buildSunburstData(rows, ranks);
        const totalAsvs = chartData.find(d => d.id === '0')?.value ?? 0;
        const count = eventCountProp ?? new Set(rows.map(r => r.eventID)).size;
        return {
            chartData,
            title: `${count} event${count !== 1 ? 's' : ''}`,
            subtitle: `Combined taxonomic composition — ${totalAsvs.toLocaleString()} ASVs`,
        };
    }, [rows, selectedSample, eventCountProp, ranks]);

    if (!chartData) return null;

    const colors = Highcharts.getOptions().colors;

    // Colour phylum-level nodes distinctly (same strategy as TaxonomyChart)
    const data = chartData.map(d =>
        d.rank === 'phylum'
            ? { ...d, color: colors[Math.abs(hashCode(d.id)) % colors.length] }
            : d
    );

    const options = {
        chart: { height: 420 },
        colorAxis: {},
        title: { text: title, style: { fontSize: '13px' } },
        subtitle: { text: subtitle },
        legend: { enabled: false },
        series: [{
            type: 'sunburst',
            data,
            name: 'Root',
            turboThreshold: 0,
            allowDrillToNode: true,
            cursor: 'pointer',
            dataLabels: {
                format: '{point.name}',
                filter: { property: 'innerArcLength', operator: '>', value: 16 },
                rotationMode: 'circular'
            },
            levels: [
                {
                    level: 1,
                    levelIsConstant: false,
                    dataLabels: { filter: { property: 'outerArcLength', operator: '>', value: 64 } }
                },
                { level: 2, colorByPoint: true },
                { level: 3, colorVariation: { key: 'brightness', to: -0.5 } },
                { level: 4, colorVariation: { key: 'brightness', to: 0.5 } },
                { level: 5, colorVariation: { key: 'brightness', to: 0.5 } },
                { level: 6, colorVariation: { key: 'brightness', to: 0.5 } },
            ]
        }],
        tooltip: {
            headerFormat: '',
            pointFormat: '<b>{point.name}</b> — <b>{point.value} ASVs</b>'
        }
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ExploreSunburst;
