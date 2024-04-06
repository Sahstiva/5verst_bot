import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { format, subDays, startOfWeek } from 'date-fns';
import { parser5verst }  from './parser.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(token);


bot.start((ctx) => ctx.reply('Welcome to the 5 Verst Summary bot! Please send a date in DD.MM.YYYY format or \"latest\" to get a summary.'));
bot.help((ctx) => ctx.reply('Send a date in DD.MM.YYYY format to receive a summary. In case of wrong date latest results will be processed'));

bot.on(message('text'), async (ctx) => {
    const text = ctx.message.text.trim();

    try {
        const data = await parser5verst(text);
        const summary = formatSummary(data);

        ctx.reply(summary);
    } catch (error) {
        console.error('Failed to fetch summary:', error);
        ctx.reply('Sorry, there was an error fetching the summary. Please try again later.');
    }
});

function formatSummary(data) {
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

function getLastSaturdayDate() {
    const now = new Date();
    const lastSaturday = startOfWeek(now, { weekStartsOn: 0 });
    return format(subDays(lastSaturday, 1), 'dd.MM.yyyy');
}

function formatTime(timeStr) {
    return timeStr.replace(/^00:/,'');
}

export const handler = async (event) => {
    console.log('Handle', event);
    if (event) {
        // const body = JSON.parse(event);
        await bot.handleUpdate(event);
    }
    return { statusCode: 200, body: 'Event processed' };
};
