var request = require('request');
var fs = require('fs');

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
	uri: 'https://www.wsl.waseda.jp/syllabus/JAA101.php',
	form: {
		"p_number": "50",
		"p_page": "1",
		"p_gakubu": "28",
		"pClsOpnSts": "123",
		"ControllerParameters": "JAA103SubCon",
		"pLng": "jp",
	},
	json: true
};

/*
26 0000100201 2017 2600001002 26
              year            gakubu
*/

/*
772 <option label="政経" value="111973">政経</option>
773 <option label="法学" value="121973">法学</option>
774 <option label="一文" value="132002">一文</option>
775 <option label="二文" value="142002">二文</option>
776 <option label="教育" value="151949">教育</option>
777 <option label="商学" value="161973">商学</option>
778 <option label="理工" value="171968">理工</option>
779 <option label="社学" value="181966">社学</option>
780 <option label="人科" value="192000">人科</option>
781 <option label="スポーツ" value="202003">スポーツ</option>
782 <option label="国際教養" value="212004">国際教養</option>
783 <option label="文構" value="232006">文構</option>
784 <option label="文" value="242006">文</option>
785 <option label="人通" value="252003">人通</option>
786 <option label="基幹" value="262006">基幹</option>
787 <option label="創造" value="272006">創造</option>
788 <option label="先進" value="282006">先進</option>
789 <option label="政研" value="311951">政研</option>
790 <option label="経研" value="321951">経研</option>
791 <option label="法研" value="331951">法研</option>
792 <option label="文研" value="342002">文研</option>
793 <option label="商研" value="351951">商研</option>
794 <option label="教研" value="371990">教研</option>
795 <option label="人研" value="381991">人研</option>
796 <option label="社学研" value="391994">社学研</option>
797 <option label="アジア研" value="402003">アジア研</option>
798 <option label="国情研" value="422000">国情研</option>
799 <option label="日研" value="432001">日研</option>
800 <option label="情シス研" value="442003">情シス研</option>
801 <option label="公共研" value="452003">公共研</option>
802 <option label="ファイナンス研" value="462004">ファイナンス研</option>
803 <option label="法務研" value="472004">法務研</option>
804 <option label="会計研" value="482005">会計研</option>
805 <option label="スポーツ研" value="502005">スポーツ研</option>
806 <option label="基幹研" value="512006">基幹研</option>
807 <option label="創造研" value="522006">創造研</option>
808 <option label="先進研" value="532006">先進研</option>
809 <option label="環エネ研" value="542006">環エネ研</option>
810 <option label="教職研" value="552007">教職研</option>
811 <option label="国際コミ研" value="562012">国際コミ研</option>
812 <option label="経管研" value="572015">経管研</option>
813 <option label="芸術" value="712001">芸術</option>
814 <option label="日本語" value="922006">日本語</option>
815 <option label="留学" value="982007">留学</option>
816 <option label="グローバル" value="9S2013">グローバル</option>
*/

var idList = new Array();

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
				fs.writeFile('id_' +
					idList[0].substr(12, 4) + '_' + 
					idList[0].substr(-2) + ".json", 
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
