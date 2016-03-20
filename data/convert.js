var fs = require('fs');

function findData(m0, mp, me, env){
	var s, t;
	env.p = env.text.indexOf(m0, env.p + 1) + m0.length;
	env.p = env.text.indexOf(mp, env.p + 1);
	s = env.p + mp.length;
	env.p = env.text.indexOf(me, env.p + 1);
	t = env.p;
	return env.text.substring(s, t);
}

fs.readFile('./kikan_all.txt', 'utf8', function (err, text) {
	var env = new Object();
	var tList = new Object();
	env.p = -1;
	env.text = text;
	for(;;){
		var t = new Object();
    	env.p = text.indexOf("授業情報", env.p + 1);
		if(env.p == -1){
			break;
		}
		console.log(env.p);
		t["開講年度"]		= findData("<td", ">", "<", env);
		t["開講箇所"]		= findData("<td", ">", "<", env);
		t["科目名"]			= findData("<td", "div>", "<", env);
		t["担当教員"]		= findData("<td", ">", "<", env);
		t["学期曜日時限"]	= findData("<td", ">", "<", env);
		t["科目区分"]		= findData("<td", ">", "<", env);
		t["配当年次"]		= findData("<td", ">", "<", env);
		t["単位数"]			= findData("<td", ">", "<", env);
		t["使用教室"]			= findData("<td", ">", "<", env);
		t["キャンパス"]			= findData("<td", ">", "<", env);
		t["科目キー"]			= findData("<td", ">", "<", env);
		t["科目クラスコード"]	= findData("<td", ">", "<", env);
		t["授業で使用する言語"]	= findData("<td", ">", "<", env);
		t["コース・コード"]	= findData("<td", ">", "<", env);
		t["大分野名称"]	= findData("<td", ">", "<", env);
		t["中分野名称"]	= findData("<td", ">", "<", env);
		t["小分野名称"]	= findData("<td", ">", "<", env);
		t["レベル"]	= findData("<td", ">", "<", env);
		t["授業形態"]	= findData("<td", ">", "<", env);
		t["pKey"]	= findData('<input type="hidden" name="pKey"', '"', '"', env);
		t["URL"] = "https://www.wsl.waseda.jp/syllabus/JAA104.php?pKey=" + t["pKey"] + "&pLng=jp"
		tList[t["pKey"]] = t;
	}
	console.log(tList);
});
