import { fetchUtils } from "react-admin";
import {WEBTOKEN} from "../_constants/index"
export const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" });
    }
    const token = localStorage.getItem(WEBTOKEN);

    if (token) {
        const parsedToken = JSON.parse(token);
        options.headers.set("Authorization", `Bearer ${parsedToken.access}`);
    }
    return fetchUtils.fetchJson(url, options);
};