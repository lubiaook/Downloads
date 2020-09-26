var navtab;
var bmtree;
// 业务模型树对象
var currentBMParam = {
	type : '',
	category : '',
	appid : '',
	appname : ''
};
// 记录当前导航树的选中节点
var selectedNodeType;
// 记录新建类型
var currentgroup = '';
// 记录 当前选中的组
var currentWin;
// 新建业务模型窗口里的window
var nodeIdGenerator = 100;
var bmCategoryPD = "BMPDCategory";
var bmCategoryPDg = "BMPDGroup";
var bmCategoryFM = "BMFormCategory";
var bmCategoryBO = "BMBOCategory";
var bmCategoryRP = "BMReportCategory";
var bmCategoryDW = "BMDWCategory";
var bmCategory = 'BMCategory';
var bmPD = "BMPD";
var bmDIC = "BMDIC";
var bmMainWorkspaceTabID = "AWS_BM_Main_Workspace_Tab_ID";
var bmMainWorkspaceFrameID = "AWS_BM_Main_Workspace_Frame_ID";
var newTypeXD = "XD";
var newTypeMS = "MS";
var awsGrid;
// 侦测到的需要刷新的节点的父节点
var navOpen;
// 判断此页面是否已经打开

$(document).ready(function() {
	navOpen = true;
	$(window).layout({
		left : {
			target : "#left",
			closable : false
		},
		right : {
			target : "#center"
		},
		separater : {
			target : "#separater",
			show : false
		}
	});
	initBmTree();
	// 初始化右侧欢迎页
	navtab = awsui.tabs.init($("#ui-tabs"), {
		contentPanel : $("#awsui-tabs-content"),
		onClick : function(obj) {
			if (obj.index == "functionHistory") {
				$("iframe[name='functionHistory']")[0].src = './w?sid=' + $("input[name='sid']").val() + '&cmd=CONSOLE_FUNCTION_HISTORY&category=1&filter=BM&pageNow=1&pageSize=20';
			}
			return true;
		}
	});
	// 初始化搜索框
	$("#buttoneditLiveSearch").buttonedit({
		onLiveSearch : function(e) {
			searchInit(e);
		}
	});
	/*
	 * if(window.navigator.userAgent.indexOf("Chrome") != -1){ $(".awsui-buttonedit-search").css("margin-top", "-10px"); }
	 */
	loadCoEMarkWindow();

	// 如果通过App创建后进入，需要打开新建对话框，并定位应用ID
	if (createNewModelByAppId.length > 0) {
		createBizModel();
	}
	createViewTab('最近访问', 'iframe', 'functionHistory', navtab, navtab.tabContentPanel, './w?sid=' + $("input[name='sid']").val() + '&cmd=CONSOLE_FUNCTION_HISTORY&category=1&filter=BM&pageNow=1&pageSize=20', false, 'functionHistory');
});

// CoE如果存在部署到BPM的流程文件，需要展示并分配
function loadCoEMarkWindow() {
	// 判断CoE是否有相应的数据需要挂接到平台 zhoux 2014-2-25
	awsui.ajax.request({
		url : "./jd",
		method : "POST",
		data : {
			"cmd" : "CONSOLE_CHECK_COE_PAL_MARK_DISTRIBUTION",
			"sid" : encodeURIComponent($("input[name='sid']").val())
		},
		ok : function(r) {
			if (r.data.flag == "true") {
				var dlg = FrmDialog.open({
					width : 900,
					height : 400,
					model : true,
					draggable : true,
					title : "CoE资产库流程文件分配",
					url : "./w?cmd=CONSOLE_OPEN_COE_PAL_MARK_DISTRIBUTION&sid=" + encodeURIComponent($("input[name='sid']").val()),
					id : "iflowlist"
				});
			}
		},
		err : function(r) {
		}
	});
}

function searchInit(e) {
	searchOnKeyPress(e);
}

function blurField(field) {
	field.value = '快速搜索';
}

function focusField(field) {
	field.value = '';
}

// 注册搜索事件
function searchOnKeyPress(e) {
	if (window.event) {
		key = e.keyCode;
	} else if (e.which) {
		key = e.which;
	}
	if (key == 37 || key == 38 || key == 39 || key == 40) {
		return false;
	}
	if (key == "27") {
		closeGrid();
	} else {
		var val = $("#buttoneditLiveSearch").val();
		if ($("#searchGrid").is(":hidden")) {
			showGrid();
		}
		var initGrid = function() {
			var top = $("#buttoneditLiveSearch").offset().top;
			var left = $("#buttoneditLiveSearch").offset().left;
			$("#searchGrid").css("top", top + 22);
			$("#searchGrid").css("left", left);
		};
		if (val.length >= 3) {//
			initGrid();
			initSearchGrid(val);
		} else if (val.length > 0 && val.length < 3 && key == 13) {
			initGrid();
			initSearchGrid(val);
		}
	}
}

// 快速搜索grid
function initSearchGrid(serchKey) {
	if (awsGrid) {
		awsGrid.awsGrid("destroy");
	}
	createAwsGrid(serchKey);
	parent.$("#bm_navigation").on("mousedown.initG", function() {
		closeGrid();
	});
	$(document).on("mousedown.initGrid", function(e) {
		closeGrid();
	});
	$("#searchGrid").on("mousedown.initGrid_", function(e) {
		e.stopPropagation();
		return false;
	});
}

function closeGrid() {
	$("#searchGrid").hide();
}

function showGrid() {
	$("#searchGrid").show();
}

function createAwsGrid(serchKey) {
	var obj = {
		width : 684,
		numberCellWidth : 30,
		topVisible : false,
		title : "快速搜索",
		flexHeight : true,
		rowClick : function(event, ui) {

			setTimeout(function() {
				var rows = awsGrid.awsGrid("getRows");
				if (rows.length > 0) {
					var paramObj = rows[0].params;
					closeGrid();
					if (typeof rows[0].params == "string") {
						var params = paramObj.split(',');
						var obj = params[0];
						if (obj == 'field') {
							setTimeout(function() {
								openMetaDataCard(params[1], params[2], params[3], params[4]);
							}, 50);
						} else if (obj == 'bridge') {
							setTimeout(function() {
								openBridgeCard(params[1], params[2], params[3], params[4]);
							}, 50);
						}
						// else if (obj == 'report') {
						// setTimeout(function() {
						// openReportCard(params[1], params[2], params[3], "0", params[4]);
						// }, 50);
						// }
					} else {
						//最新方式
						tryExpandNode(paramObj);
//						if (obj == 'bo') {
//							setTimeout(function() {
//								openMetaDataCard(params[1], params[2], params[3], params[4]);
//							}, 50);
//						} else if (obj == 'form') {
//							setTimeout(function() {
//								openFormCard(params[1], params[2], params[3], params[4]);
//							}, 50);
//						} else if (obj == 'view') {
//							setTimeout(function() {
//								openDataWindow('', params[1], params[2], params[3], params[4]);
//							}, 50);
//
//						} else if (obj == 'dic') {
//							setTimeout(function() {
//								openDicCard(params[1], params[2], params[3], params[4], params[5], params[6]);
//							}, 50);
//						} else if (obj == 'flow') {
//							setTimeout(function() {
//								openProcessDefCard(params[1], params[2], params[3], params[4]);
//							}, 50);
//						}
					}
				}

			}, 100);
		},
		scrollModel : {
			horizontal : false
		}
	};
	obj.colModel = [ {
		title : "类型",
		width : 100,
		dataType : "string",
		dataIndx : "type",
		align : 'left',
		sortable : false
	}, {
		title : "名称",
		width : 250,
		dataType : "string",
		dataIndx : "name",
		align : 'left',
		sortable : false
	}, {
		title : "参数",
		width : 250,
		dataType : "string",
		hidden : true,
		dataIndx : "params",
		sortable : false
	}, {
		title : "路径",
		width : 300,
		dataType : "string",
		dataIndx : "path",
		sortable : false
	} ];
	obj.dataModel = {
		location : "remote",
		sorting : "remote",
		paging : "remote",
		dataType : "JSON",
		method : "POST",
		curPage : 1, // 当前页
		rPP : 10, // 页数
		sortDir : "up", // 排序规则
		getUrl : function() {
			return {
				url : "./w",
				data : "sid=" + sid + "&cmd=CONSOLE_M_BM_SEARCH_MODEL&currentPage=" + this.curPage + "&limit=" + this.rPP + "&query=" + encodeURI(serchKey)
			};
		},
		getData : function(dataJSON) {
			return {
				curPage : dataJSON.curPage,
				totalRecords : dataJSON.totalRecords,
				data : dataJSON.data
			};
		}
	};
	obj.load = function() {
		var tr = awsGrid.awsGrid("getRow", {
			rowIndxPage : 0
		});
		tr.focus();
		// awsGrid.awsGrid("setSelection", {
		// rowIndx : 0
		// });
	};
	awsGrid = $("#searchGrid").awsGrid(obj);
	awsGrid.find(".pq-pager").awsGridPager("option", $.awsgrid.awsGridPager.regional["zh"]);
	awsGrid.append("<div id='orgclose' class='dlg-close' onclick='closeGrid();' style='position:absolute;top:6px;right:7px;width:25px;height:25px;background: transparent url(../commons/js/jquery/themes/default/ui/images/dialog.png) 0px -25px no-repeat;background-size:cover'></div>");
	// $(".pq-pager").append("<input type='button' class='ui-button ui-widget ui-state-default ui-corner-all
	// ui-button-icon-only' onclick='closeGrid();' style='cursor:pointer;width:40px;height: 21px;float:right;' value='关
	// 闭' />");

}

