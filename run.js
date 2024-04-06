import {handler} from './index.js';

const message = {
    update_id: 418454937,
    message: {
      message_id: 57,
      from: {
        id: 126685195,
        is_bot: false,
        first_name: 'Alexander',
        last_name: 'Vitshas',
        username: 'Sahstiva',
        language_code: 'en',
        is_premium: true
      },
      chat: {
        id: 126685195,
        first_name: 'Alexander',
        last_name: 'Vitshas',
        username: 'Sahstiva',
        type: 'private'
      },
      date: 1710142622,
      text: '02.03.2024'
    }
};
handler(message)
    .then(result => {
    console.log(result);
    })
    .catch(err => {
        console.log(err);
    });
