import {handler} from './index.js';
import 'dotenv/config';
import {BotMessage} from "./interfaces.js";

const message: BotMessage = {
    update_id: parseInt(process.env.update_id || '', 10),
    message: {
      message_id: 57,
      from: {
        id: parseInt(process.env.tg_id || '', 10),
        is_bot: false,
        first_name: process.env.first_name || '',
        last_name: process.env.last_name || '',
        username: process.env.username || '',
        language_code: 'en',
        is_premium: true
      },
      chat: {
        id: parseInt(process.env.tg_id || '', 10),
          first_name: process.env.first_name || '',
          last_name: process.env.last_name || '',
          username: process.env.username || '',
        type: 'private'
      },
      date: 1710142622,
      text: 'latest'
    }
};
handler(message)
    .then(result => {
    console.log(result);
    })
    .catch(err => {
        console.log(err);
    });
