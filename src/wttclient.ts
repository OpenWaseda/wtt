
class JQuery {
	tablesorter: any;
}

class WTTDatabase {
	periodTable = {};
	classList = {};
	availableList = [
		"2015_26",
		"2016_26",
		"2017_26",
	];
	wtt: WTT;
	constructor(wtt: WTT){
		var that = this;
		this.wtt = wtt;
		for(var i = 0; i < this.availableList.length; i++){
			var f_table = function(){
				var that2 = that;
				var key = that.availableList[i];
				return function(data){
					that2.periodTable[key] = data;
					that2.wtt.refreshTimeTable();
					that2.wtt.updateStatistics();
					//console.log("table " + key + " loaded");
				}
			}();
			var f_data = function(){
				var that2 = that;
				var key = that.availableList[i];
				return function(data){
					that2.classList[key] = data;
					that2.wtt.refreshTimeTable();
					that2.wtt.updateStatistics();
					//console.log("data " + key + " loaded");
				}
			}();
			$.getJSON("data/store/" + this.availableList[i] + "_conv_table.json", f_table);
			$.getJSON("data/store/" + this.availableList[i] + "_conv_data.json", f_data);
		}
		console.log(this);
	}
	getClassIDListForPeriod(year: number, gakubu: number, day: number, period: number){
		try{
			return this.periodTable["" + year + "_" + gakubu][day][period];
		} catch(e){
			return [];
		}
	}
	getClassInfoForClassID(id: string){
		try{
			return this.classList[id.substr(12, 4) + "_" + id.substr(-2)][id];
		} catch(e){
			return null;
		}
	}
	isClassIDOfYear(id: string, year: number): boolean
	{
		return parseInt(id.substr(12, 4), 10) == year;
	}
}

