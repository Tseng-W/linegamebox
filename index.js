const linebot = require('linebot');
const express = require('express');
const db = require('./db.js');
const fgoDrawProperty = [0.7,0.3,4,3,12,40,40];
const fgoDrawResultText = ["PU五星從者","非PU五星從者","五星禮裝","四星從者","四星禮裝","三星禮裝","三星從者"];

const { Client } = require('pg');
 
console.log(db);

var currentPU = "";

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
                    case 'PGP':
                        db.any(`SELECT * FROM public."HERO_DATA"`)
                        .then(data=>{
                            console.log(data);
                        })
                        .catch(err=>{

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
						tenDrawTimes = 10000;
						drawResult = [0,0,0,0,0,0,0,0];
						for(let index = 0; index < tenDrawTimes; index++)
							drawResult = fgoDraw10Times(drawResult);
						returnText = [profile.displayName + " 十抽次數:"+tenDrawTimes];
						returnText.push("保底次數:"+drawResult[drawResult.length-1]);
						returnText.push("抽卡結果:");
						for(let index = 0 ; index < drawResult.length-1; index++){
							if(drawResult[index]!=0){
								returnText[2] += "\n" +fgoDrawResultText[index] + " : " + drawResult[index];
							}
						}
						event.reply(returnText)
						.then(function(data){
							console.log('拔草大成功',data);
						});
					});
                    break;
                case '抽到有':
                    event.source.profile()
                    .then(function(profile){
                        drawResult = [0,0,0,0,0,0,0,0];
                        let totalDrawTimes = 0;
                        do{
                            totalDrawTimes++
                            drawResult = fgoDraw10Times(drawResult);
                        }while(drawResult[0]==0);
                        returnText = [profile.displayName+" 10抽次數: "+totalDrawTimes+"次！"];
                        returnText.push("課了 "+Math.ceil(totalDrawTimes/5.1)+" 單！");
                        returnText.push("保底次數:"+drawResult[drawResult.length-1]);
                        returnText.push("抽卡結果:");
                        for(let index = 0 ; index < drawResult.length-1; index++){
                            if(drawResult[index]!=0){
                                returnText[3] += "\n" +fgoDrawResultText[index] + " : " + drawResult[index];
                            }
                        }
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
						tenDrawTimes = 5;
						drawResult = [0,0,0,0,0,0,0,0];
						for(let index = 0; index < tenDrawTimes; index++)
							drawResult = fgoDraw10Times(drawResult);
						drawResult = fgoDraw(drawResult,false);
						returnText = [profile.displayName+" 抽卡次數: 51次 (10連*5+單抽)"];
						returnText.push("保底次數:"+drawResult[drawResult.length-1]);
						returnText.push("抽卡結果:");
						for(let index = 0 ; index < drawResult.length-1; index++){
							if(drawResult[index]!=0){
								returnText[2] += "\n" +fgoDrawResultText[index] + " : " + drawResult[index];
							}
						}
						returnText = fgoDrawResultPicture(drawResult,returnText);
						
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
						drawResult = [0,0,0,0,0,0,0,0];
						let singleDrawFive = {type:'image',originalContentUrl:'https://i.imgur.com/bZY2D65.jpg', previewImageUrl:'https://i.imgur.com/bZY2D65.jpg'};
						drawResult = fgoDraw(drawResult,false);
						returnText=[profile.displayName+" 單抽結果:"];
						for(let index = 0 ; index < drawResult.length-1; index++){
							if(drawResult[index]!=0){
								console.log("index = "+index);
								returnText.push(fgoDrawResultText[index] + " : " + drawResult[index]);
							}
						}
						if(drawResult[0] != 0 || drawResult[1] != 0)
							returnText.push(singleDrawFive);
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
						tenDrawTimes = 1;
						drawResult = [0,0,0,0,0,0,0,0];
						for(let index = 0; index < tenDrawTimes; index++)
							drawResult = fgoDraw10Times(drawResult);
						returnText = [profile.displayName+" 十抽次數:"+tenDrawTimes];
						returnText.push("保底次數:"+drawResult[drawResult.length-1]);
						returnText.push("抽卡結果:");
						for(let index = 0 ; index < drawResult.length-1; index++){
							if(drawResult[index]!=0){
								returnText[2] += "\n" +fgoDrawResultText[index] + " : " + drawResult[index];
							}
						}
						returnText = fgoDrawResultPicture(drawResult,returnText);
						
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

function showData(){

}

function getUserDataFromDatabase(id) {
    const query = `
    SELECT * FROM public."USER_DATA"
    WHERE id = '` + id + `'
    `
    console.log('query = '+query);
    client
        .query(query, function(err, result){
            console.log("result.rowCount = " + result.rowCount);
            if(result.rowCount==0)
                return null;
            if(err) throw err;
            console.log("Get data and return : " + result.rows[0]);
            console.log("str = " + result.rows[0].str);
            return result.rows[0];
        });
}

function insertUserDataToDatabase(id, name, hp, str ,spd) {
    const query = `
    INSERT INTO public."USER_DATA"(id,name,hp,str,spd)
    VALUES ('` + id + `','` + name + `',` + hp + ',' +  str + ',' + spd+`)
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
    }
	console.log('getRandomInts---------------');
	console.log('max: ' + max);
	console.log('result : ' + result);
	console.log('----------------------------');
    return result;
}

function fgoDraw(result, isGuarantee) {
    let randomNumber = Math.random() * 100;
	//console.log("randomNumber = "+randomNumber);
    let propertyLevel = 0;
    if (isGuarantee) {
        console.log("<<<<<<<此抽保底>>>>>>");
        result[result.length - 1] += 1;
    };
    for (var i = 0; i < fgoDrawProperty.length; i++) {
        propertyLevel += fgoDrawProperty[i];
        if (propertyLevel > 100)
            console.log("錯誤：機率大於100");
        if (randomNumber < propertyLevel) {
            if (isGuarantee) {
                console.log("(isisGuarantee)randomNumber = " + randomNumber);
                console.log("(isisGuarantee)propertyLevel = " + propertyLevel);
            }
            if (isGuarantee && i > 4)
                result[4]++;
            else
                result[i]++;
            break;
        }
    }
    console.log("-----------------");
    return result;
}

function fgoDraw10Times(result) {
    let drawTimes = 10;
    let isGuarantee = false;
    for (let draw = 1; draw < drawTimes + 1; draw++) {
        if (draw == 10) {
            let nonThree = result.slice(0, 5);
            console.log(nonThree);
            isGuarantee = true;
            for (let index = 0; index < nonThree.length; index++)
                if (nonThree[index] != 0) isGuarantee = false;
        } else isGuarantee = false;
        result = fgoDraw(result, isGuarantee);
    }
    return result;
}

function fgoDrawResultPicture(result, returnText){
	let black = {type:'image',originalContentUrl: 'https://truth.bahamut.com.tw/s01/201901/7716563a47b4196cafaeff388e8637fa.JPG',previewImageUrl: 'https://truth.bahamut.com.tw/s01/201901/7716563a47b4196cafaeff388e8637fa.JPG'};
	let veryBlack = {type : 'image', originalContentUrl:'https://truth.bahamut.com.tw/s01/201902/a25b18fedf67c3fcbac442fea775c341.JPG',previewImageUrl:'https://truth.bahamut.com.tw/s01/201902/a25b18fedf67c3fcbac442fea775c341.JPG'};
	let veryVeryBlack = {type:'image',originalContentUrl:'https://truth.bahamut.com.tw/s01/201902/0f595554af88c42c095243128ca912c5.JPG',previewImageUrl:'https://truth.bahamut.com.tw/s01/201902/0f595554af88c42c095243128ca912c5.JPG'};
	let returnBlack = {type:'image',originalContentUrl:'https://truth.bahamut.com.tw/s01/201902/d5b4ee85bb697e896aeef32c1454161e.JPG',previewImageUrl:'https://truth.bahamut.com.tw/s01/201902/d5b4ee85bb697e896aeef32c1454161e.JPG'};
	let white = {type:'image',originalContentUrl:'https://i.imgur.com/bZY2D65.jpg', previewImageUrl:'https://i.imgur.com/bZY2D65.jpg'};
	if(result[0] != 0)
		returnText.push(white);
	else if(result[0] == 0 && result[1] == 0 && result[2] == 0 && result[3] == 0)
		returnText.push(black);
	else if(result[result.length-1] != 0)
		returnText.push(veryBlack);
	else if(result[0] == 0 && result[1] == 1 && result[2] ==0)
		returnText.push(returnBlack);
	return returnText;
}