function createViewTab(title, type, index, headerContainer, contentContainer, url, close, frameName) {
	var setting = {
		item : {
			title : title,
			index : index,
			type : type
		},
		contextMenu : true,
		contextMenuTarget : "contextMenu",
		close : close

	};
	index = index.replaceAll(" ", "_");
	if (contentContainer.find(".awsui-layout-iframe[index=" + index + "]").length) {
		headerContainer.focusTab(index);
		return;
	}
	var html = $("<iframe allowfullscreen='true' webkitallowfullscreen='true' name='" + frameName + "' index=" + index + " class='awsui-layout-iframe' frameborder='0' height='100%' width='100%' src='" + url + "'></iframe>").appendTo(contentContainer);
	headerContainer.addTab(setting);
}

// 模型分类在同一个tab展示方法
function openInfixedTab(title, type, index, headerContainer, contentContainer, url, close) {
	var setting = {
		item : {
			title : title,
			index : index,
			type : type
		},
		close : close
	};
	if (contentContainer.find(".awsui-layout-iframe[index=" + index + "]").length) {
		headerContainer.focusTab(index);
	}
	url = encodeURI(url);
	var iframeobj = $('iframe[index=' + index + ']');
	if (iframeobj.length == 0) {
		var html = $("<iframe allowfullscreen='true' webkitallowfullscreen='true' name='" + index + "' index=" + index + " id='" + index + "' class='awsui-layout-iframe' frameborder='0' height='100%' width='100%' src='" + url + "'></iframe>").appendTo(contentContainer);
	} else if (iframeobj.length == 1) {
		$('iframe[index=' + index + ']').eq(0).attr('src', url);
	}
	headerContainer.addTab(setting, function() {
	});
	// 手动改变tab title
	headerContainer.setTitle(index, title);
}

function initSize() {
	initBottomTab();
}

// 初始化业务模型树
function initBmTree() {
	// 初始化业务模型树
	// 相当于刷新树
	initAddButton();
	$("#bmtree").html('');
	var dataUrl = './jd?sid=' + sessionId + '&cmd=CONSOLE_M_BM_TREE_DATA_JSON';
	var setting = {
		showIcon : true,
		showTitle : true,
		dblClickToExpand : true,
		animate : true,
		remember : true,
		event : {
			beforeExpand : loadChildNode,
			onClick : createViewTabs
		},
		dataModel : {
			url : dataUrl,
			method : "POST",
			dataType : "text",
			params : {
				requestType : 'BMRoot',
				param1 : 0,
				param2 : '',
				param3 : ''
			}
		}
	};
	setting.contextMenu = {
		items : [ {
			text : "修改分类",
			tit : "expand",
			method : updateCategory
		}, {
			text : "迁移分类",
			tit : "close",
			method : moveCategory
		} ],
		target : "#contextMenu"
	};
	bmtree = awsui.tree.init($("#bmtree"), setting);
}

// 修改分类名
function updateCategory() {
	$(bmtree.setting.contextMenu.target).menu("close");
	$("#categoryTarget").parent().parent().parent().hide();
	$("#newCategoryName").val("");
	$("#newCategoryName").parent().parent().show();
	var node = bmtree.getSelectedNode();
	$("#categoryName").html(node.name).attr("title", node.name);
	$("#categoryDialog").dialog({
		title : "修改分类",
		buttons : [ {
			text : '确定',
			cls : "blue",
			handler : function() {
				var node = bmtree.getSelectedNode();
				var appId = node.appid;
				var categoryName = node.name;
				var newCategoryName = $("#newCategoryName").val();
				if (!newCategoryName) {
					$.simpleAlert('新分类名不允许为空', 'info', 2000);
					return false;
				} else if (newCategoryName == categoryName) {
					$.simpleAlert('新分类名不允许和旧分类名一致', 'info', 2000);
					return false;
				}
				$("#categoryDialog").dialog("close");
				$.simpleAlert('正在操作...', 'loading');
				awsui.ajax.request({
					url : "./jd",
					method : "POST",
					data : {
						cmd : "CONSOLE_M_CATEGORY_UPDATE",
						sid : $("input[name='sid']").val(),
						appId : appId,
						category : categoryName,
						newCategoryName : newCategoryName
					},
					ok : function(r) {
						$.simpleAlert("close");
						refreshBMTree();
					},
					err : function(r) {
						$.simpleAlert("close");
					}
				});
			}
		}, {
			text : '取消',
			handler : function() {
				$("#categoryDialog").dialog("close");
			}
		} ]
	});
}

// 分类迁移
function moveCategory() {
	$(bmtree.setting.contextMenu.target).menu("close");
	$("#newCategoryName").parent().parent().hide();
	var node = bmtree.getSelectedNode();
	$("#categoryName").html(node.name).attr("title", node.name);
	$("#categoryTarget").parent().parent().parent().show();
	var pid = node.pid;
	var cs = bmtree.getChildrenByPid(pid);
	var option = "";
	$.each(cs, function() {
		var name = this.name;
		if (this.iconCls == "treeBMCategory" && node.name != name) {
			option += "<option value=" + name + ">" + name + "</option>";
		}
	});
	$("#categoryTarget").html(option);
	$("#categoryTarget").customSelect("");
	$("#categoryDialog").dialog({
		title : "分类迁移",
		buttons : [ {
			text : '确定',
			cls : "blue",
			handler : function() {
				var target = $("#categoryTarget").val();
				if (!target) {
					$.simpleAlert('请选择迁移目标', 'info', 2000);
					return false;
				}
				var node = bmtree.getSelectedNode();
				var appId = node.appid;
				var categoryName = node.name;
				$("#categoryDialog").dialog("close");
				$.simpleAlert('正在操作...', 'loading');
				awsui.ajax.request({
					url : "./jd",
					method : "POST",
					data : {
						cmd : "CONSOLE_M_CATEGORY_MOVE",
						sid : $("input[name='sid']").val(),
						appId : appId,
						category : categoryName,
						target : target
					},
					ok : function(r) {
						$.simpleAlert("close");
						refreshBMTree();
					},
					err : function(r) {
						$.simpleAlert("close");
					}
				});
			}
		}, {
			text : '取消',
			handler : function() {
				$("#categoryDialog").dialog("close");
			}
		} ]
	});
}

// 记录并分析业务模型导航树的选中节点
function analysisCurrentBMNode(node) {
	// 流程组或流程
	if (node.type == bmCategoryPDg || node.type == bmCategoryPD || node.type == bmPD) {
		currentBMParam.type = bmCategoryPD;
		currentBMParam.category = node.category;
	} else if (node.type == bmCategoryFM) {
		currentBMParam.type = bmCategoryFM;
		currentBMParam.category = node.category;
	} else if (node.type == bmCategoryBO) {
		currentBMParam.type = bmCategoryBO;
		currentBMParam.category = node.category;
	} else if (node.type == bmCategoryRP) {
		currentBMParam.type = bmCategoryRP;
		currentBMParam.category = node.category;
	} else if (node.type == bmCategoryDW) {
		currentBMParam.type = bmCategoryDW;
		currentBMParam.category = node.category;
	} else if (node.type == 'BMApps') {
		currentBMParam.type = 'BMApps';
		currentBMParam.category = '';
		currentBMParam.appname = node.appname;
	} else if (node.type == 'BMCategory') {
		currentBMParam.category = node.name;
		currentBMParam.type = newTypeMS;
		currentBMParam.appname = node.appname;
	} else if (node.type == 'BMDIC') {
		currentBMParam.category = node.category;
		currentBMParam.type = newTypeXD;
	} else {
		currentBMParam.type = '';
		currentBMParam.category = '';
	}
	// 当前节点不是业务模型库节点激活添加按钮
	currentBMParam.appid = typeof node.appid == 'undefined' ? "" : node.appid;
}

function loadChildNode(node, reload) {
	onBMTreeBeforeLoad(node, reload);
}

// 动态改变导航树参数的方法
function onBMTreeBeforeLoad(node, reload) {
	var nodeId = node.id.substring(15);
	if (node.type == 'BMRoot') {
		bmtree.setting.dataModel.params.appId = '';
		bmtree.setting.dataModel.params.requestType = 'BMRoot';
		bmtree.setting.dataModel.params.param1 = "0";
		bmtree.setting.dataModel.params.param2 = "";
		bmtree.setting.dataModel.params.param3 = "0";
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMApps') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = node.type;
		bmtree.setting.dataModel.params.param1 = node.id;
		bmtree.setting.dataModel.params.param2 = node.appid;
		bmtree.setting.dataModel.params.param3 = "";
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMCategory') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMCategory';
		bmtree.setting.dataModel.params.param1 = nodeId;
		bmtree.setting.dataModel.params.param2 = "all";
		bmtree.setting.dataModel.params.param3 = node.appid;
		bmtree.setting.dataModel.params.param4 = node.name;
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMPDCategory') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMPDCategory';
		bmtree.setting.dataModel.params.param1 = nodeId;
		bmtree.setting.dataModel.params.param2 = node.category;
		bmtree.setting.dataModel.params.param3 = "0";
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMFormCategory') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMFormCategory';
		bmtree.setting.dataModel.params.param1 = nodeId;
		bmtree.setting.dataModel.params.param2 = node.category;
		bmtree.setting.dataModel.params.param3 = "0";
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMBOCategory') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMBOCategory';
		bmtree.setting.dataModel.params.param1 = node.category;
		bmtree.setting.dataModel.params.param2 = "all";
		bmtree.setting.dataModel.params.param3 = "0";
		bmtree.setting.dataModel.params.param4 = nodeId;
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMReportCategory') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMReportCategory';
		bmtree.setting.dataModel.params.param1 = nodeId;
		bmtree.setting.dataModel.params.param2 = node.category;
		bmtree.setting.dataModel.params.param3 = "0";
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMPDGroup') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMPDGroup';
		bmtree.setting.dataModel.params.param1 = node.category;
		bmtree.setting.dataModel.params.param2 = node.groupId;
		bmtree.setting.dataModel.params.param3 = "0";
		bmtree.setting.dataModel.params.param4 = "";
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMDWCategory') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMDWCategory';
		bmtree.setting.dataModel.params.param1 = node.category;
		bmtree.setting.dataModel.params.param2 = "all";
		bmtree.setting.dataModel.params.param3 = "0";
		bmtree.setting.dataModel.params.param4 = nodeId;
		buildChildNode(node, bmtree.setting, reload);
	} else if (node.type == 'BMDIC') {
		bmtree.setting.dataModel.params.appId = node.appid;
		bmtree.setting.dataModel.params.requestType = 'BMDIC';
		bmtree.setting.dataModel.params.param1 = node.category;
		bmtree.setting.dataModel.params.param2 = "all";
		bmtree.setting.dataModel.params.param3 = "0";
		bmtree.setting.dataModel.params.param4 = nodeId;
		buildChildNode(node, bmtree.setting, reload);
	}
}

