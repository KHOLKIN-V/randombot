const TelegramApi = require('node-telegram-bot-api');
const token = '2098156631:AAHpS2ZSqo8xnFgO2kSxcWEvMc1xmGdVnJI';
const {gameOptions, againOptions} = require('./options.js');
const sequelize = require('./database');
const UserModel = require('./model')

const bot = new TelegramApi(token, {polling: true} );
const chats = {}


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать!`);
    const randomNumber = Math.floor(Math.random()* 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Отгадывай`, gameOptions);
}


const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (error) {
        console.log(`Подключение к базе данных поломалося. Ошибка ${error}`);
    }


    bot.on('message', async msg => {
        console.log(msg);
        const text = msg.text;
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name;
        const lastName = msg.from.last_name;
        bot.setMyCommands([
            {command: '/start', description: 'Приветствие'},
            {command: '/info', description: 'О нас'},
            {command: '/game', description: 'Игра "Угадай цифру"'}
        ]);

        try {

            if (text === '/start') {
                await UserModel.create({chatId});
                await bot.sendMessage(chatId, `Добро пожаловать, ${firstName} ${lastName}!
        Это бот семьи "MARINAD"`);
                return bot.sendSticker(chatId, `https://tlgrm.ru/_/stickers/316/9d1/3169d16d-7d80-4e5a-bac8-6b55a421ee6f/5.webp`);
            }
        
            if (text === '/info') {
                const user = await UserModel.findOne({chatId});
                return bot.sendMessage(chatId, `Сейчас я расскажу тебе о нашем заведении. Мы работаем в лучших семейных традициях, воспитанных в течение полувека. Эти традиции касаются мариновки и приготовления мясной продукции. В игре у тебя ${user.right} правильных ответов и ${user.wrong} неправильных ответов.`)
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй ещё раз!');    
        } catch (error) {
            return bot.sendMessage(chatId, 'Какая-то ошибочка на сервачке')
        }
    });

    bot.on('callback_query', msg => {
        console.log(msg)
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === `/again`) {
            return startGame(chatId);
        }

        if (data === chats[chatId]) {
            return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${data}!`, againOptions);
        } else {
            return bot.sendMessage(chatId, `К сожалению ты не отгадал. Бот загадал цифру ${chats[chatId]}.`, againOptions);
        };
    })
}

start()
