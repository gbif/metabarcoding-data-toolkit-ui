import axios from "axios";
import config from "../config";

export const getDwcTerms = async () => {
    try {
        const res = await axios(`${config.backend}/terms/dwc`)
        return res
    } catch (error) {
        throw error
    }
}

export const getRequiredTerms = async () => {
    try {
        const res = await axios(`${config.backend}/terms/required`)
        return res
    } catch (error) {
        throw error
    }
}

export const getDefault = async () => {
    try {
        const res = await axios(`${config.backend}/terms/defaultvalue`)
        return res
    } catch (error) {
        throw error
    }
}