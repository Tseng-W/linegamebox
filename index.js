const linebot = require('linebot');
const express = require('express');
const { Client } = require('pg');

// const config = {
//     host: 'ec2-174-129-227-205.compute-1.amazonaws.com',
//     // Do not hard code your username and password.
//     // Consider using Node environment variables.
//     user: 'yfqwtlcqklltsf',     
//     password: '123fcb85f17cc4233729ea77e0fa69e5a8048e5269a6c3af49e576867c59be5d',
//     database: 'dai9s7ljceh6ei',
//     port: 5432,
//     ssl: true
// };

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

client.connect(err => {
    if (err) throw err;
    // else {
    //     queryDatabase();
    // }
});

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
                            //嘗試取得用戶資料
                            result = getUserDataFromDatabase(profile.userId);
                        })
                        .then(function(result) {
                            console.log("******RESULT******* = "+result);
                        })
                        .catch(function(error) {
                            console.log(error);
                            return event.reply('error');
                        });

                    break;
                case 'inital':
                    event.source.profile()
                        .then(function(profile) {
                            insertUserDataToDatabase(profile.userId, profile.displayName, getRandomInt(10));
                        });
                    break;
                case 'DB':
                    const query = `
                    DROP TABLE IF EXISTS inventory;
                    CREATE TABLE inventory (id serial PRIMARY KEY, name VARCHAR(50), quantity INTEGER);
                    INSERT INTO inventory (name, quantity) VALUES ('banana', 150);
                    INSERT INTO inventory (name, quantity) VALUES ('orange', 154);
                    INSERT INTO inventory (name, quantity) VALUES ('apple', 100);
                    `;
                    client
                        .query(query)
                        .then(() => {
                            console.log('Table created successfully!');
                            client.end(console.log('Closed client connection'));
                        })
                        .catch(err => console.log(err))
                        .then(() => {
                            console.log('Finished execution, exiting now');
                            process.exit();
                        });
                    break;
                    // case 'Member':
                    //     event.source.member()
                    //         .then(function(member) {
                    //             return event.reply(JSON.stringify(member));
                    //         })
                    //         .catch(function(error) {
                    //             console.log(error);
                    //             return event.reply('error');
                    //         });;
                    //     break;
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
                    // case 'Confirm':
                    //     event.reply({
                    //         type: 'template',
                    //         altText: 'this is a confirm template',
                    //         template: {
                    //             type: 'confirm',
                    //             text: 'Are you sure?',
                    //             actions:     [{
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
                default:
                    var msg = event.message.text;
                    if (msg.indexOf('擲骰') != -1) {
                        console.log('收到擲骰請求');
                        var diceRule = /\d*[d|D]\d*/;
                        var diceRequest = diceRule.exec(msg) + '';
                        console.log("diceRequest = " + diceRequest);
                        console.log("diceRequest.length = " + diceRequest.length);
                        if (diceRequest != 'null') {
                            var diceParamater = diceRequest.split('d');
                            console.log("diceParamater[0] = " + diceParamater[0]);
                            console.log("diceParamater[1] = " + diceParamater[1]);
                            if (diceParamater[0] != "" && diceParamater[1] != "") {
                                var diceResult = getRandomInts(diceParamater[0], diceParamater[1]);
                                console.log("diceResult=" + diceResult);
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

function getUserDataFromDatabase(id) {
    const query = `
    SELECT * FROM public."USER_DATA"
    WHERE id = '` + id + `'
    `
    console.log('query = '+query);
    client
        .query(query, function(err, result){
            for(var i in result)
                console.log("result["+i+"] = " + result[i]);
            if(result.rowCount==0)
                return 2000;
            if(err) throw err;
            console.log("result.rows = "+result.rows);
            for(var i in result.rows[0])
                console.log("result.rows[0]["+i+"] = "+result.rows[0].i);
            return 10;
        });
}

function insertUserDataToDatabase(id, name, str) {
    const query = `
    INSERT INTO public."USER_DATA"(id,name,str)
    VALUES ('` + id + `','` + name + `',` + str + `)
    `
    client
        .query(query)
        .then(() => {
            console.log('Insert success.');
        })
        .catch(err => console.log(err))
        .then(() => {
            console.log('Failed')
        });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

function getRandomInts(max, amount) {
    var result = [];
    for (var i = 0; i < amount; i++) {
        var value = getRandomInt(max);
        result.push(value);
        console.log('max: ' + max);
        console.log('value: ' + value);
        console.log('tempResult : ' + result);
    }
    return result;
}