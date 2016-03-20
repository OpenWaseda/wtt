<?php

$youbiList = array("日", "月", "火", "水", "木", "金", "土");
$data = array();
$data[1][3] = "てすと";

function showTimeTable($data, $maxPeriod = 6){
	global $youbiList;
	print "<table class='table table-bordered'>";
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
			if(isset($data[$d][$p])){		
				print htmlspecialchars($data[$d][$p]);
			}
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
var currentFocusLabelSel;
var candidateClassResultAreaSel;
var youbiList = ["日", "月", "火", "水", "木", "金", "土"];

var classList = [
	// [day, period, 配当年次, 単位数
	// 履修登録学期区分(1: 春季, 2: 秋期, 3: 通年),
	// name, 科目区分],
	[1, 1, 1, 3, 6, "数学B2(微分積分) 基幹(1)", "数学　必修"],
	[1, 1, 1, 3, 6, "数学B2(微分積分) 基幹(2)", "数学　必修"],
	[1, 1, 1, 1, 2, "化学C　基幹　（化学未履修者用クラス）", ""],
	[1, 1, 1, 1, 2, "基礎の数学　基幹(3)-I", "数学　必修"],
	[1, 1, 1, 1, 2, "基礎の数学　基幹(3)-II", "数学　必修"],
	[1, 1, 2, 1, 1, "Concept Building And Discussion 1", "外国語　英語　必修"],
	[1, 1, 1, 2, 2, "Cプログラミング　基幹(3)", "情報関連科目　選択"],
	[1, 1, 1, 2, 2, "Cプログラミング　基幹(9)", "情報関連科目　選択"],
	[1, 1, 1, 2, 5, "数学A2（線形代数）　基幹(4)", "数学　必修"],
	[1, 1, 2, 2, 1, "Concept Building And Discussion 2", "外国語　英語　必修"],
];

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
	showCandidateClassTable(classList, d, p);
}

function showCandidateClassTable(cList, d, p){
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
	for(var i = 0; i < cList.length; i++){
		var c = cList[i];
		if(c[0] != d || c[1] != p){
			continue;
		}
		console.log(c);
		var td = $('<tr>')
			.append($('<td>').text(c[2]))
			.append($('<td>').text(c[3]))
			.append($('<td>').text(c[5]))
			.append($('<td>').text(c[6]))
			.append($('<td>').text(c[4]));
		tbody.append(td);
	}
	table.append(tbody);
	//
	console.log(table);
	console.log(candidateClassResultAreaSel);
	candidateClassResultAreaSel.empty().append(table);
} 

onload = function(){
	currentFocusLabelSel = $("#currentFocusLabel");
	candidateClassResultAreaSel = $("#candidateClassResultArea");
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
		<?php showTimeTable($data); ?>
		<h2>選択可能な授業</h2>
		<h4 id="currentFocusLabel">編集する時限を上から選択してください</h4>
		<div id="candidateClassResultArea"></div>
	</div>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
</body>
</html>
