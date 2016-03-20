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
	</style>
	<script>

var focusDay = -1, focusPeriod = -1, focusElemSel, focusElemOldCSS;
var focusListSel, focusListOldCSS;
var timeTableSel;
var currentFocusLabelSel;
var candidateClassResultAreaSel;
var youbiList = ["日", "月", "火", "水", "木", "金", "土"];

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
	var c = classList[code];
	focusElemSel.text(c[4]);
	localStorage[focusDay + "_" + focusPeriod] = code;
}

function showCandidateClassTable(d, p){
	var table = $('<table>')
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
} 

function erasePeriod(){
	focusElemSel.text("");
	localStorage.removeItem(focusDay + "_" + focusPeriod);
}

onload = function(){
	currentFocusLabelSel = $("#currentFocusLabel");
	candidateClassResultAreaSel = $("#candidateClassResultArea");
	timeTableSel = $("#timeTable");
	//
	var rowList = timeTableSel[0].children[1].children;
	for(var p = 0; p < rowList.length; p++){
		var days = rowList[p].children;
		//console.log(days);
		for(d = 1; d < days.length; d++){
			var t = days[d];
			var code = localStorage[d + "_" + (p + 1)];
			//console.log(code);
			if(code){
				var c = classList[code];
				if(c){
					$(t).text(c[4]);
				}
			}
		}
	}
}

	</script>
	<!--[if lt IE 9]>
		<script src="//oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="//oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
</head>
<body>
	<div class="container">
		<h1>WTT</h1>
		<h2>現在の時間割</h2>
		<?php showTimeTable(); ?>
		<button onclick="erasePeriod()"><span class="glyphicon glyphicon-erase"></span></button>
		<h2>選択可能な授業</h2>
		<h4 id="currentFocusLabel">編集する時限を上から選択してください</h4>
		<div id="candidateClassResultArea"></div>
	</div>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
</body>
</html>
