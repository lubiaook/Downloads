var DWdataList = {
	dataModel: {
		selects: [],
		template: "",
		columns: {},
		datas: [],
		useImg: true,
		curPage: 0,
		rPP: 10,
		total: 0,
		type: "list",
		bindRowIndx: 0,
		loadingcount: 0,
		refresh: true,
		superResize: function () {//需要字类调用
			if (this.type == "card") {
				this.card.resize();
			}
		},
		showLoading: function () {
			//必须字类实现
			// this.delayLoad = setTimeout(function(){
			// 	$(".awsui-grid-list").html("");
			// 	$("#refershDiv").css("z-index",3);
			// },200);//200ms内的加载不显示loading
			// $("#refershDiv").show();
			// this.loadingcount++;
		},
		hideLoading: function () {
			//必须字类实现
			// clearTimeout(this.delayLoad);
			// $("#refershDiv").hide();
			// $("#refershDiv").css("z-index",-1);
			// this.loadingcount--;
		},
		isLastPage: function () {
			if (this.curPage >= Math.ceil(this.total / this.rPP)) {
				return true;
			}
		},
		init: function (obj) {
			obj = obj ? obj : {};
			if (this.type == "card") {
				this.card.initCard(obj.that);
			} else {
				this.initList(obj.that);
			}
		},
		getSelectedRow: function () {
			return this.selects;
		},
		getRowDatas: function () {
			return this.datas;
		},
		card: {
			width: 200,
			initCard: function (that) {
				$("#dw_centerGrid").css("background-color", "#f9faf9");
				//初始化容器
				var html = "<div class=\"awsui-grid-list cards\"></div></div>"
				if (!window.isMobile) {
					html = "<div class='dataDiv'>" + html + "</div>";
				}
				$("#dw_centerGrid").html(html);
				DWdataList.tool.scrollPlug.init(that);
			},
			resize: function () {
				var datas = $("#dw_centerGrid .awsui-grid-list .awsui-grid-data");
				if (datas.length == 0) {
					return;
				}
				//计算宽度
				var padmargin = 8 + 20 + 2;//8的marginleft,20的子margin,2的边框
				var setWidth = parseInt(this.width, 10);
				var w = 0;
				if (window.isMobile) {
					w = $("#dw_centerGrid").width() - 16;//手机端14+2的margin
				} else {
					w = $(".dataDiv").width();
				}
				w -= DWdataList.tool.getScrollWidth(); //空出滚动条宽度
				var curwidth = (this.width + "").indexOf("%") > -1 ? (setWidth / 100 * w) : setWidth;
				var noNum = w / (curwidth + padmargin);
				var columnNum = Math.floor(noNum);
				columnNum = columnNum > datas.length ? datas.length : columnNum;
				this.useWidth = columnNum > 1 ? Math.floor(w / columnNum) : w;
				datas.width(this.useWidth - padmargin);
				datas.height("auto");
				if (columnNum > 1) {
					var rows = [], max = 0;
					//设置高度，取单行最高的为基准
					for (var i = 0, size_i = datas.length; i < size_i; i++) {
						var datum = datas.eq(i);
						if (datum.height() > max) {
							max = datum.height();
						}
						rows.push(datum);
						if (i % columnNum == columnNum - 1 || i == datas.length - 1) { //最后一个
							//var width = rows.length < columnNum ?  w/rows.length : -1;
							for (var j = 0, size_j = rows.length; j < size_j; j++) {
								rows[j].height(max);
								// if(width > 0 ){
								// 	rows[j].width(width-padmargin);
								// }
							}
							max = 0;
							rows = [];
						}
					}
				}
			}
		},
		refreshData: function (obj) {
			obj = obj ? obj : {};
			obj.showLoad = obj.showLoad == null ? true : obj.showLoad;
			obj.refresh = true;
			this.curPage = 0;
			if (window.DWMobile && this.type != "card") {
				obj.callback = obj.callback ? obj.callback : function () {
					DWMobile.tool.touchPlug.resizeTouch(); //必须回掉一下
				}
			}
			this.datas = [];
			this.getDataList(obj);
		},
		getDataList: function (obj) {
			this.refresh = obj.refresh;
			var that = this;
			var params = {
				cmd: "CLIENT_DW_DATA_GRIDJSON",
				sid: sessionId,
				appId: $("#appId").val(),
				dwViewId: dwViewId,
				processGroupId: processGroupId,
				condition: condition,
				pageNow: this.curPage + 1,
				limit: this.rPP
			};
			if (obj.showLoad) {
				that.showLoading();
			}
			var p = {
				url: './jd',
				dataType: "json",
				data: params,
				success: function (json) {
					if (obj.showLoad) {
						that.hideLoading();
					}
					if (json.result != 'ok') {
						setTimeout(function () {
							$.simpleAlert(json.msg, json.result)
						}, 1);
						console.log(json.data);
						return {};
					}
					var jsonO = json.data.maindata;
					if (jsonO == "-1" || jsonO.error) {
						$.simpleAlert("数据加载失败，请查看日志信息。或者请检查当前视图是否正确配置了数据源信息", "error");
						return false;
					}
					if (dsearch == 2 && json.data.ls) {
						$("button[name=DW_toobar_searcher]").each(function (i) {
							$(this).find("span").text("(" + json.data.ls[i] + ")");
						});
					}
					identifier = jsonO.identifier;
					that.total = jsonO.pageInfo.total;
					that.curPage = jsonO.pageNow;
					that.datas = $.merge(that.datas, jsonO.items);
					that.createList(jsonO.items);
					if (obj.callback) {
						obj.callback(jsonO);
					}
				}
			}
			awsui.ajax.request(p);
		},
		createList: function (remoteDatas) {
			if (this.curPage == 1 && (remoteDatas == null || remoteDatas.length == 0)) {
				var noData = "<div class=\"noRowShow\" ><div><img style=\"height:105px;\" src=\"../commons/js/jquery/themes/default/ui/images/noResult.png\"><div style='margin-top:14px'>暂无数据</div></div></div>";
				var con = $("#dw_centerGrid .awsui-grid-list");
				var setWidth = "100%";
				if (isMobile) {
					con.width("calc(100% - 24px)")
				}
				var h = $("#dw_centerGrid").height();
				var $noData = $(noData)
				con.html($noData);
				$noData.css({
					"margin-top": h / 4 - 40
				})
				return;
			}
			var size_i = remoteDatas.length;
			if (size_i > 0) {
				var html = [];
				for (var i = 0; i < size_i; i++) {
					var x = remoteDatas[i];
					if (this.type == "card") {
						html.push("<div class='card'>");
					}
					html.push(this.buildTemplate({
						datas: remoteDatas,
						rowData: remoteDatas[i],
						rowIndx: i
					}));
					if (this.type == "card") {
						html.push("</div>");
					}
				}
				if (this.refresh) {
					this.bindRowIndx = 0;
					$("#dw_centerGrid .awsui-grid-list").html(html.join(""));
				} else {
					$("#dw_centerGrid .awsui-grid-list").append(html.join(""));
				}
				this.setHtml();
			}
		},
		buildTemplate: function (obj) {
			var datas = obj.datas, rowData = obj.rowData, rowIndx = obj.rowIndx;
			var cols = this.template.match(/\[#.+?\]/g);
			var html = this.template;
			if (cols != null) {
				for (var i = 0, size_i = cols.length; i < size_i; i++) {
					var x = cols[i], dataIndx = x.replace(/(\[#)|\]/g, "");
					var r = new RegExp(x.replace("[", "\\[").replace("]", "\\]"));
					var value = getGridFieldValue(rowData, dataIndx);
					value = this.formatColumnValue(rowData, dataIndx, value);
					if (value == null) {
						value = "&nbsp;";
					}
					this.columns[dataIndx] = true; //存储字段
					html = html.replace(r, value);
				}
			}
			return html;
		},
		setHtml: function () {
			this.superResize();
			this.bindListEvent();
			this.setSubHtml();
		},
		bindListEvent: function () {
			var rows = $(".awsui-grid-list").find(".awsui-grid-data"), rowsSize = rows.length;
			while (this.bindRowIndx < rowsSize) {
				var row = rows.eq(this.bindRowIndx);
				row.attr("rowIndx", this.bindRowIndx);
				this.bindRowIndx++;
			}
			this.bindRowEvent(row, this.bindRowIndx);
		},
		bindRowEvent: function (row, rowIndx) {
			//子类必须实现
		},
		deleteRows: function (obj) {
			var ids = obj.ids;  //id的数组
			var rowIndxs = [], datas = this.datas, selects = this.selects;
			for (var i = 0, size_i = ids.length; i < size_i; i++) {
				var id = ids[i];
				//删除datas
				for (var j = 0, size_j = datas.length; j < size_j; j++) {
					var datum = datas[j];
					if (id == datum["_ID"]) {
						datas.splice(j, 1);
						break;
					}
				}
				//删除selects
				for (var j = 0, size_j = selects.length; j < size_j; j++) {
					var select = selects[j];
					if (id == select.rowData["_ID"]) {
						selects.splice(j, 1);
						rowIndxs.push(select.rowIndx);//找到rowIndx
						break;
					}
				}
			}
			//删除Dom
			var lists = $(".awsui-grid-list")
			for (var i = 0, size_i = rowIndxs.length; i < size_i; i++) {
				var rowIndx = rowIndxs[i];
				var node = lists.find("[rowindx=" + rowIndx + "]");
				if (node.parent().hasClass("card")) {
					node.parent().remove();
				} else {
					node.remove();
				}
			}
			//刷新rowIndx
			lists.find("[rowindx]").each(function (k) {
				$(this).attr("rowindx", k);
			});
			//如果selects还存在数据则刷新rowindx
			if (selects.length > 0) {
				for (var i = 0, size_i = selects.length; i < size_i; i++) {
					var select = selects[i];
					for (var j = 0, size_j = datas.length; j < size_j; j++) {
						var datum = datas[j];
						if (select.rowData["_ID"] == datum["_ID"]) {
							select.rowIndx = j;
							break;
						}
					}
				}
			}
			$(window).trigger("resize");
		},
		formatColumnValue: function (rowData, dataIndx, value) {
			var val = getGridFieldValue(rowData, dataIndx.replace(/^_/, "") + "_SHOW_RULE_SUFFIX");
			var uiType = getGridFieldValue(rowData, "COLUMNTYPE_" + dataIndx);
			if (typeof val == "object") {
				if (val.typeS = "AWS_OBJ_ORG_USER") {
					return val.username;
				}
			}
			switch (uiType) {
				case "file":
					if (this.useImg) { //图片
						if (/^\.\//.test(value)) {
							value = "<img  class='awsui-dw-m-img' src='" + value + "' />";
						}
					}
					break;
				case "currency" :
					var thatvalue = getGridFieldValue(rowData, dataIndx + "_SHOW_CONFIG");
					//暂时提取货币
					if (typeof(thatvalue) == "object") {
						var classStyle = "", style = "", value = thatvalue.value == null ? (thatvalue.isShowZero == "1" ? "0" : "") : thatvalue.value;
						if (thatvalue.currencySymbol == "￥") {
							classStyle = "RMB";
						} else if (thatvalue.currencySymbol == "$") {
							classStyle = "dollar";
						} else if (thatvalue.currencySymbol == "HK") {
							classStyle = "hk_RMB";
						} else if (thatvalue.currencySymbol == "EUR") {
							classStyle = "EUR";
						} else if (thatvalue.currencySymbol == "other") {
							style = "padding-left: 16px !important;background: transparent url(" + thatvalue.symbol + ") no-repeat left center !important;";
						}
						value = "<span style='vertical-align: text-top;text-align: right;" + style + "'class='aws-grid-editor-default " + classStyle + "'>" + value + "</span>";
					}
					break;
				case "slider" :
					var config = value;
					if (typeof config == "string") {
						config = JSON.parse(config);
					}
					var showValue = config.value != null ? parseInt(config.value, 10) : 0;
					//var max = parseInt(config.max, 10);
					//var per = parseFloat(showValue / max * 100, 2).toFixed(2);
					//var borderRadius = per != 100 ? "border-radius:3px 0px 0px 3px" : "border-radius: 3px;";
					// 计算进度条宽度
					//return "<div class= \"iae-progressBar\" ><span>" + showValue + "</span><div style=\"width: " + per + "%;" + borderRadius + "\"></div></div>";
					return showValue;
				case "LogoP" :
					return "";
				case "XCode" :
					return "";
				default:
					value = val != null ? val : value;
			}
			return value;
		}
	},
	tool: {
		findRowContent: function (obj, max) {
			max = max == null ? 0 : max;
			if (max > 12) {
				return null;
			}
			var op = obj.parent();
			if (op.attr("rowIndx") == null) {
				max++;
				return DWdataList.tool.findRowContent(op, max);
			} else {
				return op;
			}
		},
		getScrollWidth: function () {
			if (window.isMobile) {
				return 0;
			} else {
				//判断是否滚动
				//$(".awsui-grid-list").scrollHeight
			}
			var scorllWidth = 4;
			if (navigator.userAgent.indexOf("Edge") > -1) {
				scorllWidth = 11;
			} else if ($.browser.isFirefox) {
				scorllWidth = 9;
			} else if ($.browser.isIE) {
				scorllWidth = 10;
			}
			return scorllWidth;
		},
		scrollPlug: {
			init: function (obj) {
				var that = this;
				if (window.isMobile) {
					$("#dw_centerGrid").on("touchmove", function (e) {
						that.bottomToLoad({dom: $(this), dataModel: obj.dataModel});
					});
				} else {
					$("#dw_centerGrid").on("scroll", function () {
						that.bottomToLoad({dom: $(this), dataModel: obj.dataModel});
					})
				}
			},
			bottomToLoad: function (obj) {
				var that = this;
				var dom = obj.dom, dataModel = obj.dataModel;
				if (that.isReady === false) {
					return;
				}
				if (!dataModel.isLastPage()) {
					var targetHeight = dom.height(), targetScollHeight = dom[0].scrollHeight;
					if (targetHeight + dom.scrollTop() > targetScollHeight - 1) {
						that.isReady = false;
						dataModel.getDataList({
							callback: function () {
								that.isReady = true;
							}
						});
					}
				}
			}
		}
	}
}
