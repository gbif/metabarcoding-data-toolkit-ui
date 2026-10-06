/**
 * Resolves a dataset's stored target_gene to the marker the sequence ID service supports.
 *
 * target_gene is constrained to the GBIF target_gene vocabulary, so a stored value is a concept
 * name like SSU_rRNA_16S_prokaryotic - not the short form the supported-marker list is keyed by.
 * Each marker served from /enum/supported-markers carries the concepts it covers, so the mapping
 * is data rather than duplicated here; this mirrors resolveSupportedMarker in the backend's
 * enum/supportedMarkers.js.
 *
 * The legacy short form is still accepted, so a dataset mapped before the vocabulary was wired
 * in keeps offering taxonomy assignment.
 */
export const resolveSupportedMarker = (value, supportedMarkers = []) => {
    const needle = `${value ?? ''}`.trim().toLowerCase();
    if (!needle) {
        return null;
    }
    return (supportedMarkers || []).find(m =>
        `${m?.name ?? ''}`.toLowerCase() === needle ||
        (m?.concepts || []).some(c => `${c}`.toLowerCase() === needle)
    ) || null;
};

export default { resolveSupportedMarker };
