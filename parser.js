import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { parse, isValid, isSaturday, isPast } from 'date-fns';


function parsePositionInGenderGroup(text) {
    const result = { position: null, gender: null };
    const match = text.match(/(\d+)-[а-я]+ из \d+ [а-я]+/i);

    if (match) {
        result.position = parseInt(match[1], 10); // Extract position as an integer

        // Determine gender based on the presence of specific keywords
        if (/женщин/i.test(text)) {
            result.gender = 'female';
        } else if (/мужчин/i.test(text)) {
            result.gender = 'male';
        }
    }

    return result;
}

// Define processResults function here
const processResults = (data) => {
    const $ = cheerio.load(data);
    const results = [];

    $('#results-table_runner tbody tr').each((index, element) => {
        const position = $(element).find('td.table_gray__row_position div.table_gray__cell').text().trim();
        const nameSurname = $(element).find('td.table_gray__row_name a').text().trim();
        let finishes = 0;
        if($(element).find('td.table_gray__row_name div.user-stat div span').length > 0) {
            finishes = $(element).find('td.table_gray__row_name div.user-stat div span').first().text().trim().match(/\d+/)[0];
        }
        let volunteering = 0;
        if($(element).find('td.table_gray__row_name div.user-stat div span.volunteer').length > 0) {
            volunteering = $(element).find('td.table_gray__row_name div.user-stat div span.volunteer').text().trim().match(/\d+/)[0];
        }
        const finishTime = $(element).find('td.table_gray__row div.cell-label_time div').last().text().trim();
        let positionInGenderGroup = {};
        if ($(element).find('td.table_gray__row_name div.user-stat div.tablet-stats div').length > 0) {
            positionInGenderGroup = parsePositionInGenderGroup($(element).find('td.table_gray__row_name div.user-stat div.tablet-stats div').last().text().trim());
        }
        let achievement = '';
        if ($(element).find('td.table_gray__row div.cell-label_time div.table-achievments span[title]').attr('title')) {
            achievement = $(element).find('td.table_gray__row div.cell-label_time div.table-achievments span[title]').attr('title');
        }

        results.push({
            position,
            nameSurname,
            finishes: parseInt(finishes, 10),
            volunteering: parseInt(volunteering, 10),
            finishTime,
            positionInGenderGroup,
            achievement
        });
    });
    return results;
};


const volunteersSummary = (results) => {
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
// Define createSummary function here
const createSummary = (results, date) => {
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
            firstParkFinish: results.filter(r => r.achievement.includes('Первый финиш на Парк 850-летия Москвы')).length,
            first5kFinish: results.filter(r => r.achievement.includes('Первый финиш на 5 вёрст')).length,
        },
        newcomersPark: results.filter(r => r.achievement.includes('Первый финиш на Парк 850-летия Москвы')).map(r => r.nameSurname),
        newcomers5k: results.filter(r => r.achievement.includes('Первый финиш на 5 вёрст')).map(r => r.nameSurname),
        personalRecordBreakers: results.filter(r => r.achievement.includes('Личный рекорд!')).map(r => r.nameSurname),
    };
};

async function fetchHtmlContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching the page:', error);
    }
}

function parseAndValidateDate(dateStr) {
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

function parseVolunteers(data) {
    const $ = cheerio.load(data);
    const volunteers = [];

    $('#volunteers table.sortable tbody tr').each((index, element) => {
        const name = $(element).find('td').first().find('a').text().trim();
        const volunteeringCountMatch = $(element).find('.user-stat .volunteer').text().trim().match(/\d+/) || $(element).find('.user-stat .volunteer-noruns').text().trim().match(/\d+/);
        const volunteeringCount = volunteeringCountMatch ? parseInt(volunteeringCountMatch[0], 10) : undefined;
        const role = $(element).find('td').last().text().trim();
        const achievementImgSrc = $(element).find('.results_icon img').attr('src');
        let achievement;
        if (achievementImgSrc) {
            achievement = $(element).find('.results_icon img').attr('alt');
        }

        volunteers.push({
            name,
            volunteeringCount,
            role,
            achievement: achievement || ''
        });
    });

    return mergeVolunteerRoles(volunteers);
}

function mergeVolunteerRoles(volunteers) {
    const mergedVolunteers = [];

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


export const parser5verst = async (message) => {
    let date = parseAndValidateDate(message); // Get the date from the query string
    const url = `https://5verst.ru/park850letiyamoskvy/results/${date}/`;

    try {
        const data = await fetchHtmlContent(url);
        const results = processResults(data); // Assume this function processes the HTML/data from the URL and extracts results
        const volunteers = parseVolunteers(data);
        // Use the createSummary function defined earlier
        return {
            summary: createSummary(results, date),
            volunteers: volunteersSummary(volunteers)
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};
