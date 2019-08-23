const db = require('./pgp.js');
const fgoDrawProperty = [0.7, 0.3, 4, 3, 12, 40, 40];
const fgoDrawResultText = ["PU五星從者", "非PU五星從者", "五星禮裝", "四星從者", "四星禮裝", "三星從者", "三星禮裝"];

var tenDrawTimes = 0;
var returnText;
var drawResult = [0, 0, 0, 0, 0, 0, 0, 0];
var currentPU = "貞德Alter";
var currentPUData;
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
        db.getCurrentPU()
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
        }else if (lastTimes == 44444) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 4);
            times = tenDrawTimes * 10;
        }else if (lastTimes == 33333) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 3);
            times = tenDrawTimes * 10;
        }else if (lastTimes == 22222) {
            do {
                drawResult = fgoDraw10Times(drawResult);
                tenDrawTimes++;
            } while (drawResult[0] < 2);
            times = tenDrawTimes * 10;
        } else if (lastTimes > 0) {
            while (lastTimes >= 10) {
                drawResult = fgoDraw10Times(drawResult);
				tenDrawTimes++;
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
		let handEmoji;
		let drawPerPU = drawResult[0] / tenDrawTimes / 10;
		if(drawPerPU == 0)
			handEmoji = "👉🏿";
		else if(drawPerPU <= 0.007)
			handEmoji = "👉🏾";
		else if(drawPerPU <= 0.014)
			handEmoji = "👉🏽";
		else
			handEmoji = "👉🏻";
		
        if (tenDrawTimes == 0)
            returnText = [userName + " 抽卡總次數: " + times + "次。"];
		else returnText = [userName + " "+handEmoji+"抽卡總次數: " + times + "次。\n課了 " + Math.ceil(tenDrawTimes * 30 / 155) + " 單！"];
	
        db.getCurrentPU()
            .then(limtedData => {
                db.getServantsByStar(5)
                    .then(unlimitedData => {
                        returnText[returnText.length - 1] += "\n抽卡結果：\n";

                        let getLimitedHero = [];
                        let getLimitedHeroData = [];
                        for (let index = 0; index < drawResult[0]; index++)
                            getLimitedHero.push(Math.floor(Math.random() * limtedData.length));

                        getLimitedHero.forEach(index => {
                            getLimitedHeroData.push(limtedData[index]);
                        })
                        returnText[returnText.length - 1] += fgoOutputResultText_All(5, getLimitedHeroData, true);
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
									if(returnText.length <5)
										returnText.push(image);
                                } else if (returnText.indexOf(defaultImage) == -1)
									if(returnText.length <5)
										returnText.push(defaultImage);
								if(limtedData[index].summonDialog){
									if(returnText.length <5)
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
    let isGuarantee = false;
    for (let draw = 1; draw < 11; draw++) {
        if (draw == 10) {
            let nonThree = result.slice(0, 4);
            console.log(nonThree);
            isGuarantee = true;
			nonThree.forEach(data =>{
				if(data > 0) isGuarantee = false;
			});
        }
        result = fgoDraw(result, isGuarantee);
    }
    return result;
}


function fgoOutputResultText(star, data, isHero, num) {
    let returnText = isHero ? star + "星從者：" : star + "星禮裝：";
    if (num <= 0)
        return "";
    if (data != null) {
        let target = [];
        for (let index = 0; index < num; index++)
            target.push(data[Math.floor(Math.random() * data.length)].servantName);
        const result = Object.create(null);
        target.forEach(element => {
            result[element] = result[element] ? result[element] += 1 : 1;
        });

        returnText += "\n";
        const entries = Object.entries(result);
        entries.sort((a, b) => b[1] - a[1]);
        entries.forEach(obj => {
            returnText += "" + obj[0] + "：" + obj[1] + "\n";
        });
        console.log('fgoOutputResultText returnText = ' + returnText);
        return returnText;
    } else {
        returnText += num + "\n";
        console.log('fgoOutputResultText returnText = ' + returnText);
        return returnText;
    }
}

function fgoOutputResultText_All(star, data, isHero) {
    let returnText = isHero ? star + "星從者：" : star + "星禮裝：";

    if (data.length>0) {
        let target = [];
        data.forEach(content => {
            target.push(content.servantName);
        });
        const result = Object.create(null);
        target.forEach(element => {
            result[element] = result[element] ? result[element] += 1 : 1;
        });

        returnText += "\n";
        const entries = Object.entries(result);
        entries.sort((a, b) => b[1] - a[1]);
        entries.forEach(obj => {
            returnText += "" + obj[0] + "：" + obj[1] + "\n";
        });
        console.log('fgoOutputResultText returnText = ' + returnText);
        return returnText;
    }return "";
}