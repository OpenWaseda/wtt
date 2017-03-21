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
			print"<td onclick='moveTTFocus({$d}, {$p});'>";
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
	<link rel="stylesheet" type="text/css" href="css/wtt.css">
	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script src="js/wttclient.js"></script>
	<!--[if lt IE 9]>
		<script src="//oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="//oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
<?php require_once("analyticstracking.php") ?>
</head>
<body>
	<div class="container">
		<h1>WTT</h1>
		<span>
			<select id="yearSelector" onchange="">
				<option value="2017" selected>2017年度</option> 
				<option value="2016">2016年度</option>
				<option value="2015">2015年度</option>
				<option value="2014">2014年度</option>
			</select>
			<select id="termSelector" onchange="termChanged(this);">
				<option value="0" selected>春学期・通年</option> 
				<option value="1">秋学期・通年</option>
			</select>
		</span>
		<button onclick="erasePeriod()"><span class="glyphicon glyphicon-erase"></span></button>
		<?php showTimeTable(); ?>
		<div id="statTableArea"></div>
		<h2>選択可能な授業</h2>
		<h4 id="currentFocusLabel">編集する時限を上から選択してください</h4>
		<div id="candidateClassResultArea"></div>
	</div>
	<script src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="./js/jquery.tablesorter.js"></script>
	<script type="text/javascript" src="./js/ext.js"></script>
</body>
</html>
