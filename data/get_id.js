var request = require('request');
var fs = require('fs');
var path = require('path');

function findData(m0, mp, me, env){
	var s, t;
	env.p = env.text.indexOf(m0, env.p + 1) + m0.length - 1;
	env.p = env.text.indexOf(mp, env.p + 1);
	s = env.p + mp.length;
	env.p = env.text.indexOf(me, env.p + 1);
	t = env.p;
	return env.text.substring(s, t);
}

var opt = {
	uri: 'https://www.wsl.waseda.jp/syllabus/JAA102.php',
	form: {
		"nendo": "2015",
		"p_number": "50",
		"p_page": "1",
		"p_gakubu": "26",
		//"pClsOpnSts": "123",
		"ControllerParameters": "JAA103SubCon",
		"pLng": "jp",
	},
	json: true
};

/*
26 0000100201 2017 2600001002 26
              year            gakubu
*/

gakubuIDList = {};

gakubuIDList["11"] = "政経";
gakubuIDList["12"] = "法学";
gakubuIDList["13"] = "一文";
gakubuIDList["14"] = "二文";
gakubuIDList["15"] = "教育";
gakubuIDList["16"] = "商学";
gakubuIDList["17"] = "理工";
gakubuIDList["18"] = "社学";
gakubuIDList["19"] = "人科";
gakubuIDList["20"] = "スポーツ";
gakubuIDList["21"] = "国際教養";
gakubuIDList["23"] = "文構";
gakubuIDList["24"] = "文";
gakubuIDList["25"] = "人通";
gakubuIDList["26"] = "基幹";
gakubuIDList["27"] = "創造";
gakubuIDList["28"] = "先進";
gakubuIDList["31"] = "政研";
gakubuIDList["32"] = "経研";
gakubuIDList["33"] = "法研";
gakubuIDList["34"] = "文研";
gakubuIDList["35"] = "商研";
gakubuIDList["37"] = "教研";
gakubuIDList["38"] = "人研";
gakubuIDList["39"] = "社学研";
gakubuIDList["40"] = "アジア研";
gakubuIDList["42"] = "国情研";
gakubuIDList["43"] = "日研";
gakubuIDList["44"] = "情シス研";
gakubuIDList["45"] = "公共研";
gakubuIDList["46"] = "ファイナンス研";
gakubuIDList["47"] = "法務研";
gakubuIDList["48"] = "会計研";
gakubuIDList["50"] = "スポーツ研";
gakubuIDList["51"] = "基幹研";
gakubuIDList["52"] = "創造研";
gakubuIDList["53"] = "先進研";
gakubuIDList["54"] = "環エネ研";
gakubuIDList["55"] = "教職研";
gakubuIDList["56"] = "国際コミ研";
gakubuIDList["57"] = "経管研";
gakubuIDList["71"] = "芸術";
gakubuIDList["92"] = "日本語";
gakubuIDList["98"] = "留学";
gakubuIDList["9S"] = "グローバル";

var idList = new Array();

if(process.argv.length < 4){
	console.log("Usage: " + 
		path.basename(process.argv[1]) + " [year] [gakubuID]");
	return;
}

opt.form["nendo"] = process.argv[2];
opt.form["p_gakubu"] = process.argv[3];

if(!gakubuIDList[opt.form["p_gakubu"]]){
	console.log("Invalid GakubuID");
	return;
}

console.log(opt.form["nendo"] + "年度 " + 
	gakubuIDList[opt.form["p_gakubu"]]);

function getPage(page){
	opt.form["p_page"] = "" + page;
	console.log(page);
	request.post(opt, function(error, res, body){
		if (!error && res.statusCode == 200) {
			console.log("200 OK");
			var env = new Object();
			var endp;
			var cList = new Array();
			var id;
			env.text = body;
			env.p = 0;
			if(env.text.indexOf("ch-message") != -1){
				console.log("Out of Pages.");
				console.log(JSON.stringify(idList, "", "    "));
				fs.writeFile('store/' +
					idList[0].substr(12, 4) + '_' + 
					idList[0].substr(-2) + "_id.json", 
					JSON.stringify(idList, "", "  "));
				return;
			}
			env.p = env.text.indexOf("block_main_start", env.p + 1);
			env.p = env.text.indexOf("</tr>", env.p + 1);
			endp = env.text.indexOf("</table>", env.p + 1);
			for(;;){
				env.p = env.text.indexOf("<tr>", env.p + 1) + 1;
				if(env.p == 0 || env.p > endp){
					break;
				}
				findData("<td", ">", "<", env);
				findData("<td", ">", "<", env);
				id = findData("<td", ", '", "')", env);
				idList.push(id);
			}
			getPage(page + 1);
		} else {
			console.log('error: '+ res.statusCode);
			return;
		}
	});
}
getPage(1);
