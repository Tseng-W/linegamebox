const { LineBot } = require('bottender');
const { createServer } = require('bottender/express');

const bot = new LineBot({
  accessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelID: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  // sendMethod: 'reply', // Default: 'push'
});

bot.onEvent(async context => {
  await context.sendText('Hello World');
});

const server = createServer(bot);

server.listen((process.env.PORT || 5000), () => {
  console.log('server is running on 5000 port...');
});
