const linebot = require('linebot');
const express = require('express');

const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

const app = express();

const linebotParser = bot.parser();

app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.post('/linewebhook', linebotParser);

bot.on('message', function(event) {
    switch (event.message.type) {
        case 'text':
            switch (event.message.text) {
                case 'Me':
                    event.source.profile()
                        .then(function(profile) {
                            return event.reply('Hello ' + profile.displayName + ' ' + profile.userId);
                        })
                        .catch(function(error) {
                            console.log(error);
                            return event.reply('error');
                        });
                    break;
                case 'Member':
                    event.source.member()
                        .then(function(member) {
                            return event.reply(JSON.stringify(member));
                        })
                        .catch(function(error) {
                            console.log(error);
                            return event.reply('error');
                        });;
                    break;
                    // case 'Picture':
                    //     event.reply({
                    //         type: 'image',
                    //         originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
                    //         previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
                    //     });
                    //     break;
                    // case 'Location':
                    //     event.reply({
                    //         type: 'location',
                    //         title: 'LINE Plus Corporation',
                    //         address: '1 Empire tower, Sathorn, Bangkok 10120, Thailand',
                    //         latitude: 13.7202068,
                    //         longitude: 100.5298698
                    //     });
                    //     break;
                case 'Push':
                    bot.push('U17448c796a01b715d293c34810985a4c', ['Hey!', 'สวัสดี ' + String.fromCharCode(0xD83D, 0xDE01)]);
                    break;
                case 'Push2':
                    bot.push('Cba71ba25dafbd6a1472c655fe22979e2', 'Push to group');
                    break;
                case 'Multicast':
                    bot.push(['U17448c796a01b715d293c34810985a4c', 'Cba71ba25dafbd6a1472c655fe22979e2'], 'Multicast!');
                    break;
                case 'Broadcast':
                    bot.broadcast('Broadcast!');
                    break;
                    // case 'Confirm':
                    //     event.reply({
                    //         type: 'template',
                    //         altText: 'this is a confirm template',
                    //         template: {
                    //             type: 'confirm',
                    //             text: 'Are you sure?',
                    //             actions: [{
                    //                 type: 'message',
                    //                 label: 'Yes',
                    //                 text: 'yes'
                    //             }, {
                    //                 type: 'message',
                    //                 label: 'No',
                    //                 text: 'no'
                    //             }]
                    //         }
                    //     });
                    //     break;
                case 'Multiple':
                    return event.reply(['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']);
                    break;
                default:
                    var msg = event.message.text;
                    if (msg.indexOf('擲骰') != -1) {
                        console.log('收到擲骰請求');
                        var diceRule = /\d*[d|D]\d*/;
                        var diceRequest = diceRule.exec(msg) + '';
                        console.log("diceRequest = " + diceRequest);
                        if (diceRequest) {
                            var diceParamater = diceRequest.split('d');
                            console.log("diceParamater[0] = " + diceParamater[0]);
                            console.log("diceParamater[1] = " + diceParamater[1]);
                            if (diceParamater[0] != "" && diceParamater[1] != "") {
                                let diceResult = getRandomInt(diceParamater[0], diceParamater[1]);
                                event.reply(['擲出' + diceParamater[1] + '個' + diceParamater[0] + '面骰！',
                                        '擲骰結果：' + diceResult + '點！',
                                        '總數為：' + diceResult.reduce((a, b) => a + b, 0) + '點！'
                                    ])
                                    .then(function(data) {
                                        console.log('擲骰成功', data);
                                    })
                                    .catch(function(error) {
                                        console.log('Error', error);
                                    });;
                            }
                        } else {
                            event.reply(['擲出1個6面骰', '擲骰結果：' + getRandomInt(6)])
                                .then(function(data) {
                                    console.log('擲骰成功', data);
                                })
                                .catch(function(error) {
                                    console.log('Error', error);
                                });;
                        }
                    }
                    break;
            }
            break;
            // case 'image':
            //     event.message.content().then(function(data) {
            //         const s = data.toString('hex').substring(0, 32);
            //         return event.reply('Nice picture! ' + s);
            //     }).catch(function(err) {
            //         return event.reply(err.toString());
            //     });
            //     break;
            // case 'video':
            //     event.reply('Nice video!');
            //     break;
            // case 'audio':
            //     event.reply('Nice audio!');
            //     break;
            // case 'location':
            //     event.reply(['That\'s a good location!', 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
            //     break;
            // case 'sticker':
            //     event.reply({
            //         type: 'sticker',
            //         packageId: 1,
            //         stickerId: 1
            //     });
            //     break;
            // default:
            //     event.reply('Unknow message: ' + JSON.stringify(event));
            //     break;
    }
});

bot.on('follow', function(event) {
    event.reply('follow: ' + event.source.userId);
});

bot.on('unfollow', function(event) {
    event.reply('unfollow: ' + event.source.userId);
});

bot.on('join', function(event) {
    event.reply('join: ' + event.source.groupId);
});

bot.on('leave', function(event) {
    event.reply('leave: ' + event.source.groupId);
});

bot.on('postback', function(event) {
    event.reply('postback: ' + event.postback.data);
});

bot.on('beacon', function(event) {
    event.reply('beacon: ' + event.beacon.hwid);
});

app.listen(process.env.PORT || 80, function() {
    console.log('LineBot is running.');
});

function getRandomInt(max) {
    return Math.ceil(Math.random() * Math.ceil(max));
}

function getRandomInt(max, amount) {
    var result = [];
    for (var i = 0; i < amount; i++) {
        result.push(getRandomInt(max));
    }
    return result;
}