class WTT {
	currentFocusLabelSel: JQuery;
	candidateClassResultAreaSel: JQuery;
	timeTableSel: JQuery;
	statTableAreaSel: JQuery;
	timeTableCells = [];
	takingClassCodeList = [];
	currentTerm = 0;	// 0: 春学期 1: 秋学期
	currentYear = 2017;
	currentGakubu = 26;
	focusDay = -1;
	focusPeriod = -1;
	focusElemSel;
	focusListSel;
	focusListOldCSS;
	youbiList = ["日", "月", "火", "水", "木", "金", "土"];
	kamokuKubunList = {
		'綜合科目 選択必修': 		'A1',
		'特論科目 選択必修': 		'A1',
		'基礎科目 選択必修': 		'A1',
		'数学　必修':				'B1',
		'実験・実習・制作':			'B3',
		'専門必修':					'C1',
		'領域コース 必修':			'A1',
		'専門選択必修':				'C2',
		'外国語　英語　必修':		'A2',
		'外国語　英語　選択必修':	'A2',
		'外国語　英語　選択':		'A2',
		'実験・実習・制作　必修':	'B3',
		'情報関連科目　選択':		'B4',
		'自主挑戦科目':				'D',
		'専門選択':					'C3',
		'綜合科目 選択':			'A1',
		'自然科学　物理学　必修':	'B2',
		'自然科学　物理学　選択':	'B2',
		'自然科学　化学　必修':		'B2',
		'自然科学　生命科学　必修':	'B2',
		'情報関連科目　必修':		'B4',
	};
	//periodTable = [];
	//classList = [];
	db: WTTDatabase;
	constructor(){
		var that = this;
		/*
		$.getJSON("data/store/2017_26_conv_table.json" , function(data) {
			that.periodTable = data;
			that.refreshTimeTable();
		});
		$.getJSON("data/store/2017_26_conv_data.json" , function(data) {
			that.classList = data;
			that.refreshTimeTable();
		});
		 */
		this.db = new WTTDatabase(this);
		// Generate time table cells
		var ttArea = $("#timeTableArea");
		var table = $('<table>')
			.attr('id', 'timeTable')
			.addClass("table")
			.addClass("table-bordered");
		var thead = $('<thead>')
		var tr = $('<tr>')
			.append($('<th>').text("").css("width", "8%"))
		for(var i = 1; i < this.youbiList.length; i++){
			tr.append($('<th>').text(this.youbiList[i]))
		}
		thead.append(tr);
		var tbody = $('<tbody>');
		for(var i = 1; i <= 6; i++){
			var tr = $('<tr>');
			tr.append($('<th>').text(i));
			for(var k = 1; k < this.youbiList.length; k++){
				var f = function(){
					var that2 = that;
					var period = i;
					var day = k;
					return function(){ that2.moveTTFocus(day, period) };
				}();
				tr.append($('<td>').on("click", f));
			}
			tbody.append(tr);
		}
		table.append(thead).append(tbody);
		ttArea.append(table);
		//
		this.currentFocusLabelSel = $("#currentFocusLabel");
		this.candidateClassResultAreaSel = $("#candidateClassResultArea");
		this.timeTableSel = $("#timeTable");
		this.statTableAreaSel = $("#statTableArea");
		//
		var rowList = this.timeTableSel[0].children[1].children;
		for(var p = 0; p < rowList.length; p++){
			var days = rowList[p].children;
			for(var d = 1; d < days.length; d++){
				var t = days[d];
				if(!this.timeTableCells[d]) this.timeTableCells[d] = [];
				this.timeTableCells[d][p + 1] = $(t);
			}
		}
		// Restore Data
		this.load();
		//
		this.refreshTimeTable();
		this.updateStatistics();
		$('#erasePeriodButton').on("click", function(){
			that.erasePeriod();
		})
		$('#termSelector').on("change", function(){
			that.termChanged(this);
		})
		$('#yearSelector').on("change", function(){
			that.yearChanged(this);
		})
	}
	save(){
		var d = {
			takingClassCodeList: this.takingClassCodeList
		}
		localStorage["default"] = JSON.stringify(d);
	}
	load(){
		if(localStorage["default"]){
			var d = JSON.parse(localStorage["default"]);
			if(d.takingClassCodeList instanceof Array){
				this.takingClassCodeList = d.takingClassCodeList;
				return;
			}
		}
		this.takingClassCodeList = new Array();
	}
	moveTTFocus(d, p){
		this.focusDay = d;
		this.focusPeriod = p;
		this.currentFocusLabelSel.text(this.youbiList[d] + "曜" + p + "限");
		if(this.focusElemSel){
			this.focusElemSel.css("border", this.focusElemSel.oldCSS);
		}
		this.focusElemSel = this.timeTableCells[d][p];
		this.focusElemSel.oldCSS = this.focusElemSel.css("border");
		this.focusElemSel.css("border", "2px solid #ff0000");
		//
		this.showCandidateClassTable(d, p);
	}
	moveCLFocus(elem, code){
		if(this.focusListSel){
			this.focusListSel.css("border", this.focusListOldCSS);
		}
		this.focusListSel = $(elem);
		this.focusListOldCSS = this.focusListSel.css("border");
		this.focusListSel.css("border", "2px solid #ff0000");
		//
		this.takeClass(code);
	}
	showCandidateClassTable(d, p){
		var that = this;
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
		this.candidateClassResultAreaSel.empty();
		var classIDList = this.db.getClassIDListForPeriod(this.currentYear, this.currentGakubu, d, p);
		if(!classIDList){
			return;
		}
		for(var i = 0; i < classIDList.length; i++){
			var code = classIDList[i];
			var c = this.db.getClassInfoForClassID(code);
			if(!this.isInCurrentTerm(c, code)){
				continue;
			}
			var f = function(){
				var that2 = that;
				var classID = code;
				return function(){ that2.moveCLFocus(this, classID); };
			}();
			var td = $('<tr>')
				.append($('<td>').text(c[1]))
				.append($('<td>').text(c[3]))
				.append($('<td>').append($('<a>').text(c[4]).attr("href", c[6]).attr("target", "_blank")))
				.append($('<td>').text(c[5]).addClass("kk-" + this.kamokuKubunList[c[5]]))
				.append($('<td>').text(c[2]))
				.on("click", f);
			tbody.append(td);
		}
		table.append(tbody);
		//
		this.candidateClassResultAreaSel.append(table);
		table.tablesorter(); 
	} 
	erasePeriod(){
		var code = this.focusElemSel.classCode;
		if(!code){
			console.log("Invalid code " + code);
		}
		this.takingClassCodeList.removeAnObject(code);
		this.save();
		this.refreshTimeTable();
		this.updateStatistics();
	}
	takeClass(code){
		this.takingClassCodeList.pushUnique(code);
		this.save();
		this.refreshTimeTable();
		this.updateStatistics();
	}
	updateStatistics(){
		var stat = {
			"A1":0,
			"A2":0,
			"B1":0,
			"B2":0,
			"B3":0,
			"B4":0,
			"C1":0,
			"C2":0,
			"C3":0,
			"D":0,
			"unknown":0,
			"sum":0
		};
		for(var i = 0; i < this.takingClassCodeList.length; i++){
			var code = this.takingClassCodeList[i];
			var c = this.db.getClassInfoForClassID(code);
			if(!c){
				continue;
			}
			if(this.kamokuKubunList[c[5]]){
				stat[this.kamokuKubunList[c[5]]] += c[2];
			} else{
				stat["unknown"] += c[2];	
			}
			stat["sum"] += c[2];
		}
		
		//
		var table = $('<table>')
			.addClass("table")
			.addClass("table-bordered");
		var th0 = $('<tr>')
			.append($('<th>').text("A群").attr("colspan", "2"))
			.append($('<th>').text("B群").attr("colspan", "4"))
			.append($('<th>').text("C群").attr("colspan", "3"))
			.append($('<th>').text("D").addClass("kk-D").attr("rowspan", "2"))
			.append($('<th>').text("他").attr("rowspan", "2"))
			.append($('<th>').text("計").attr("rowspan", "2"));
		var th1 = $('<tr>')
			.append($('<th>').text("A1").addClass("kk-A1"))
			.append($('<th>').text("A2").addClass("kk-A2"))
			.append($('<th>').text("B1").addClass("kk-B1"))
			.append($('<th>').text("B2").addClass("kk-B2"))
			.append($('<th>').text("B3").addClass("kk-B3"))
			.append($('<th>').text("B4").addClass("kk-B4"))
			.append($('<th>').text("必修").addClass("kk-C1"))
			.append($('<th>').text("選択必修").addClass("kk-C2"))
			.append($('<th>').text("選択").addClass("kk-C3"));
		table.append($('<thead>').append(th0).append(th1));
		var tbody = $('<tbody>');
		var td = $('<tr>')
			.append($('<td>').text(stat["A1"]))
			.append($('<td>').text(stat["A2"]))
			.append($('<td>').text(stat["B1"]))
			.append($('<td>').text(stat["B2"]))
			.append($('<td>').text(stat["B3"]))
			.append($('<td>').text(stat["B4"]))
			.append($('<td>').text(stat["C1"]))
			.append($('<td>').text(stat["C2"]))
			.append($('<td>').text(stat["C3"]))
			.append($('<td>').text(stat["D"]))
			.append($('<td>').text(stat["unknown"]))
			.append($('<td>').text(stat["sum"]));
		tbody.append(td);
		table.append(tbody);
		console.log(stat);
		//
		this.statTableAreaSel.empty().append(table);
	}

