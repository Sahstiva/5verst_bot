import fetch, {Headers} from "node-fetch-native";
import * as XLSX from 'xlsx';
import {writeFileSync} from 'node:fs';
import 'dotenv/config';
import {NrmsLoginResponse, NrmsResultItem, NrmsResultsResponse} from "./interfaces.js";
import {getLastSaturdayDate} from "./summary.js";
import {guessGender} from "./guessgender.js";

const username = process.env.LOGIN_5VERST;
const password = process.env.PASSWORD_5VERST;
const baseUrl = process.env.NRMS_BASE_URL;
const eventId = process.env.NRMS_EVENT_ID;

const login = async (): Promise<string|undefined> =>  {
    try {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        const raw = JSON.stringify({
            username,
            password
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        const response = await fetch(`${baseUrl}/auth/login`, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const {result} = await response.json() as NrmsLoginResponse;
        return result.token;
    } catch (error: any) {
        console.error('Error during login to NRMS', error);
        return undefined;
    }
}

const getResults = async (date = getLastSaturdayDate()): Promise<NrmsResultsResponse|undefined> => {
    try {
        const token = await login();
        if(!token) {
            throw new Error(`Token invalid`);
        }

        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('User-Agent', 'PostmanRuntime/7.37.0');
        myHeaders.append('Authorization', `Bearer ${token}`);

        const raw = JSON.stringify({
            event_id: parseInt(eventId || '', 10),
            date
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        const response = await fetch(`${baseUrl}/results/getByDateAndEventId`, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json() as NrmsResultsResponse;
    } catch (error: any) {
        console.error('Error getting results from NRMS', error);
        return undefined;
    }
}

const createXLS = (results: NrmsResultItem[]) => {
    const data = results.map(item => {
        const [firstName, lastName] = item.full_name.split(' ', 2);
        const genders = new Map([['male', 'М'], ['female', 'Ж'], ['undefined', '-']]);
        const gender = genders.get(guessGender({firstName, lastName}));
        return {
            'место в абсолюте': item.position,
            'результат': item.finish_time,
            'parkrun/5верст ID': item.athlete_id,
            'Имя целиком': item.full_name,
            'Пол': gender
        };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Probeg');
    XLSX.writeFile(workbook, '/Users/sahstiva/Documents/MyRunO/probeg030126.xlsx');
}

(async () => {
    const response = await getResults('03.01.2026');
    if (response?.result.results) {
        createXLS(response.result.results);
    }
})();
