import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { parser5verst }  from './parser.js';
import { formatSummary } from './summary.js';
import 'dotenv/config';

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

export const handler = async (event) => {
    if (event) {
        await bot.handleUpdate(event);
    }
    return { statusCode: 200, body: 'Event processed' };
};