	termChanged(selector){
		this.currentTerm = selector.value;
		this.refreshTimeTable();
		this.updateStatistics();
	}

	yearChanged(selector){
		this.currentYear = selector.value;
		this.refreshTimeTable();
		this.updateStatistics();
	}

	refreshTimeTable(){
		for(var d = 1; d < 7; d++){
			for(var p = 1; p < 7; p++){
				this.timeTableCells[d][p].empty();
				this.timeTableCells[d][p].classCode = null;
				this.timeTableCells[d][p].removeClass();
			}
		}

		for(var i = 0; i < this.takingClassCodeList.length; i++){
			var code = this.takingClassCodeList[i];
			var c = this.db.getClassInfoForClassID(code);
			if(!c){
				console.log("Invalid classcode:" + code);
				return;
			}
			if(!this.isInCurrentTerm(c, code)){
				continue;
			}
			var pList = c[0];
			for(var p = 0; p < pList.length; p++){
				this.timeTableCells[pList[p][0]][pList[p][1]].empty()
					.append($('<a>').text(c[4]).attr("href", c[6]).attr("target", "_blank"))
					.append($('<small>').text("(" + c[2] + "単位)"))
					.append($('<div>').append($('<small>').text(c[8])/*.attr("class", "pull-right")*/));
				if(this.timeTableCells[pList[p][0]][pList[p][1]].classCode){
					window.alert(this.youbiList[pList[p][0]] + "曜" + pList[p][1] + "限に重複している授業があります。");
					console.log("duplicate class at (" + pList[p][0] + "," + pList[p][1] + ")");
				}
				this.timeTableCells[pList[p][0]][pList[p][1]].classCode = code;
				if(this.kamokuKubunList[c[5]]){
					this.timeTableCells[pList[p][0]][pList[p][1]].addClass("kk-" + this.kamokuKubunList[c[5]]);
				}
			}
			
		}
	}

	isInCurrentTerm(c, id){
		return (c[3].indexOf('通') != -1 ||
			(this.currentTerm == 0 && c[3].indexOf('春') != -1) ||
			(this.currentTerm == 1 && c[3].indexOf('秋') != -1)) &&
			this.db.isClassIDOfYear(id, this.currentYear);
	}
}
$(function() {
	new WTT();
});