function buildChildNode(treeNode, setting, reload) {
	if (treeNode.open != null) {
		bmtree.refreshNode({
			id : treeNode.id,
			dataModel : setting.dataModel
		});
	}

	if (typeof reload == 'undefined') {
		createViewTabs(treeNode);
	}
}

/* 复制一个业务模型 */
function copyItem() {
	var currentNode = bmtree.getSelectedNode();
	var currentCategory = currentNode.category;
	if (!currentNode) {
		$.simpleAlert('请在导航树选择一个模型对象节点', 'info', 2000, {
			model : true
		});
		return;
	}
	var nodeType = currentNode.type;
	if (nodeType != "BMForm" && nodeType != "BMBO" && nodeType != "BMRP") {
		$.simpleAlert('请在导航树选择一个模型对象节点', 'info', 2000, {
			model : true
		});
		return;
	}
	$.simpleAlert("系统正在请求数据请稍候", "loading", "no");
	var nodeId = currentNode.id.substring(15);
	var params = {
		sid : sessionId,
		cmd : "CONSOLE_M_BM_COPY_MODEL_PAGE",
		modelType : nodeType,
		modelId : nodeId,
		Category : currentCategory,
		appid : currentNode.appid
	};
	var html = "";
	awsui.ajax.request({
		url : './w',
		method : 'POST',
		dataType : 'json',
		data : params,
		success : function(response, options) {
			$.simpleAlert("close");
			var msg = response.msg;
			if (response.result != 'ok') {
				$.simpleAlert(msg, 'warning', 2000, {
					model : true
				});
				return false;
			}
			html += msg;
			var param = getParameter(nodeType);
			var buttons = [ {
				text : '确定',
				cls : "blue",
				handler : function() {
					doCopyItem(nodeType, nodeId, currentNode.appid)
				}
			}, {
				text : '取消',
				handler : function() {
					$("#copy-bm-dlg").dialog("close")
				}
			} ];
			$("#copy-bm-dlg").html(html);
			$("#copy-bm-dlg").dialog({
				title : param[0],
				height : 300,
				width : 500,
				buttons : buttons
			});
			$("#newGroupName").customSelect();

			// 表前缀永远没焦点
			$("#entityExit").focus(function() {
				$("#entityExit").blur();
			});
		}
	});
}

function doCopyItem(nodeType, nodeId, appid) {
	if (nodeType == "BMForm") {
		if ($('#reportTitle').val() == "") {
			$.simpleAlert('[表单名称]不允许为空', "info", 2000);
			return false;
		}
		if (checkSymbols($('#reportTitle').val(), false)) {
			$.simpleAlert("[表单名称]不允许包含特殊符号<br/>不能包含|'\"。、，+*/%^=\\!&:;~`#<>$", "info", 2000, {
				model : true
			});
			return false;
		}
		params = {
			sid : sessionId,
			cmd : "CONSOLE_M_FORM_COPY_MODEL",
			appid : appid,
			modelType : "FM",
			formDefId : nodeId,
			reportTitle : $('#reportTitle').val(),
			groupName : $('#newGroupName').val()
		};
	} else if (nodeType == "BMBO") {
		if ($('#entityName').val() == '') {
			$.simpleAlert('[表名称]不允许为空', "info", 2000);
			return false;
		}
		if (!checkvalue('表名称', $('#entityName').val())) {
			return false;
		}
		if ($('#entityName').val().indexOf('@') != -1) {
			$.simpleAlert("[表名称]不允许包含特殊符号<br/>不能包含|'\"。、，+*/%^=\\!&:;~`#<>$@", "info", 2000, {
				model : true
			});
			return false;
		}
		if (checkSymbols($('#entityName').val(), false)) {
			$.simpleAlert("[表名称]不允许包含特殊符号<br/>不能包含|'\"。、，+*/%^=\\!&:;~`#<>$@", "info", 2000, {
				model : true
			});
			return false;
		}
		if ($('#entityTitle').val() == '') {
			$.simpleAlert('[标题]不允许为空', 'info', 2000);
			return false;
		}
		if (!checkvalue('标题', $('#entityTitle').val())) {
			return false;
		}
		params = {
			sid : sessionId,
			cmd : "CONSOLE_M_BM_COPY_METADATA_MODEL",
			appid : appid,
			modelType : "BO",
			boDefId : nodeId,
			entityName : $('#entityName').val(),
			entityTitle : $('#entityTitle').val(),
			groupName : $('#newGroupName').val(),
			boType : $('#boType').val()
		};
	} else if (nodeType == "BMRP") {
		if ($('#reportName').val() == "") {
			$.simpleAlert('[方案名称]不允许为空', 'info', 2000);
			return false;
		}
		if (!checkvalue('方案名称', $('#reportName').val())) {
			return false;
		}
		params = {
			sid : sessionId,
			cmd : "CONSOLE_M_BM_COPY_DIGGER_MODEL",
			appid : appid,
			modelType : "RP",
			reportDefId : nodeId,
			reportName : $('#reportName').val(),
			groupName : $('#newGroupName').val()
		};
	}
	sendAjaxRequest(params, false);
}

// 获取复制窗口所需要的信息
function getParameter(nodeType) {
	var param = new Array();
	if (nodeType == "BMForm") {
		param.push('复制表单名称');
	} else if (nodeType == "BMBO") {
		param.push('复制存储模型');
	} else if (nodeType == "BMRP") {
		param.push('复制报表模型');
	}
	return param;
}

