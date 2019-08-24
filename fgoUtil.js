const db = require('./pgp.js');
const fgoDrawProperty = [0.7, 0.3, 4, 3, 12, 40, 40];
const fgoDrawResultText = ["PU五星從者", "非PU五星從者", "五星禮裝", "四星從者", "四星禮裝", "三星從者", "三星禮裝"];

var tenDrawTimes = 0;
var returnText;
var drawResult = [0, 0, 0, 0, 0, 0, 0, 0];
let defaultImage = { type: 'image', originalContentUrl: 'https://i.imgur.com/yfnub7D.jpg', previewImageUrl: 'https://i.imgur.com/yfnub7D.jpg' };

module.exports = {
    initalUserData: function(id, callback) {
        db.getUserDataById(id)
            .then(userData => {
                console.log("userData = " + userData);
                if (!userData)
                    db.initalUserData(id)
                    .then(resultData => {
                        console.log("resultData = " + resultData);
                        callback(data);
                    })
                    .catch(err => {
                        console.log("err = " + err);
                        callback(err);
                    });
                else
                    callback(userData);
            });
    },
    setPU: function(heros, callback) {
        console.log("fgo.js ---- heros:" + heros);
        db.setPickUpServants(heros)
            .then(data => {
                console.log("fgoutil ");
                let returnT = "當前PU從者為：\n";
                data.forEach(servantName => {
                    returnT += servantName.servantName + "\n";
                });
                callback(returnT);
            })
            .catch(err => {
                callback("無對應從者");
                console.log(err);
            });
    },
    getPU: function(callback) {
        db.getServants(null, null, true)
            .then(data => {
                callback(data);
            });
    },
    getDrawResult: function(user, drawTimes, callback) {
        //初始化參數
        initial();
        let lastTimes = drawTimes;
        //前面為抽到有系列，最後為指定抽卡次數
        if (lastTimes == 55555) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 5);
            drawTimes = tenDrawTimes * 10;
        } else if (lastTimes == 44444) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 4);
            drawTimes = tenDrawTimes * 10;
        } else if (lastTimes == 33333) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 3);
            drawTimes = tenDrawTimes * 10;
        } else if (lastTimes == 22222) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 2);
            drawTimes = tenDrawTimes * 10;
        } else if (lastTimes == 11111) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 1);
            drawTimes = tenDrawTimes * 10;
        } else if (lastTimes > 0) { //指定抽卡次數
            while (lastTimes >= 10) {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
                lastTimes -= 10;
            }
            while (lastTimes > 0) {
                drawResult = fgoDraw(drawResult, false);
                lastTimes--;
            }
        }

        //取得並更新userData，並取得整理後的文案


        let drawPerPU = drawResult[0] / tenDrawTimes / 10;

        if (tenDrawTimes == 0)
            returnText = [user.displayName + " 抽卡總次數: " + drawTimes + "次。"];
        else returnText = [user.displayName + " " + getEmoji("hand", drawPerPU) + "抽卡總次數: " + drawTimes + "次。\n課了 " + Math.ceil(tenDrawTimes * 30 / 155) + " 單！"];

        setUserData(user.userId, drawTimes, drawResult, result => {
            returnText += result;

            //將英雄資訊依照抽卡結果組成輸出文案
            db.getServants(5, null, true)
                .then(limtedData => {
                    db.getServants(5, false, false)
                        .then(unlimitedData => {
                            console.log("-----Enter db.getServants(5, false, false)-----");
                            returnText[returnText.length - 1] += "\n抽卡結果：\n";

                            let getLimitedHero = [];
                            let getLimitedHeroData = [];
                            for (let index = 0; index < drawResult[0]; index++)
                                getLimitedHero.push(Math.floor(Math.random() * limtedData.length));

                            getLimitedHero.forEach(index => {
                                getLimitedHeroData.push(limtedData[index]);
                            })

                            //將抽獎結果、從者名進行統計與排列
                            returnText[returnText.length - 1] += fgoOutputResultText(5, getLimitedHeroData, true, -1);
                            returnText[returnText.length - 1] += fgoOutputResultText(5, unlimitedData, true, drawResult[1]);
                            returnText[returnText.length - 1] += fgoOutputResultText(5, null, false, drawResult[2]);
                            returnText[returnText.length - 1] += fgoOutputResultText(4, null, true, drawResult[3]);
                            returnText[returnText.length - 1] += fgoOutputResultText(4, null, false, drawResult[4]);
                            returnText[returnText.length - 1] += fgoOutputResultText(3, null, true, drawResult[5]);
                            returnText[returnText.length - 1] += fgoOutputResultText(3, null, false, drawResult[6]);

                            console.log("-----After add text, returnText = " + returnText);


                            //若抽到PU五星，從所有PU五星中抽取並加入英雄名、立繪和招喚語
                            if (drawResult[0] > 0) {
                                let image;
                                getLimitedHero = getLimitedHero.filter(function(elem, pos) {
                                    return getLimitedHero.indexOf(elem) == pos;
                                })
                                getLimitedHero.forEach(index => {
                                    if (limtedData[index].picture) {
                                        image = { type: 'image', originalContentUrl: limtedData[index].picture, previewImageUrl: limtedData[index].picture };
                                        console.log('image url:', image);
                                        if (returnText.length < 5)
                                            returnText.push(image);
                                    } else if (returnText.indexOf(defaultImage) == -1)
                                        if (returnText.length < 5)
                                            returnText.push(defaultImage);
                                    if (limtedData[index].summonDialog) {
                                        if (returnText.length < 5)
                                            returnText.push(limtedData[index].summonDialog);
                                    }
                                    console.log("imtedData[index].summonDialog = " + limtedData[index].summonDialog);
                                });
                            }

                            console.log('fgoUtil.js(with5) ---- returnText : ' + returnText);
                            callback(returnText);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        });
    },
}

function initial() {
    drawResult = [0, 0, 0, 0, 0, 0, 0, 0];
    returnText = "";
    tenDrawTimes = 0;
}

function fgoDraw(result, isGuarantee) {
    let randomNumber = Math.random() * 100;
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
            if (isGuarantee && i > 4)
                result[4]++;
            else
                result[i]++;
            break;
        }
    }
    return result;
}

