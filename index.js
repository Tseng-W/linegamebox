const { LineBot, LineHandler } = require('bottender');
const { createServer } = require('bottender/express');

const bot = new LineBot({
  accessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelID: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  // sendMethod: 'reply', // Default: 'push'
});

const handler = new LineHandler()
  .onText(/yo/i, async context => {
    await context.sendText('Hi there!');
  })
  .onEvent(async context => {
    await context.sendText("I don't know what you say.");
  })
  .onError(async context => {
    await context.sendText('Something wrong happened.');
  });

bot.onEvent(handler);	

const server = createServer(bot);

server.listen((process.env.PORT || 5000), () => {
  console.log('server is running on 5000 port...');
});
