const db = require('./pgp.js');
const fgoDrawProperty = [0.7, 0.3, 4, 3, 12, 40, 40];
const fgoDrawResultText = ["PU五星從者", "非PU五星從者", "五星禮裝", "四星從者", "四星禮裝", "三星禮裝", "三星從者"];

var tenDrawTimes = 0;
var returnText;
var drawResult = [0,0,0,0,0,0,0,0];
var currentPU = "阿比";

module.exports = {
	getCurrentPU: function(){
		console.log(db.getHerosByStar(5));
	},
    getDrawResult: function(userName, times){
    	initial();
    	let lastTimes = times;
    	if(lastTimes > 0){
	    	while(lastTimes>10){
	    		drawResult = fgoDraw10Times(drawResult);
	    		lastTimes-=10;
	    	}
	    	while(lastTimes > 0){
	    		drawResult = fgoDraw(drawResult,false);
	    		lastTimes--;
	    	}
    	}else{
    		do{
    			drawResult = fgoDraw10Times(drawResult);
    			tenDrawTimes++;
    		}while(drawResult[0] == 0);
    		times = tenDrawTimes*10;
    	}
    	if(tenDrawTimes == 0)
    		returnText = [userName +" 抽卡總次數: "+ times+"次。"];
    	else returnText = [userName +" 抽卡總次數: "+ times+"次。  課了 "+ Math.ceil(tenDrawTimes*30/155)+" 單！"];
    	let list = "";
    	for(let index = 0 ; index < drawResult.length-1; index++){
			if(drawResult[index]!=0){
				list += "\n" +fgoDrawResultText[index] + " : " + drawResult[index];
			}
		}
    	returnText.push("抽卡結果:"+list);
		
		returnText = fgoDrawResultPicture(drawResult,returnText);
		return returnText;
    },
}

function initial(){
	drawResult = [0,0,0,0,0,0,0,0];
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