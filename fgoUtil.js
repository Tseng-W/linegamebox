const db = require('./pgp.js');
const fgoDrawProperty = [0.7, 0.3, 4, 3, 12, 40, 40];
const fgoDrawResultText = ["PU五星從者", "非PU五星從者", "五星禮裝", "四星從者", "四星禮裝", "三星從者", "三星禮裝"];

var tenDrawTimes = 0;
var returnText;
var drawResult = [0, 0, 0, 0, 0, 0, 0, 0];
var currentPU = "貞德Alter";
var currentPUData;

module.exports = {
    setPU: function(name, callback) {
        db.getHerosByName(name)
            .then(data => {
                if (data.length > 0) {
                    currentPU = name;
                    console.log('已變更PU從者為：' + currentPU);
                }
                callback("當前PU從者為：" + data[0].heroName);
            })
            .catch(err => {
                console.log("無對應從者名稱");
                callback("無對應從者名稱");
            });
    },
    getPU: function() {
        return currentPU;
    },
    getDrawResult: function(userName, times, callback) {
        //初始化參數
        initial();
        let lastTimes = times;
        //依照抽卡次數計算抽卡結果
        if (lastTimes > 0) {
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

        db.getHerosByName(currentPU)
            .then(limtedData => {
                let image = { type: 'image', originalContentUrl: limtedData[0].picture, previewImageUrl: limtedData[0].picture };
                console.log('image url:', image);
                db.getHerosByStar(5)
                    .then(unlimitedData => {
                        returnText.push("抽卡結果：");
                        returnText[returnText.length - 1] += fgoOutputResultText(5, limtedData, true, drawResult[0]);
                        returnText[returnText.length - 1] += fgoOutputResultText(5, unlimitedData, false, drawResult[1]);
                        returnText[returnText.length - 1] += fgoOutputResultText(5, null, false, drawResult[2]);
                        returnText[returnText.length - 1] += fgoOutputResultText(4, null, false, drawResult[3]);
                        returnText[returnText.length - 1] += fgoOutputResultText(4, null, false, drawResult[4]);
                        returnText[returnText.length - 1] += fgoOutputResultText(3, null, false, drawResult[5]);
                        returnText[returnText.length - 1] += fgoOutputResultText(3, null, false, drawResult[6]);
                        if(drawResult[0]>0)
                        	returnText.push(image);
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


function fgoOutputResultText(star, data, isHero, num) {
	let returnText = isHero ? star + "星從者：\n" : star + "星禮裝：";
    if (num <= 0)
        return "";
    if (data != null) {
        let 	 = [];
        for (let index = 0; index < num; index++)
            target.push(data[Math.floor(Math.random() * data.length)].heroName);
        const result = Object.create(null);
        target.forEach(element => {
            result[element] = result[element] ? result[element] += 1 : 1;
        });
        const entries = Object.entries(result);
        entries.foreach(obj => {
            returnText += "\n" + obj[0] + "：" + obj[1];
        });
        console.log('fgoOutputResultText returnText = ' + returnText);
        return returnText;
    }else{
    	returnText += num;
    	console.log('fgoOutputResultText returnText = ' + returnText);
        return returnText;
    }
}

function fgoDrawResultPicture(result, returnText) {
    let black = { type: 'image', originalContentUrl: 'https://truth.bahamut.com.tw/s01/201901/7716563a47b4196cafaeff388e8637fa.JPG', previewImageUrl: 'https://truth.bahamut.com.tw/s01/201901/7716563a47b4196cafaeff388e8637fa.JPG' };
    let veryBlack = { type: 'image', originalContentUrl: 'https://truth.bahamut.com.tw/s01/201902/a25b18fedf67c3fcbac442fea775c341.JPG', previewImageUrl: 'https://truth.bahamut.com.tw/s01/201902/a25b18fedf67c3fcbac442fea775c341.JPG' };
    let veryVeryBlack = { type: 'image', originalContentUrl: 'https://truth.bahamut.com.tw/s01/201902/0f595554af88c42c095243128ca912c5.JPG', previewImageUrl: 'https://truth.bahamut.com.tw/s01/201902/0f595554af88c42c095243128ca912c5.JPG' };
    let returnBlack = { type: 'image', originalContentUrl: 'https://truth.bahamut.com.tw/s01/201902/d5b4ee85bb697e896aeef32c1454161e.JPG', previewImageUrl: 'https://truth.bahamut.com.tw/s01/201902/d5b4ee85bb697e896aeef32c1454161e.JPG' };
    let white = { type: 'image', originalContentUrl: 'https://i.imgur.com/bZY2D65.jpg', previewImageUrl: 'https://i.imgur.com/bZY2D65.jpg' };
    if (result[0] != 0)
        returnText.push(white);
    else if (result[0] == 0 && result[1] == 0 && result[2] == 0 && result[3] == 0)
        returnText.push(black);
    else if (result[result.length - 1] != 0)
        returnText.push(veryBlack);
    else if (result[0] == 0 && result[1] == 1 && result[2] == 0)
        returnText.push(returnBlack);
    return returnText;
}