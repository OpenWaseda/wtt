<?php

$youbiList = array("日", "月", "火", "水", "木", "金", "土");

function showTimeTable($maxPeriod = 6){
	global $youbiList;
	print "<table id='timeTable' class='table table-bordered'>";
	print "<thead><tr>";
	print "<th style='width: 8%;'></th>";
	for($d = 1; $d < 7; $d++){
		print "<td>{$youbiList[$d]}</td>";
	}
	print "</tr></thead>";
	print "<tbody>";
	for($p = 1; $p <= $maxPeriod; $p++){
		print "<tr>";
		print "<th>{$p}</th>";
		for($d = 1; $d < 7; $d++){
			print"<td onclick='moveTTFocus(this, {$d}, {$p});'>";
			print "</td>";
		}
		print "</tr>";
	}
	print "</tbody>";
	print "</table>";
}

?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>WTT</title>
	<link rel="stylesheet" type="text/css" href="css/bootstrap.css">
	<style type="text/css">
table {
	table-layout: fixed;
}

.kk-A1 {
	background-color: #ff5852;
}
.kk-A2 {
	background-color: #ffa8c7;
}
.kk-B1 {
	background-color: #a1beff;
}
.kk-B2 {
	background-color: #c7ff7d;
}
.kk-B3 {
	background-color: #74ff4f;
}
.kk-B4 {
	background-color: #39beff;
}
.kk-C {
	background-color: #fff1b1;
}
.kk-D {
	background-color: #9489ff;
}
.kk-A1 {
	background-color: #ff5852;
}
.kk-A1 {
	background-color: #ff5852;
}
	</style>
	<script>

var focusDay = -1, focusPeriod = -1, focusElemSel, focusElemOldCSS;
var focusListSel, focusListOldCSS;
var timeTableSel;
var statTableAreaSel;
var timeTableCells = [[], [], [], [], [], [], []];
var currentFocusLabelSel;
var candidateClassResultAreaSel;
var youbiList = ["日", "月", "火", "水", "木", "金", "土"];
var kamokuKubunList = {
	'綜合科目 選択必修': 		'A1',
	'特論科目 選択必修': 		'A1',
	'基礎科目 選択必修': 		'A1',
	'数学　必修':				'B1',
	'実験・実習・制作':			'B3',
	'専門必修':					'C',
	'領域コース 必修':			'A1',
	'専門選択必修':				'C',
	'外国語　英語　必修':		'A2',
	'外国語　英語　選択必修':	'A2',
	'外国語　英語　選択':		'A2',
	'実験・実習・制作　必修':	'B3',
	'情報関連科目　選択':		'B4',
	'自主挑戦科目':				'D',
	'専門選択':					'C',
	'綜合科目 選択':			'A1',
	'自然科学　物理学　必修':	'B2',
	'自然科学　物理学　選択':	'B2',
	'自然科学　化学　必修':		'B2',
	'自然科学　生命科学　必修':	'B2',
	'情報関連科目　必修':		'B4',
};
var takingClassCodeList = new Array();

<?php
	$str = file_get_contents("./data/2016_kikan_index.json");
	print("var periodTable = " . $str . "\n");
	$str = file_get_contents("./data/2016_kikan.json");
	print("var classList = " . $str . "\n");
?>

function moveTTFocus(elem, d, p){
	focusDay = d;
	focusPeriod = p;
	currentFocusLabelSel.text(youbiList[d] + "曜" + p + "限");
	if(focusElemSel){
		focusElemSel.css("border", focusElemOldCSS);
	}
	focusElemSel = $(elem);
	focusElemOldCSS = focusElemSel.css("border");
	focusElemSel.css("border", "2px solid #ff0000");
	//
	showCandidateClassTable(d, p);
}

function moveCLFocus(elem, code){
	console.log(code);
	//
	if(focusListSel){
		focusListSel.css("border", focusListOldCSS);
	}
	focusListSel = $(elem);
	focusListOldCSS = focusListSel.css("border");
	focusListSel.css("border", "2px solid #ff0000");
	//
	takeClass(code);
}

function showCandidateClassTable(d, p){
	var table = $('<table>')
		.addClass("tablesorter")
		.addClass("table")
		.addClass("table-bordered");
	var th = $('<tr>')
		.append($('<th>').text("学年").css("width", "10%"))
		.append($('<th>').text("学期").css("width", "10%"))
		.append($('<th>').text("授業名"))
		.append($('<th>').text("科目群").css("width", "20%"))
		.append($('<th>').text("単位数").css("width", "10%"));
	table.append($('<thead>').append(th));
	var tbody = $('<tbody>');
	var classIDList = periodTable[d][p];
	for(var i = 0; i < classIDList.length; i++){
		var c = classList[classIDList[i]];
		var td = $('<tr>')
			.append($('<td>').text(c[1]))
			.append($('<td>').text(c[3]))
			.append($('<td>').append($('<a>').text(c[4]).attr("href", c[6]).attr("target", "_blank")))
			.append($('<td>').text(c[5]))
			.append($('<td>').text(c[2]))
			.attr("onclick", "moveCLFocus(this, '"+classIDList[i]+"')");
		tbody.append(td);
	}
	table.append(tbody);
	//
	//console.log(table);
	//console.log(candidateClassResultAreaSel);
	candidateClassResultAreaSel.empty().append(table);
	table.tablesorter(); 
} 

