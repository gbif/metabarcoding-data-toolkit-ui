import axios from "axios";
import config from "../config";

export const getLicense = async () => {
    try {
        const res = await axios(`${config.backend}/enum/license`)
        return res
    } catch (error) {
        throw error
    }
}

export const getFormat = async () => {
    try {
        const res = await axios(`${config.backend}/enum/format`)
        return res
    } catch (error) {
        throw error
    }
}

// The GBIF target_gene vocabulary, served through the backend so it can be cached and so there
// is something to fall back to when api.gbif.org is unreachable. Fetched when the mapping step
// renders rather than with the other enums at boot - filling the backend cache takes seconds.
export const getTargetGeneVocabulary = async () => {
    try {
        const res = await axios(`${config.backend}/enum/target-gene`)
        return res
    } catch (error) {
        throw error
    }
}

export const getSupportedMarkers = async () => {
    try {
        const res = await axios(`${config.backend}/enum/supported-markers`)
        return res
    } catch (error) {
        throw error
    }
}


export const getAgentRoles = async () => {
    try {
        const res = await axios(`${config.backend}/enum/agent-roles`)
        return res
    } catch (error) {
        throw error
    }
}

export const getNetworks = async () => {
    try {
        const res = await axios(`${config.backend}/enum/networks`)
        return res
    } catch (error) {
        throw error
    }
}

export const getFileTypes = async () => {
    try {
        const res = await axios(`${config.backend}/enum/file-types`)
        return res
    } catch (error) {
        throw error
    }
}

export const getFileNameSynonyms = async () => {
    try {
        const res = await axios(`${config.backend}/file-name-synonyms`)
        return res
    } catch (error) {
        throw error
    }
}

export const getValidFileExtensions = async () => {
    try {
        const res = await axios(`${config.backend}/valid-file-extensions`)
        return res
    } catch (error) {
        throw error
    }
}