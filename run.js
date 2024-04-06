import {handler} from './index.js';
import 'dotenv/config';

const message = {
    update_id: process.env.update_id,
    message: {
      message_id: 57,
      from: {
        id: process.env.tg_id,
        is_bot: false,
        first_name: process.env.first_name,
        last_name: process.env.last_name,
        username: process.env.username,
        language_code: 'en',
        is_premium: true
      },
      chat: {
        id: process.env.tg_id,
          first_name: process.env.first_name,
          last_name: process.env.last_name,
          username: process.env.username,
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