function erasePeriod(){
	var code = timeTableCells[focusDay][focusPeriod].classCode;
	var c = classList[code];
	if(!c){
		console.log("Invalid classcode.")
		return;
	}
	var pList = c[0];
	for(var i = 0; i < pList.length; i++){
		timeTableCells[pList[i][0]][pList[i][1]].text("");
		timeTableCells[pList[i][0]][pList[i][1]].classCode = null;
		if(kamokuKubunList[c[5]]){
			timeTableCells[pList[i][0]][pList[i][1]].removeClass();
		}
	}
	focusElemSel.text("");
	takingClassCodeList.removeAnObject(code);
	localStorage["defaultTable"] = JSON.stringify(takingClassCodeList);
	updateStatistics();
}

function takeClass(code){
	var c = classList[code];
	if(!c){
		console.log("Invalid classcode.")
		return;
	}
	var pList = c[0];
	for(var i = 0; i < pList.length; i++){
		timeTableCells[pList[i][0]][pList[i][1]].text(c[4]);
		timeTableCells[pList[i][0]][pList[i][1]].classCode = code;
		if(kamokuKubunList[c[5]]){
			timeTableCells[pList[i][0]][pList[i][1]].addClass("kk-" + kamokuKubunList[c[5]]);
		}
	}
	takingClassCodeList.pushUnique(code);
	localStorage["defaultTable"] = JSON.stringify(takingClassCodeList);
	updateStatistics();
}

function updateStatistics(){
	var stat = {
		"A1":0,
		"A2":0,
		"B1":0,
		"B2":0,
		"B3":0,
		"B4":0,
		"C":0,
		"D":0,
		"sum":0
	};
	for(var i = 0; i < takingClassCodeList.length; i++){
		var code = takingClassCodeList[i];
		var c = classList[code];
		if(!c){
			continue;
		}
		if(kamokuKubunList[c[5]]){
			stat[kamokuKubunList[c[5]]] += c[2];
			stat["sum"] += c[2];
		} else{
			console.log("Unknown kamokukubun " + c[5]);
		}
	}
	
	//
	var table = $('<table>')
		.addClass("table")
		.addClass("table-bordered");
	var th = $('<tr>')
		.append($('<th>').text("A1").addClass("kk-A1"))
		.append($('<th>').text("A2").addClass("kk-A2"))
		.append($('<th>').text("B1").addClass("kk-B1"))
		.append($('<th>').text("B2").addClass("kk-B2"))
		.append($('<th>').text("B3").addClass("kk-B3"))
		.append($('<th>').text("B4").addClass("kk-B4"))
		.append($('<th>').text("C").addClass("kk-C"))
		.append($('<th>').text("D").addClass("kk-D"))
		.append($('<th>').text("計"));
	table.append($('<thead>').append(th));
	var tbody = $('<tbody>');
	var td = $('<tr>')
		.append($('<td>').text(stat["A1"]))
		.append($('<td>').text(stat["A2"]))
		.append($('<td>').text(stat["B1"]))
		.append($('<td>').text(stat["B2"]))
		.append($('<td>').text(stat["B3"]))
		.append($('<td>').text(stat["B4"]))
		.append($('<td>').text(stat["C"]))
		.append($('<td>').text(stat["D"]))
		.append($('<td>').text(stat["sum"]));
	tbody.append(td);
	table.append(tbody);
	//
	statTableAreaSel.empty().append(table);
}

onload = function(){
	currentFocusLabelSel = $("#currentFocusLabel");
	candidateClassResultAreaSel = $("#candidateClassResultArea");
	timeTableSel = $("#timeTable");
	statTableAreaSel = $("#statTableArea");
	//
	var rowList = timeTableSel[0].children[1].children;
	for(var p = 0; p < rowList.length; p++){
		var days = rowList[p].children;
		for(d = 1; d < days.length; d++){
			var t = days[d];;
			timeTableCells[d][p + 1] = $(t);
		}
	}
	//
	if(localStorage["defaultTable"]){
		takingClassCodeList = JSON.parse(localStorage["defaultTable"]);
	} else{
		takingClassCodeList = new Array();
	}
	for(var i = 0; i < takingClassCodeList.length; i++){
		takeClass(takingClassCodeList[i]);
	}
}

	</script>
	<!--[if lt IE 9]>
		<script src="//oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="//oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
<?php require_once("analyticstracking.php") ?>
</head>
<body>
	<div class="container">
		<h1>WTT</h1>
		<h2>現在の時間割</h2>
		<button onclick="erasePeriod()"><span class="glyphicon glyphicon-erase"></span></button>
		<?php showTimeTable(); ?>
		<div id="statTableArea"></div>
		<h2>選択可能な授業</h2>
		<h4 id="currentFocusLabel">編集する時限を上から選択してください</h4>
		<div id="candidateClassResultArea"></div>
	</div>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="./js/jquery.tablesorter.js"></script>
	<script type="text/javascript" src="./js/ext.js"></script>
</body>
</html>
