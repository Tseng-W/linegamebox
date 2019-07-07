const { LineBot, LineHandler, Line } = require('bottender');
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
    await context.reply([
    	Line.createText('Hello'),
    	Line.createImage({
    originalContentUrl: 'https://example.com/original.jpg',
    previewImageUrl: 'https://example.com/preview.jpg',
  }),
  Line.createText('End'),
    	]);
  })
  .onError(async context => {
    await context.sendText('Something wrong happened.');
  });

bot.onEvent(handler);	

const server = createServer(bot);

server.listen((process.env.PORT || 8080), () => {
  console.log('server is running on 5000 port...');
});
