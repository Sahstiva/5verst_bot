import {format, startOfWeek, subDays} from "date-fns";
import {Summary} from './interfaces.js';

export function formatSummary(data: Summary): string {
    if (data.summary.date === 'latest') {
        data.summary.date = getLastSaturdayDate();
    }
    return `В забеге ${data.summary.date} финишировало ${data.summary.totalFinishers} участников
    \nПервая тройка финишёров:
    \n${data.summary.firstThreeOverall.map(p => `${p.name}, ${formatTime(p.time)}`).join('\n')}
    \nСамые быстрые девочки!
    \n${data.summary.firstThreeWomen.map(p => `${p.name}, ${formatTime(p.time)}`).join('\n')}
    \nСамые быстрые мальчики!
    \n${data.summary.firstThreeMen.map(p => `${p.name}, ${formatTime(p.time)}`).join('\n')}
    \nЮбилейные финиши:
    \n${data.summary.jubileeFinishes.map(p => `${p.name}, ${p.finishes}`).join('\n')}
    \nЛичный рекорд - ${data.summary.achievementsCount.personalBest}
    \n${data.summary.personalRecordBreakers.join('\n')}
    \nПервый финиш 5 Вёрст в нашем парке - ${data.summary.achievementsCount.firstParkFinish}
    \n${data.summary.newcomersPark.join('\n')}
    \nПервый финиш 5 Вёрст - ${data.summary.achievementsCount.first5kFinish}
    \n${data.summary.newcomers5k.join('\n')}
    \nЗабег организован силами ${data.volunteers.totalVolunteers} волонтеров
    \nЮбилейные волонтерства:
    \n${data.volunteers.jubileeVolunteering.map(p => `${p.name}, ${p.volunteeringCount}`).join('\n')}
    \nПервое волонтерство:
    \n${data.volunteers.firstVolunteering.map(p => `${p.name}`).join('\n')}
    \nОбщий список волонтеров:
    \n${data.volunteers.volunteeringList.join('\n')}`;
}

function getLastSaturdayDate(): string {
    const now = new Date();
    const lastSaturday = startOfWeek(now, { weekStartsOn: 0 });
    return format(subDays(lastSaturday, 1), 'dd.MM.yyyy');
}

function formatTime(timeStr: string): string {
    return timeStr.replace(/^00:/,'');
}
