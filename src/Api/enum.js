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