function fgoDraw10Times(result) {
    let isGuarantee = false;
    for (let draw = 1; draw < 11; draw++) {
        if (draw == 10) {
            let nonThree = result.slice(0, 4);
            isGuarantee = true;
            nonThree.forEach(data => {
                if (data > 0) isGuarantee = false;
            });
        }
        result = fgoDraw(result, isGuarantee);
    }
    return result;
}


function fgoOutputResultText(star, data, isHero, num) {
    let returnText = isHero ? star + "星從者：" : star + "星禮裝：";
    //不輸出
    if (num == 0)
        return "";
    //num==-1，為PU，data已過篩，全部匯入
    else if (num == -1) {
        if (data.length > 0) {
            let target = [];
            data.forEach(content => {
                target.push(content.servantName);
            });
            returnText += sortData(target);

            return returnText;
        }
        return "";
        //num>0，代表為常駐
    } else {
        if (data != null) {
            let target = [];
            for (let index = 0; index < num; index++)
                target.push(data[Math.floor(Math.random() * data.length)].servantName);
            const result = Object.create(null);
            target.forEach(element => {
                result[element] = result[element] ? result[element] += 1 : 1;
            });

            returnText += sortData(target);

            return returnText;

        } else {
            returnText += num + "\n";
            return returnText;
        }
    }
}

function getEmoji(type, param) {
    let emoji = "";
    switch (type) {
        case "hand":
            if (param <= 0.001)
                emoji = "🌚";
            else if (param <= 0.0035)
                emoji = "👉🏿";
            else if (param <= 0.007)
                emoji = "👉🏾";
            else if (param <= 0.014)
                emoji = "👉🏽";
            else
                emoji = "👉🏻";
            break;
    }
    return emoji;
}

function setUserData(id, drawTimes, drawResult, callback) {
    console.log("Enter setUserData");
    let tempResult = drawResult;
    db.getUserDataById(id)
        .then(userData => {
            if (!userData) {
                db.initalUserData(id, drawTimes, tempResult[0], tempResult[1])
                    .then(initalResult => {
                        console.log("!userData : " + userData);
                        callback("\n首次抽卡！歐度為：" + getLucky(drawTimes, tempResult[0], tempResult[1]) + "\n");
                    });
            } else {
                let originalLuk = getLucky(userData.drawTimes, userData.servantPu5, userData.servant5);
                drawTimes += parseInt(userData.drawTimes);
                tempResult[0] += parseInt(userData.servantPu5);
                tempResult[1] += parseInt(userData.servant5);
                let currentLuk = getLucky(drawTimes, tempResult[0], tempResult[1]);
                let resultText = "\n累積抽卡" + userData.drawTimes + "次並歐出PU5星" + userData.servantPu5 + "位、歪出常駐5星" + userData.servant5 + "位！\n";
                if (originalLuk = currentLuk)
                    resultText += "膚色沒有變化\n";
                else if (originalLuk - currentLuk < 0)
                    resultText += "歐度從" + originalLuk + "增加到" + currentLuk + "！\n";
                else resultText += "歐度從" + originalLuk + "下降到" + currentLuk + "！\n";
                db.updateUserDataById(id, drawTimes, tempResult[0], tempResult[1])
                    .then(result => {
                        console.log("userData update success, and return" + resultText);
                        callback(resultText);
                    })
                    .catch(err => {
                        console.log("userData update err = " + err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
            callback("[系統] 打翻了泡麵！資料庫口水直流短路中。");
        });
}

function getLucky(drawTimes, sPu5Num, s5Num) {
    let bounes = drawTimes / 1000;
    let expectedPu5 = drawTimes * fgoDrawProperty[0] / 100;
    let expected5 = drawTimes * fgoDrawProperty[1] / 100;
    let luckyPu = sPu5Num / expectedPu5 * (1 + bounes);
    let lucky = s5Num / expected5 * (1 + bounes);
    return Math.floor(luckyPu * 100) / 100;
}

function sortData(target) {
    let text = "";
    let result = Object.create(null);
    target.forEach(element => {
        result[element] = result[element] ? result[element] += 1 : 1;
    });

    text += "\n";
    let entries = Object.entries(result);
    entries.sort((a, b) => b[1] - a[1]);
    entries.forEach(obj => {
        text += "" + obj[0] + "：" + obj[1] + "\n";
    });
    console.log('sortData text = ' + text);
    return text;
}