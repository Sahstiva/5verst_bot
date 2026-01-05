import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { parse, isValid, isSaturday, isPast } from 'date-fns';
import {Gender, ParseResult, ParseVolunteers, Position, ResultsSummary, Summary, VolunteersSummary} from './interfaces.js';
import {
    SELECTOR_POSITION,
    SELECTOR_FINISHES,
    SELECTOR_ACHIEVEMENT,
    SELECTOR_FINISHTIME,
    SELECTOR_GENDER_POSITION,
    SELECTOR_VOLUNTEERS,
    SELECTOR_NAME,
    SELECTOR_RESULT_TABLE,
    SELECTOR_VOLUNTEERS_TABLE, URL_5VERST_RESULTS
} from './constants.js';


function parsePositionInGenderGroup(text: string): Position {
    const result = { position: 0, gender: Gender.Male };
    const match = text.match(/(\d+)-[а-я]+ из \d+ [а-я]+/i);

    if (match) {
        result.position = parseInt(match[1], 10); // Extract position as an integer

        // Determine gender based on the presence of specific keywords
        if (/женщин/i.test(text)) {
            result.gender = Gender.Female;
        } else if (/мужчин/i.test(text)) {
            result.gender = Gender.Male;
        }
    }

    return result;
}


const processResults = (data: string) => {
    const $ = cheerio.load(data);
    const results: ParseResult[] = [];

    $(SELECTOR_RESULT_TABLE).each((index, element) => {
        const position: number = parseInt($(element).find(SELECTOR_POSITION).text().trim(), 10);
        const nameSurname: string = $(element).find(SELECTOR_NAME).text().trim();
        let finishes: number = 0;
        if($(element).find(SELECTOR_FINISHES).length > 0) {
            const selector = $(element).find(SELECTOR_FINISHES).first().text().trim().match(/\d+/);
            finishes = parseInt(selector ? selector[0] : '', 10) || 0;
        }
        let volunteering = 0;
        if($(element).find(SELECTOR_VOLUNTEERS).length > 0) {
            const selector = $(element).find(SELECTOR_VOLUNTEERS).text().trim().match(/\d+/);
            volunteering = parseInt(selector ? selector[0] : '', 10) || 0;
        }
        const finishTime = $(element).find(SELECTOR_FINISHTIME).last().text().trim();
        let positionInGenderGroup: Position = { position: 0, gender: Gender.Male };
        if ($(element).find(SELECTOR_GENDER_POSITION).length > 0) {
            positionInGenderGroup = parsePositionInGenderGroup($(element).find(SELECTOR_GENDER_POSITION).last().text().trim());
        }
        let achievement = '';
        if ($(element).find(SELECTOR_ACHIEVEMENT).attr('title')) {
            achievement = $(element).find(SELECTOR_ACHIEVEMENT).attr('title') || '';
        }

        results.push({
            position,
            nameSurname,
            finishes: finishes,
            volunteering: volunteering,
            finishTime,
            positionInGenderGroup,
            achievement
        });
    });
    return results;
};