var refreshNode = null;
// 点击左侧树节点 打开tab页方法
function createViewTabs(node) {
	// 记录当前选中的group todo
	analysisCurrentBMNode(node);
	var nodeId = node.id.substring(15);
	// 如果是模型库分类节点
	if (node.pid && node.pid == 'root') {
		initAddButton();
		return;
	}
	if (node.id && node.id == 'root') {
		initAddButton();
		return;
	}
	var img = "";
	if (node.type == "BMPD") {
		img = "<img src='../commons/img/model/biz/process16.png' width='16'/>";
	} else if (node.type == "BMForm") {
		img = "<img src='../commons/img/model/biz/form16.png' width='16'/>";
	} else if (node.type == "BMBO") {
		if (node.iconCls.indexOf("View") != -1 || node.iconCls.indexOf("VCommon") != -1) {
			img = "<img src='../commons/img/model/biz/bo16-1.png' width='16'/>";
			if (node.iconCls.indexOf("CC") != -1) {
				img = "<img src='../commons/img/model/biz/bo16-cc-1.png' width='16'/>";
			}
		} else if (node.iconCls.indexOf("Stru") != -1) {
			img = "<img src='../commons/img/model/biz/bo16-2.png' width='16'/>";
		} else {
			img = "<img src='../commons/img/model/biz/bo16.png' width='16'/>";
			if (node.iconCls.indexOf("CC") != -1) {
				img = "<img src='../commons/img/model/biz/bo16-cc.png' width='16'/>";
			}
		}
	} else if (node.type == "BMRP") {
		img = "<img src='../commons/img/model/biz/report16.png' width='16'/>";
	} else if (node.type == "DWDetailed") {
		img = "<img src='../commons/img/model/biz/dw16.png' width='16'/>";
	} else if (node.type == "BMDICXD") {
		img = "<img src='../commons/img/model/biz/dd16.png' width='16'/>";
	} else if (node.type == "BMDICCD") {
		img = "<img src='../commons/img/model/biz/dr16.png' width='16'/>";
	}
	var tabTitle = img + " " + node.name;
	// 具体打开某个模型tab
	if (node.type == "BMRoot") {
		// 树上目前绑定不了根节点的事件
		// bmTabs.getItem("BMPreviewPanelID").show();//回到欢迎页
	} else if (node.type == "BMPD") {
		frmMain.cmd.value = "CONSOLE_M_PROCESS_DESIGNER_PORTAL";
		frmMain.processDefId.value = nodeId;
		frmMain.isSupport.value = supports_canvas();
		frmMain.appId.value = node.appid;
		var frameName = "AWS_BM_Tab_WF" + nodeId;
		var htmlSrc = "../commons/wait.htm";
		createViewTab(tabTitle, 'iframe', nodeId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
		frmMain.target = frameName;
		frmMain.submit();
		return false;
	} else if (node.type == "BMForm") {
		var htmlSrc = "../commons/wait.htm";
		frmMain.cmd.value = "CONSOLE_M_FORM_DESIGN_OPEN";
		frmMain.formDefId.value = nodeId;
		frmMain.appId.value = openAppId ? openAppId : node.appid;
		var frameName = "AWS_BM_Tab_Form_" + nodeId;
		var htmlSrc = "../commons/wait.htm";
		createViewTab(tabTitle, 'iframe', nodeId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
		frmMain.target = frameName;
		setTimeout(function () {
		frmMain.submit();
		}, 10);
		return false;
	} else if (node.type == "BMDICXD" || node.type == "BMDICCD") {
		var frameName = "AWS_BM_Tab_DIC_" + node.id;
		var dictTitle = node.name;
		var time = new Date().getMilliseconds();
		var htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_XMLDICT_EDIT_WEB&appId=" + node.appid + "&dictName=" + node.xmlName + "&dictTitle=" + encodeURI(dictTitle) + "&categoryName=" + encodeURI(node.category) + "&type=" + (node.isDic ? "createXD" : "createCD") + "&isHiddenDataSource=false";
		createViewTab(tabTitle, 'iframe', 'AWS_BM_Tab_DICT_new_' + node.id.split("_")[1], parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
		return false;
	} else if (node.type == "BMBO") {
		awsui.ajax.request({
			url : './jd',
			method : 'POST',
			async : false,
			data : {
				sid : sessionId,
				cmd : 'CONSOLE_M_BO_DESIGN_CHECK',
				boDefId : nodeId
			},
			err : function(r) {
				return false;
			},
			ok : function(r) {
				var htmlSrc = "../commons/wait.htm";
				frmMain.cmd.value = "CONSOLE_M_BO_DESIGN_OPEN";
				frmMain.boDefId.value = nodeId;
				var frameName = "AWS_BM_Tab_BO" + nodeId;
				/*
				 * if ( typeof node.exist != 'undefined' && node.exist == false) { $.simpleAlert('该模型物理表已丢失', 'warning',
				 * 2000, { model : true }); return false; }
				 */
				createViewTab(tabTitle, 'iframe', nodeId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
				frmMain.target = frameName;
				setTimeout(function () {
				frmMain.submit();
				}, 10);
			}
		});
		return false;
	} else if (node.type == "BMRP") {
		frmMain.cmd.value = "CONSOLE_M_REPORT_DESIGN_OPEN";
		frmMain.reportDefId.value = nodeId;
		frmMain.pageType.value = node.reportType;
		var frameName = "AWS_BM_Tab_RP_" + nodeId;
		var htmlSrc = "../commons/wait.htm";
		createViewTab(tabTitle, 'iframe', nodeId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
		frmMain.target = frameName;
		frmMain.submit();
		return false;
	} else if (node.type == "DWDetailed") {
		var htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_DW_DESIGN_PAGE&processGroupName=" + encodeURI(node.name) + "&processGroupId=" + node.processGroupId + "&title=" + encodeURI(node.name) + "&appId=" + node.appid;
		var title;
		if (node.name == "" || node.name == undefined) {
			title = node.qtip;
		} else {
			title = node.name;
		}
		createViewTab(img + " " + title, 'iframe', "DataWindow" + node.processGroupId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true);
	} else if (node.type == "BMCategory") {
		initAddButton();
		return;
	} else if (node.type == "BMApps") {
		initAddButton();
		return;
	} else {
		// 打开几大模型分组tab
		var htmlSrc = "";
		if (node.type == "BMPDGroup") {// 点击流程组名称时，直接展开该节点
			htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_PROCESS_DEF_LIST_PAGE&categoryName=" + node.category + '&searchKey=' + node.groupId + '&appId=' + node.appid;
			refreshNode = node;
		} else if (node.type == "BMPDCategory") {
			htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_PROCESS_DEF_LIST_PAGE&categoryName=" + node.category + "&searchKey=" + "&appId=" + node.appid;
			refreshNode = node;
		} else if (node.type == "BMFormCategory") {
			htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_FORM_DESIGN_LIST&groupName=" + node.category + "" + "&appId=" + node.appid;
			refreshNode = node;
		} else if (node.type == "BMBOCategory") {
			htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_BO_DESIGN_LIST&groupName=" + node.category + "" + "&appId=" + node.appid;
			refreshNode = node;
		} else if (node.type == "BMReportCategory") {
			htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_REPORT_DESIGN_LIST&groupName=" + node.category + "" + "&appId=" + node.appid;
			refreshNode = node;
		} else if (node.type == "BMDWCategory") {
			htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_DW_DESIGN_LIST_PAGE&groupName=" + node.category + "" + "&appId=" + node.appid;
			refreshNode = node;
		} else if (node.type == "BMDIC") {
			htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_XMLDICT_EDIT_LIST&categoryName=" + node.category + "" + "&appId=" + node.appid + "&pid=" + node.id;
			refreshNode = node;
		}
		openInfixedTab(tabTitle, 'iframe', bmMainWorkspaceFrameID, navtab, navtab.tabContentPanel, htmlSrc, true);
	}
}

// 打开新模型并尝试展开指定路径
function tryExpandNode(node) {
	createViewTabs(node);
	try {
		function findIdByName(appid, nodes, name) {
			var t = new RegExp(appid + "[0-9]*$"); // 为了匹配正确的级别
			for (var i = 0, size = nodes.length; i < size; i++) {
				if (nodes[i].name == name && t.test(nodes[i].id)) {
					return nodes[i].id;
				}
			}
		}
		//展开root
		if($("#tree_switch_root").hasClass("root-close")){
			bmtree.expandNode($("a[tbindex=root]"), true);
		}
		var nodeId = node.baseId, appId = node.appid, _appId = appId.replace(/\./g, "_");
		// 展开app
		bmtree.expandNode($("a[tbindex=" + _appId + "]"), true);
		// 展开catoryname
		var caTreeId = findIdByName(_appId, bmtree.getChildrenByPid(_appId), node.category);
		bmtree.expandNode($("a[tbindex=" + caTreeId + "]"), true);
		var tempIndx = caTreeId.split(_appId)[1];
		_appId += tempIndx;
		if ("BMPD" == node.type) {
			// 展开模型
			bmtree.expandNode($("a[tbindex=AWS_NODE_WC_WF_" + _appId + "_1]"), true);
			// 展开名称
			bmtree.expandNode($("a[tbindex=AWS_NODE_WG_WF_" + node.capdId + "]"), true);
			// 设置选中
			bmtree.selectNode("AWS_NODE_WF_ID_" + node.baseId, false);
		} else if ("BMForm" == node.type) {
			// 展开模型
			bmtree.expandNode($("a[tbindex=AWS_NODE_FC_FM_" + _appId + "_2]"), true);
			// 设置选中
			bmtree.selectNode("AWS_NODE_FM_ID_" + node.baseId, false);
		} else if ("BMBO" == node.type) {
			// 展开模型
			bmtree.expandNode($("a[tbindex=AWS_NODE_BC_BO_" + _appId + "_3]"), true);
			// 设置选中
			bmtree.selectNode("AWS_NODE_BO_ID_" + node.baseId, false);
		} else if ("DWDetailed" == node.type) {
			// 展开模型
			bmtree.expandNode($("a[tbindex=AWS_NODE_UC_UV_" + _appId + "_5]"), true);
			// 设置选中
			bmtree.selectNode("AWS_NODE_UV_ID_" + node.baseId, false);
		} else if ("BMDICXD" == node.type || "BMDICCD" == node.type) {
			// 展开模型
			bmtree.expandNode($("a[tbindex=AWS_NODE_WC_DC_" + _appId + "_6]"), true);
			// 设置选中
			if ("BMDICCD" == node.type) {
				bmtree.selectNode("CD_" + node.baseId, false);
			} else {
				bmtree.selectNode("XD_" + node.baseId, false);
			}
		}
		var target = $("li[id*=" + node.baseId + "]");
		if(target.length == 1){
			setTimeout(function(){
				var top = target.offset().top - 48;
				$("#bmtree").animate({
					scrollTop:  top + "px"
			    });
			},50);
		}
	} catch (e) {
		// tree_span_AWS_NODE_WF_ID_obj_6d6d1e4950d14cb3abb62bac10fdf7cd
		// parent.createViewTabs({"appid":"com.actionsoft.apps.newapp","name":"fsdf
		// v1.0(设计)","id":"000000000000000obj_6d6d1e4950d14cb3abb62bac10fdf7cd","type":"BMPD"});
	}
}

// 是否支持cavas
function supports_canvas() {
	return !!document.createElement('canvas').getContext;
}

// toolbar 新建模型事件
function createBizModel() {
	if (currentBMParam.type == bmCategoryPD || currentBMParam.type == bmCategoryFM || currentBMParam.type == bmCategoryBO || currentBMParam.type == bmCategoryRP || currentBMParam.type == bmCategoryDW || currentBMParam.type == newTypeXD) {
		// 直接打开对应的dialog
		processCreateModel(currentBMParam.type, currentBMParam.category, currentBMParam.appid)
	} else {
		var buttons = [ {
			text : '确定',
			cls : "blue",
			handler : function() {
				var result = getSelectedInfo();
				if (result) {
					selectedNodeType = undefined;
					$("#add-bm-dlg").dialog("close");
				}
			}
		}, {
			text : '取消',
			handler : function() {
				selectedNodeType = undefined;
				$("#add-bm-dlg").dialog("close");
			}
		} ];
		$("#add-bm-dlg").dialog({
			title : '新建...',
			height : 500,
			width : 820,
			buttons : buttons,
			onClose : function() {
				$("#add-bm-dlg .awsui-radio").check("option", "checked", false);
			}
		});
		// 初始化五大模型树
		initAddBizBMCheck();
		// 初始化app和category
		initAppAndCategory();
		if (subAdminPower) {
			$(".aws-categorys-list").find("li:not(#BMPDCategory)").hide();
		}
		// 从 概览首页 点击进入 业务模型界面 新建模型事件
		if (createNewModelByAppId.indexOf('Flag_KK_Click') > -1) {
			if (createNewModelByAppId.indexOf('Dw') > -1) {
				$('#BMDWCategory').click();
			} else if (createNewModelByAppId.indexOf('Form') > -1) {
				$('#BMFormCategory').click();
			} else if (createNewModelByAppId.indexOf('Bo') > -1) {
				$('#BMBOCategory').click()
			} else if (createNewModelByAppId.indexOf('Process') > -1) {
				$('#BMPDCategory').click()
			}
		}
	}
}
function formatState(state) { // select2的前缀实现方法
	if (!state.id) {
		return state.text;
	}
	var $state = $('<span>' + state.imgs + state.text + '</span>');
	return $state;
};
var categroyListHtml = "";
function initAppAndCategory() {
	// 默认category
	if (currentBMParam.category != "" && typeof currentBMParam.category != "undefined") {
		$('#categroyList').val(currentBMParam.category).trigger("change");
	}
	var currentAppid = currentBMParam.appid;
	// 如果从应用开发中创建的应用，进入该入口，createNewModelByAppId的值为创建的AppId
	if (createNewModelByAppId.length > 0) {
		currentAppid = createNewModelByAppId;
	}
	var appName = currentBMParam.appname;
	// 获取所有app category进行联动 category可以可输入
	var appList = getappIdList();
	var apphtml = "<span class='required'><select id='appid_select'  style='width:99%;'  ></select>";
	// <select id='appid_select' class='awsui-select' onchange=initCategroy()>
	// for (appid in appList) {
	// if (currentAppid == appid) {
	// apphtml += "<option value ='" + appid + "' selected='selected'>" + appList[appid] + "</option>";
	// } else {
	// apphtml += "<option value ='" + appid + "'>" + appList[appid] + "</option>";
	// }
	// }
	// apphtml += "</select></span>";
	apphtml += "</span>";
	$("#appContent").html(apphtml);
	if (categroyListHtml == '') {
		categroyListHtml = $("#category").html();
	} else {
		$("#category").html("");
		$("#category").html(categroyListHtml);
	}
	var options = {
		placeholder : '请选择一个应用',
		allowClear : true,
		data : appList,
		templateResult : formatState,
	};
	$("#appid_select").select2(options);
	$('#appid_select').val(currentAppid).trigger("change");
	$('#appid_select').on('select2:select', function(evt) {
		var data = evt.params.data;
		$("#category").html("");
		$("#category").html(categroyListHtml);
		initCategroy(appList, data.id, data.text);
	});
	// $("#appid_select").combobox({
	// multiple : false,
	// editable : true,
	// selectVal : currentAppid,
	// valueField : 'id',
	// width : "100%",
	// select : function(item, data) {
	// $("#category").html("");
	// $("#category").html(categroyListHtml);
	// initCategroy(appList, data.id, data.text);
	// },
	// source : appList
	// });
	initCategroy(appList, currentAppid, appName);
}
var initCateGroyVal = '';
function initCategroy(appList, appid, appName) {
	if (appid == "" && appList.length > 0) {
		appid = appList[0].value;
		appName = appList[0].label;
	}
	// $("#appid_select").val(appid);
	var categroyList = "";
	if($('#appid_select').val() != null && $('#appid_select').val() != ""){
		categroyList = getCategoryListByAppId(appid);
	}
	var options = {
		placeholder : '请选择或输入一个业务模型分类',
		allowClear : true,
		data : categroyList,
		tags : true
	};
	$("#categroyList").select2(options);
	if (currentBMParam.category == '') {
		$('#categroyList').val(categroyList[0]).trigger("change");
	} else {
		$('#categroyList').val(currentBMParam.category).trigger("change");
	}
	if (categroyList.length > 0) {
		initCateGroyVal = categroyList[0]
	}
}

function getSelectedInfo() {
	var appid = $("#appid_select").val();
	if (appid == "" || appid == "undefined") {
		$.simpleAlert('[应用名称]不允许为空', 'info', 2000, {
			model : true
		});
		return false;
	}
	var appList = getappIdList();
	var flag = false;
	for (var i = 0; i < appList.length; i++) {
		if (appList[i].id == appid) {
			flag = true;
		}
	}
	if (!flag) {
		$.simpleAlert('请输入正确的[应用名称]', 'info', 2000, {
			model : true
		});
		return false;
	}
	// var appid = $('#appid_select').val();
	var category = $("#categroyList").val();
	if (category == null || typeof category == "undefined") {
		$.simpleAlert('[业务模型分类]不允许为空', 'info', 2000, {
			model : true
		});
		return false;
	}
	category = category.trim();
	if (checkSymbols(category)) {
		$.simpleAlert("业务模型分类不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", 'info', 2000, {
			model : true
		});
		$("#categroyList").val(initCateGroyVal).trigger("change");
		return false;
	}
	if (selectedNodeType != null && selectedNodeType != "ROOT") {
		// 处理创建模型
		return processCreateModel(selectedNodeType, category, appid);
	} else {
		$.simpleAlert('请选择一个业务模型', 'info', 2000, {
			model : true
		});
		return false;
	}

}

function closeDialog() {
	$("#addModel-dialog").dialog("close");
}

function processCreateModel(type, groupname, appId) {
	var buttons = [ {
		text : '确定',
		cls : "blue",
		handler : function() {
		}
	}, {
		text : '继续新建',
		handler : function() {
		}
	}, {
		text : '关闭',
		handler : closeDialog
	} ];

	if (type != null && type == 'BMPDCategory') {
		winTitle = "新建流程模型";
		winDesc1 = "创建一个流程模型所需信息";
		winDesc2 = "流程模型";
		cmd = "CONSOLE_M_PROCESS_DEF_CREATE_PAGE";
		buttons = [ {
			text : '确定',
			cls : "blue",
			handler : function() {
			}
		}, {
			text : '关闭',
			handler : closeDialog
		} ];
		buttons[0].handler = function() {// 点击确定后调用的方法
			currentWin = $('#addBizModelIframe')[0].contentWindow;
			var creatBizFormDoc = $('#addBizModelIframe')[0].contentWindow.document;
			var prcessName = currentWin.document.getElementById("processName").value;
			var g = currentWin.document.getElementsByName("groupName")[0].value;
			var processGroupNameText = currentWin.document.getElementById("processGroupNameText").value;
			var myAppId = currentWin.document.getElementsByName("appId")[0].value;
			var processDefGroupNames = currentWin.processDefGroupNames;
			var isExt = isProcessGroupName(processDefGroupNames, processGroupNameText);
			if (!isExt) {
				currentWin.document.getElementById("processGroupId").value = "";
			}
			var processGroupId = currentWin.document.getElementById("processGroupId").value;
			creaetProcess2(g, prcessName, processGroupNameText, myAppId, processGroupId);
		};
		return openDialog('Diag1', 900, 290, cmd, winTitle, winDesc1, winDesc2, 'process.png', encodeURI(groupname), buttons, appId);
	} else {
		if (subAdminPower) {
			$.simpleAlert('不允许创建流程以外的其他模型', 'info', 2000, {
				model : true
			});
			return;
		}
	}
	if (type != null && type == bmCategoryFM) {
		openCreateFormDialog(groupname, appId);
		return true;
	} else if (type != null && type == bmCategoryBO) {
		cmd = "CONSOLE_M_BO_DESIGN_CREATEPAGE";
		winTitle = "新建BO模型";
		winDesc1 = "创建一个存储模型所需信息";
		winDesc2 = "存储模型";
		buttons[0].handler = function() {// 点击确定后调用的方法
			currentWin = $('#addBizModelIframe')[0].contentWindow;
			var creatBizBODoc = $('#addBizModelIframe')[0].contentWindow.document;
			createMetaData(currentWin.document.getElementById("frmMain"), 'CONSOLE_M_BO_DESIGN_CREATE', false);

		};
		buttons[1].handler = function() {// 点击确定后调用的方法
			currentWin = $('#addBizModelIframe')[0].contentWindow;
			var creatBizBODoc = $('#addBizModelIframe')[0].contentWindow.document;
			createMetaData(currentWin.document.getElementById("frmMain"), 'CONSOLE_M_BO_DESIGN_CREATE', true);

		};
		return openDialog('Diag1', 910, 400, cmd, winTitle, winDesc1, winDesc2, 'process.png', encodeURI(groupname), buttons, appId);
	} else if (type != null && type == bmCategoryRP) {
		cmd = "CONSOLE_M_REPORT_DESIGN_CREATE_PAGE";
		winTitle = "新建报表模型";
		winDesc1 = "创建一个报表模型所需信息";
		winDesc2 = "报表模型";

		buttons[0].handler = function() {// 点击确定后调用的方法
			currentWin = $('#addBizModelIframe')[0].contentWindow;
			var creatBizRPDoc = $('#addBizModelIframe')[0].contentWindow.document;
			createReport(creatBizRPDoc.getElementById("frmMain"), 'CONSOLE_M_REPORT_DESIGN_CREATE', false);
		};

		buttons[1].handler = function() {// 点击确定后调用的方法
			currentWin = $('#addBizModelIframe')[0].contentWindow;
			var creatBizRPDoc = $('#addBizModelIframe')[0].contentWindow.document;
			createReport(creatBizRPDoc.getElementById("frmMain"), 'CONSOLE_M_REPORT_DESIGN_CREATE', true);
		};
		return openDialog('Diag1', 900, 400, cmd, winTitle, winDesc1, winDesc2, 'process.png', encodeURI(groupname), buttons, appId);
	} else if (type != null && (type == bmCategoryDW)) {
		cmd = "CONSOLE_M_DW_DESIGN_PROCESS_CREATE";
		winTitle = "新建数据窗口模型";
		winDesc1 = "创建一个数据窗口模型所需信息";
		winDesc2 = "数据窗口模型模型";

		buttons = [ {
			text : '确定',
			cls : "blue",
			handler : function() {
			}
		}, {
			text : '关闭',
			handler : closeDialog
		} ];
		buttons[0].handler = function() {// 点击确定后调用的方法
			currentWin = $('#addBizModelIframe')[0].contentWindow;
			createDataWindows(currentWin.document.getElementById("viewtype").value, currentWin);
		};

		return openDialog('Diag1', 890, 400, cmd, winTitle, winDesc1, winDesc2, 'process.png', encodeURI(groupname), buttons, appId);
	} else if (type != null && (type == newTypeXD || type == 'DD' || type == 'DR')) {
		cmd = "CONSOLE_M_XMLDICT_DESIGN_CREATE_PAGE";
		if (type == "DD") {
			winTitle = "新建数据字典";
		} else if (type == "DR") {
			winTitle = "新建参考录入";
		} else {
			winTitle = "新建数据字典";
		}
		winDesc1 = "创建XML数据字典所需信息";
		winDesc2 = "数据字典模型";

		buttons = [ {
			text : '确定',
			cls : "blue",
			handler : function() {
			}
		}, {
			text : '关闭',
			handler : closeDialog
		} ];
		buttons[0].handler = function() {// 点击确定后调用的方法
			currentWin = $('#addBizModelIframe')[0].contentWindow;
			createXmlDict(currentWin.document.getElementById("xmlName").value, appId, currentWin.document.getElementById("groupName").value, currentWin.document.getElementById("createType").value);
		};
		return openDialog('Diag1', 900, 290, cmd, winTitle, winDesc1, winDesc2, 'xml.png', encodeURI(groupname), buttons, appId);
	}
}

// 查找该流程是否在已存在的流程组中
function isProcessGroupName(processDefGroupNames, groupName) {
	if (processDefGroupNames) {
		for (var i = 0; i <= processDefGroupNames.length; i++) {
			if (processDefGroupNames[i] == groupName) {
				return true;
			}
		}
	}
	return false;
}

function creaetProcess2(categoryName, p, g, myAppId, processGroupId) {
	var isSelect = false;
	var processName;
	var processGroupName;
	if (p) {
		processName = p;
	} else {
		processName = $.trim($("#processName").val());
	}
	if (processName == "") {
		$.simpleAlert('[流程名称]不允许为空', 'info', 2000, {
			model : true
		});
		return;
	}
	if (checkSymbols(processName)) {
		$.simpleAlert("[流程名称]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", 'info', 2000, {
			model : true
		});
		return;
	}
	if (g) {
		processGroupName = g;
	} else {
		processGroupName = $.trim($("#processGroupNameText").val());
	}
	if (processGroupName == "") {
		$.simpleAlert('[流程组名称]不允许为空', 'info', 2000, {
			model : true
		});
		return;
	}
	if (checkSymbols(processGroupName)) {
		$.simpleAlert("[流程组名称]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", 'info', 2000, {
			model : true
		});
		return;
	}
	var appId = document.getElementById("frmMain").appId.value;
	openWorkFlowCardByNewBtn('', processName, processGroupName, categoryName, myAppId, processGroupId);
	closeDialog();
}

function openDialog(id, w, h, cmd, titile, message, messageTitle, titleIcon, groupname, buttons, appId) {
	var url = "./w?sid=" + sessionId + "&cmd=" + cmd + "&groupName=" + groupname + "&appId=" + appId;
	if (cmd == "CONSOLE_M_PROCESS_DEF_CREATE_PAGE") {// 当前为流程创建
		var node = bmtree.getSelectedNode();
		var groupId = "";
		var processGroupName = "";
		if (node != null) {
			groupId = node.groupId;
			processGroupName = node.groupName;
		}

		if (groupId == undefined) {
			groupId = "";
		}
		if (processGroupName == undefined) {
			processGroupName = "";
		}
		url += "&processGroupId=" + groupId + "&processGroupName=" + encodeURI(processGroupName);
	} else if (cmd == "CONSOLE_M_XMLDICT_DESIGN_CREATE_PAGE") {
		url += "&type=" + selectedNodeType;
	}
	$('#addBizModelIframe').attr('src', url);
	$('#addModel-dialog').attr('title', titile);
	$("#addModel-dialog").dialog({
		buttons : buttons,
		height : h,
		width : w
	});
	// 标志新建窗口是否关闭
	return true;
}

function initAddBizBMCheck() {
	$(".aws-categorys").find(".mark").remove();
	$(".aws-categorys-list li").css({
	// borderColor : "#fff"
	}).removeClass("aws-categorysHover");
	$(".aws-categorys-list li").on("click", function() {
		var html = "<div class='mark'><img src='../apps/_bpm.platform/img/model/form_designer/mark.png'></div>";
		$(".aws-categorys").find(".aws-categorysHover").css({
		// borderColor : "#fff"
		}).removeClass("aws-categorysHover");
		$(".aws-categorys").find(".mark").remove();
		$(html).appendTo($(this));
		$(this).css({
			borderColor : "#ddd"
		});
		$(this).addClass("aws-categorysHover");
		selectedNodeType = $(this).attr("id");
	});
}

// 获得所有的app信息 json
function getappIdList() {
	var data = null;
	awsui.ajax.request({
		url : './jd',
		type : 'GET',
		async : false,
		data : {
			sid : sessionId,
			cmd : 'CONSOLE_M_GET_APPLIST'
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			$.simpleAlert('网络有问题请求失败', 'info', 2000, {
				model : true
			});
			return false;
		},
		success : function(r) {
			data = r.data;
		}
	});
	return data;
}

// 获得某个app下的category信息
function getCategoryListByAppId(appid) {
	var data = null;
	awsui.ajax.request({
		url : './jd',
		type : 'POST',
		async : false,
		data : {
			sid : sessionId,
			cmd : 'CONSOLE_M_GET_APP_CATEGORYLIST',
			appid : appid
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			$.simpleAlert('网络有问题请求失败', 'info', 2000, {
				model : true
			});
			return false;
		},
		success : function(r) {
			data = r.data;
		}
	});
	return data;
}

function createCategory() {
	var categoryName = $('#categoryname_input').val();
	// var appId = $("#appid_select option:selected").val();
	var appId = $("#appid_select").val();

	// 获取treeNodeid 这是一个约定
	var treeId = appId.replace(/\./ig, '_');
	if (categoryName == null || categoryName == '') {
		$.simpleAlert('[模型分类名称]不允许为空', 'info', 2000, {
			model : true
		});
	}

	var treenewNode = {
		type : 'BMCategory',
		iconCls : 'treeBMCategory',
		leaf : false,
		draggable : false,
		open : false
	};
	treenewNode.name = categoryName;
	treenewNode.appid = appId;
	treenewNode.id = 'AWS_NODE_BC_ID_' + (nodeIdGenerator++);
	treenewNode.pid = treeId;
	var obj = bmtree.treeObj.find("li[li_index=" + treeId + "]");

	bmtree.addNode(treenewNode, obj, function() {
		bmtree.initStyles();
		bmtree.initIcon(treenewNode);
	});
	bmtree.initEvent();
}

function refreshBMTree() {
	currentBMParam = {
			type : '',
			category : '',
			appid : '',
			appname : ''
		};
	initAddButton();
	$("#bmtree").html('');
	var dataUrl = './jd?sid=' + sessionId + '&cmd=CONSOLE_M_BM_TREE_DATA_JSON';
	var setting = {
		showIcon : true,
		dblClickToExpand : true,
		animate : true,
		remember : true,
		event : {
			beforeExpand : loadChildNode,
			onClick : createViewTabs
		},
		dataModel : {
			url : dataUrl,
			method : "POST",
			dataType : "text",
			params : {
				requestType : 'BMRoot',
				param1 : 0,
				param2 : '',
				param3 : ''
			}
		}
	};
	setting.contextMenu = {
		items : [ {
			text : "修改分类",
			tit : "update",
			method : updateCategory
		}, {
			text : "分类迁移",
			tit : "move",
			method : moveCategory
		} ],
		target : "#contextMenu"
	};
	bmtree = awsui.tree.init($("#bmtree"), setting);
	$.simpleAlert("业务模型树已刷新", "info", 2000);
}

/* 创建报表 */
function createReport(form, mycmd, isContinueNew) {
	if ($.trim(form.reportName.value) == "") {
		$.simpleAlert('请填写报表名称', 'info', 2000, {
			model : true
		});
		return false;
	}
	if (!validateLengthAndSpace("报表名称", form.reportName.value, 30, false, false)) {
		return false;
	}
	var reportType = "1";
	for (var i = 0; i < form.reportTypeSelect.length; i++) {
		if (form.reportTypeSelect[i].checked) {
			reportType = form.reportTypeSelect[i].value;
		}
	}
	var reportName = form.reportName.value;
	var groupName = form.groupName.value;

	var paramss = {
		sid : sessionId,
		cmd : mycmd,
		addType : isContinueNew ? 1 : 0,
		appId : form.appId.value,
		reportName : reportName,
		reportType : reportType,
		groupName : groupName
	};
	sendAjaxRequest(paramss, isContinueNew);
}

/* 创建元数据 */
function createMetaData(form, mycmd, isContinueNew) {
	var params;
	var entityName = form.entityName.value;
	var t = 1000, fun = function() {
		form.entityNameTemp.focus();
	};
	if (entityName != "系统默认" && /.*[\u4e00-\u9fa5]+.*$/.test(entityName)) {
		$.simpleAlert('[存储名称]不允许包含中文', 'info', t, {
			callback : fun,
			model : true
		});
		return;
	}
	if (entityName.replace(/\s/ig, '').length == 0) {
		$.simpleAlert('[存储名称]不允许为空', 'info', t, {
			callback : fun,
			model : true
		});
		return;
	}
	if (isIncSpace(entityName)) {
		$.simpleAlert('[存储名称]不允许包含空格', 'info', t, {
			callback : fun,
			model : true
		});
		return;
	}
	if (entityName.indexOf('-') != -1) {
		$.simpleAlert('[存储名称]不允许包含-', 'info', t, {
			callback : fun,
			model : true
		});
		return;
	}
	if (entityName.indexOf('@') != -1) {
		$.simpleAlert('[存储名称]不允许包含@', 'info', t, {
			callback : fun,
			model : true
		});
		return false;
	}
	if (entityName.length > 100) {
		$.simpleAlert('[存储名称]长度不允许大于100个字符', 'info', t, {
			callback : fun,
			model : true
		});
		return;
	}
	if (checkSymbols(entityName)) {
		$.simpleAlert("[存储名称]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", 'info', t, {
			callback : fun,
			model : true
		});
		return;
	}
	var entityTitle = form.entityTitle.value;
	if (entityTitle.replace(/\s/ig, '').length == 0) {
		$.simpleAlert('[存储标题]不允许为空', 'info', 2000, {
			model : true
		});
		form.entityTitle.focus();
		return;
	}
	if (entityTitle.length > 100) {
		$.simpleAlert('[存储标题]长度不允许大于100个字符', 'info', 2000, {
			model : true
		});
		form.entityTitle.focus();
		form.entityTitle.value = entityTitle;
		return;
	}
	if (checkSymbols(entityTitle)) {
		$.simpleAlert("[存储标题]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", 'info', 2000, {
			model : true
		});
		form.entityTitle.focus();
		form.entityTitle.value = entityTitle;
		return;
	}
	// 根据具体的页面内容拼装发送服务器请求的参数
	params = {
		sid : sessionId,
		cmd : mycmd,
		entityName : form.entityName.value,
		entityTitle : form.entityTitle.value,
		groupName : form.groupName.value,
		appId : form.appId.value,
		boType : form.boType.value,
		viewType : form.viewType.value,
		viewSQL : form.viewSQL.value,
		target : form.target.value
	};

	// 发送公共的服务器请求
	sendAjaxRequest(params, isContinueNew);
}

// 创建表单模型方法
function createFormModel(form, mycmd, isContinueNew) {
	var gridData = currentWin.MainStructureZone.getGridData();
	if (!gridData) {
		return false;
	}
	var params = gridData.split(":");
	var formstyle = "";
	var isCreate = true;
	var data = params[2];
	var formName = form.formName.value;
	var formType = form.groupName.value;
	var appId = form.appId.value;
	var params;
	if (!currentWin.validateLengthAndSpace('表单名称', formName)) {
		return false;
	}
	if (!currentWin.validateLengthAndSpace('表单名称', formName, 80, false, false)) {
		return false;
	}
	if (checkSymbols(formName)) {
		$.simpleAlert("[表单名称]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", 'info', 2000, {
			model : true
		});
		return false;
	}
	var paramss = {
		sid : sessionId,
		cmd : mycmd,
		appId : appId,
		formName : formName,
		formType : formType,
		formstyle : formstyle,
		isCreate : isCreate,
		data : data
	};
	sendAjaxRequest(paramss, isContinueNew);
}

// 创建xml字典
function createXmlDict(val, appId, groupname, createType) {
	if (trim(val) == "") {
		$.simpleAlert("[字典标题]不允许为空", "info", 2000);
		return false;
	}
	if (checkSymbols(trim(val), false, false, false)) {
		$.simpleAlert("[字典标题]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", "info", 2000, {
			model : true
		});
		return false;
	}
	var time = new Date().getMilliseconds();
	var tabId = 'AWS_BM_Tab_DICT_new_' + time;
	var htmlSrc = './w?sid=' + frmMain.sid.value + '&cmd=CONSOLE_M_XMLDICT_EDIT_WEB&appId=' + appId + "&dictName=&dictTitle=" + encodeURI(val) + "&categoryName=" + encodeURI(groupname) + "&type=" + createType + "&isHiddenDataSource=false";
	var img = "";
	if (createType == "" || createType == "createXD") {
		img = "<img src='../commons/img/model/biz/dd16.png' width='16'>";
	} else {
		img = "<img src='../commons/img/model/biz/dr16.png' width='16'>";
	}
	createViewTab(img + val, 'iframe', tabId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, val);
	$("#addModel-dialog").dialog("close");
	setTimeout(function() {
		try {
			AWS_BM_Main_Workspace_Frame_ID.location.href = AWS_BM_Main_Workspace_Frame_ID.location.href;
		} catch (e) {
		}
		refreshCurrentTreeNode();
	}, 1000);
}

// 创建数据窗口模型模型方法
function createDataWindows(val, currentWin) {
	// 创建流程视图
	if (val == 0) {
		var form = currentWin.document.getElementById("frmMain");
		if (form.flowgroup.value == '0') {
			$.simpleAlert("[绑定流程组]不允许为空", "info", 2000);
			return false;
		}
		if (form.title.value == "") {
			$.simpleAlert("[应用主标题]不允许为空", "info", 2000);
			return false;
		}
		if (checkSymbols(form.title.value, false)) {
			$.simpleAlert("[应用主标题]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", "info", 2000);
			return false;
		}
		createFlowDW(form);
		// 创建仅存储视图
	} else {
		createBoProcessAndView(currentWin.document.getElementById("frmMain"), false);
	}
}

// 创建流程数据窗口模型xml文件
function createFlowDW(form) {
	$.simpleAlert("loading", "loading", {
		model : true
	});
	params = {
		sid : sessionId,
		cmd : "CONSOLE_M_DW_PROCESS_VIEW_CREATE",
		appId : form.appId.value,
		title : form.title.value,
		processDefId : form.flowgroup.value
	// 流程组
	};
	awsui.ajax.request({
		url : './jd',
		type : 'POST',
		data : params,
		alert : false,
		success : function(msg) {
			$.simpleAlert("close");
			if (msg.result == "ok") {
				var newNode = msg.data;
				if (newNode.tpye == "dw") {
					// 关闭创建dialog
					closeDialog();
					/*
					 * try { // 重新加载树节点 var currentNode = bmtree.getSelectedNode(); if
					 * (currentNode.hasOwnProperty('open')) { loadChildNode(currentNode, 'reload'); } else { var
					 * parentNode = bmtree.getNodeById(currentNode.pid) loadChildNode(parentNode, 'reload'); } }
					 * catch(e) { }
					 */
					try {
						AWS_BM_Main_Workspace_Frame_ID.location.href = AWS_BM_Main_Workspace_Frame_ID.location.href;
					} catch (e) {
					}
					// 创建并打开试图
					openDataWindow(newNode.processDefId, newNode.processGroupName, newNode.title, newNode.processGroupId, newNode.appId, newNode.categoryName, newNode.dwType);
				}
			} else {
				$.simpleAlert(msg.msg, 'warning', 2000, {
					model : true
				});
				return false;
			}
		}
	});
}

// 创建仅存储视图
function createBoProcessAndView(form, isContinueNew) {
	var params;
	if (form.groupName.value == "") {
		$.simpleAlert("[模型分类]不允许为空", "info", 2000);
		return false;
	}
	if (form.title.value == "") {
		$.simpleAlert("[应用主标题]不允许为空", "info", 2000);
		return false;
	}
	if (checkSymbols(form.title.value, false)) {
		$.simpleAlert("[应用主标题]不允许包含|'\"。、，+*/%^=\\!&:;~`#<>$等字符", "info", 2000);
		return false;
	}
	var dataplans = form.dataplan.value;
	if (dataplans == "") {
		$.simpleAlert("[数据方案]不允许为空", "info", 2000);
		return false;
	}
	if (!checkvalue2("数据方案", dataplans)) {
		return false;
	}
	if (dataplans.replace(/,/g, "") == "") {
		$.simpleAlert("[数据方案]不允许全为逗号", "info", 2000);
		return false;
	}
	if (/[\[\]\{\}\\%&<>|'"\/]/g.test(dataplans)) {
		$.simpleAlert("[数据方案]不允许包含特殊字符", "info", 2000);
		return false;
	}
	dataplans = dataplans.replace(/,{2,}/g, ",").replace(/^,/g, "").replace(/,$/g, "");
	params = {
		sid : sessionId,
		cmd : 'CONSOLE_M_DW_BO_PROCESS_CREATE',
		appId : form.appId.value,
		processGroupName : form.title.value, // 流程组名称(应用主标题)
		processName : form.title.value,
		groupName : form.groupName.value, // 模型分类
		dwType : form.viewtype.value, // 模型分类 1为仅存储 2为报表
		dwReportType : form.dwReportType.value, // 报表分类 （作为js传参，java不必接收）
		formModelId : form.formModelId.value,
		type : 0,
		isDw : true,
		initStepName : dataplans
	};
	// 发送创建Bo流程和数据窗口模型ajax请求
	sendAjaxRequest(params, isContinueNew);
}

function sendAjaxRequest(params, isContinueNew) {
	var currentNode;
	if (typeof currentWin == 'undefined' || currentWin == null)
		currentWin = window;
	// 与弹出窗口公用一个Ajax请求
	$.simpleAlert("loading", "loading", "no");
	awsui.ajax.request({
		url : './jd',
		type : 'POST',
		data : params,
		dataType : "json",
		async : false,
		alert : params.isDw ? false : true,
		success : function(r) {
			if (awsui.ajax.ok(r)) {
				$.simpleAlert("close");
			}
			if (isContinueNew) {
				currentWin.location.href = currentWin.location.href;
			} else {
				try {
					// 关闭拷贝对话框
					$("#copy-bm-dlg").dialog("close");
				} catch (e) {
				}
				try {
					if (awsui.ajax.ok(r)) {
						// 关闭创建对话框
						closeDialog();
					}
				} catch (e) {
				}
			}
			// 此处刷新相应界面列表
			var newNode = r.data;
			if (newNode.type == 'dw') {
				// 如果是dw类型则（此时刷新会导致bug所以什么也不执行，待后面刷新）
			} else {
				// 重新加载树节点
				refreshCurrentTreeNode();
				try {
					if (newNode.type == 'fm') {
						var groupName = params.formType;
						var appId = params.appId;
						var url = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_FORM_DESIGN_LIST&groupName=" + encodeURI(groupName) + "" + "&appId=" + appId + "&tmp=" + Math.random();
						$("#AWS_BM_Main_Workspace_Frame_ID").attr("src", url);
						$("input[type='checkbox']").check("uncheck");
					} else {
						AWS_BM_Main_Workspace_Frame_ID.location.reload(true);
					}
				} catch (e) {
				}
			}
			// 此处使用json
			if (!isContinueNew && awsui.ajax.ok(r)) {
				if (newNode.type == 'fm') {
					openFormCard(newNode.id, newNode.name, 'iconBMForm', 1);
				} else if (newNode.type == 'bo') {
					openMetaDataCard(newNode.id, newNode.name, 'iconBMBO');
				} else if (newNode.type == "rp") {
					openReportCard(newNode.id, newNode.name, newNode.cls, newNode.rtype);
				} else if (newNode.type == 'dw') {
					openDataWindow(newNode.processDefId, newNode.processGroupName, newNode.title, newNode.processGroupId, newNode.appId, newNode.categoryName, newNode.dwType, params.dwReportType);
				}
			}
		}
	});
}

// 创建Report后打开Report tab
function openReportCard(nodeId, nodeName, cls, reportType) {
	frmMain.cmd.value = "CONSOLE_M_REPORT_DESIGN_OPEN";
	frmMain.reportDefId.value = nodeId;
	frmMain.pageType.value = reportType;
	var frameName = "AWS_BM_Tab_RP_" + nodeId;
	var htmlSrc = "../commons/wait.htm";
	createViewTab("<img src='../commons/img/model/biz/report16.png'> " + nodeName, 'iframe', nodeId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
	setTimeout(function() {
		frmMain.target = frameName;
		frmMain.submit();
	}, 10);
	return false;
}

// 创建BO后打开BO tab
function openMetaDataCard(nodeId, nodeName, cls) {
	var htmlSrc = "../commons/wait.htm";
	frmMain.cmd.value = "CONSOLE_M_BO_DESIGN_OPEN";
	frmMain.boDefId.value = nodeId;
	var frameName = "AWS_BM_Tab_BO" + nodeId;
	var img = "bo16.png";
	if (cls.indexOf("BMBOCC") != -1) {
		img = "bo16-cc.png";
	} else if (cls.indexOf("BMBOVCC") != -1) {
		img = "bo16-cc-1.png";
	}else if (cls.indexOf("BMBOV") != -1) {
		img = "bo16-cc-1.png";
	} else if (cls.indexOf("BMBS") != -1) {
		img = "bo16-2.png";
	}
	createViewTab("<img src='../commons/img/model/biz/" + img + "' width='16'/> " + nodeName, 'iframe', nodeId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
	setTimeout(function() {
		frmMain.target = frameName;
		frmMain.submit();
	}, 10);
	return false;
}

// 创建表单后打开表单tab
function openFormCard(nodeId, nodeName, cls, isHasDatasource, appId, categoryName) {
	// 检查当前表单是否含有数据源
	// if(isHasDatasource==0){
	// openCreateFormDialog($("input[name='groupName']").val(),$("input[name='appId']").val(),undefined,true,nodeName,nodeId);
	// }else{
	var frmMain = $("#frmMain").get(0);
	frmMain.cmd.value = "CONSOLE_M_FORM_DESIGN_OPEN";
	frmMain.formDefId.value = nodeId;
	frmMain.appId.value = appId;
	frmMain.categoryName.value = categoryName;
	var frameName = "AWS_BM_Tab_Form_" + nodeId;
	var htmlSrc = "../commons/wait.htm";
	parent.createViewTab(nodeId, "<img src='../commons/img/model/biz/form16.png' width='16'/> " + nodeName, cls, htmlSrc, frameName);
	setTimeout(function() {
		frmMain.target = frameName;
		frmMain.submit();
	}, 100);
	// }

	return false;
}

// 创建DW后打开DW tab
function openDataWindow(processDefId, processGroupName, title, processGroupId, appId, categoryName, dwType, dwReportType) {
	dwType = dwType == null ? -1 : dwType;
	dwReportType = dwReportType == null ? -1 : dwReportType;
	categoryName = categoryName == null ? "" : categoryName;
	var htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_DW_DESIGN_PAGE&processGroupName=" + encodeURI(processGroupName) + "&title=" + encodeURI(title) + "&processGroupId=" + processGroupId + "&appId=" + appId + "&dwType=" + dwType + "&dtt=" + dwReportType + "&categoryName=" + encodeURI(categoryName);
	createViewTab("<img src='../commons/img/model/biz/dw16.png' width='16'/> " + title, 'iframe', "DataWindow" + processGroupId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true);
	// 重新加载树节点
	setTimeout(refreshCurrentTreeNode, 1000);
	return false;
}

// 创建Dictionary后打开 tab
function openDicCard(title, createType, appId, groupname, dicName, id) {
	var htmlSrc = './w?sid=' + frmMain.sid.value + '&cmd=CONSOLE_M_XMLDICT_EDIT_WEB&appId=' + appId + "&dictName=" + dicName + "&dictTitle=" + encodeURI(title) + "&categoryName=" + encodeURI(groupname) + "&type=" + createType + "&isHiddenDataSource=false";
	var time = new Date().getMilliseconds();
	var tabId = 'AWS_BM_Tab_DICT_new_' + id;
	// var tabId = 'AWS_BM_Tab_DICT_new_' + time;
	var img = "";
	if (createType == "" || createType == "createXD") {
		img = "<img src='../commons/img/model/biz/dd16.png' width='16'/>";
	} else {
		img = "<img src='../commons/img/model/biz/dr16.png' width='16'/>";
	}
	createViewTab(img + title, 'iframe', tabId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, "xmldict");
	return false;
}

/**
 * 新建一个空白流程页面
 */
function openWorkFlowCardByNewBtn(processDefId, processName, processGroupName, categoryName, appId, processGroupId) {
	// 新版Flex流程设计器入口
	var time = new Date().getMilliseconds();
	var frameName = "AWS_BM_Tab_WF_" + time;
	var tabId = 'AWS_BM_Tab_WF_new_' + time;
	var htmlSrc = "./w?sid=" + sessionId + "&cmd=CONSOLE_M_PROCESS_DESIGNER_PORTAL&processDefId=" + processDefId + "&processName=" + encodeURI(processName) + "&processGroupName=" + encodeURI(processGroupName) + "&categoryName=" + encodeURI(categoryName) + "&isSupport=" + supports_canvas() + "&appId=" + appId + "&processGroupId=" + processGroupId;
	createViewTab("<img src='../commons/img/model/biz/process16.png' width='16'/> " + processName + " v1.0(设计)", 'iframe', tabId, parent.bmtabs, parent.bmtabs.tabContentPanel, htmlSrc, true, frameName);
	return false;
}

/**
 * 打开流程页面
 */
function openProcessDefCard(processDefId, tabTitle, iconClassName, appId) {
	// 新版Flex流程设计器入口
	frmMain.cmd.value = "CONSOLE_M_PROCESS_DESIGNER_PORTAL";
	frmMain.processDefId.value = processDefId;
	frmMain.isSupport.value = supports_canvas();
	frmMain.appId.value = appId;
	var frameName = "AWS_BM_Tab_WF" + processDefId;
	var tabId = frameName;
	var htmlSrc = "../commons/wait.htm";
	parent.createViewTab(processDefId, "<img src='../commons/img/model/biz/process16.png' width='16'/> " + tabTitle, iconClassName, htmlSrc, frameName);
	setTimeout(function() {
		frmMain.target = frameName;
		frmMain.submit();
	}, 10);

	return false;
}

// 刷新树节点
function refreshCurrentTreeNode(nodeId, type) {
	if (typeof nodeId == 'string' && nodeId != null && typeof type == 'string') {
		switch (type) {
		case 'bo':
			nodeId += 'AWS_NODE_BO_ID_';
			break;
		case 'fm':
			nodeId += 'AWS_NODE_FM_ID_';
			break;
		case 'rp':
			nodeId += 'AWS_NODE_RP_ID_';
			break;
		case 'dw':
			nodeId += 'AWS_NODE_UV_ID_';
			break;
		case 'pd':
			nodeId += 'AWS_NODE_WF_ID_';
			break;
		case 'pdg':
			nodeId += 'AWS_NODE_WG_WF_';
			break;
		case 'dic':
			break;
		default:
			$.simpleAlert('刷新失败未找到节点[' + nodeId + ']', 'info', 2000, {
				model : true
			});
		}
		loadChildNode(bmtree.getNodeById(nodeId), 'reload');
	} else if (typeof bmtree.getSelectedNode() != 'undefined') {
		var currentNode = bmtree.getSelectedNode();
		if (currentNode.type == 'BMApps' && bmtree.existsChildren(currentNode.id)) {
			loadChildNode(currentNode, 'reload');
		} else if (currentNode.type == bmCategory) {
			loadChildNode(bmtree.getNodeById(currentNode.pid), 'reload');
			loadChildNode(currentNode, 'reload');
		} else {
			loadChildNode(currentNode, 'reload');
		}
	}
}

// 刷新最后一次列表节点
function refreshLastList() {
	loadChildNode(refreshNode, 'reload');
}

//初始化新增“+”符号按钮
function initAddButton(button){
	$('#add').remove();
	$('#refresh').after("<a class='awsui-linkbutton' id='add' onclick='createBizModel()' awsui-qtip='新建'> <img src='../apps/_bpm.platform/img/model/add.gif'> </a>");
}

//刷新新增“+”符号按钮,具体模型会调用此方法进行新增按钮加载
function refreshAddButton(button){
	$('#add').remove();
	$('#refresh').after(button);
}

function isChinese(temps) {
	var re = /[^\u4e00-\u9fa5]/;
	var str_array = new Array();
	for (var i = 0; i < temps.length; i++) {
		str_array[i] = temps.substring(i, i + 1);
	}
	for (var i = 0; i < str_array.length; i++) {
		var temp = str_array[i];
		if (!re.test(temp))
			return false;
	}
	return true;
}

// 校验非字母开头的串为不正确的串
function isTrueName(s) {
	var patrn = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._\s]){4,19}$/;
	if (!patrn.exec(s))
		return false;
	return true;
}
