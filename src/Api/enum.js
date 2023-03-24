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