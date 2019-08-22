const db = require('./pgp.js');
const fgoDrawProperty = [0.7, 0.3, 4, 3, 12, 40, 40];
const fgoDrawResultText = ["PU五星從者", "非PU五星從者", "五星禮裝", "四星從者", "四星禮裝", "三星從者", "三星禮裝"];

//5英靈 5禮裝 4英靈 4禮裝 3英靈 3禮裝
const fgoPickUpProperty = [
    [0.7, 0.8],
    [2.8],
    [1.5, 2.4],
    [4],
    [4],
    [8]
];
//5英靈 5禮裝 4英靈 4禮裝 3英靈 3禮裝
const fgoBaseProperty = [1, 4, 3, 12, 40, 40];
const fgoPropertyText = ['五星從者', '五星禮裝', '四星從者', '四星禮裝', '三星從者', '三星禮裝'];
const drawResultNew = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
];

var tenDrawTimes = 0;
var returnText;
var drawResult = [0, 0, 0, 0, 0, 0, 0, 0];
let defaultImage = { type: 'image', originalContentUrl: 'https://i.imgur.com/yfnub7D.jpg', previewImageUrl: 'https://i.imgur.com/yfnub7D.jpg' };

module.exports = {
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
    getDrawResult: function(userName, times, callback) {
        //初始化參數
        initial();
        let lastTimes = times;
        //依照抽卡次數計算抽卡結果
        if (lastTimes == 55555) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 5);
            times = tenDrawTimes * 10;
            console.log('寶5抽了共：' + times + "抽！");
        } else if (lastTimes == 44444) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 4);
            times = tenDrawTimes * 10;
            console.log('寶4抽了共：' + times + "抽！");
        } else if (lastTimes == 33333) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 3);
            times = tenDrawTimes * 10;
            console.log('寶3抽了共：' + times + "抽！");
        } else if (lastTimes == 22222) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 2);
            times = tenDrawTimes * 10;
            console.log('寶2抽了共：' + times + "抽！");
        } else if (lastTimes > 0) {
            while (lastTimes > 10) {
                drawResult = fgoDraw10Times(drawResult);
                lastTimes -= 10;
            }
            while (lastTimes > 0) {
                drawResult = fgoDraw(drawResult, false);
                lastTimes--;
            }
        } else {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] == 0);
            times = tenDrawTimes * 10;
        }
        if (tenDrawTimes == 0)
            returnText = [userName + " 抽卡總次數: " + times + "次。"];
        else returnText = [userName + " 抽卡總次數: " + times + "次。\n課了 " + Math.ceil(tenDrawTimes * 30 / 155) + " 單！"];

        //取得PU角色 與 常駐非PU角色 列表
        db.getServants(5, null, true)
            .then(limtedData => {
                db.getServants(5, false, false)
                    .then(unlimitedData => {
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
                                console.log(limtedData[index].summonDialog);
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
    },
}

function initial() {
    drawResult = [0, 0, 0, 0, 0, 0, 0, 0];
    returnText = "";
    tenDrawTimes = 0;
}

function fgoDrawNew(result, isGuarantee) {
    db.getServants(null, null, true)
        .then(pu => {

        })
        .catch(err => {
            console.log(err);
        });
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
            let nonThree = result.slice(0, 4);
            console.log(nonThree);
            isGuarantee = true;
            for (let index = 0; index < nonThree.length; index++)
                if (nonThree[index] != 0) isGuarantee = false;
        } else isGuarantee = false;
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

function sortData(target) {
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