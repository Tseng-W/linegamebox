const linebot = require('linebot');
const express = require('express');
const fgoUtil = require('./fgoUtil.js');

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
    var tenDrawTimes = 1;
	var userName;
	let returnText;
	let drawResult;
    switch (event.message.type) {
        case 'text':
            switch (event.message.text) {
                case 'Me':
                let result;
                let id;
                let name;
					event.source.profile()
						.then(function(profile) {
							//嘗試取得用戶資料
							id = profile.userId;
							name = profile.displayName;
							result = getUserDataFromDatabase(id);
							console.log("Output result at event : " + result);
						})
						.then(function() {
							console.log("******RESULT******* = "+result);
							if(result === undefined){
								console.log("<<<<result === undefined");
								let str = getRandomInt(10);
								let hp = getRandomInt(50);
								let spd = getRandomInt(10);
								insertUserDataToDatabase(id,name,hp,str,spd);
								return event.reply([
									"恭喜你成為新的冒險者~",
									"初始化屬性...",
									"生命："+hp+"  力量："+str+"  敏捷："+spd,
									"註冊完畢！"
									]);
							}else{
								console.log("<<<<ELSE");
								return event.reply([
									"冒險者 "+name+" 的屬性是：",
									"生命："+result.hp+"  力量："+result.str+"  敏捷："+result.spd
									]);
							}
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
                    case 'PGP':
                        var herosFromDB = fgoUtil.getHerosByStar(5);
                        console.log("index.js  ------ herosFromDB : "+herosFromDB[0]);
                        for(let index = 0;index<herosFromDB.length;index++)
                            console.log(herosFromDB[index]);
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
					//case 'Picture':
					//	event.reply(["123456",{
					//		type: 'image',
					//		originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
					//		previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
					//	}]);
					//	break;
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
				case '抽卡測試':
					event.source.profile()
					.then(function(profile){
                        returnText = fgoUtil.getDrawResult(profile.displayName,100000);
						event.reply(returnText)
						.then(function(data){
							console.log('拔草大成功',data);
						});
					});
                    break;
                case '抽到有':
                case '課到有':
                    event.source.profile()
                    .then(function(profile){
                        returnText = fgoUtil.getDrawResult(profile.displayName,-1);
                        event.reply(returnText)
                        .then(function(data){
                            console.log('拔草大成功',data);
                        })
                        .catch(function(error){
                            console.log('error',error);
                        });
                    });
                    break;
				case '1單':
				case '一單':
					event.source.profile()
					.then(function(profile){
                        returnText = fgoUtil.getDrawResult(profile.displayName,51);

						event.reply(returnText)
						.then(function(data){
							console.log('拔草大成功',data);
						})
						.catch(function(error){
							console.log('error',error);
						});
					});
					break;
				case '抽卡':
				case '抖肉':
				case '單抽':
				case '呼符':
				event.source.profile()
					.then(function(profile){
                        returnText = fgoUtil.getDrawResult(profile.displayName,1);

						event.reply(returnText)
						.catch(function(error){
							console.log('error',error);
						});
					});
					break;
                //case '瘋狂拔草':
                //   var crazyDraw = true;
				case '10抽':
				case '十抽':
				case '10連':
				case '十連':
				case '拔草':
                case '測風向':
					event.source.profile()
					.then(function(profile){
						returnText = fgoUtil.getDrawResult(profile.displayName,10);
						event.reply(returnText)
						.then(function(data){
							console.log('拔草大成功',data);
						})
						.catch(function(error){
							console.log('error',error);
						});
					});
                    break;
                default:
					console.log(event.message.text);
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
							if(diceParamater[0] > 100)
								event.reply('骰子太多拿不動啦！最多一次擲出100顆骰子');
							if(diceParamater[1] > 100)
								event.reply('小算盤表示：手指不夠用！最大可擲出100面骰');
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
                    }else if(msg.indexOf('PU') != -1){
						console.log('currentPU = '+currentPU);
						currentPU = msg.slice(2,msg.length);
						console.log('currentPU = '+currentPU);
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
    return Math.floor(Math.random() * max) + 1;
}

function getRandomInts(max, amount) {
    var result = [];
    for (var i = 0; i < amount; i++) {
        var value = getRandomInt(max);
        result.push(value);
    }
	console.log('getRandomInts---------------');
	console.log('max: ' + max);
	console.log('result : ' + result);
	console.log('----------------------------');
    return result;
}