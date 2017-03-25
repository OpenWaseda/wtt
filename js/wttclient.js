var JQuery = (function () {
    function JQuery() {
    }
    return JQuery;
}());
var WTTDatabase = (function () {
    function WTTDatabase(wtt) {
        this.periodTable = {};
        this.classList = {};
        this.availableList = [
            "2015_26",
            "2016_26",
            "2017_26",
        ];
        var that = this;
        this.wtt = wtt;
        for (var i = 0; i < this.availableList.length; i++) {
            var f_table = function () {
                var that2 = that;
                var key = that.availableList[i];
                return function (data) {
                    that2.periodTable[key] = data;
                    that2.wtt.refreshTimeTable();
                    that2.wtt.updateStatistics();
                    console.log("table " + key + " loaded");
                };
            }();
            var f_data = function () {
                var that2 = that;
                var key = that.availableList[i];
                return function (data) {
                    that2.classList[key] = data;
                    that2.wtt.refreshTimeTable();
                    that2.wtt.updateStatistics();
                    console.log("data " + key + " loaded");
                };
            }();
            $.getJSON("data/store/" + this.availableList[i] + "_conv_table.json", f_table);
            $.getJSON("data/store/" + this.availableList[i] + "_conv_data.json", f_data);
        }
        console.log(this);
    }
    WTTDatabase.prototype.getClassIDListForPeriod = function (year, gakubu, day, period) {
        try {
            return this.periodTable["" + year + "_" + gakubu][day][period];
        }
        catch (e) {
            return [];
        }
    };
    WTTDatabase.prototype.getClassInfoForClassID = function (id) {
        try {
            return this.classList[id.substr(12, 4) + "_" + id.substr(-2)][id];
        }
        catch (e) {
            return null;
        }
    };
    WTTDatabase.prototype.isClassIDOfYear = function (id, year) {
        return parseInt(id.substr(12, 4), 10) == year;
    };
    return WTTDatabase;
}());
var WTT = (function () {
    function WTT() {
        this.timeTableCells = [];
        this.takingClassCodeList = [];
        this.currentTerm = 0; // 0: 春学期 1: 秋学期
        this.currentYear = 2017;
        this.currentGakubu = 26;
        this.focusDay = -1;
        this.focusPeriod = -1;
        this.youbiList = ["日", "月", "火", "水", "木", "金", "土"];
        this.kamokuKubunList = {
            '綜合科目 選択必修': 'A1',
            '特論科目 選択必修': 'A1',
            '基礎科目 選択必修': 'A1',
            '数学　必修': 'B1',
            '実験・実習・制作': 'B3',
            '専門必修': 'C1',
            '領域コース 必修': 'A1',
            '専門選択必修': 'C2',
            '外国語　英語　必修': 'A2',
            '外国語　英語　選択必修': 'A2',
            '外国語　英語　選択': 'A2',
            '実験・実習・制作　必修': 'B3',
            '情報関連科目　選択': 'B4',
            '自主挑戦科目': 'D',
            '専門選択': 'C3',
            '綜合科目 選択': 'A1',
            '自然科学　物理学　必修': 'B2',
            '自然科学　物理学　選択': 'B2',
            '自然科学　化学　必修': 'B2',
            '自然科学　生命科学　必修': 'B2',
            '情報関連科目　必修': 'B4'
        };
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
        var thead = $('<thead>');
        var tr = $('<tr>')
            .append($('<th>').text("").css("width", "8%"));
        for (var i = 1; i < this.youbiList.length; i++) {
            tr.append($('<th>').text(this.youbiList[i]));
        }
        thead.append(tr);
        var tbody = $('<tbody>');
        for (var i = 1; i <= 6; i++) {
            var tr = $('<tr>');
            tr.append($('<th>').text(i));
            for (var k = 1; k < this.youbiList.length; k++) {
                var f = function () {
                    var that2 = that;
                    var period = i;
                    var day = k;
                    return function () { that2.moveTTFocus(day, period); };
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
        for (var p = 0; p < rowList.length; p++) {
            var days = rowList[p].children;
            for (var d = 1; d < days.length; d++) {
                var t = days[d];
                if (!this.timeTableCells[d])
                    this.timeTableCells[d] = [];
                this.timeTableCells[d][p + 1] = $(t);
            }
        }
        // Restore Data
        this.load();
        //
        this.refreshTimeTable();
        this.updateStatistics();
        $('#erasePeriodButton').on("click", function () {
            that.erasePeriod();
        });
        $('#termSelector').on("change", function () {
            that.termChanged(this);
        });
        $('#yearSelector').on("change", function () {
            that.yearChanged(this);
        });
    }
    WTT.prototype.save = function () {
        var d = {
            takingClassCodeList: this.takingClassCodeList
        };
        localStorage["default"] = JSON.stringify(d);
    };
    WTT.prototype.load = function () {
        if (localStorage["default"]) {
            var d = JSON.parse(localStorage["default"]);
            if (d.takingClassCodeList instanceof Array) {
                this.takingClassCodeList = d.takingClassCodeList;
                return;
            }
        }
        this.takingClassCodeList = new Array();
    };
    WTT.prototype.moveTTFocus = function (d, p) {
        this.focusDay = d;
        this.focusPeriod = p;
        this.currentFocusLabelSel.text(this.youbiList[d] + "曜" + p + "限");
        if (this.focusElemSel) {
            this.focusElemSel.css("border", this.focusElemSel.oldCSS);
        }
        this.focusElemSel = this.timeTableCells[d][p];
        this.focusElemSel.oldCSS = this.focusElemSel.css("border");
        this.focusElemSel.css("border", "2px solid #ff0000");
        //
        this.showCandidateClassTable(d, p);
    };
    WTT.prototype.moveCLFocus = function (elem, code) {
        if (this.focusListSel) {
            this.focusListSel.css("border", this.focusListOldCSS);
        }
        this.focusListSel = $(elem);
        this.focusListOldCSS = this.focusListSel.css("border");
        this.focusListSel.css("border", "2px solid #ff0000");
        //
        this.takeClass(code);
    };
    WTT.prototype.showCandidateClassTable = function (d, p) {
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
        if (!classIDList) {
            return;
        }
        for (var i = 0; i < classIDList.length; i++) {
            var code = classIDList[i];
            var c = this.db.getClassInfoForClassID(code);
            if (!this.isInCurrentTerm(c, code)) {
                continue;
            }
            var f = function () {
                var that2 = that;
                var classID = code;
                return function () { that2.moveCLFocus(this, classID); };
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
    };
    WTT.prototype.erasePeriod = function () {
        var code = this.focusElemSel.classCode;
        if (!code) {
            console.log("Invalid code " + code);
        }
        this.takingClassCodeList.removeAnObject(code);
        this.save();
        this.refreshTimeTable();
        this.updateStatistics();
    };
    WTT.prototype.takeClass = function (code) {
        this.takingClassCodeList.pushUnique(code);
        this.save();
        this.refreshTimeTable();
        this.updateStatistics();
    };
    WTT.prototype.updateStatistics = function () {
        var stat = {
            "A1": 0,
            "A2": 0,
            "B1": 0,
            "B2": 0,
            "B3": 0,
            "B4": 0,
            "C1": 0,
            "C2": 0,
            "C3": 0,
            "D": 0,
            "unknown": 0,
            "sum": 0
        };
        for (var i = 0; i < this.takingClassCodeList.length; i++) {
            var code = this.takingClassCodeList[i];
            var c = this.db.getClassInfoForClassID(code);
            if (!c) {
                continue;
            }
            if (this.kamokuKubunList[c[5]]) {
                stat[this.kamokuKubunList[c[5]]] += c[2];
            }
            else {
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
    };
    WTT.prototype.termChanged = function (selector) {
        this.currentTerm = selector.value;
        this.refreshTimeTable();
        this.updateStatistics();
    };
    WTT.prototype.yearChanged = function (selector) {
        this.currentYear = selector.value;
        this.refreshTimeTable();
        this.updateStatistics();
    };
    WTT.prototype.refreshTimeTable = function () {
        for (var d = 1; d < 7; d++) {
            for (var p = 1; p < 7; p++) {
                this.timeTableCells[d][p].empty();
                this.timeTableCells[d][p].classCode = null;
                this.timeTableCells[d][p].removeClass();
            }
        }
        for (var i = 0; i < this.takingClassCodeList.length; i++) {
            var code = this.takingClassCodeList[i];
            var c = this.db.getClassInfoForClassID(code);
            if (!c) {
                console.log("Invalid classcode:" + code);
                return;
            }
            if (!this.isInCurrentTerm(c, code)) {
                continue;
            }
            var pList = c[0];
            for (var p = 0; p < pList.length; p++) {
                this.timeTableCells[pList[p][0]][pList[p][1]].empty()
                    .append($('<a>').text(c[4]).attr("href", c[6]).attr("target", "_blank"))
                    .append($('<small>').text("(" + c[2] + "単位)"))
                    .append($('<div>').append($('<small>').text(c[8]) /*.attr("class", "pull-right")*/));
                if (this.timeTableCells[pList[p][0]][pList[p][1]].classCode) {
                    window.alert(this.youbiList[pList[p][0]] + "曜" + pList[p][1] + "限に重複している授業があります。");
                    console.log("duplicate class at (" + pList[p][0] + "," + pList[p][1] + ")");
                }
                this.timeTableCells[pList[p][0]][pList[p][1]].classCode = code;
                if (this.kamokuKubunList[c[5]]) {
                    this.timeTableCells[pList[p][0]][pList[p][1]].addClass("kk-" + this.kamokuKubunList[c[5]]);
                }
            }
        }
    };
    WTT.prototype.isInCurrentTerm = function (c, id) {
        return (c[3].indexOf('通') != -1 ||
            (this.currentTerm == 0 && c[3].indexOf('春') != -1) ||
            (this.currentTerm == 1 && c[3].indexOf('秋') != -1)) &&
            this.db.isClassIDOfYear(id, this.currentYear);
    };
    return WTT;
}());
$(function () {
    new WTT();
});
;
Array.prototype.removeAllObject = function (anObject) {
    //Array中にある全てのanObjectを削除し、空いた部分は前につめる。
    //戻り値は削除が一回でも実行されたかどうか
    var ret = false;
    for (var i = 0; i < this.length; i++) {
        if (this[i] == anObject) {
            this.splice(i, 1);
            ret = true;
            i--;
        }
    }
    return ret;
};
Array.prototype.removeAnObject = function (anObject, fEqualTo) {
    //Array中にある最初のanObjectを削除し、空いた部分は前につめる。
    //fEqualToは省略可能で、評価関数fEqualTo(array[i], obj)を設定する。
    //戻り値は削除が実行されたかどうか
    if (!(fEqualTo instanceof Function)) {
        fEqualTo = function (a, b) { return (a == b); };
    }
    for (var i = 0; i < this.length; i++) {
        if (fEqualTo(this[i], anObject)) {
            this.splice(i, 1);
            return true;
        }
    }
    return false;
};
Array.prototype.removeByIndex = function (index, length) {
    //Array[index]を削除し、空いた部分は前につめる。
    if (length === undefined) {
        length = 1;
    }
    this.splice(index, length);
    return;
};
Array.prototype.insertAtIndex = function (index, data) {
    this.splice(index, 0, data);
    return;
};
Array.prototype.symmetricDifferenceWith = function (b, fEqualTo) {
    // 対称差(XOR)集合を求める
    // fEqualToは省略可能で、評価関数fEqualTo(a[i], b[j])を設定する。
    var a = this.copy();
    var ei;
    for (var i = 0, len = b.length; i < len; i++) {
        ei = a.getIndex(b[i], fEqualTo);
        if (ei != -1) {
            a.removeByIndex(ei);
        }
        else {
            a.push(b[i]);
        }
    }
    return a;
};
Array.prototype.intersectionWith = function (b, fEqualTo) {
    //積集合（AND）を求める
    //fEqualToは省略可能で、評価関数fEqualTo(a[i], b[j])を設定する。
    var r = new Array();
    for (var i = 0, len = b.length; i < len; i++) {
        if (this.includes(b[i], fEqualTo)) {
            r.push(b[i]);
        }
    }
    return r;
};
Array.prototype.unionWith = function (b, fEqualTo) {
    //和集合（OR）を求める
    //fEqualToは省略可能で、評価関数fEqualTo(a[i], b[j])を設定する。
    var r = new Array();
    for (var i = 0, len = b.length; i < len; i++) {
        if (!this.includes(b[i], fEqualTo)) {
            r.push(b[i]);
        }
    }
    return this.concat(r);
};
Array.prototype.isEqualTo = function (b, fEqualTo) {
    //retv: false or true.
    //二つの配列が互いに同じ要素を同じ個数だけ持つか調べる。
    //fEqualToは省略可能で、評価関数fEqualTo(a[i], b[i])を設定する。
    //fEqualToが省略された場合、二要素が全く同一のオブジェクトかどうかによって評価される。
    var i, iLen;
    if (!(b instanceof Array) || this.length !== b.length) {
        return false;
    }
    iLen = this.length;
    if (fEqualTo == undefined) {
        for (i = 0; i < iLen; i++) {
            if (this[i] !== b[i]) {
                break;
            }
        }
    }
    else {
        for (i = 0; i < iLen; i++) {
            if (fEqualTo(this[i], b[i])) {
                break;
            }
        }
    }
    if (i === iLen) {
        return true;
    }
    return false;
};
Array.prototype.includes = function (obj, fEqualTo) {
    //含まれている場合は配列内のそのオブジェクトを返す
    //fEqualToは省略可能で、評価関数fEqualTo(array[i], obj)を設定する。
    if (fEqualTo == undefined) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (this[i] == obj) {
                return this[i];
            }
        }
    }
    else {
        for (var i = 0, len = this.length; i < len; i++) {
            if (fEqualTo(this[i], obj)) {
                return this[i];
            }
        }
    }
    return false;
};
Array.prototype.getIndex = function (obj, fEqualTo) {
    // 含まれている場合は配列内におけるそのオブジェクトの添字を返す。
    // 見つからなかった場合、-1を返す。
    //fEqualToは省略可能で、評価関数fEqualTo(array[i], obj)を設定する。
    if (fEqualTo == undefined) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
    }
    else {
        for (var i = 0, len = this.length; i < len; i++) {
            if (fEqualTo(this[i], obj)) {
                return i;
            }
        }
    }
    return -1;
};
Array.prototype.getAllMatched = function (obj, fEqualTo) {
    // 評価関数が真となる要素をすべて含んだ配列を返す。
    // 返すべき要素がない場合は空配列を返す。
    // fEqualToは省略可能で、評価関数fEqualTo(array[i], obj)を設定する。
    var retArray = new Array();
    if (fEqualTo == undefined) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (this[i] == obj) {
                retArray.push(this[i]);
            }
        }
    }
    else {
        for (var i = 0, len = this.length; i < len; i++) {
            if (fEqualTo(this[i], obj)) {
                retArray.push(this[i]);
            }
        }
    }
    return retArray;
};
/*
Array.prototype.last = function(n){
    var n = (n === undefined) ? 1 : n;
    return this[this.length - n];
}
Array.prototype.search2DLineIndex = function(column, obj, fEqualTo){
    //与えられた配列を二次元配列として解釈し
    //array[n][column]がobjと等価になる最初の行nを返す。
    //fEqualToは省略可能で、評価関数fEqualTo(array[n][column], obj)を設定する。
    //該当する行がなかった場合、戻り値はundefinedとなる。
    if(fEqualTo == undefined){
        for(var i = 0, iLen = this.length; i < iLen; i++){
            if(this[i] instanceof Array && this[i][column] == obj){
                return i;
            }
        }
    } else{
        for(var i = 0, iLen = this.length; i < iLen; i++){
            if(this[i] instanceof Array && fEqualTo(this[i][column], obj)){
                return i;
            }
        }
    }
    return undefined;
}
Array.prototype.search2DObject = function(searchColumn, retvColumn, obj, fEqualTo){
    //与えられた配列を二次元配列として解釈し
    //array[n][searchColumn]がobjと等価になる最初の行のオブジェクトarray[n][retvColumn]を返す。
    //fEqualToは省略可能で、評価関数fEqualTo(array[n][searchColumn], obj)を設定する。
    //該当する行がなかった場合、戻り値はundefinedとなる。
    if(fEqualTo == undefined){
        for(var i = 0, iLen = this.length; i < iLen; i++){
            if(this[i] instanceof Array && this[i][searchColumn] == obj){
                return this[i][retvColumn];
            }
        }
    } else{
        for(var i = 0, iLen = this.length; i < iLen; i++){
            if(this[i] instanceof Array && fEqualTo(this[i][searchColumn], obj)){
                return this[i][retvColumn];
            }
        }
    }
    return undefined;
}
*/
Array.prototype.pushUnique = function (obj, fEqualTo) {
    //値が既に存在する場合は追加しない。評価関数fEqualTo(array[i], obj)を設定することができる。
    //結果的に配列内にあるオブジェクトが返される。
    var o = this.includes(obj, fEqualTo);
    if (!o) {
        this.push(obj);
        return obj;
    }
    return o;
};
Array.prototype.stableSort = function (f) {
    // http://blog.livedoor.jp/netomemo/archives/24688861.html
    // Chrome等ではソートが必ずしも安定ではないので、この関数を利用する。
    if (f == undefined) {
        f = function (a, b) { return a - b; };
    }
    for (var i = 0; i < this.length; i++) {
        this[i].__id__ = i;
    }
    this.sort.call(this, function (a, b) {
        var ret = f(a, b);
        if (ret == 0) {
            return (a.__id__ > b.__id__) ? 1 : -1;
        }
        else {
            return ret;
        }
    });
    for (var i = 0; i < this.length; i++) {
        delete this[i].__id__;
    }
};
/*
Array.prototype.splitByArray = function(separatorList){
    //Array中の文字列をseparatorList内の文字列でそれぞれで分割し、それらの文字列が含まれた配列を返す。
    var retArray = new Array();
    
    for(var i = 0, iLen = this.length; i < iLen; i++){
        retArray = retArray.concat(this[i].splitByArray(separatorList));
    }
    
    return retArray;
}
*/
Array.prototype.propertiesNamed = function (pName) {
    //Array内の各要素のプロパティpNameのリストを返す。
    var retArray = new Array();
    for (var i = 0, iLen = this.length; i < iLen; i++) {
        retArray.push(this[i][pName]);
    }
    return retArray;
};
/*
Array.prototype.logAsHexByte = function(logfunc){
    //十六進バイト列としてデバッグ出力する。
    //logfuncは省略時はconsole.logとなる。
    if(logfunc === undefined){
        logfunc = function(s){ console.log(s); };
    }
    var ds = "";
    for(var i = 0, iLen = this.length; i < iLen; i++){
        ds += ("00" + this[i].toString(16).toUpperCase()).slice(-2);
    }
    logfunc(ds);
}
Array.prototype.stringAsHexByte = function(){
    //十六進バイト列として文字列を得る
    var ds = "";
    for(var i = 0, iLen = this.length; i < iLen; i++){
        ds += ("00" + this[i].toString(16).toUpperCase()).slice(-2);
    }
    return ds;
}
Array.prototype.logEachPropertyNamed = function(pname, logfunc, suffix){
    //Arrayのすべての各要素pについて、プロパティp[pname]を文字列としてlogfuncの引数に渡して呼び出す。
    //suffixは各文字列の末尾に追加する文字列。省略時は改行文字となる。
    //logfuncは省略時はconsole.logとなる。
    if(logfunc === undefined){
        logfunc = function(s){ console.log(s); };
    }
    if(suffix === undefined){
        suffix = "\n";
    }
    for(var i = 0, iLen = this.length; i < iLen; i++){
        logfunc(this[i][pname] + suffix);
    }
}

Array.prototype.logEachPropertiesNamed = function(pnames, logfunc,　separator, suffix){
    //Arrayのすべての各要素pについて、プロパティp[pnames[n]]を文字列としてlogfuncの引数に渡して呼び出す。
    //suffixは各文字列の末尾に追加する文字列。省略時は改行文字となる。
    //separatorは各項目の間に置かれる文字列。省略時は",\t"となる。
    //logfuncは省略時はconsole.logとなる。
    if(logfunc === undefined){
        logfunc = function(s){ console.log(s); };
    }
    if(suffix === undefined){
        suffix = "\n";
    }
    if(separator === undefined){
        separator = ",\t";
    }
    var kLen = pnames.length - 1;
    for(var i = 0, iLen = this.length; i < iLen; i++){
        var s = "";
        for(var k = 0; k < kLen; k++){
            s += this[i][pnames[k]] + separator;
        }
        if(kLen != -1){
            s += this[i][pnames[k]] + suffix;
        }
        logfunc(s);
    }
}
*/
Array.prototype.copy = function () {
    return (new Array()).concat(this);
};
//文字列関連
String.prototype.replaceAll = function (org, dest) {
    //String中にある文字列orgを文字列destにすべて置換する。
    //http://www.syboos.jp/webjs/doc/string-replace-and-replaceall.html
    return this.split(org).join(dest);
};
/*
String.prototype.compareLeftHand = function (search){
    //前方一致長を求める。
    for(var i = 0; search.charAt(i) != ""; i++){
        if(search.charAt(i) != this.charAt(i)){
            break;
        }
    }
    return i;
}

String.prototype.splitByArray = function(separatorList){
    //リスト中の文字列それぞれで分割された配列を返す。
    //separatorはそれ以前の文字列の末尾に追加された状態で含まれる。
    //"abcdefg".splitByArray(["a", "e", "g"]);
    //	= ["a", "bcde", "fg"]
    var retArray = new Array();
    retArray[0] = this;
    
    for(var i = 0; i < separatorList.length; i++){
        var tmpArray = new Array();
        for(var k = 0; k < retArray.length; k++){
            tmpArray[k] = retArray[k].split(separatorList[i]);
            if(tmpArray[k][tmpArray[k].length - 1] == ""){
                tmpArray[k].splice(tmpArray[k].length - 1, 1);
                if(tmpArray[k] && tmpArray[k].length > 0){
                    for(var m = 0; m < tmpArray[k].length; m++){
                        tmpArray[k][m] += separatorList[i];
                    }
                }
            } else{
                for(var m = 0; m < tmpArray[k].length - 1; m++){
                    tmpArray[k][m] += separatorList[i];
                }
            }
        }
        retArray = new Array();
        retArray = retArray.concat.apply(retArray, tmpArray);
    }
    
    if(retArray.length == 0){
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/split
        //文字列が空であるとき、split メソッドは、空の配列ではなく、1 つの空文字列を含む配列を返します。
        retArray.push("");
    }
    
    return retArray;
}

String.prototype.splitByArraySeparatorSeparated = function(separatorList){
    //リスト中の文字列それぞれで分割された配列を返す。
    //separatorも分割された状態で含まれる。
    //"abcdefg".splitByArraySeparatorSeparated(["a", "e", "g"]);
    //	= ["a", "bcd", "e", "f", "g"]
    var retArray = new Array();
    retArray[0] = this;
    
    for(var i = 0; i < separatorList.length; i++){
        var tmpArray = new Array();
        for(var k = 0; k < retArray.length; k++){
            var tmpArraySub = retArray[k].split(separatorList[i]);
            tmpArray[k] = new Array();
            for(var m = 0, mLen = tmpArraySub.length - 1; m < mLen; m++){
                if(tmpArraySub[m] != ""){
                    tmpArray[k].push(tmpArraySub[m]);
                }
                tmpArray[k].push(separatorList[i]);
            }
            if(tmpArraySub[tmpArraySub.length - 1] != ""){
                tmpArray[k].push(tmpArraySub[m]);
            }
        }
        retArray = new Array();
        retArray = retArray.concat.apply(retArray, tmpArray);
    }
    
    if(retArray.length == 0){
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/split
        //文字列が空であるとき、split メソッドは、空の配列ではなく、1 つの空文字列を含む配列を返します。
        retArray.push("");
    }
    
    return retArray;
}
*/
String.prototype.splitByArraySeparatorSeparatedLong = function (separatorList) {
    //リスト中の文字列それぞれで分割された配列を返す。
    //separatorも分割された状態で含まれる。
    //separatorListの前の方にあるseparatorは、後方のseparatorによって分割されない。
    //"abcdefgcdefg".splitByArraySeparatorSeparatedLong(["bcde", "cd", "f"]);
    //	= ["a", "bcde", "f", "g", "cd", "e", "f", "g"]
    //"for (i = 0; i != 15; i++) {".splitByArraySeparatorSeparatedLong(["!=", "(", ")", "="]);
    //	= ["for ", "(", "i ", "=", " 0; i ", "!=", " 15; i++", ")", " {"]
    var retArray = new Array();
    var checkArray = new Array();
    retArray[0] = this;
    checkArray[0] = false;
    for (var i = 0; i < separatorList.length; i++) {
        var tmpArray = new Array();
        var tmpCheckArray = new Array();
        for (var k = 0; k < retArray.length; k++) {
            if (!checkArray[k]) {
                var tmpArraySub = retArray[k].split(separatorList[i]);
                tmpArray[k] = new Array();
                tmpCheckArray[k] = new Array();
                for (var m = 0, mLen = tmpArraySub.length - 1; m < mLen; m++) {
                    if (tmpArraySub[m] != "") {
                        tmpArray[k].push(tmpArraySub[m]);
                        tmpCheckArray[k].push(false);
                    }
                    tmpArray[k].push(separatorList[i]);
                    tmpCheckArray[k].push(true);
                }
                if (tmpArraySub[tmpArraySub.length - 1] != "") {
                    tmpArray[k].push(tmpArraySub[m]);
                    tmpCheckArray[k].push(false);
                }
            }
            else {
                tmpArray.push([retArray[k]]);
                tmpCheckArray.push([true]);
            }
        }
        retArray = new Array();
        checkArray = new Array();
        retArray = retArray.concat.apply(retArray, tmpArray);
        checkArray = checkArray.concat.apply(checkArray, tmpCheckArray);
    }
    if (retArray.length == 0) {
        // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/split
        //文字列が空であるとき、split メソッドは、空の配列ではなく、1 つの空文字列を含む配列を返します。
        retArray.push("");
    }
    return retArray;
};
/*
String.prototype.trim = function(str){
    return this.replace(/^[ 　	]+|[ 　	]+$/g, "").replace(/\n$/g, "");
}
//http://d.hatena.ne.jp/favril/20090514/1242280476
String.prototype.isKanjiAt = function(index){
    var u = this.charCodeAt(index);
    if( (0x4e00  <= u && u <= 0x9fcf) ||	// CJK統合漢字
        (0x3400  <= u && u <= 0x4dbf) ||	// CJK統合漢字拡張A
        (0x20000 <= u && u <= 0x2a6df) ||	// CJK統合漢字拡張B
        (0xf900  <= u && u <= 0xfadf) ||	// CJK互換漢字
        (0x2f800 <= u && u <= 0x2fa1f)){ 	// CJK互換漢字補助
        return true;
    }
    return false;
}
String.prototype.isHiraganaAt = function(index){
    var u = this.charCodeAt(index);
    if(0x3040 <= u && u <= 0x309f){
        return true;
    }
    return false;
}
String.prototype.isKatakanaAt = function(index){
    var u = this.charCodeAt(index);
    if(0x30a0 <= u && u <= 0x30ff){
        return true;
    }
    return false;
}
String.prototype.isHankakuKanaAt = function(index){
    var u = this.charCodeAt(index);
    if(0xff61 <= u && u <= 0xff9f){
        return true;
    }
    return false;
}
*/
String.prototype.escapeForHTML = function () {
    var e = document.createElement('div');
    e.appendChild(document.createTextNode(this));
    return e.innerHTML;
};
// http://stackoverflow.com/questions/641857/javascript-window-resize-event
// addEvent(window, "resize", function_reference);
var addEvent = function (elem, type, eventHandle) {
    if (elem == null || typeof (elem) == 'undefined')
        return;
    if (elem.addEventListener) {
        elem.addEventListener(type, eventHandle, false);
    }
    else if (elem.attachEvent) {
        elem.attachEvent("on" + type, eventHandle);
    }
    else {
        elem["on" + type] = eventHandle;
    }
};
