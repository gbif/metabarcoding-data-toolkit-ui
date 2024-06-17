import axios from "axios";
import config from "../config";

export const getInstallationSettings = async () => {
    try {
        const res = await axios(`${config.backend}/installation-settings`)
        return res
    } catch (error) {
        throw error
    }
}