const volunteersSummary = (results: ParseVolunteers[]): VolunteersSummary => {
    return {
        totalVolunteers: results.length,
        jubileeVolunteering: results
            .filter(r => r.volunteeringCount % 10 === 0 && r.volunteeringCount !== 0)
            .map(({name, volunteeringCount}) => ({
                name: name,
                volunteeringCount
            })),
        firstVolunteering: results
            .filter(r => r.volunteeringCount === 1)
            .map(({name, volunteeringCount}) => ({
                name: name,
                volunteeringCount
            })),
        volunteeringList: results
            .map(r => (`${r.name} - ${r.role}`)),
    }
}
const createSummary = (results: ParseResult[], date: string): ResultsSummary => {
    return {
        date,
        totalFinishers: results.length,
        firstThreeOverall: results
            .slice(0, 3)
            .map(({nameSurname, finishTime}) => ({
                name: nameSurname,
                time: finishTime
        })),
        firstThreeMen: results
            .filter(r => r.positionInGenderGroup.gender === 'male')
            .slice(0, 3)
            .map(({nameSurname, finishTime}) => ({
                name: nameSurname,
                time: finishTime
        })),
        firstThreeWomen: results
            .filter(r => r.positionInGenderGroup.gender === 'female')
            .slice(0, 3)
            .map(({nameSurname, finishTime}) => ({
                name: nameSurname,
                time: finishTime
        })),
        jubileeFinishes: results
            .filter(r => r.finishes % 10 === 0 && r.finishes !== 0)
            .map(({nameSurname, finishes}) => ({
                name: nameSurname,
                finishes
        })),
        achievementsCount: {
            personalBest: results.filter(r => r.achievement.includes('Личный рекорд')).length,
            firstParkFinish: results.filter(r => r.achievement.includes('Первый финиш на Марьино')).length,
            first5kFinish: results.filter(r => r.achievement.includes('Первый финиш на 5 вёрст')).length,
        },
        newcomersPark: results.filter(r => r.achievement.includes('Первый финиш на Марьино')).map(r => r.nameSurname),
        newcomers5k: results.filter(r => r.achievement.includes('Первый финиш на 5 вёрст')).map(r => r.nameSurname),
        personalRecordBreakers: results.filter(r => r.achievement.includes('Личный рекорд!')).map(r => r.nameSurname),
    };
};

async function fetchHtmlContent(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error: any) {
        console.error('Error fetching the page:', error);
        return '';
    }
}

function parseAndValidateDate(dateStr: string): string {
    if(!dateStr) {
        return 'latest';
    }
    // Try to parse the date string
    const date = parse(dateStr, 'dd.MM.yyyy', new Date());
    // Check if the date is valid, is a Saturday, and is in the past
    if (isValid(date) && isSaturday(date) && isPast(date)) {
        return dateStr;
    } else {
        return 'latest';
    }
}


function parseVolunteers(data: string): ParseVolunteers[] {
    const $ = cheerio.load(data);
    const volunteers: ParseVolunteers[] = [];

    $(SELECTOR_VOLUNTEERS_TABLE).each((index, element) => {
        const name = $(element).find('td').first().find('a').text().trim();
        const volunteeringCountMatch = $(element).find('.user-stat .volunteer').text().trim().match(/\d+/) || $(element).find('.user-stat .volunteer-noruns').text().trim().match(/\d+/);
        const volunteeringCount = volunteeringCountMatch ? parseInt(volunteeringCountMatch[0], 10) : 0;
        const role = $(element).find('td').last().text().trim();
        const achievementImgSrc = $(element).find('.results_icon img').attr('src');
        const achievement = achievementImgSrc ? $(element).find('.results_icon img').attr('alt') || '' : '';

        volunteers.push({
            name,
            volunteeringCount,
            role,
            achievement
        });
    });

    return mergeVolunteerRoles(volunteers);
}

function mergeVolunteerRoles(volunteers: ParseVolunteers[]): ParseVolunteers[] {
    const mergedVolunteers: ParseVolunteers[] = [];

    volunteers.forEach(volunteer => {
        // Check if this volunteer is already in the mergedVolunteers array
        const existingVolunteerIndex = mergedVolunteers.findIndex(v => v.name === volunteer.name);

        if (existingVolunteerIndex !== -1) {
            // Volunteer already exists, merge roles
            const existingVolunteer = mergedVolunteers[existingVolunteerIndex];
            existingVolunteer.role = `${existingVolunteer.role}, ${volunteer.role}`;
            // In case roles are duplicated, ensure they are unique
            existingVolunteer.role = [...new Set(existingVolunteer.role.split(', '))].join(', ');
        } else {
            // New volunteer, add to the mergedVolunteers array
            mergedVolunteers.push(volunteer);
        }
    });

    return mergedVolunteers;
}


export const parser5verst = async (message: string):Promise<Summary|null> => {
    let date = parseAndValidateDate(message); // Get the date from the query string
    const url = `${URL_5VERST_RESULTS}/${date}/`;

    try {
        const data: string = await fetchHtmlContent(url);
        const results: ParseResult[] = processResults(data); // Assume this function processes the HTML/data from the URL and extracts results
        const volunteers: ParseVolunteers[] = parseVolunteers(data);

        return {
            summary: createSummary(results, date),
            volunteers: volunteersSummary(volunteers)
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};
