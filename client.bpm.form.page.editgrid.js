/*!
 * =====================================================
 * AWS可编辑子表运行时库文件
 * v1.0 (http://www.actionsoft.com.cn)
 * 发布后文件名：client.bpm.form.page.editgrid.js
 * =====================================================
 */
/**
 * AWS可编辑子表操作
 */
var AWSGrid = {
	version: "2.4.1",
	awsgridRegional: {
		'cn': {"strLoading": "加载中", "strAdd": "添加", "strEdit": "编辑", "strDelete": "删除", "strSearch": "搜索", "strNothingFound": "暂无结果", "strNoRows": "暂无结果", "strSelectedmatches": "选择{0}{1}匹配", "strPrevResult": "上一结果", "strNextResult": "下一结果"},
		'big5': {"strLoading": "加載中", "strAdd": "添加", "strEdit": "編輯", "strDelete": "刪除", "strSearch": "搜索", "strNothingFound": "暫無結果", "strNoRows": "暫無結果", "strSelectedmatches": "選擇{0}{1}匹配", "strPrevResult": "上壹結果", "strNextResult": "下壹結果"}
	},
	awsGridPagerRegional: {
		'cn': {"strPage": "第 {0} 页（共 {1} 页）", "strFirstPage": "第一页", "strPrevPage": "上一页", "strNextPage": "下一页", "strLastPage": "尾页", "strRefresh": "刷新", "strRpp": false, "strDisplay": "显示 {0} 到 {1} 条，共 {2} 条"},
		'big5': {"strPage": "第 {0} 頁（共 {1} 頁）", "strFirstPage": "第壹頁", "strPrevPage": "上壹頁", "strNextPage": "下壹頁", "strLastPage": "尾頁", "strRefresh": "刷新", "strRpp": false, "strDisplay": "顯示 {0} 到 {1} 條，共 {2} 條"}
	},
	/**
	 * 子表/字段子表的列表
	 */
	list: new Array(),
	/**
	 * 将BO表放入列表中
	 *
	 * @param {String}  boDefName BO表表名
	 */
	put: function (boDefName) {
		this.list.push(boDefName);
	},
	/**
	 * 扩展配置信息
	 */
	extendSetting: function (boDefName, BOGridSetting) {
		var that = this;
		//高度
		if (BOGridSetting.flexHeight) {
			BOGridSetting.height = "flex";
			delete BOGridSetting.flexHeight;
		}
		//国际化
		if (BOGridSetting.language != "en") {
			$.extend(BOGridSetting, this.awsgridRegional[BOGridSetting.language]);
			$.extend(BOGridSetting.pageModel, this.awsGridPagerRegional[BOGridSetting.language]);
		}
		BOGridSetting.editModel.saveKey = -3; //不使用
		//editor边框
		if (BOGridSetting.editModel) {
			BOGridSetting.editModel.cellBorderWidth = 1;
		} else {
			BOGridSetting.editModel = {cellBorderWidth: 1}
		}
		//边框样式
		if (BOGridSetting.cls) {
			$("#" + boDefName).addClass(BOGridSetting.cls);
		}
		//其他样式
		if (BOGridSetting.collapsible) {
			BOGridSetting.collapsible.css = {zIndex: 497}
		} else {
			BOGridSetting.collapsible = {css: {zIndex: 497}}
		}
		BOGridSetting.collapsible.toggle = false; //默认关闭最大化
		BOGridSetting.collapsible.ctitle = 展开;
		BOGridSetting.collapsible.etitle = 收起;
		BOGridSetting.collapsible.ttitle = 最大化;
		BOGridSetting.toggle = function (event, obj) {
			if (obj.state == "max") {
				$("#" + boDefName).find(".ui-icon.ui-icon-arrow-4-diag").attr("title", 还原窗口);
			} else {
				$("#" + boDefName).find(".ui-icon.ui-icon-arrow-4-diag").attr("title", 最大化);
			}
		}
		//翻页事件
		if (BOGridSetting.pageModel) {
			BOGridSetting.pageModel.beforeChange = function () {
				//翻页事件
				var grid = that.getGrid(boDefName)
				var m = grid.awsGrid("getEditData");
				if (m != null && m.length > 0) {
					$.simpleAlert("请保存数据后再翻页，如不需保存数据请点击刷新再翻页", "info", 3000)
					return false;
				}
				return true;
			}
		}
		//空数据显示
		BOGridSetting.noRows = function (obj) {
			obj.boDefName = boDefName;
			return that.noRowsShow(obj);
		}
		try {
			//自定义规则设置
			dynamicRule.awsGridSettingInit(boDefName, BOGridSetting);
		} catch (e) {
		}
		if (checkGridFnEventExist(boDefName, "_GridCustomSetting")) {
			try {
				//判断是否有加载后事件
				eval(boDefName + "_GridCustomSetting(BOGridSetting)");
			} catch (e) {
			}
		}
	},
	/**
	 * 根据配置信息执行Grid的渲染动作
	 */
	initGrid: function (boDefName) {
		//var start = new Date().getTime();
		var isRender = true;//默认渲染
		//初始化grid
		if ($("#" + boDefName).is(":hidden")) {//初始判断，隐藏情况时，不渲染
			isRender = false;
		}
		var div = $("#" + boDefName);
		if (isRender == false && div.parents(".aws-form-ux-tab-content").length > 0) {//判断特殊情况
			isRender = true;
		} else if (isRender == false && div.parents(".ui-accordion-content").length > 0) {
			//还需要判断手风琴模式的
			isRender = true;
		}
		var obj = this.getObject(boDefName);//如果已经初始化，则不处理了
		if (obj != null) {
			return;
		}
		debugger;
		if (isRender) {
			var that = this;
			var init = function (BOGrid, BOGridSetting) {
				//处理当流程表单设置不可编辑、表单新增子表有删除权限。
				if(BOGridSetting.toolbar!=null&&BOGridSetting.toolbar!="undefined" && BOGridSetting.toolbar.items.length<=2){
					if(BOGridSetting.toolbar.items[0].style!=null&&BOGridSetting.toolbar.items[0].style !="undefined" &&BOGridSetting.toolbar.items[0].style.indexOf("display")>=0){
						if(BOGridSetting.toolbar.items[1].label=="删除"){
							debugger;
							//BOGridSetting.toolbar.items[1].style = "display:none;";
							//BOGridSetting.toolbar.items[1].attr = BOGridSetting.toolbar.items[1].attr.replace("selectShow = 'true'","");
							BOGridSetting.toolbar="";
							BOGridSetting.showToolbar=false;
							BOGridSetting.showTop=false;
						}
				}
				}
				that.extendSetting(boDefName, BOGridSetting);
				BOGrid.grid = $("#" + boDefName).awsGrid(BOGridSetting);
				AWSGrid.bindingEvent(boDefName);
				BOGrid.grid.awsGrid('enableSelection');
				if (checkGridFnEventExist(boDefName, "_GridReadyEvent")) {
					try {
						//判断是否有加载后事件
						eval(boDefName + "_GridReadyEvent()");
					} catch (e) {
					}
				}
			};
			eval(boDefName + "_init()");
			var BOGrid = eval(boDefName);
			var BOGridSetting = eval(boDefName + "_setting");
			init(BOGrid, BOGridSetting);
		}
	},
	/**
	 * 获取子表定义中的grid对象
	 *
	 * @param {String}  boDefName BO表表名
	 *
	 */
	getGrid: function (boDefName) {
		var grid;
		if (this.getObject(boDefName)) {
			grid = eval(boDefName).grid;
		}
		return grid;
	},
	/**
	 * 获取子表定义对象
	 *
	 * @param {String}  boDefName BO表表名
	 *
	 */
	getObject: function (boDefName) {
		var dom = $("#" + boDefName);
		if (dom.length > 0 && dom.is("div")) {
			return eval(boDefName);
		} else {
			return null;
		}
	},
	/**
	 * 获取子表定义中的grid对象
	 *
	 * @param {String}  boDefName BO表表名
	 * @return {Object}  一个API对象，提供了常用的方法
	 *
	 */
	getGridAPI: function (boDefName) {
		var grid = this.getGrid(boDefName);
		var isReady = function () {
			if (grid == null) {
				$.simpleAlert(表格对象未能初始化, "info");
				return false;
			}
			return true;
		};
		return {
			/**
			 * 设置单元格的样式
			 * @param {String} fieldName 字段名称
			 * @param {Number} rowIndx 行索引
			 * @param {Object} style 样式，JSON结构
			 */
			setStyleByCell: function (fieldName, rowIndx, style) {
				if (isReady()) {
					//console.log(grid);
				}
			},
			/**
			 * 设置一行的样式
			 * @param {String} rowIndx 行索引
			 * @param {Object} style 样式，JSON结构
			 */
			setStyleByRow: function (rowIndx, style) {
				if (isReady()) {
					//console.log(grid);
				}
			},
			/**
			 * 获取grid中一行的字段的值
			 * @param {Number} rowIndx 整行字段信息
			 * @param {String} fieldName 字段名称
			 * @return {String} 返回该列的值
			 */
			getFieldValue: function (rowIndx, fieldName) {
				if (isReady()) {
					var data = grid.awsGrid("getData");
					var row = data[rowIndx];//row是每行数据
					return row[fieldName];
				}
			},
			/**
			 * 获取grid中一行的字段的值
			 * @param {Number} rowIndx 行索引
			 * @param {String} fieldName 字段名称
			 * @param {Object} value 要设置的值
			 */
			setFieldValue: function (rowIndx, fieldName, value) {
				if (isReady()) {
					var data = grid.awsGrid("getData");
					var row = data[rowIndx];//row是每行数据
					row[fieldName] = value;//设置这个字段的值
					grid.awsGrid("setEditData", row, {updateDB: true});
					grid.awsGrid("refreshCell", {
						rowIndxPage: rowIndx,
						dataIndx: fieldName
					});
				}
			},
			/**
			 * 获取当前grid所选择行的数据（json数组形式,顺序按选中的顺序）
			 */
			getSelectedRowDatas: function () {
				if (isReady()) {
					var selectedItems = grid.awsGrid("getRows");
					return selectedItems;
				}
			},
			/**
			 * 获取当前未选中的行的数据
			 * @return 未选中行的数据
			 */
			getUnSelectedRowDatas: function () {
				if (isReady()) {
					return grid.awsGrid("getUnSelectedRow");
				}
			},
			/**
			 * 获取当前grid所选择行的索引（数组形式，并与所选行的数据相对应,顺序按选中的顺序）
			 */
			getSelectedRowIndxs: function () {
				if (isReady()) {
					var selectedRowIndx = grid.awsGrid("getSelectRowIndx");
					return selectedRowIndx;
				}
			},
			/**
			 * 获取当前grid未选择行的索引（数组形式）
			 */
			getUnSelectedRowIndxs: function () {
				if (isReady()) {
					return grid.awsGrid("getUnSelectRowIndx");
				}
			},
			/**
			 * 获取当前所选中的行的索引值
			 * @return {} 行的索引值，当未有行被选中的时候，返回undefined
			 */
			getCurrentRowIndx: function () {
				if (isReady()) {
					var rowindexs = grid.awsGrid("getSelectRowIndx");
					return currentRowIndex;
				}
			},
			/**
			 * 设置指定的字段为只读/可编辑
			 * @param {String} fieldName 字段名称
			 * @param {boolean} isReadonly 是否只读
			 */
			setColumnReadonly: function (fieldName, isReadonly) {
			}
		};
	},
	/**
	 * 子表单元格编辑时获取值
	 */
	getEditCellData: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var value = "";
		var isQuitDom = ui.$cell.children();
		//不允许编辑返回原值
		if (isQuitDom != null && isQuitDom.attr("name") == "quitEditModeFlag") {
			return isQuitDom.val();
		}
		switch (uiId) {
			case "AWSUI.HTMLEditor" :
				value = AWSGridGetEditCellData.Textarea(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.Currency" :
				value = AWSGridGetEditCellData.Currency(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.CheckboxGroups" :
				value = AWSGridGetEditCellData.CheckboxGroups(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.RadioGroups" :
				value = AWSGridGetEditCellData.RadioGroups(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.ComboBox" :
				// value = AWSGridGetEditCellData.Select(ui, boDefName, boItemDefName, uiId, uiSetting);
				value = AWSGridGetEditCellData.Select2(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.Textarea" :
				value = AWSGridGetEditCellData.Textarea(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.Slider" :
				value = AWSGridGetEditCellData.Slider(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.Rating" :
				value = AWSGridGetEditCellData.Rating(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.Address" :
				value = AWSGridGetEditCellData.Address(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.TreeDictionary" :
				value = AWSGridGetEditCellData.TreeDictionary(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.GridDictionary" :
				value = AWSGridGetEditCellData.GridDictionary(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.FlatDictionary" :
				value = AWSGridGetEditCellData.FlatDictionary(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.SwitchButton" :
				value = AWSGridGetEditCellData.SwitchButton(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.Team" :
				value = AWSGridGetEditCellData.Team(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			case "AWSUI.XCode" :
				value = AWSGridGetEditCellData.XCode(ui, boDefName, boItemDefName, uiId, uiSetting);
				break;
			default :
				value = AWSGridGetEditCellData.Text(ui, boDefName, boItemDefName, uiId, uiSetting);
		}
		if (AWSGrid.editorSaveEvent != null) {
			if (ui.rowIndx < 0) {
				ui.rowIndx = ui.rowIndxPage; //新建数据是负数
			}
			return AWSGrid.editorSaveEvent(value, ui, boDefName, boItemDefName, uiId, uiSetting);
		}
		return value;
	},
	/**
	 * 单元格渲染
	 */
	render: function (ui, boDefName, boItemDefName, uiId, boItemId, readonly, uiSetting, tooltip) {
		switch (uiId) {
			case "AWSUI.HTMLEditor" :
				return AWSGridRender.HTMLEditor(ui, boDefName, boItemDefName, uiId, boItemId, readonly, uiSetting);
			case "AWSUI.Currency" :
				return AWSGridRender.Currency(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.Textarea" :
				return AWSGridRender.Textarea(ui, boDefName, boItemDefName, uiId, uiSetting, readonly);
			case "AWSUI.FieldTable" :
				return AWSGridRender.FieldTable(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.ComboBox" :
				return AWSGridRender.Select2(ui, boDefName, boItemDefName, uiId, uiSetting);
			// return AWSGridRender.Select(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.RadioGroups" :
				return AWSGridRender.RadioGroups(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.CheckboxGroups" :
				return AWSGridRender.CheckboxGroups(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.Time" :
				return AWSGridRender.Time(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.DateTime" :
				return AWSGridRender.DateTime(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.GridDictionary" :
				return AWSGridRender.GridDictionary(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.Rating" :
				return AWSGridRender.Rating(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.Button" :
				return AWSGridRender.Button(ui, boDefName, boItemDefName, uiId, readonly, uiSetting, tooltip);
			case "AWSUI.Address" :
				return AWSGridRender.Address(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.Team" :
				return AWSGridRender.Team(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.XCode" :
				return AWSGridRender.XCode(ui, boDefName, boItemDefName, uiId, readonly, uiSetting);
			case "AWSUI.SwitchButton" :
				return AWSGridRender.SwitchButton(ui, boDefName, boItemDefName, uiId, uiSetting);
			case "AWSUI.BOAC" :
				return AWSGridRender.BOAC(ui, boDefName, boItemDefName, uiId, readonly, uiSetting);
			case "AWSUI.LogoPhoto" :
				return AWSGridRender.LogoPhoto(ui, boDefName, boItemDefName, uiId, boItemId, readonly, uiSetting);
			case "AWSUI.File" :
				return AWSGridRender.File(ui, boDefName, boItemDefName, uiId, boItemId, readonly, uiSetting, tooltip);
			default :
				return AWSGridRender.Text(ui, boDefName, boItemDefName, uiId, uiSetting, readonly);
		}
	},
	/**
	 * 单元格编辑器
	 */
	editor: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		var boGrid = AWSGrid.getGrid(boDefName);
		ui.data = boGrid.awsGrid("option").dataModel.data;
		if (AWSGrid.isEditorEvent != null) {
			if (!AWSGrid.isEditorEvent(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip)) {
				var $cell = ui.$cell, data = ui.data, rowIndx = ui.rowIndxPage, colIndx = ui.colIndx, dataCell = $.trim(data[rowIndx][colIndx]);
				$cell.append("<textarea style='display:none;' name=\"quitEditModeFlag\">" + dataCell + "</textarea>");
				AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
			}
		}
		if (checkGridFnEventExist(boDefName, "_beforeedit")) {
			var uiSettingc = $.extend(true, {}, uiSetting);
			uiSettingc.uiId = uiId;
			var obj = eval(boDefName + "_beforeedit(ui, boDefName, boItemDefName,  uiSettingc)");
			if (obj === false) {
				var $cell = ui.$cell, data = ui.data, rowIndx = ui.rowIndxPage, colIndx = ui.colIndx, dataCell = $.trim(data[rowIndx][colIndx]);
				$cell.append("<textarea style='display:none;' name=\"quitEditModeFlag\">" + dataCell + "</textarea>");
				boGrid.awsGrid("quitEditMode");
			} else if (obj != null && typeof obj == "object") {
				uiSetting = obj;
				uiSetting.custom = true;
				uiId = uiSetting.uiId ? uiSetting.uiId : uiId;
			}
		}
		switch (uiId) {
			case "AWSUI.Currency" :
				AWSGridEditor.Currency(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Textarea" :
				AWSGridEditor.Textarea(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.ComboBox" :
				// AWSGridEditor.Select(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				AWSGridEditor.Select2(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.RadioGroups" :
				AWSGridEditor.RadioGroups(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.CheckboxGroups" :
				AWSGridEditor.CheckboxGroups(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.DateTime" :
				AWSGridEditor.DateTime(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Date" :
				AWSGridEditor.Date(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Time" :
				AWSGridEditor.Time(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Slider" :
				AWSGridEditor.Slider(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Button" :
				AWSGridEditor.Button(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Rating" :
				AWSGridEditor.Rating(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Address" :
				AWSGridEditor.Address(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.Team" :
				AWSGridEditor.Team(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.TreeDictionary" :
				AWSGridEditor.TreeDictionary(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.GridDictionary" :
				AWSGridEditor.GridDictionary(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.FlatDictionary" :
				AWSGridEditor.FlatDictionary(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
				break;
			case "AWSUI.XCode" :
				AWSGridEditor.XCode(ui, boDefName, boItemDefName, uiId, uiSetting, tooltip);
				break;
			case "AWSUI.SwitchButton" :
				AWSGridEditor.SwitchButton(ui, boDefName, boItemDefName, uiId, uiSetting, tooltip);
				break;
			default :
				AWSGridEditor.Text(ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip);
		}
	},
	/**
	 * 返回一个子表的过滤条件，后期实现
	 */
	getGridCondition: function (formItemDefId) {
		return AWSGridUtil.getGridCondition(formItemDefId);
	},
	/**
	 * 子表插入一行记录
	 */
	addRow: function (boDefId, boDefName, isSaveMainWhenAdded) {
		if ($("#isCreate").val() == "true" && isSaveMainWhenAdded === true) {
			$.simpleAlert(请先保存表单数据, "info");
			return;
		}
		if ($("#BTN_CHECKOUT").length > 0) {
			$.simpleAlert(并签任务未获取编辑权时不能新增数据, "info");
			return;
		}
		awsui.ajax.request({
			url: './jd',
			type: 'POST',
			dataType: 'json',
			alert: false,
			data: {
				sid: $("#sid").val(),
				cmd: 'CLIENT_BPM_FORM_EDITGRID_GET_DEFAULT_ROWDATA',
				processInstId: $("#processInstId").val(),
				taskInstId: $("#taskInstId").val(),
				boDefId: boDefId
			},
			success: function (r) {
				if (r.result == "ok") {
					var newRowData = r.data;
					AWSGrid.getGrid(boDefName).awsGrid("addRowToBottom", newRowData);
					var rowIndx = AWSGrid.getGrid(boDefName).awsGrid("option").dataModel.data.length - 1;
					// var row = AWSGrid.getGrid(boDefName).awsGrid("getSelectRowIndx");
					// var rowIndx = row[0];
					// AWSGrid.getGrid(boDefName).awsGrid("editCell", {
					// 	rowIndx: rowIndx
					// });
					//插入后事件
					if (checkGridFnEventExist(boDefName, "_rowsinserted")) {
						eval(boDefName + "_rowsinserted(rowIndx, newRowData)");
					}
					//执行默认规则
					if (dynamicRule) {
						dynamicRule.executeFormulaByFirstCreate(boDefName, rowIndx);
						dynamicRule.executeFormulaByGridAdd(boDefName);
					}
				} else if (r.result == "error") {
					$.simpleAlert(r.msg, "error");
				}
			}
		});
	},
	/**
	 * 子表删除记录
	 */
	removeData: function (boDefId, boDefName, formItemDefId) {
		$("#awsui_tooltip").remove();
		var grid = AWSGrid.getGrid(boDefName);
		var selectionArray = grid.awsGrid("getSelectedRow");
		if (selectionArray.length == 0) {
			$.simpleAlert(请选择要删除的记录);
			return;
		}
		var existDB = false;
		//是否存在数据库数据的标志位
		var ids = "";
		var unsaveids = "";
		for (var i = 0; i < selectionArray.length; i++) {
			var rowData = selectionArray[i].rowData;
			var attrColumn = rowData.FORM_EDITGRID_DATA_ATTR_COLUMN;
			if (typeof (attrColumn) == "string") {
				attrColumn = awsui.decode(attrColumn);
			}
			if (attrColumn.isCreate == false) {
				existDB = true;
				ids += rowData.ID + ",";
			}
			unsaveids += rowData.ID + ",";
		}
		//如果都不在数据库中，直接删除
		if (existDB == false) {
			var deleteArray = [];
			for (var i = 0; i < selectionArray.length; i++) {
				var rowData = selectionArray[i].rowData;
				var attrColumn = rowData.FORM_EDITGRID_DATA_ATTR_COLUMN;
				if (typeof (attrColumn) == "string") {
					attrColumn = awsui.decode(attrColumn);
				}
				if (attrColumn.isCreate == true) {
					deleteArray.push(selectionArray[i]);
				}
			}
			if (deleteArray.length > 0) {
				var commitData = [];
				for (var k in deleteArray) {
					commitData.push(deleteArray[k].rowData);
				}
				grid.awsGrid("deleteRows", {rows: deleteArray});
				//提交删除的数据，避免引起保存
				grid.awsGrid("commit", {type: 'add', rows: commitData});
				grid.awsGrid("commit", {type: 'update', rows: commitData});
				grid.awsGrid("commit", {type: 'delete', rows: commitData});
				if (unsaveids.length > 0) {
					unsaveids = unsaveids.substring(0, unsaveids.length - 1);
				}
				awsui.ajax.request({
					url: './jd',
					type: 'POST',
					dataType: 'json',
					alert: false,
					data: {
						sid: $("#sid").val(),
						cmd: 'CLIENT_BPM_FORM_PAGE_S_EDITGRID_REMOVE_UNSAVEDATA',
						processInstId: $("#processInstId").val(),
						taskInstId: $("#taskInstId").val(),
						openState: $("#openState").val(),
						currentPage: $("#currentPage").val(),
						formItemDefId: formItemDefId,
						ids: unsaveids,
						boDefName: boDefName,
						processDefId: $("#processDefId").val()
					},
					success: function (r) {
					}
				});
				isShowButtonBySelected("delete", grid);
				//重新计算跟当前子表相关的计算公式
				dynamicRule.executeFormulaByGridDelete(boDefName);
				// 行删除后事件
				try {
					if (checkGridFnEventExist(boDefName, "_rowremoved")) {
						eval(boDefName + "_rowremoved(ids,commitData)");
					}
				} catch (e) {
				}
			}
		} else {
			//判断是否有未保存的数据
			var m = grid.awsGrid("getEditData");
			if (m != null && m.length > 0) {
				$.simpleAlert(请保存子表数据, "info");
				return;
			}
			grid.awsGrid("quitEditMode");
			awsui.MessageBox.confirm(提示, 确定要删除吗, function () {
				var option = grid.awsGrid("option"), dataModel = option.dataModel, pageModel = option.pageModel, datasnow = dataModel.data, curPage = pageModel.curPage, isPre = false;
				if (datasnow.length == selectionArray.length && curPage > 1) {
					isPre = true;
				}
				awsui.ajax.request({
					url: './jd',
					type: 'POST',
					dataType: 'json',
					alert: false,
					data: {
						sid: $("#sid").val(),
						cmd: 'CLIENT_BPM_FORM_PAGE_S_EDITGRID_REMOVE_DATA',
						processInstId: $("#processInstId").val(),
						taskInstId: $("#taskInstId").val(),
						openState: $("#openState").val(),
						currentPage: $("#currentPage").val(),
						formItemDefId: formItemDefId,
						ids: ids
					},
					success: function (r) {
						if (r.result == "ok") {
							$.simpleAlert(r.msg, r.result);
							var removeCallback = function () { // 行删除后事件
								try {
									if (checkGridFnEventExist(boDefName, "_rowremoved")) {
										eval(boDefName + "_rowremoved(ids)");
									}
									//重新计算跟当前子表相关的计算公式
									dynamicRule.executeFormulaByGridDelete(boDefName);
								} catch (e) {
									console.log(e)
								}
							};
							grid.awsGrid("deleteRows", {rows: deleteArray});
							AWSGrid.refreshData(boDefId, boDefName, false, isPre, removeCallback);
							isShowButtonBySelected("delete", grid);
							// var m = AWSGrid.getGrid(boDefName).awsGrid("getSelectRowIndx");
							// if (m.length > 0) {
							// 	$("#" + boDefName).find("button[id$='_Btn_Remove']").show();
							// } else {
							// 	$("#" + boDefName).find("button[id$='_Btn_Remove']").hide();
							// }
						} else if (r.result == "error") {
							AWSFormUI.showErrorMsg(r);
						}
					}
				});
			});
		}
	},
	/**
	 * 子表刷新
	 *
	 * @param {String} boDefId BO模型定义ID
	 * @param {String} boDefName BO表名
	 * @param {boolean} showAlert 是否显示提示消息
	 * @param {boolean} isPre 是否要将Grid的分页向前跳一页
	 */
	refreshData: function (boDefId, boDefName, showAlert, isPre, callback) {
		if (boDefName == undefined) {
			return;
		}
		$("#awsui_tooltip").remove();
		var grid = AWSGrid.getGrid(boDefName);
		if (grid) {
			var pageModel = grid.awsGrid("option").pageModel;
			if (isPre) {
				pageModel.curPage -= 1;
				grid.awsGrid("option", {
					pageModel: pageModel
				});
			}
			var refreshCallback = function (r) {
				if (callback) {
					callback();
				}
				if (r.result == "ok") {
					if (r.data.MustCalcMasterData) {
						var mustCalcMasterData = r.data.MustCalcMasterData;
						for (var item in mustCalcMasterData) {
							$("#" + item).val(mustCalcMasterData[item]);
							if ($("#" + item + "_Readonly").length > 0) {
								$("#" + item + "_Readonly").html(mustCalcMasterData[item]);
							}
						}
					}
				}
			};
			grid.awsGrid("refreshDataAndView", {keepSelection: false, callback: refreshCallback});
			if (showAlert) {
				$.simpleAlert(数据已刷新, "info");
			}
		}
	},
	/**
	 * 子表保存
	 */
	saveData: function (boDefId, boDefName, isShowMsg, isValidateForm) {
		if (!dynamicRule.girdSaveBeforeEvent(true, boDefName)) {//校验子表必填规则
			setTimeout(function () {
				$.simpleAlert("close");
			}, 1700);
			return false;
		}
		if (isShowMsg == undefined) {//默认都提示，所以如果未传入时给默认值为true
			isShowMsg = true;
		}
		if (isValidateForm == undefined) {
			isValidateForm = true;//校验子表
		}
		$("#awsui_tooltip").remove();
		if (boDefId == "undefined" || boDefId == null) {
			boDefId = $("#AWSGridBoDefID-" + boDefName).val();
		}
		var gridData = this.getGridData(boDefName, isShowMsg, isValidateForm);
		if (gridData == null) {
			return true;
		}
		if (gridData == false) {
			setTimeout(function () {
				$.simpleAlert("close");
			}, 1700);
			var grid = this.getGrid(boDefName);
			grid.awsGrid("quitEditMode");
			//$.simpleAlert(验证未通过, "info");
			return false;
		}
		var msg = gridData.msg;
		gridData = awsui.encode(gridData);
		var fieldTableBindId = $("#fieldTableBindId").val();
		if (fieldTableBindId == "") {
			if ($("#rowBoId").length > 0) {
				fieldTableBindId = $("#rowBoId").val();
			}
		} else if (fieldTableBindId != $("#rowBoId").val()) {
			fieldTableBindId = $("#rowBoId").val();
		}
		var axis;
		try {
			axis = isShowMsg == false && parent.$ ? parent : window;//防止跨域出错
		} catch (e) {
			axis = window;
		}
		var returnVal = true;
		var p = function () {
			awsui.ajax.request({
				url: './jd',
				type: 'POST',
				dataType: 'json',
				alert: false,
				async: false,
				axis: axis, //当isShowMsg为false时，是主表单的保存掉用的，这个设置就需要和主表的ajax配置一致
				loading: isShowMsg == false ? true : false, //当isShowMsg为false时，是主表单的保存掉用的，这个设置就需要和主表的ajax配置一致
				data: {
					sid: $("#sid").val(),
					cmd: 'CLIENT_BPM_FORM_PAGE_S_EDITGRID_SAVE_DATA',
					processInstId: $("#processInstId").val(),
					taskInstId: $("#taskInstId").val(),
					openState: $("#openState").val(),
					currentPage: $("#currentPage").val(),
					formItemDefId: $("#AWSGridFormItemDefID-" + boDefName).val(),
					fieldTableBindId: fieldTableBindId,
					boDefId: boDefId,
					gridData: gridData
				},
				success: function (r) {
					if (r.result == "ok") {
						if (isShowMsg) {
							$.simpleAlert(r.msg, r.result);
						}
						AWSForm.validateMsg = "";//清空验证消息
						AWSGrid.refreshData(boDefId, boDefName, false);
					} else if (r.result == "error") {
						$.simpleAlert("close");
						clearInterval(AWSForm.AWS_INTEVAL_ID);
						enableAll();
						AWSFormUI.showErrorMsg(r);
						returnVal = false;
					}
				}
			});
		};
		if (msg) {
			$.simpleAlert(msg, "info", 2000);
			setTimeout(p, 2000);
			return msg; // 如果是主表保存，把错误信息返回给主表
		} else {
			p();
		}
		return returnVal;
	},
	/**
	 * 复制数据
	 */
	copyData: function (boDefId, boDefName, formItemDefId) {
		if (this.hasUnsavedData(boDefName)) {
			return;
		}
		var selectionArray = this.getGrid(boDefName).awsGrid("getSelectedRow");
		if (selectionArray.length == 0) {
			$.simpleAlert(请选择要复制的数据, "info");
			return;
		}
		if (selectionArray.length > 1) {
			$.simpleAlert(请选择一条数据, "info");
			return;
		}
		var sourceRowBoId = selectionArray[0].rowData.ID;
		awsui.MessageBox.prompt(提示, 请输入要复制记录的条数, function (val) {
			if (val == "") {
				return false;
			}
			if (isNaN(val)) {
				$.simpleAlert(请填写正确的数字, "info");
				return false;
			}
			awsui.ajax.request({
				url: './jd',
				type: 'POST',
				dataType: 'json',
				alert: false,
				data: {
					sid: $("#sid").val(),
					cmd: 'CLIENT_BPM_FORM_PAGE_S_COMMONGRID_COPY_DATA',
					processInstId: $("#processInstId").val(),
					taskInstId: $("#taskInstId").val(),
					openState: $("#openState").val(),
					currentPage: $("#currentPage").val(),
					formItemDefId: formItemDefId,
					fieldTableBindId: $("#fieldTableBindId").val(),
					sourceRowBoId: sourceRowBoId,
					cpCount: val
				},
				success: function (r) {
					if (r.result == "ok") {
						$.simpleAlert(r.msg, r.result);
						// 刷新
						AWSGrid.refreshData(boDefId, boDefName, false);
					} else {
						AWSFormUI.showErrorMsg(r);
					}
					return false;
				}
			});
		}, function () {
		});
	},
	/**
	 * 参考录入
	 */
	insertData: function (boDefId, boDefName, dicName, dictTitle, formItemDefId, isSaveForm) {
		if (this.hasUnsavedData(boDefName)) {
			return;
		}
		var bindVal = awsui.encode(AWSForm.getFormData());
		var fieldTableBoItemNames = "";
		if ($("#isMainForm").val() == "true") {
			fieldTableBoItemNames = $("#fieldTableBoItemNames").val();
		} else {
			fieldTableBoItemNames = parent.$("#fieldTableBoItemNames").val();
		}
		if (fieldTableBoItemNames != '') {
			var fieldTableArr = fieldTableBoItemNames.split("|");
			if (fieldTableArr[fieldTableArr.length - 1] != ' ') {
				bindVal = $("#formData").val();
			}
		}
		if (isSaveForm) {
			if ($("#isMainForm").val() != "true" && $("#isCreate").val() == 'true') {
				$.simpleAlert(请先保存数据);
				return false;
			}
			if ($("#isMainForm").val() == "true" && (AWSFormUtil.checkModifyState() || $("#isCreate").val() == 'true')) {
				$.simpleAlert(请先保存数据);
				return false;
			}
		}
		var config = {
			multiple: false,
			dictionryName: dicName
		};
		var dialogHeight = $(window).height() - 50;
		if (dialogHeight > 507) {
			dialogHeight = 507;
		}
		FrmDialog.open({
			title: dictTitle,
			width: 800,
			height: dialogHeight,
			url: "./w",
			data: {
				sid: $("#sid").val(),
				cmd: 'CLIENT_UI_XMLDICT_OPEN',
				config: awsui.encode(config),
				appId: $("#appId").val(),
				condition: '',
				pageIndex: 1,
				bindValue: bindVal,
				boId: boDefId,
				processInstId: $("#processInstId").val(),
				taskInstId: $("#taskInstId").val(),
				formItemDefId: formItemDefId,
				containerId: "",
				containerType: "copy2grid"
			},
			buttons: [{
				text: 确定,
				cls: "blue",
				handler: function () {
					var ids = $("#id-awsui-win-frm-2013-frm").contents().find("form[name='frmMain']").get(0).ids.value;
					if (ids == "") {
						$.simpleAlert(请选择记录, "info", 2000);
						return false;
					}
					//js 插入前
					var r = $("#id-awsui-win-frm-2013-frm").get(0).contentWindow.jsBefore();
					if (r === false) {
						return;
					}
					var result = $("#id-awsui-win-frm-2013-frm").get(0).contentWindow.insertData();
					if (result.res == "1") {
						//js 插入后
						$("#id-awsui-win-frm-2013-frm").get(0).contentWindow.jsAfter();
						AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
						AWSGrid.refreshData(boDefId, boDefName, false, false);
						//执行默认规则
						if (dynamicRule) {
							dynamicRule.executeFormulaByFirstCreate(boDefName);
							dynamicRule.executeFormulaByGridAdd(boDefName);
						}
						if (result.msg != '') {
							$.simpleAlert(result.msg, "warning", 5000);
						} else {
							FrmDialog.close();
						}
					} else {
						//$.simpleAlert(操作失败, "info");
					}
				}
			}, {
				text: 取消,
				handler: function () {
					FrmDialog.close();
				}
			}]
		});
	},
	getGridData: function (boDefName, isShowMsg, isValidateForm) {
		var gridData = [];
		var grid = this.getGrid(boDefName);
		grid.awsGrid("quitEditMode");
		var m = grid.awsGrid("getData");
		if (m != null) {
			gridData = this.getGridDataAndCheckData(boDefName, m, isValidateForm);
			if (gridData === false) {
				return false;
			}
		}
		m = grid.awsGrid("getEditData");
		if (m == null || m.length == 0) {
			$.simpleAlert("close");
			if (isShowMsg) {
				$.simpleAlert(没有被修改的数据, "info");
			}
			return null;
		}
		if (gridData.msg) {
			m.msg = gridData.msg;
		}
		return m;
	},
	getGridDataAndCheckData: function (boDefName, m, isValidateForm) {
		var gridData = [];
		var msg = ""; // 延时返回结果
		for (var i = 0, len = m.length; i < len; i++) {
			rowData = {};
			var rec = m[i];
			rec.rowIndx = i;
			var columns = AWSGrid.getObject(boDefName).getColumnsOrderArray();
			for (var j = 0; j < columns.length; j++) {
				var fieldName = columns[j];
				// 跳过第二列checkbox字段
				if (fieldName == '1' || fieldName == 'selectedRow') {
					continue;
				}
				if (fieldName != '') {
					var cellValue = rec[fieldName];
					//已经显示的列，这些列需要校验
					if (isValidateForm && AWSGrid.getObject(boDefName).getColumnType(fieldName) != undefined) {
						var validateValue = AWSGrid.getObject(boDefName).validateGridData(boDefName, fieldName, cellValue, rec);
						if (!validateValue) {//调用校验方法
							return false;
						} else if (typeof (validateValue) == "string") {
							gridData.msg = validateValue;
						}
					}
					if (String.valueOf(cellValue) != '') {
						rowData[fieldName] = cellValue;
					}
				}
			}
			gridData.push(rowData);
		}
		return gridData;
	},
	renderCheckbox: function (ui, boDefName) {
		var rowData = ui.rowData;
		var isRemove = rowData.FORM_EDITGRID_DATA_ATTR_COLUMN.remove;
		if (isRemove == false) {//不能删除
			rowData.AWS_Grid_noCheckbox = true;
			AWSGrid.getGrid(boDefName).awsGrid("setEditData", rowData);
			return "";
		} else {
			var isCheck = (rowData.selectedRow != null && rowData.selectedRow == true) ? true : false;
			return "<input type='checkbox' " + (isCheck ? "checked=checked" : "") + " />";
		}
	},
	getFieldTableBindId: function () {
		if ($("#fieldTableBindId").length > 0) {
			var fieldTableBindId = $("#fieldTableBindId").val();
			if (fieldTableBindId == "" || fieldTableBindId == null) {
				if ($("#rowBoId").length > 0) {
					fieldTableBindId = $("#rowBoId").val();
				}
			} else if (fieldTableBindId != $("#rowBoId").val()) {
				fieldTableBindId = $("#rowBoId").val();
			}
			return fieldTableBindId;
		} else {
			return "";
		}
	},
	hasUnsavedData: function (boDefName) {
		AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
		var $tr = AWSGrid.getGrid(boDefName).awsGrid("getEditData");
		if ($tr != null && $tr.length > 0) {
			$.simpleAlert(请先保存子表数据, "info");
			return true;
		} else {
			return false;
		}
	},
	bindingEvent: function (boDefName) {
		var $grid = AWSGrid.getGrid(boDefName);
		$grid.on("awsgridrowselect", function (evt, ui) {
			var rowIndx = ui.rowIndxPage;
			// var m = $grid.awsGrid("getSelectRowIndx");
			// if (m.length > 0) {
			// 	$("#" + boDefName).find("button[id$='_Btn_Remove']").attr("style", "display:inline-block !important");
			// } else {
			// 	$("#" + boDefName).find("button[id$='_Btn_Remove']").hide();
			// }
			try {
				if (checkGridFnEventExist(boDefName, "_rowselect")) {
					var dataModel = $grid.awsGrid("option").dataModel, data = dataModel.data;
					eval(boDefName + "_rowselect(rowIndx,  dataModel, data, ui)");
				}
			} catch (e) {
			}
		});
		$grid.on("awsgridrowunselect", function (evt, ui) {
			//TODO 用不到暂时
		});
		var doGridSelectEvent = function (evt, ui) {
			$(".aws-grid-cell input[type=checkbox][class!=awsui-checkbox]").prop("checked", false);
			for (var k in ui.rows) {
				var rows = ui.rows[k];
				var rowData = rows.rowData, rowIndx = rows.rowIndx;
				if (rowData != null) {
					if (rowData.AWS_Grid_noCheckbox) {
						$grid.awsGrid("selection", {type: 'row', method: 'remove', rowIndx: rowIndx});
					} else {
						if (!rowData.pq_rowselect) {
							$grid.awsGrid("selection", {type: 'row', method: 'remove', rowIndx: rowIndx});
							rowData["$fx1"] = false;
							$grid.awsGrid('refreshCell', {rowIndx: rowIndx, dataIndx: '$fx1'});
						} else {
							$grid.awsGrid("selection", {type: 'row', method: 'add', rowIndx: rowIndx, focus: false});
							rowData["$fx1"] = true;
							$grid.awsGrid('refreshCell', {rowIndx: rowIndx, dataIndx: '$fx1'});
						}
					}
				}
			}
		}
		$grid.on('awsgridselectchange', function (event, ui) {
			isShowButtonBySelected("selectchange", $(this), event, ui);
			doGridSelectEvent(event, ui);
		});
		$grid.on("awsgridcellmousedown", function (evt, ui) { //mousedown用于阻止选择事件
			var target = evt.toElement;
			if ($(target).attr("onclick") || $(target).parent().attr("onclick")) {
				evt.stopPropagation();
				evt.preventDefault();
				return false;
			}
		})
		$grid.on("awsgridnumcellclick", function (evt, ui) { //点击序号时触发选中
			//暂时闲置
		}),
			$grid.on("awsgridcellclick", function (evt, ui) {
				var rowIndxPage = ui.rowIndxPage, rowIndx = ui.rowIndx, dataIndx = ui.dataIndx, colIndx = ui.colIndx, column = ui.column, rowData = ui.rowData;
				if (dataIndx == "$fx1") { //点击check框不取消问题
					if (!rowData.pq_rowselect) {
						$grid.awsGrid("selection", {type: 'row', method: 'remove', rowIndx: rowIndx});
						rowData["$fx1"] = false;
						$grid.awsGrid('refreshCell', {rowIndx: rowIndx, dataIndx: '$fx1'});
					}
				}
				//事件设置了只读，则不能编辑
				var isReadonly = rowData.FORM_EDITGRID_DATA_ATTR_COLUMN.readonly;
				if (isReadonly) {
					return false;
				}
				try {
					if (checkGridFnEventExist(boDefName, "_cellclick")) {
						var dataModel = $grid.awsGrid("option").dataModel, data = dataModel.data;
						eval(boDefName + "_cellclick(rowIndx, colIndx, column, dataModel, rowData, data)");
					}
				} catch (e) {
				}
				return true;
			}),
			// 编辑状态键盘事件
			$grid.on("awsgrideditorkeydown", function (evt, ui) {
				var rowIndx = ui.rowIndxPage, colIndx = ui.colIndx, column = ui.column;
				var $cell = ui.$cell;
				try {
					if (checkGridFnEventExist(boDefName, "_celleditkeydown")) {
						var dataModel = $grid.awsGrid("option").dataModel, data = dataModel.data;
						var $td = $grid.awsGrid("getCell", {rowIndxPage: rowIndx, colIndx: ui.colIndx});
						eval(boDefName + "_celleditkeydown(rowIndx, colIndx, column, dataModel, data, $cell, $td)");
					}
				} catch (e) {
				}
			});
		// 退出编辑状态时的事件(修改显示)
		$grid.on("awsgrideditorend", function (evt, ui) {
			// 不按Esc 或者 Tab
			if (evt.keyCode != $.ui.keyCode.ESCAPE && evt.keyCode != $.ui.keyCode.TAB) {
				if (ui.$cell.find(".pq-editor-focus").length == 0 || ui.$editor.attr("needsave") == "true") {
					$grid.awsGrid("saveEditCell");
				}
				//将gridoverflow重置
				reSetGridOverflow(boDefName);
			}
			// 编辑后事件
			var rowIndx = ui.rowIndx, colIndx = ui.colIndx;
			var editData = ui.rowData;
			try {
				if (checkGridFnEventExist(boDefName, "_afteredit")) {
					var dataModel = $grid.awsGrid("option").dataModel, data = dataModel.data;
					eval(boDefName + "_afteredit(rowIndx, colIndx, dataModel, data)");
				}
			} catch (e) {
			}
			if (dynamicRule) {
				dynamicRule.gridEditorEndEvent(boDefName + "." + ui.dataIndx, ui.rowIndxPage, editData, boDefName);
			}
		});
		$grid.on('awsgridbeforeselection', function (event, obj) {
			//选中前事件
			var rowData = obj.data[obj.rowIndx];
			if (rowData && rowData.AWS_Grid_noCheckbox) {
				return false;
			}
		});
		$grid.on("awsgridrefresh", function (evt, ui) {
			// 表格刷新事件
			var dataModel = ui.dataModel, data = dataModel.data;
			// var m = $grid.awsGrid("getSelectRowIndx");
			// if (m.length > 0) {
			// 	$("#" + boDefName).find("button[id$='_Btn_Remove']").show();
			// } else {
			// 	$("#" + boDefName).find("button[id$='_Btn_Remove']").hide();
			// }
			try {
				if (checkGridFnEventExist(boDefName, "_refresh")) {
					eval(boDefName + "_refresh(dataModel, data)");
				}
			} catch (e) {
			}
			bindUIEvent(ui, boDefName);
			//处理底部信息显示
			var option = $grid.awsGrid("option");
			var setting = eval(boDefName + "_setting");//必须取此配置
			if (!setting.pageModel && option.dataModel.data) {
				var total = setting.language == "cn" ? ("共 " + option.dataModel.data.length + " 条") : ("total " + option.dataModel.data.lengt);
				$grid.find(".aws-grid-footer").text(total);
			}
			//处理awsui-qtip
			//	var f = $grid.awsGrid("option").freezeCols; 待留
			// var inners =$grid.find(".pq-cont .pq-cont-inner");
			// var inner1 = inners[0].find("td.aws-grid-cell");
			// var inner2 = inners[1].find("td.aws-grid-cell");
			// var textDivs = [];
			// for(var i in f){  //取出列锁前部分
			// 	textDivs.push(inner1[i]);
			// }
			// for (var i =  inner2.length; i > f; i--) {//取出列锁前部分
			// 	textDivs.push(inner2[i]);
			// }
			if ($.browser.isChrome) {
				var textDivs = $grid.find("td.aws-grid-cell"); //可能会影响性能！！！！
				textDivs.each(function () {
					var obj = $(this);
					var baseScrollWidth = this.scrollWidth;
					var baseText = obj.text();
					//chrome下更精准
					if (obj.outerWidth() < this.scrollWidth) {
						obj.attr("title", baseText);
					}
					//if (!$.browser.isChrome) {
					//暂时屏蔽火狐和IE的判断，如果精准的话，需要耗费大量的性能（不能接受）
					// if (obj.children().length == 0) { //火狐或ie，复杂dom会清空
					// 	obj.text(baseText + "_");//其他浏览器需加字符来判断
					// 	if (baseScrollWidth != this.scrollWidth && obj.outerWidth() < this.scrollWidth) {
					// 		obj.attr("awsui-qtip", "text:'" + baseText + "',position:'top'");
					// 	}
					// 	obj.text(baseText);//其他浏览器还原字符 （重点号）
					// }
					//}
				});
			}
		});
		$grid.on("awsgridrender", function (evt, ui) {
			var rowIndx = ui.rowIndxPage, colIndx = ui.colIndx, column = ui.column, dataModel = ui.dataModel, data = dataModel.data;
		});
		$grid.on("awsgridload", function (dataModel, data) {
			if (checkGridFnEventExist(boDefName, "_load")) {
				eval(boDefName + "_load(dataModel, data)");
			}
		});
		$grid.on("pqscrollbardrag", function (event, ui) {
			if (ui.evt != null) {
				//滚动条时退出编辑
				$grid.awsGrid("quitEditMode");
			}
		});
		$grid.on("awsgrideditorblur", function (evt, ui) {
			if (ui.$editor.attr("needsave") == "true") {//不使用blur触发save
				return false;
			}
			return true
		})
		//查找上传按钮，绑定一下上传事件
		$("#" + boDefName).find("button[type='button'][id$='Btn_ImportExcel']").each(function () {
			AWSGridUtil.initUploadBtnEvent(this);
		});
	},
	setEditGridWidth: function (boDefName) {
		var c = $("div[id='" + boDefName + "']").parent();
		var cWidth = c.width();
		var $grid = AWSGrid.getGrid(boDefName);
		if ($grid) {
			$grid.width(cWidth);
			$grid.awsGrid("refresh");
		}
		var btn = c.find("button.form-editgrid-toolbar-title");
		if (btn.length > 0) {
			var div = btn.parent().parent();
			var span = btn.parent();
			var spanWidth = span.width();
			var title = span.val();
			div.append("<div class='form-editgrid-toolbar-title' style='left: 718px;'>" + title + "</div>");
			span.remove();
		}
		return false;
	},
	//检测Ajax子表的工具条是不是没有可见的按钮，没有话的隐藏工具条
	checkToolbar: function () {
		for (var i = 0; i < this.list.length; i++) {
			var boDefName = this.list[i];
			var grid = $("#" + boDefName);
			var toolbar = grid.find(".aws-grid-toolbar");
			if (toolbar.length == 0) {
				continue;
			}
			var toolbarHeight = toolbar.outerHeight();
			var allHidden = true;
			toolbar.find("button").each(function () {
				var btn = $(this);
				if (btn.is(":visible")) {
					allHidden = false;
				}
			});
			if (allHidden) {
				toolbar.hide();
				grid.height(grid.height() - toolbarHeight);
				grid.awsGrid("refresh");
			}
		}
	},
	advancedSearchRest: function (formItemId) {
		$("#popbox_" + formItemId + " input[id*='OBJ_']").each(function () {
			if ($(this).val() != '') {
				$(this).val("").trigger("change");
			}
		});
		$("#popbox_" + formItemId + " select").each(function () {
			if ($(this).val() != '') {
				$(this).customSelect("");
				$(this).val("").trigger("change");
			}
		});
		$("#popbox_" + formItemId + " input.dict").each(function () {
			if ($(this).val() != '') {
				$(this).val("");
			}
		});
		$("#popbox_" + formItemId + " input[type='radio']").each(function () {
			$(this).check("option", "checked", false);
		});
		$("#popbox_" + formItemId + " input[type='checkbox']").each(function () {
			$(this).check("option", "checked", false);
		});
	},
	firstPop: true,
	popSearcher: function (formItemId, obj) {
		$('#popbox_' + formItemId).appendTo("body");
		if (AWSGrid.firstPop) {
			$('#popbox_' + formItemId).find("select").val("").trigger("change");
		}
		AWSGrid.firstPop = false;
		$("#popbox_" + formItemId).show();
		$("#popbox_" + formItemId).popbox({target: obj, width: 'auto', height: 'auto'});
		$("#popbox_" + formItemId).css("z-index", 10);
		$("#popbox_" + formItemId).css("overflow", "visible");
		//var containerWidth = $("#popbox_" + formItemId).find("td.dwSenTdR:first").width();
		var setselect2Width = function (sel) {
			sel.next().width("102%");
		}
		$("#popbox_" + formItemId).find("select").each(function () {
			setselect2Width($(this));
		});
		if (typeof initMultipleComboBox === 'function') {
			if (!isInitMultipleComboBox) {
				initMultipleComboBox();
				isInitMultipleComboBox = true;
			}
		}
		$("#popbox_" + formItemId).find(".dict.awsui-buttonedit").each(function () {
			AWSFormUI.setComponentAutoWidth($(this).attr("id"));			// $(this).width("121px") ;
			// $(this).next().css("left","125px") ;
		});
		$("#popbox_" + formItemId).find("input.awsui-textbox").each(function () {
			AWSFormUI.setComponentAutoWidth($(this).attr("id"));			// $(this).width("121px") ;
			// $(this).next().css("left","125px") ;
		});
	},
	searchData: function (boDefName, formItemId) {
		if (boDefName == undefined) {
			return;
		}
		var grid = AWSGrid.getGrid(boDefName);
		if (grid) {
			var dataModel = grid.awsGrid("option").dataModel;
			dataModel.curPage = 1;
			grid.awsGrid("option", {
				dataModel: dataModel
			});
			grid.awsGrid("refreshDataAndView");
		}
		$("#popbox_" + formItemId).popbox("close");
	},
	getDataSummary: function (boDefName) {
		var summaryData;
		awsui.ajax.request({
			url: './jd',
			type: 'POST',
			dataType: 'json',
			async: false,
			data: {
				sid: $("#sid").val(),
				cmd: 'CLIENT_BPM_FORM_PAGE_S_EDITGRID_GET_DATA_SUMMARY',
				processInstId: $("#processInstId").val(),
				taskInstId: $("#taskInstId").val(),
				openState: $("#openState").val(),
				formItemDefId: $("#AWSGridFormItemDefID-" + boDefName).val(),
				fieldTableBindId: $("#fieldTableBindId").val(),
				condition: AWSGrid.getGridCondition($("#AWSGridFormItemDefID-" + boDefName).val())
			},
			ok: function (r) {
				summaryData = r.data.summaryData;
				//货币格式化
				if (summaryData.AWSUI_COMMON_CURRENCY != null) {
					var thisSetting = eval(boDefName + "_setting");
					for (var s in summaryData.AWSUI_COMMON_CURRENCY) {
						var field = summaryData.AWSUI_COMMON_CURRENCY[s];
						if (summaryData[field] == null || summaryData[field] == "") {
							continue;
						}
						for (var k in thisSetting.colModel) {
							var CM = thisSetting.colModel[k];
							if (CM.dataIndx == field) {
								var html = CM.render({
									rowData: summaryData,
									dataIndx: field,
									column: CM
								});
								summaryData[field] = html;
							}
						}
					}
				}
			},
			err: function (r) {
				alert(r);
			}
		});
		return summaryData;
	},
	getGroupDisplayVal: function (boDefName, boItemDefName, val, firstRowData) {
		if (firstRowData) {
			if (firstRowData[boItemDefName + "_DISPLAYVALUE"])
				return firstRowData[boItemDefName + "_DISPLAYVALUE"];
		}
		var config = AWSGrid.getObject(boDefName).getColumnConfig(boItemDefName);
		var data = config.data;
		if (data) {
			for (var i in data) {
				var row = data[i];
				if (row.value == val) {
					return row.label;
				}
			}
		}
		return val;
	},
	groupTitle: function (obj, boItemName, boName) {
		var CMs = this.getGrid(boName).awsGrid("option").colModel;
		var CM;
		obj.groupTitle = "";
		for (var c  in CMs) {
			if (CMs[c].dataIndx == boItemName) {
				CM = CMs[c];
				break;
			}
		}
		var rowData = obj.nextRowData;
		var value = rowData[boItemName];
		var showName;
		if (value == "") {
			showName = "";
		} else {
			showName = CM.render({
				rowData: obj.nextRowData,
				dataIndx: boItemName,
				column: CM
			});
		}
		return "<b style='font-weight:bold;'>" + showName + " - " + CM.title + "(" + obj.items + ")</b>";
	},
	noRowsShow: function (obj) {
		var grid = AWSGrid.getGrid(obj.boDefName);
		if (grid == null || grid.awsGrid("getInstance").grid.showLoadingCounter > 0) {
			return "";
		}
		var B_$CONT_H = 435, B_$CONT_CONVERT = 95;
		var $cont = obj.$cont, hscrollHeight = $cont.find(".pq-hscroll.pq-sb-horiz.pq-sb-horiz-wt").height(), h = $cont.height() - hscrollHeight, imgw = 105, noRowsStr = 暂无数据;
		if (h < B_$CONT_CONVERT) {
			imgw = 25;
			h = h < 25 ? 25 : h;
		} else if (h < B_$CONT_H) {
			imgw = (imgw) / B_$CONT_H * h;
			imgw = imgw < 50 ? 50 : imgw;
		}
		var t = (h - imgw) / 2;
		t -= t * 0.35;
		var styleDiv = " style='height:" + h + "px;padding-top:" + t + "px;text-align: center;'";
		if (h < B_$CONT_CONVERT) {
			return "<div class='noRowShow' " + styleDiv + ">" +
				"<img   style= 'height:" + imgw + "px' src='../commons/js/jquery/themes/default/ui/images/noResult.png'/>" +
				"<div style='color: #8c8c8c;display: inline-block;vertical-align: top;margin-top: 5px'>" + noRowsStr + "</div>" +
				"</div>";
		}
		var img = " style= 'height:" + imgw + "px;'";
		var html = "<div class='noRowShow' " + styleDiv + ">" +
			"<div>" +
			"<img  " + img + " src='../commons/js/jquery/themes/default/ui/images/noResult.png'/>" +
			"<div  style='color: #8c8c8c;font-size:15px'>" + noRowsStr + "</div>" +
			"</div></div>"
		$cont.append(html);
	}
};
var datelang = {
	en: "en",
	cn: "zh-cn",
	big5: "zh-tw"
};

function bindUIEvent(ui, boDefName) {
	var cks = $(".aws-grid-cell .awsui-checkbox");
	cks.each(function () { // 如果一列只有一个选项，则隐藏label，并且居中显示
		if ($(this).parent().children().length == 2) {
			$(this).parent().css("text-align", "center");
			$(this).next().hide();
		}
	});
	cks.off("click").on("click", function () {
		var isChecked = $(this).prop("checked");
		var rowIndx = $(this).parent().parent().parent().attr("pq-row-indx");　// 行号
		if (rowIndx == undefined) {
			rowIndx = $(this).parent().parent().attr("pq-row-indx");　// 行号
		}
		var id = $(this).attr("id"); // 列号
		var separator = $(this).attr("separator");
		var data;
		if (ui.data) {
			data = ui.data;
		} else {
			data = ui.dataModel.data;
		}
		var record = data[rowIndx];
		var val = $(this).attr("value");
		var arr = new Array();
		if (record[id] != "") {
			arr = record[id].split(separator);
		}
		if (isChecked && $.inArray(val, arr) == -1) {
			arr.push(val);
		} else if (!isChecked && $.inArray(val, arr) > -1) {
			arr.splice($.inArray(val, arr), 1);
		}
		record[id] = arr.toString();
		if (separator.indexOf(",") != 0) {
			record[id] = record[id].replace(/,/g, separator);
		}
		AWSGrid.getGrid(boDefName).awsGrid("setEditData", record);
	});
}

var AWSGridEditor = {
	Text: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, rowIndx = ui.rowIndxPage, record = ui.rowData, dataCell = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		if (tooltip == undefined) {
			tooltip = "";
		}
		if (uiId == "AWSUI.Text") {
			var dataType, ccId, sql, pageSize, source, query;
			query = $("#Grid_" + boDefName + boItemDefName).val();
			if (uiSetting && uiSetting.search == 1) {
				$cell.append("<input title='" + tooltip + "' " + componentExtendCode + " class='pq-editor-focus ' needsave='true' style='border:0px;outline:none;width:100%;height: 25px;' type='text' id='Grid_" + boDefName + boItemDefName + "' value='" + dataCell + "'/>");
				$cell.children("input").attr("placeholder", uiSetting.placeholder);
				var opt = {};
				var url = "./jd?sid=" + $("#sid").val() + "&cmd=CLIENT_UI_TEXT_LIVESEARCH&config=" + encodeURIComponent(awsui.encode(uiSetting)) + "&opt=";
				new LiveSearch("Grid_" + boDefName + boItemDefName, $("#sid").val(), opt, url);
			} else {
				$cell.append("<input title='" + tooltip + "' " + componentExtendCode + " style='padding-left:0px;height: 23px;width: 100%;' id='Grid_" + boDefName + boItemDefName + "' class='aws-grid-editor-default pq-editor-focus ' type='text' value='" + dataCell + "'>");
				$cell.children("input").attr("placeholder", uiSetting.placeholder).focus();
			}
		} else if (uiId == "AWSUI.Number") {
			var align = "text-align: right;";
			var $input = $("<input  title='" + tooltip + "' " + componentExtendCode + " style='" + align + "padding-left:0px;width: 100%;height: 23px;' id='Grid_" + boDefName + boItemDefName + "' class='aws-grid-editor-default pq-editor-focus ' type='text' value='" + dataCell + "'>");
			gridNumberInputFilter($input);
			$cell.append($input);
			$cell.children("input").attr("placeholder", uiSetting.placeholder).focus();
			// 编辑状态下，取消input的禁选状态
			$(document).off("selectstart").on("selectstart", "input", function () {
				return true;
			});
		} else {
			var align = "";
			if (uiId == "AWSUI.Number") {
				align = "text-align: right;";
			}
			$cell.append("<input  title='" + tooltip + "' " + componentExtendCode + " style='" + align + "padding-left:0px;width: 100%;height: 23px;' id='Grid_" + boDefName + boItemDefName + "' class='aws-grid-editor-default pq-editor-focus ' type='text' value='" + dataCell + "'>");
			$cell.children("input").attr("placeholder", uiSetting.placeholder).focus();
			// 编辑状态下，取消input的禁选状态
			$(document).off("selectstart").on("selectstart", "input", function () {
				return true;
			});
		}
	},
	Textarea: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, rowIndx = ui.rowIndxPage, record = ui.rowData, dataCell = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		if (tooltip == undefined) {
			tooltip = "";
		}
		var flexH = AWSGrid.getGrid(boDefName).awsGrid("option").flexHeight;
		var height = $("#" + boDefName + " tr[pq-row-indx=" + rowIndx + "]").height();
		var contH = $("#" + boDefName).find(".pq-cont").height();
		height = contH > height ? height : contH;//最大高度
		if (!flexH) { //如果非自动高度
			var minH = uiSetting.listHeight == "" ? "50" : uiSetting.listHeight;
			height = minH < height ? height : minH;//最小高度
		}
		var inputId = "Grid_" + boDefName + boItemDefName;
		$cell.append("<textarea title='" + tooltip + "' " + componentExtendCode + " style='height:" + height + "px;width:100%;margin-top:-1px;margin-left:-1px;outline:none;border:1px solid #63abf7;' class='pq-editor-focus '>" + dataCell + "</textarea>");
		$cell.children("textarea").attr("placeholder", uiSetting.placeholder).focus();
	},
	Currency: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, rowIndx = ui.rowIndxPage, record = ui.rowData, dataCell = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		var classStyle = "";
		var style = "";
		if (uiId == "AWSUI.Currency") {
			if (uiSetting.currencySymbol == "￥") {
				classStyle = "RMB";
			} else if (uiSetting.currencySymbol == "$") {
				classStyle = "dollar";
			} else if (uiSetting.currencySymbol == "HK") {
				classStyle = "hk_RMB";
			} else if (uiSetting.currencySymbol == "EUR") {
				classStyle = "EUR";
			} else if (uiSetting.currencySymbol == "other") {
				style = "padding-left: 16px !important;background: transparent url(" + uiSetting.symbol + ") no-repeat left center !important;";
			}
			if (tooltip == undefined) {
				tooltip = "";
			}
			var num = "", cents = "";
			if (dataCell.indexOf(".") > 0) {
				num = dataCell.substring(0, dataCell.indexOf("."));
				cents = dataCell.substring(dataCell.indexOf("."));
			} else {
				num = dataCell;
			}
			for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
				num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
			}
			value = num + cents;
			var $input = $("<input  title='" + tooltip + "' " + componentExtendCode + " style='text-align: right;width:" + ($cell.width() - 20) + "px;height: 25px; " + style + "' id='Currency_" + boDefName + boItemDefName + "' class='aws-grid-editor-default pq-editor-focus " + classStyle + "' type='text' value='" + dataCell + "'/>");
			gridNumberInputFilter($input);
			$cell.append($input);
			$cell.children("input").attr("placeholder", uiSetting.placeholder).focus();
		} else {
			AWSGridEditor.Text(ui, boDefName, boItemDefName, uiId, uiSetting, tooltip);
		}
	},
	RadioGroups: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, rowIndx = ui.rowIndxPage, record = ui.rowData, realValue = dataCell = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		var isSingle = true;
		if (uiId == "AWSUI.RadioGroups") {
			isSingle = false;
		}
		var separated = uiSetting.separator || ",";
		var cellData = dataCell.split(separated);
		var value = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		dataCell = UIUtil.getGridComboxValue(cellData, uiSetting.data, isSingle, separated);
		if (dataCell == undefined) {
			dataCell = "";
		}
		if (tooltip == undefined) {
			tooltip = "";
		}
		$cell.append("<select title='" + tooltip + "' event=" + componentExtendCode + " style='border:0px;outline:none;width:100%;' type='text' id='Grid_" + boDefName + boItemDefName + "' value='" + cellData + "'></select>");
		var disable = false;
		if ($("#Grid_" + boDefName + boItemDefName).attr("disabled") || $("#Grid_" + boDefName + boItemDefName).attr("disabled") == "disabled") {
			disable = true;
		}
		$("#Grid_" + boDefName + boItemDefName + "_menu").remove();
		if (uiSetting.dataType) {
			var inputId = "Grid_" + boDefName + boItemDefName;
			var initSelect2 = function (inputId, uiSetting) { //渲染方法
				var select = $("#" + inputId);
				var opt = {
					width: "100%",
					placeholder: '请选择',
					allowClear: true,
					data: uiSetting.dataSource
				};
				select.select2(opt);
				var separated1 = uiSetting.separator || ",";
				select.data("separator", separated1); // 标记分隔符
				value = value || ""; // 没有默认值的时候，确保默认为空
				var arr = value.split(separated1);
				if (arr.length > 0) { // 添加用户编辑的选项
					var html = "";
					for (var i = 0; i < arr.length; i++) {
						var val = arr[i];
						if (val == null || val == "") {
							continue;
						}
						if (select.find("option[value=\"" + val + "\"]").length == 0) {
							html += "<option  data-select2-tag=\"true\" value=\"" + val + "\">" + val + "</option>";
						}
					}
					select.append(html);
				}
				select.val(false ? arr : value).trigger("change"); // 触发级联
				function fixSelect2() {
					$(".select2-selection--single .select2-selection__clear").css("line-height", "26px");
					$(".select2-selection--multiple .select2-selection__clear").css("margin-right", "0px");
				}
				
				var span = select.next();
				span.css("top", "-1px").css("left", "-1px");
				var selection = span.find(".select2-selection");
				selection.width(selection.width() + 2).height(23);
				selection.find("li.select2-selection__choice").css("margin-top", "3px").height(16);
				fixSelect2();
				select.on("change", function () {
					fixSelect2();
				});
			};
			//修改数据源格式为select2数据格式
			if (Object.prototype.toString.call(uiSetting.data) == '[object Array]') { // 判断数据源是数组
				var newData = [];
				for (var i in uiSetting.data) {
					var temp = uiSetting.data[i];
					if (temp.id) {
						newData = uiSetting.data;
						break;
					}
					if (temp.value) {
						var item = {
							id: temp.value,
							text: temp.label
						};
						newData.push(item);
					}
				}
				uiSetting.dataSource = newData;
				initSelect2(inputId, uiSetting);
			} else { // 加载数据源
				var bindValue = "";
				if (uiSetting.cascade) {
					bindValue = {};
					var cascade = uiSetting.cascade;
					for (var k in uiSetting.cascade) { // 把要级联的数据分别转数组
						var id = cascade[k];
						var separator = $("#" + id).data("separator") || ",";
						var v = record[id].split(separator);
						bindValue[id] = v;
					}
					bindValue = JSON.stringify(bindValue)
				}
				awsui.ajax.request({
					type: "POST",
					url: "./jd",
					dataType: "json",
					data: {
						sid: $("#sid").val(),
						cmd: "CLIENT_UI_SELECT2_SOURCE",
						boEntityName: boDefName,
						boItemName: boItemDefName,
						config: awsui.encode(uiSetting),
						bindValue: bindValue
					},
					success: function (r) {
						uiSetting.dataSource = r; // 使用dataSource装载数据源是因为，data（sql）要在下次查询数据的时候使用
						$("#" + inputId).html("");
						initSelect2(inputId, uiSetting);
					}
				});
			}
		}
	},
	CheckboxGroups: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, rowIndx = ui.rowIndxPage, record = ui.rowData, realValue = dataCell = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		var isSingle = true;
		var separated = ",";
		if (uiId == "AWSUI.RadioGroups") {
			isSingle = false;
			separated = "";
		} else {
			separated = uiSetting.separator;
		}
		if (tooltip == undefined) {
			tooltip = "";
		}
		var cellData = dataCell.split(separated);
		if (uiSetting.data.length > 3) {
			dataCell = UIUtil.getGridComboxValue(cellData, uiSetting.data, isSingle, separated);
			if (dataCell == undefined) {
				dataCell = "";
			}
			$cell.append("<select title='" + tooltip + "' event=" + componentExtendCode + " style='border:0px;outline:none;width:100%;' type='text' id='Grid_" + boDefName + boItemDefName + "' value='" + dataCell + "'></select>");
			var disable = false;
			if ($("#Grid_" + boDefName + boItemDefName).attr("disabled") || $("#Grid_" + boDefName + boItemDefName).attr("disabled") == "disabled") {
				disable = true;
			}
			$("#Grid_" + boDefName + boItemDefName + "_menu").remove();
			var value = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
			if (uiSetting.dataType) {
				var inputId = "Grid_" + boDefName + boItemDefName;
				var initSelect2 = function (inputId, uiSetting) { //渲染方法
					var select = $("#" + inputId);
					var opt = {
						width: "100%",
						multiple: true,
						placeholder: '请选择',
						allowClear: true,
						data: uiSetting.dataSource
					};
					select.select2(opt);
					var separator = uiSetting.separator ? uiSetting.separator : ",";
					select.data("separator", separator); // 标记分隔符
					value = value || ""; // 没有默认值的时候，确保默认为空
					var arr = value.split(separator);
					if (arr.length > 0) { // 添加用户编辑的选项
						var html = "";
						for (var i = 0; i < arr.length; i++) {
							var val = arr[i];
							if (val == null || val == "") {
								continue;
							}
							if (select.find("option[value=\"" + val + "\"]").length == 0) {
								html += "<option  data-select2-tag=\"true\" value=\"" + val + "\">" + val + "</option>";
							}
						}
						select.append(html);
					}
					select.val(true ? arr : value).trigger("change"); // 触发级联
					function fixSelect2() {
						$(".select2-selection--single .select2-selection__clear").css("line-height", "26px");
						$(".select2-selection--multiple .select2-selection__clear").css("margin-right", "0px");
					}
					
					var span = select.next();
					span.css("top", "-1px").css("left", "-1px");
					var selection = span.find(".select2-selection");
					selection.width(selection.width() + 2).height(23);
					selection.find("li.select2-selection__choice").css("margin-top", "3px").height(16);
					fixSelect2();
					select.on("change", function () {
						fixSelect2();
					});
				};
				if (Object.prototype.toString.call(uiSetting.data) == '[object Array]') { // 判断数据源是数组
					var newData = [];
					for (var i in uiSetting.data) {
						var temp = uiSetting.data[i];
						if (temp.id) {
							newData = uiSetting.data;
							break;
						}
						if (temp.value) {
							var item = {
								id: temp.value,
								text: temp.label
							};
							newData.push(item);
						}
					}
					uiSetting.dataSource = newData;
					initSelect2(inputId, uiSetting);
				} else { // 加载数据源
					var bindValue = "";
					if (uiSetting.cascade) {
						bindValue = {};
						var cascade = uiSetting.cascade;
						for (var k in uiSetting.cascade) { // 把要级联的数据分别转数组
							var id = cascade[k];
							var separator = $("#" + id).data("separator") || ",";
							var v = record[id].split(separator);
							bindValue[id] = v;
						}
						bindValue = JSON.stringify(bindValue)
					}
					awsui.ajax.request({
						type: "POST",
						url: "./jd",
						dataType: "json",
						data: {
							sid: $("#sid").val(),
							cmd: "CLIENT_UI_SELECT2_SOURCE",
							boEntityName: boDefName,
							boItemName: boItemDefName,
							config: awsui.encode(uiSetting),
							bindValue: bindValue
						},
						success: function (r) {
							uiSetting.dataSource = r; // 使用dataSource装载数据源是因为，data（sql）要在下次查询数据的时候使用
							$("#" + inputId).html("");
							initSelect2(inputId, uiSetting);
						}
					});
				}
			}
		}
	},
	Select2: function (ui, boDefName, boItemName, uiId, config, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndxNum = ui.dataIndx;
		var value = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		var inputId = "Grid_" + boDefName + boItemName;
		var select = $("<select title='" + tooltip + "' type='text' id='" + inputId + "' value='" + value + "'" + componentExtendCode + "></select>");
		select.data("colIndxNum", colIndxNum); // 列号，getData存显示值用
		$cell.append(select);
		var multiple = config.multiple ? config.multiple : false;
		var initSelect2 = function (inputId, config) { //渲染方法
			var select = $("#" + inputId);
			var editable = config.editable == true;
			var opt = {
				width: "100%",
				multiple: multiple,
				placeholder: config.placeholder || '请选择',
				allowClear: true,
				tags: editable,
				data: config.dataSource
			};
			select.select2(opt);
			var separator = config.separator ? config.separator : ",";
			select.data("separator", separator); // 标记分隔符
			value = value || ""; // 没有默认值的时候，确保默认为空
			var arr = value.split(separator);
			if (arr.length > 0) { // 添加用户编辑的选项
				var html = "";
				for (var i = 0; i < arr.length; i++) {
					var val = arr[i];
					if (val == null || val == "") {
						continue;
					}
					if (select.find("option[value=\"" + val + "\"]").length == 0) {
						html += "<option  data-select2-tag=\"true\" value=\"" + val + "\">" + val + "</option>";
					}
				}
				select.append(html);
			}
			select.val(multiple ? arr : value).trigger("change"); // 触发级联
			function fixSelect2() {
				$(".select2-selection--single .select2-selection__clear").css("line-height", "26px");
				$(".select2-selection--multiple .select2-selection__clear").css("margin-right", "0px");
			}
			
			var span = select.next();
			span.css("top", "-1px").css("left", "-1px");
			var selection = span.find(".select2-selection");
			selection.width(selection.width() + 2).height(23);
			selection.find("li.select2-selection__choice").css("margin-top", "3px").height(16);
			fixSelect2();
			select.on("change", function () {
				fixSelect2();
			});
		};
		if (Object.prototype.toString.call(config.data) == '[object Array]') { // 判断数据源是数组
			var newData = [];
			for (var i in config.data) {
				var temp = config.data[i];
				if (temp.id) {
					newData = config.data;
					break;
				}
				if (temp.value) {
					var item = {
						id: temp.value,
						text: temp.label
					};
					newData.push(item);
				}
			}
			config.dataSource = newData;
			initSelect2(inputId, config);
		} else { // 加载数据源
			var bindValue = "";
			if (config.cascade) {
				bindValue = {};
				var cascade = config.cascade;
				for (var k in config.cascade) { // 把要级联的数据分别转数组
					var id = cascade[k];
					var separator = $("#" + id).data("separator") || ",";
					var v = (data[id] + "").split(separator);
					bindValue[id] = v;
				}
				bindValue = JSON.stringify(bindValue)
			}
			awsui.ajax.request({
				type: "POST",
				url: "./jd",
				dataType: "json",
				data: {
					sid: $("#sid").val(),
					cmd: "CLIENT_UI_SELECT2_SOURCE",
					boEntityName: boDefName,
					boItemName: boItemName,
					config: awsui.encode(config),
					bindValue: bindValue
				},
				success: function (r) {
					config.dataSource = r; // 使用dataSource装载数据源是因为，data（sql）要在下次查询数据的时候使用
					$("#" + inputId).html("");
					initSelect2(inputId, config);
				}
			});
		}
	},
	Select: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, rowIndx = ui.rowIndxPage, dataIndx = ui.dataIndx, record = ui.rowData, realValue = dataCell = $.trim(ui.cellData).replace(/'/g, "&apos;").replace(/"/g, "&quot;"), colIndxNum = AWSGrid.getGrid(boDefName).awsGrid("getColIndx", {dataIndx: dataIndx});
		var isAdvance = uiSetting.isAdvance;
		var dataType = uiSetting.dataType;
		// 0表示常量，1表示sql数据
		var isMultiple = false;
		// false表示可多选true表示单选
		var separated = isAdvance ? uiSetting.separator : ",";
		// 分隔符
		var disable = false;
		if (componentExtendCode.indexOf("disabled") >= 0) {
			disable = true;
		}
		var editable = false;
		/**
		 *渲染组件
		 */
		var inputId = "Grid_" + boDefName + boItemDefName;
		var displayValue = $("tr[pq-row-indx=" + rowIndx + "]").find("#" + boItemDefName).html();
		var combo = $("<input title='" + tooltip + "' style='border:0px;outline:none;width:100%;' type='text' id='" + inputId + "' value='" + dataCell + "' displayValue='" + displayValue + "'/>");
		combo.attr("event", componentExtendCode);
		var cellData = dataCell.split(separated);
		if (isAdvance) {
			isMultiple = uiSetting.multiple;
			// false表示可多选true表示单选
			separated = uiSetting.separator;
			// 分隔符
			editable = uiSetting.editable;
			if (componentExtendCode.indexOf("readonly") >= 0) {
				editable = false;
			}
			// 是否只读 表示可修改true 表示只读 false
			if (uiSetting.data instanceof Array) {
				dataCell = UIUtil.getGridComboxValue(cellData, uiSetting.data, isMultiple, separated);
			}
			if (dataCell == undefined) {
				dataCell = "";
			}
			$("#" + inputId + "_menu").remove();
			if (tooltip == undefined) {
				tooltip = "";
			}
		}
		/**
		 *初始化组件，绑定事件
		 */
		var initCombobox = function (source) {
			var combobox = $("#" + inputId).combobox({
				height: 22,
				source: source,
				width: '100%',
				multiple: isMultiple,
				listWidth: parseInt(uiSetting.listWidth),
				seperator: separated,
				placeholder: uiSetting.placeholder,
				listHeight: parseInt(uiSetting.maxHeight),
				editable: editable,
				disable: disable,
				autoFocus: false,
				// selectVal : '',
				select: function (item, data) {
					var value = data.value;
					var changeEvent = window.onComboboxChangeEvent;
					if (changeEvent) {
						window.onComboboxChangeEvent(boItemDefName, $(this), value);
					}
					// 把dataSource放到对应的td，供render使用
					var rowIndx = $("#" + inputId).data("rowIndx");
					var colIndxNum = $("#" + inputId).data("colIndxNum");
					if (item != null) {
						var dataSource = item.dataSource;
						$("tr[pq-row-indx=" + rowIndx + "] td[pq-col-indx=" + colIndxNum + "]").data("dataSource", dataSource);
					}
				}
			});
			$("#" + inputId).data("rowIndx", rowIndx);
			$("#" + inputId).data("colIndxNum", colIndxNum);
		};
		var isCombo = true;
		if (dataType == "sampleText") {//常量
			if (isAdvance) {
				$cell.append(combo);
				initCombobox(uiSetting.data);
			} else {
				var str = "";
				var configData = uiSetting.data;
				if (configData.length > 0 && UIValidate.isNullable(boDefName, boItemDefName, uiSetting)) {
					str += "<option value=''></option>";
				}
				for (var i = 0; i < configData.length; i++) {
					if (dataCell == configData[i].value) {
						str += "<option value='" + configData[i].value + "' selected>" + configData[i].label + "</option>";
					} else {
						str += "<option value='" + configData[i].value + "'>" + configData[i].label + "</option>";
					}
				}
				isCombo = false;
				$("<select title='" + tooltip + "' " + componentExtendCode + " style='width:100%;height:25px;outline:none;border:1px solid transparent;padding:2px 0px' >" + str + "</select>").appendTo($cell);
				$cell.children("select").attr("placeholder", uiSetting.placeholder);
			}
		} else if (dataType == "dictKey" || dataType == "json") { // dict,json
			$cell.append(combo);
			var tempConf = uiSetting;
			if (tempConf.custom) {
				initCombobox(uiSetting.data);
			} else {
				tempConf.data = "";
				tempConf.dataSource = "";
				var url = "./w?sid=" + $("#sid").val() + "&cmd=CLIENT_UI_COMBOBOX_SOURCE&bindValue=&boEntityName=" + boDefName + "&boItemName=" + boItemDefName + "&config=" + encodeURIComponent(awsui.encode(tempConf)) + "&query=" + dataType + "&cascadeValue=";
				initCombobox(url);
			}
		} else {//sql数据源
			//判断是否级联，若级联则绑定事件；
			$cell.append(combo);
			if (uiSetting.cascade && uiSetting.cascade != "") {
				var cascade = uiSetting.cascade;
				var cascadeId = "";
				for (var o in cascade) {
					cascadeId += o + ";";
				}
				cascadeId = cascadeId.toLocaleUpperCase();
				var allCascade = AWSForm.getFormData($('#frmMain'), cascadeId.replace(/\$/g, ""));
				var cascadeComboboxReset = function () {
					var url = "./w?sid=" + $("#sid").val() + "&cmd=CLIENT_UI_COMBOBOX_SOURCE&bindValue=&boEntityName=" + boDefName + "&boItemName=" + boItemDefName + "&config=" + encodeURIComponent(awsui.encode(uiSetting)) + "&query=&cascadeValue=" + encodeURIComponent(JSON.stringify(allCascade));
					initCombobox(url);
				};
				var isArray = function (obj) {
					return Object.prototype.toString.call(obj) === '[object Array]';
				};
				var cascadeValueStr = "";
				for (var o in cascade) {
					var cascadeValue = [];
					if (isMultiple) {
						query = "multiple";
					}
					cascadeValue = [];
					var fieldName = cascade[o].toLocaleUpperCase();
					var cascadeValueData = data[rowIndx][fieldName];
					if ($("#" + cascade[o]) && $("#" + fieldName).attr("separator")) {
						cascadeValueData = cascadeValueData.split($("#" + fieldName).attr("separator"));
					} else {
						cascadeValueData = cascadeValueData.split(",");
					}
					if (isArray(cascadeValueData)) {
						for (var i = 0; i < cascadeValueData.length; i++) {
							cascadeValue.push(cascadeValueData[i]);
						}
					} else {
						cascadeValue.push(cascadeValueData);
					}
					allCascade[fieldName] = cascadeValue;
					//过滤旧数据
					cascadeValueStr += cascadeValue + ",";
					var oldValues = realValue.split(separated);
					var newValues = "";
					for (var r in oldValues) {
						if (cascadeValueStr.indexOf(oldValues[r]) > -1) {
							newValues += oldValues[r] + separated;
						}
					}
					if (newValues.length > 0) {
						newValues = newValues.substr(0, newValues.length - 1);
					}
					combo.attr("value", newValues);
				}
				cascadeComboboxReset();
			} else {
				$("#" + inputId).val() == "";
				var query = $("#" + boItemDefName).val();
				var url = "./w?sid=" + $("#sid").val() + "&cmd=CLIENT_UI_COMBOBOX_SOURCE&bindValue=&boEntityName=" + boDefName + "&boItemName=" + boItemDefName + "&config=" + encodeURIComponent(awsui.encode(uiSetting)) + "&query=" + query + "&cascadeValue=";
				initCombobox(url);
			}
		}
		if (isCombo && realValue) {
			$("#" + inputId).setComboboxVal(realValue);
			$("#" + inputId).combobox("option", "value", realValue);
		}
		$("#" + inputId).attr("boName", boDefName);
		// 回显combobox
	},
	Date: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var dc = $.trim(data[colIndx]);
		if (tooltip == undefined) {
			tooltip = "";
		}
		tooltip = tooltip.replace(/\s+/g, " ");
		$cell.css('padding', '0');
		var option = {
			changeMonth: true,
			changeYear: true,
			onClose: function () {
				$inp.focus();
			}
		};
		var config = {};
		if (uiSetting.minDate) {
			if (uiSetting.minDate.indexOf("$") >= 0) {
				var minTargetId = uiSetting.minDate.substring(uiSetting.minDate.indexOf("$") + 1);
				config.minDate = data[minTargetId];
			} else {
				config.minDate = uiSetting.minDate;
			}
		}
		if (uiSetting.maxDate) {
			if (uiSetting.maxDate.indexOf("$") >= 0) {
				var maxTargetId = uiSetting.maxDate.substring(uiSetting.maxDate.indexOf("$") + 1);
				config.maxDate = data[maxTargetId];
			} else {
				config.maxDate = uiSetting.maxDate;
			}
		}
		config.doubleCalendar = uiSetting.showtype == "singleCalendar" ? false : true;
		var lang = $("#lang").val() || parent.$("#lang").val() || "cn";
		lang = datelang[lang];
		config.lang = lang;
		var set = uiSetting.advSetting;
		//高级配置
		if (set) {
			set = awsui.decode(set);
			config = $.extend(config, set);
		}
		var configStr = JSON.stringify(config);
		var isReadOnly = "";
		if (componentExtendCode.indexOf("readonly") < 0) {
			isReadOnly = " onfocus='WdatePicker(" + configStr + ")'";
		}
		tooltip = tooltip.length > 0 ? "awsui-qtip=\"text:'" + tooltip + "',position:'left'\"" : "";
		var $inp = $("<input " + tooltip + componentExtendCode + " type='text' class='pq-editor-focus ' needsave='true' style='text-align: center;padding:2px;border:0;vertical-align:bottom;width:95%;height:20px;outline:none;' id='Grid_" + boDefName + boItemDefName + "' value='" + dc + "' " + isReadOnly + "/>").appendTo($cell).val(dc);
		if ($inp.parent().height() - 12 > $inp.height()) {
			$inp.height($inp.parent().height() - 12);
		}
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
//		$('#Grid_' + boDefName + boItemDefName).datepicker(config);
//		$('#Grid_' + boDefName + boItemDefName).trigger("mousedown");
		$('#Grid_' + boDefName + boItemDefName).focus();
	},
	DateTime: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var dc = $.trim(data[colIndx]);
		$cell.css('padding', '0');
		if (tooltip == undefined) {
			tooltip = " ";
		}
		tooltip = tooltip.replace(/\s+/g, " ");
		var config = {};
		if (uiSetting.minDate) {
			if (uiSetting.minDate.indexOf("$") >= 0) {
				var minTargetId = uiSetting.minDate.substring(uiSetting.minDate.indexOf("$") + 1);
				config.minDate = data[minTargetId];
			} else {
				config.minDate = uiSetting.minDate;
			}
		}
		if (uiSetting.maxDate) {
			if (uiSetting.maxDate.indexOf("$") >= 0) {
				var maxTargetId = uiSetting.maxDate.substring(uiSetting.maxDate.indexOf("$") + 1);
				config.maxDate = data[maxTargetId];
			} else {
				config.maxDate = uiSetting.maxDate;
			}
		}
		config.doubleCalendar = uiSetting.showtype == "singleCalendar" ? false : true;
		config.dateFmt = uiSetting.dateFmt ? uiSetting.dateFmt : "yyyy-MM-dd HH:mm:ss";
		var lang = $("#lang").val() || parent.$("#lang").val() || "cn";
		lang = datelang[lang];
		config.lang = lang;
		var set = uiSetting.advSetting;
		//高级配置
		if (set) {
			set = awsui.decode(set);
			config = $.extend(config, set);
		}
		var configStr = JSON.stringify(config);
		var isReadOnly = "";
		if (componentExtendCode.indexOf("readonly") < 0) {
			isReadOnly = " onfocus='WdatePicker(" + configStr + ")'";
		}
		tooltip = tooltip.length > 0 ? " awsui-qtip=\"text:'" + tooltip + "',position:'left'\"" : "";
		var $inp = $("<input type='text' " + componentExtendCode + tooltip + "  id='Grid_" + boDefName + boItemDefName + "' class='pq-editor-focus ' needsave='true' style='text-align: center;padding:2px;border:0;vertical-align:bottom;width:95%;height:20px;outline:none;' value='" + dc + "' " + isReadOnly + "/>").appendTo($cell).val(dc);
		if ($inp.parent().height() - 12 > $inp.height()) {
			$inp.height($inp.parent().height() - 12);
		}
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
		// $("#Grid_" + boDefName + boItemDefName).datepicker({
		// 	doubleCalendar: config.doubleCalendar,
		// 	dateFmt: config.dateFmt,
		// 	lang: config.lang,
		// 	changeMonth: true,
		// 	changeYear: true,
		// 	onClose: function () {
		// 		$inp.focus();
		// 	}
		// });
		$("#Grid_" + boDefName + boItemDefName).focus();
		//	$("#Grid_" + boDefName + boItemDefName).trigger("mousedown");
	},
	Time: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var dc = $.trim(data[colIndx]);
		$cell.css('padding', '0');
		if (tooltip == undefined) {
			tooltip = " ";
		}
		tooltip = tooltip.replace(/\s+/g, " ");
		var dateFmt = uiSetting.dateFmt ? uiSetting.dateFmt : "HH:mm:ss";
		var lang = $("#lang").val() || parent.$("#lang").val() || "cn";
		lang = datelang[lang];
		var option = {
			dateFmt: dateFmt,
			changeMonth: true,
			lang: lang,
			onClose: function () {
				$inp.focus();
			}
		};
		var event = "";
		if (componentExtendCode.indexOf("readonly") < 0) {
			if (uiSetting.error) {
				componentExtendCode += " readonly";
			} else {
				event = " onfocus='WdatePicker({dateFmt : \"" + dateFmt + "\",lang : \"" + lang + "\"})'";
			}
		}
		tooltip = tooltip.length > 0 ? "awsui-qtip=\"text:'" + tooltip + "',position:'left'\" " : " ";
		var $inp = $("<input " + tooltip + componentExtendCode + " type='text' id='Grid_" + boDefName + boItemDefName + "' class='pq-editor-focus ' needsave='true' style='text-align: center;padding:2px;border:0;vertical-align:bottom;width:95%;height:20px;outline:none;' value='" + dc + "' " + event + " />").appendTo($cell).val(dc);
		if ($inp.parent().height() - 12 > $inp.height()) {
			$inp.height($inp.parent().height() - 12);
		}
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
	},
	Slider: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var record = AWSGrid.getGrid(boDefName).awsGrid("getRowData", rowIndx);
		var dataCell = realValue = $.trim(data[colIndx]);
		$("#Slider_" + boDefName + boItemDefName + "_menu").remove();
		var min = uiSetting.min;
		var max = uiSetting.max;
		var minIncrement = uiSetting.minIncrement;
		if (minIncrement == undefined || minIncrement == '' || minIncrement == 0) {
			minIncrement = 1;
		}
		var forMax = Math.round((max - min) / minIncrement) + 1;
		var tags = [{id: " ", text: "空"}];
		for (var i = 0; i < forMax; i++) {
			data = {};
			if (i == 0) {
				data.id = min + "";
				data.text = min + "";
			} else if (i == forMax - 1) {
				data.id = max + "";
				data.text = max + "";
			} else {
				var addNum = parseInt(min) + minIncrement * i;
				data.id = addNum + "";
				data.text = addNum + "";
			}
			tags.push(data);
		}
		uiSetting.dataSource = tags;
		if (tooltip == undefined) {
			tooltip = "";
		}
		$cell.append("<select title='" + tooltip + "' " + componentExtendCode + " style='text-align: right;border:0px;width:100%;outline:none;' type='text' id='Slider_" + boDefName + boItemDefName + "' value='" + dataCell + "' ></select>");
		var inputId = "Slider_" + boDefName + boItemDefName;
		var initSelect2 = function (inputId, uiSetting) { //渲染方法
			var select = $("#" + inputId);
			var opt = {
				width: "100%",
				placeholder: '请选择...',
				allowClear: true,
				seperator: '|',
				data: uiSetting.dataSource,
				minimumResultsForSearch: "Infinity"
			};
			select.select2(opt);
			realValue = realValue || "0"; // 没有默认值的时候，确保默认为空
			select.val(realValue).trigger("change");
			var span = select.next();
			span.css("top", "-1px").css("left", "-1px");
			var selection = span.find(".select2-selection");
			selection.width(selection.width() + 2).height(23);
			selection.find("li.select2-selection__choice").css("margin-top", "3px").height(16);
		};
		initSelect2(inputId, uiSetting);
	},
	Button: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
	},
	Rating: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var record = AWSGrid.getGrid(boDefName).awsGrid("getRowData", rowIndx);
		var dataCell = realValue = $.trim(data[colIndx]);
		$("#Rating_" + boDefName + boItemDefName + "_menu").remove();
		dataCell = UIUtil.getGridComboxValue(dataCell, uiSetting.data, false, '');
		if (dataCell == undefined) {
			dataCell = "";
		}
		if (tooltip == undefined) {
			tooltip = "";
		}
		$cell.append("<select title='" + tooltip + "' " + componentExtendCode + " style='border:0px;outline:none;width:100%;' type='text' id='Rating_" + boDefName + boItemDefName + "' value='" + dataCell + "'></select>");
		var oldData = uiSetting.data;
		var newData = [{id: " ", text: "空"}];
		for (var i = 0; i < oldData.length; i++) {
			var item = oldData[i];
			var newItem = {};
			newItem.id = item.value;
			newItem.text = item.label;
			newData.push(newItem);
		}
		uiSetting.dataSource = newData;
		var inputId = "Rating_" + boDefName + boItemDefName;
		var initSelect2 = function (inputId, uiSetting) { //渲染方法
			var select = $("#" + inputId);
			var opt = {
				width: "100%",
				placeholder: '请选择...',
				allowClear: true,
				data: uiSetting.dataSource,
				minimumResultsForSearch: "Infinity"
			};
			select.select2(opt);
			realValue = realValue || "0"; // 没有默认值的时候，确保默认为空
			select.val(realValue).trigger("change");
			var span = select.next();
			span.css("top", "-1px").css("left", "-1px");
			var selection = span.find(".select2-selection");
			selection.width(selection.width() + 2).height(23);
			selection.find("li.select2-selection__choice").css("margin-top", "3px").height(16);
		};
		initSelect2(inputId, uiSetting);
	},
	GridDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		uiSetting.boItemName = boItemDefName;
		var $cell = ui.$cell, data = ui.data, rowIndx = ui.rowIndxPage;
		var record = ui.rowData, dataCell = $.trim(ui.cellData);
		var css = "";
		if (tooltip == undefined) {
			tooltip = "";
		}
		$cell.append("<input title='" + tooltip + "' " + componentExtendCode + " style='padding:0px;width:100%;height: 23px;margin:0px !important' id='Grid_" + boDefName + boItemDefName + "' class='aws-grid-editor-default pq-editor-focus '  needsave='true' type='text' value='" + dataCell + "'>");
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
		uiSetting.mode = "dialog";
		// 模式：1对话框模式，
		var isMultiple = uiSetting.multiple;
		var dialogHeight = $(window).height() - 75;
		if (dialogHeight > 535) {
			dialogHeight = 535;
		}
		//var scrollTop=$(document).scrollTop();
		//alert($("#" + boItemDefName).width());
		var top = 0;
		uiSetting.placeholder = "";
		//防止有特殊字符，影响字符串转json
		var left = $("#" + boItemDefName).width() - 42;
		if (componentExtendCode.indexOf("disabled") >= 0) {
			uiSetting.clearData = false;
		}
		$("#Grid_" + boDefName + boItemDefName).buttonedit({
			isClearData: uiSetting.clearData,
			clearField: uiSetting.clearField,
			validate: uiSetting.validate,
			config: awsui.encode(uiSetting),
			multiple: uiSetting.multiple,
			record: awsui.encode(record),
			rowIndx: rowIndx,
			boDefName: boDefName,
			callback: function () {
				if (window.dictCallBack) {
					window.dictCallBack(boItemDefName);
				}
			},
			onClick: function () {
				if (componentExtendCode.indexOf("disabled") >= 0) {
					return;
				}
				var formData = AWSForm.getFormData($('#frmMain'), $("#boItemList").val());
				formData.rowData = record;
				var setting = {
					title: uiSetting.dicTitle,
					width: !isMultiple ? 800 : 800,
					height: dialogHeight,
					url: "./w",
					data: {
						sid: $("#sid").val(),
						cmd: 'CLIENT_UI_XMLDICT_OPEN',
						config: awsui.encode(uiSetting),
						appId: $("#appId").val(),
						condition: formDictValueValidate,
						isGrid: true,
						pageIndex: 1,
						bindValue: awsui.encode(formData),
						boId: $("#AWSGridBoDefID-" + boDefName).val(),
						processInstId: frmMain.processInstId.value,
						taskInstId: frmMain.taskInstId.value,
						containerId: "",
						containerType: !isMultiple ? "common" : "multichoice",
						rowIndx: rowIndx,
						boDefName: boDefName
					}
				};
				//记录onchange事件
				AWSGridEditor.changeSupport = {};
				AWSGridEditor.changeSupport[boDefName] = {};
				AWSGridEditor.changeSupport[boDefName][boItemDefName] = $("#Grid_" + boDefName + boItemDefName).get(0);
				if (uiSetting.multiple) {
					setting.buttons = [{
						text: 确定,
						cls: "blue",
						handler: function () {
							AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
							var beforVal = record[boItemDefName];
							var json = $("#id-awsui-win-frm-2013-frm")[0].contentWindow.getFormValue();
							if (json === false) {
								return false;
							}
							json = awsui.decode(json);
							var grid = AWSGrid.getGrid(boDefName);
							var data = json;
							var dataIndex = [];
							for (var id in data) {
								record[id] = data[id].substring(0, data[id].length - 1);
								if (id + "_DISPLAYVALUE" in record) {
									record[id + "_FINDTEXT"] = true; // 下拉列表增加标识符
								}
								dataIndex.push(id);
							}
							if (parent.AWSGrid && parent.AWSGrid.version) {
								grid.awsGrid("setEditData", {rowData: record, refresh: false, rowIndx: rowIndx});
							} else {
								grid.awsGrid("setEditData", record);
							}
							for (var i in dataIndex) {
								grid.awsGrid("refreshCell", {
									rowIndx: rowIndx,
									dataIndx: dataIndex[i]
								});
							}
							var inp = $cell.find("input").get(0); //onchange 触发
							if (inp.onchange && beforVal != record[boItemDefName]) {
								if (inp.fireEvent) {
									inp.fireEvent("onchange");
								} else {
									var evt = document.createEvent('HTMLEvents');
									evt.initEvent('change', true, true);
									inp.dispatchEvent(evt);
								}
							}
							FrmDialog.close();
						}
					}, {
						text: 取消,
						handler: function () {
							FrmDialog.close();
						}
					}];
				} else {
					setting.buttons = [{
						text: 取消,
						handler: function () {
							FrmDialog.close();
						}
					}];
				}
				;
				FrmDialog.open(setting);
			}
		});
	},
	FlatDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var record = AWSGrid.getGrid(boDefName).awsGrid("getRowData", rowIndx);
		var dataCell = $.trim(data[colIndx]);
		var displayValue = data[boItemDefName + "_DISPLAYVALUE"] ? data[boItemDefName + "_DISPLAYVALUE"] : dataCell;
		if (tooltip == undefined) {
			tooltip = "";
		}
		$cell.append("<input type='hidden' title='" + tooltip + "' " + componentExtendCode + "  id='Grid_" + boDefName + boItemDefName + "' name='" + boItemDefName + "' class='aws-grid-editor-default  pq-editor-focus ' needsave='true' type='text' value='" + dataCell + "' >");
		$cell.append("<input title='" + tooltip + "' " + componentExtendCode + " style='padding:0px;width:100%;height: 23px;margin:0px !important' id='Grid_" + boDefName + boItemDefName + "_DISPLAY' name='" + boItemDefName + "_DISPLAY' class='aws-grid-editor-default  pq-editor-focus ' needsave='true' type='text' value='" + displayValue + "' title='" + displayValue + "'>");
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
		uiSetting.rowIndxPage = ui.rowIndxPage;
		$("#Grid_" + boDefName + boItemDefName + "_DISPLAY").buttonedit({
			onClick: function () {
				if (componentExtendCode.indexOf("disabled") >= 0) {
					return;
				}
				uiSetting.isGrid = true;
				uiSetting.boDefName = boDefName;
				uiSetting.boItemDefName = boItemDefName;
				FrmDialog.open({
					title: 分类选择,
					width: 650,
					height: 440,
					url: "./w",
					data: {
						sid: $("#sid").val(),
						cmd: 'CLIENT_UI_FLATDICTIONARY_OPEN',
						config: escape(awsui.encode(uiSetting)),
						boItemName: "Grid_" + boDefName + boItemDefName,
						grid: '',
						group1Value: '',
						boItemValue: $("#Grid_" + boDefName + boItemDefName).val()
					},
					buttons: [{
						text: 关闭,
						handler: function () {
							FrmDialog.close();
						}
					}]
				});
			}
		});
		var fn = function (json, config) {
			for (var o in json) {
				data[o] = json[o];
			}
			var domName = "Grid_" + config.boDefName + config.boItemDefName;
			$("#" + domName).val(data[config.boItemDefName]);
			AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
			AWSGrid.getGrid(boDefName).awsGrid("setEditData", data);
			AWSGrid.getGrid(boDefName).awsGrid("refreshCell", {
				rowIndx: rowIndx,
				dataIndx: o
			});
		};
		eval("window.flatRowdata=fn");//注册一个函数，供树的界面调用
	},
	TreeDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, rowData = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var dataCell = $.trim(rowData[colIndx]);
		var displayValue = rowData[boItemDefName + "_DISPLAYVALUE"] ? rowData[boItemDefName + "_DISPLAYVALUE"] : dataCell;
		if (tooltip == undefined) {
			tooltip = "";
		}
		//展示值
		var showValueId = "Grid_" + boDefName + boItemDefName + "VAL";
		var valueId = "Grid_" + boDefName + boItemDefName;
		var $treeDom = $("<div id=\"" + valueId + "dicttree\" class='pq-editor-focus ' needsave='true' title='" + tooltip + "'" + componentExtendCode + " class=\"awsui-container\" style=\"width: 1511px;height:100%;\"></div>");
		$cell.append($treeDom);
		$cell.append("<input id='" + showValueId + "' style='display:none;' type='text' value='" + displayValue + "' >");
		// 隐藏字段 用于存储回填值
		$cell.append("<input id='" + valueId + "' style='display:none;' " + componentExtendCode + "  type='text' value='" + dataCell + "'>"); //componentExtendCode支持onchange
		//TODO
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
		var divId = "popbox_tree_" + boItemDefName + "";
		var iframeId = divId + "_frm";
		if ($(document.body).find("#" + divId).length == 0) {
			var div = "<div id='" + divId + "' class='awsui-popbox' style='display:none;border: 1px solid #C0C2C4;' >";
			div += "<iframe name='" + iframeId + "' id='" + iframeId + "'  frameborder='0' style='width:100%;height:100%' src=''></iframe></div>";
			$(document.body).append(div);
		}
		var oldData = JSON.parse(awsui.encode(AWSForm.getFormData()));
		oldData["otherData"] = rowData;
		var formData = JSON.stringify(oldData);
		uiSetting.rowIndxPage = ui.rowIndxPage;
		$treeDom.data("config", uiSetting);
		UIInit.treeDictionaryHelper.refreshNode(valueId);
		$treeDom.off("click").on("click", function () {
			uiSetting.isGrid = true;
			uiSetting.boDefName = boDefName;
			uiSetting.boItemDefName = boItemDefName;
			var data = {
				sid: $("#sid").val(),
				cmd: 'CLIENT_UI_TREEDICTIONARY_FILLBACK_GETDATA',
				boItemName: boItemDefName,
				config: awsui.encode(uiSetting),
				formData: formData
			};
			var html = "";
			html += '<html>';
			html += '<head>';
			html += '<title>loading...</title>';
			html += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
			html += '<body>';
			html += '<p>&nbsp;</p>';
			html += '<p align="center"><img src="../commons/js/jquery/themes/default/ui/images/loading.gif"><br><br><span style="font-family:Arial;color:gray;font-size:11px">loading...</span></p>';
			html += '<p>&nbsp;</p>';
			html += "<form action='./w' method='post' target='_self' id='postData_form'>";
			for (var key in data) {
				if (key == "config") {
					html += "<textarea style='display:none;' id='" + key + "' name='" + key + "'>" + data[key] + "</textarea>";
				} else if (data[key] != null) {
					html += "<input id='" + key + "' name='" + key + "' type='hidden' value='" + data[key] + "'/>";
				}
			}
			html += "</form>";
			html += '</body>';
			html += '</html>';
			setTimeout(function () {
				$("#" + iframeId).get(0).contentWindow.document.write(html);
			}, 50);
			setTimeout(function () {
				$("#" + iframeId).contents().find("#postData_form").submit();
				return false;
			}, 100);
			var width = 400;
			var height = 400;
			$("#" + divId).popbox({
				target: $treeDom,
				width: width,
				height: height,
				hideArrow: true
			});
			if (uiSetting.multiselect === true) {
				if ($("#" + divId).find('#tree_ok' + boItemDefName).length == 0) {
					var button = $('<button type="button" id="tree_ok' + boItemDefName + '" name="tree_ok' + boItemDefName + '" class="button blue" style="float:right;">' + 确定 + '</button>');
					$("#" + divId).append(button);
					$("#" + divId + "_frm").height($("#" + divId).height() - 45);
					button.off("click").on("click", function () {
						var value = $("#" + divId + "_frm").get(0).contentWindow.getValue();
						var json = awsui.decode(value);
						$("#" + divId).remove();
						var beforVal = rowData[uiSetting.boItemDefName];
						var refreshCell = {};
						for (var o in json) {
							refreshCell[o.replace("_DISPLAYVALUE", "")] = true;
							rowData[o] = json[o];
						}
						var domName = "Grid_" + uiSetting.boDefName + uiSetting.boItemDefName;
						$("#" + domName).val(rowData[uiSetting.boItemDefName]);
						if (window.triggerChangeByBoItemName) {
							window.triggerChangeByBoItemName(domName, beforVal);
						}
						AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
						AWSGrid.getGrid(boDefName).awsGrid("setEditData", rowData);
						for (var k in refreshCell) {
							AWSGrid.getGrid(boDefName).awsGrid("refreshCell", {
								rowIndx: rowIndx,
								dataIndx: k
							});
						}
					});
					var button2 = $('<button type="button" id="tree_cancel' + boItemDefName + '" name="tree_cancel' + boItemDefName + '" class="button" style="float:right;">' + 清空 + '</button>');
					$("#" + divId).append(button2);
					button2.off("click").on("click", function () {
						UIInit.treeDictionaryHelper.clearAllVal(valueId, uiSetting);
						$("#" + divId).hide();
						AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
						//$("#popbox_tree_" + boItemDefName + "_frm").get(0).contentWindow.clearSelect();
					});
				}
			} else {
				var fn = function (json, config) {
					$("#" + divId).hide();
					for (var o in json) {
						rowData[o] = json[o];
					}
					var domName = "Grid_" + config.boDefName + config.boItemDefName;
					$("#" + domName).val(rowData[config.boItemDefName]);
					if (window.triggerChangeByBoItemName) {
						window.triggerChangeByBoItemName(domName, config.beforVal);
					}
					AWSGrid.getGrid(boDefName).awsGrid("quitEditMode");
					AWSGrid.getGrid(boDefName).awsGrid("setEditData", rowData);
					AWSGrid.getGrid(boDefName).awsGrid("refreshCell", {
						rowIndx: rowIndx,
						dataIndx: o
					});
				};
				eval("window." + boDefName + boItemDefName + "=fn");//注册一个函数，供树的界面调用
			}
		});
		$treeDom.click();
		return false;
	},
	Address: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var record = AWSGrid.getGrid(boDefName).awsGrid("getRowData", rowIndx);
		var dataCell = $.trim(data[colIndx]);
		if (tooltip == undefined) {
			tooltip = "";
		}
		var disable = "";
		if (componentExtendCode.indexOf("disable") >= 0) {
			disable = "disable";
		}
		$cell.append("<input title='" + tooltip + "' " + componentExtendCode + " style='padding:0px;width:100%;margin:0px !important;height: 23px;' id='Address_" + boItemDefName + "' class='aws-grid-editor-default " + disable + "  pq-editor-focus ' needsave='true' type='text' value='" + dataCell + "' title='" + dataCell + "'>");
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
		var addressType = uiSetting.addressType;
		var isAdvMode = uiSetting.isAdvMode;
		var isLiveSearch = uiSetting.isLiveSearch;
		if (addressType == "user" && !isAdvMode) {// 普通地址簿
			$("#Address_" + boItemDefName).address({isLiveSearch: isLiveSearch, gridId: boDefName, gridRowIndx: rowIndx});
			$("#Address_" + boItemDefName).css("border", "0px");
			$("#Address_" + boItemDefName + "_menu").css("min-width", "150px");
		} else if ((addressType == "user" && isAdvMode) || addressType == "dept") {// 高级地址簿和部门地址簿
			$("#Address_" + boItemDefName).address({
				filter: uiSetting,
				isGrid: true, // 在grid中打开
				gridId: boDefName, // 初始化grid的jquery对象
				gridRowIndx: rowIndx,
				isLiveSearch: isLiveSearch
				// grid行索引
			});
		}
	},
	Team: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode, tooltip) {  //TEAMee
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var record = AWSGrid.getGrid(boDefName).awsGrid("getRowData", rowIndx);
		var dataCell = $.trim(data[colIndx]);
		if (undefined == tooltip) {
			tooltip = "";
		}
		var disable = "";
		if (componentExtendCode.indexOf("disable") >= 0) {
			disable = "disable";
		}
		var separator = uiSetting.teamSetting.selimiter;
		var showvalue = '';
		awsui.ajax.request({
			type: "POST",
			url: "./jd",
			async: false,
			data: {
				sid: $("#sid").val(),
				cmd: 'CLIENT_UI_TEAM_GET_TEAMNAMEBYID',
				teamid: dataCell,
				selimiter: separator
			},
			ok: function (r) {
				showvalue = r.data.showvalue;
			},
			err: function (r) {
				alert('error');
			}
		});
		$cell.append("<input type='hidden' " + componentExtendCode + " style='padding:0px;width:100%;margin:0px !important;height: 23px;' id='Team_" + boDefName + boItemDefName + "' class='aws-grid-editor-default " + disable + "  pq-editor-focus ' needsave='true' type='text' value='" + dataCell + "'>");
		$cell.append("<input title='" + tooltip + "' " + componentExtendCode + " style='padding:0px;padding-left:4px;width:100%;margin:0px !important;height: 23px;' id='Team_" + boDefName + boItemDefName + "VAL" + "' class='aws-grid-editor-default " + disable + "' type='text' value='" + showvalue + "' title='" + showvalue + "'>");
		$cell.children("input").attr("placeholder", uiSetting.placeholder);
		var clearData = true;
		if (componentExtendCode.indexOf("disabled") >= 0) {
			clearData = false;
		}
		$("#Team_" + boDefName + boItemDefName + "VAL").buttonedit({
			iconCls: "team",
			onClick: click,
			isClearData: true,
			boDefName: boDefName,
			rowIndx: rowIndx,
			config: awsui.encode(uiSetting),
			record: awsui.encode(record),
			clearField: boItemDefName,
			callback: function () {
				$("#Team_" + boDefName + boItemDefName + "VAL").val('');
				$("#Team_" + boDefName + boItemDefName).val('');
			}
		});
		
		function click() {
			if (componentExtendCode.indexOf("disabled") >= 0) {
				return;
			}
			var height = window.screen.availHeight / 2;
			var bb = [{
				text: '刷新',
				cls: "",
				handler: function () {
					FrmDialog.close();
					option.data.showval = $("#Team_" + boDefName + boItemDefName + "VAL").val();
					option.data.hidval = $("#Team_" + boDefName + boItemDefName).val();
					FrmDialog.open(option);
				}
			}];
			if (uiSetting.teamSetting.choiceType == 'multiple') {
				bb = [{
					text: 确定,
					cls: "blue",
					handler: function () {
						var fram = window.frames["id-awsui-win-frm-2013-frmfrmteamAjaxdia"].getTeamValue("Team_" + boDefName + boItemDefName, uiSetting);
						FrmDialog.close();
					}
				}, {
					text: '刷新',
					cls: "",
					handler: function () {
						FrmDialog.close();
						option.data.showval = $("#Team_" + boDefName + boItemDefName + "VAL").val();
						option.data.hidval = $("#Team_" + boDefName + boItemDefName).val();
						FrmDialog.open(option);
					}
				}
				];
			}
			var showval = $("#Team_" + boDefName + boItemDefName + "VAL").val();
			var hidval = $("#Team_" + boDefName + boItemDefName).val();
			var option = {
				name: "frmteamAjaxdia",
				id: "frmteamAjaxdia",
				type: "POST",
				title: "选择小组",
				width: 650,
				height: height,
				url: "./w",
				data: {
					sid: $("#sid").val(),
					cmd: 'CLIENT_UI_TEAM_OPEN',
					config: escape(awsui.encode(uiSetting)),
					boItemName: "Team_" + boDefName + boItemDefName,
					boItemValue: '',
					showval: showval,
					hidval: hidval
				},
				buttons: bb,
				onClose: function () {
					$.mask("close");
				},
				onClick: function () {
					alert('fg');
				}
			};
			FrmDialog.open(option);
			;
		}
	},
	BOAC: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode) {
	},
	XCode: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode) {
	},
	SwitchButton: function (ui, boDefName, boItemDefName, uiId, uiSetting, componentExtendCode) {
		$("#awsui_tooltip").remove();
		var $cell = ui.$cell, data = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.dataIndx;
		var record = AWSGrid.getGrid(boDefName).awsGrid("getRowData", rowIndx);
		var value = $.trim(data[colIndx]);
		var str = "";
		var selected1, selected2 = "";
		var val1, val2;
		if (!uiSetting.onText) {
			uiSetting.onText = "开";
		}
		if (!uiSetting.offText) {
			uiSetting.offText = "关";
		}
		if (uiSetting.storeFlag == "0") {
			val1 = "1";
			val2 = "0";
			if (value == "1") {
				selected1 = "selected";
				selected2 = "";
			} else {
				selected1 = "";
				selected2 = "selected";
			}
		} else {
			val1 = "true";
			val2 = "false";
			if (value == "true") {
				selected1 = "selected";
				selected2 = "";
			} else {
				selected1 = "";
				selected2 = "selected";
			}
		}
		str += "<option value='" + val1 + "' " + selected1 + ">" + uiSetting.onText + "</option>";
		str += "<option value='" + val2 + "' " + selected2 + ">" + uiSetting.offText + "</option>";
		$("<select " + componentExtendCode + " style='width:100%;outline:none;border:1px solid transparent;padding:2px 0px' >" + str + "</select>").appendTo($cell);
	}
};
var AWSGridRender = {
	Text: function (ui, boDefName, boItemDefName, uiId, uiSetting, readonly) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		var html = value;
		// if (uiId == "AWSUI.TreeDictionary" && value != "") {//树形数据字典 键值回填
		// 	awsui.ajax.request({
		// 		type: "POST",
		// 		url: "./jd",
		// 		async: false,
		// 		data: {
		// 			sid: $("#sid").val(),
		// 			cmd: 'CLIENT_UI_TREEDICTIONARY_FILLBACK_GET_DISPLAY_VALUE',
		// 			value: value,
		// 			uiSetting: JSON.stringify(uiSetting),
		// 			boItemDefName: boItemDefName
		// 		},
		// 		ok: function (r) {
		// 			html = r.data.displayValue;
		// 		},
		// 		err: function (r) {
		// 			alert('error');
		// 		}
		// 	});
		// }
		if (html == "" && uiSetting.placeholder && readonly == false) {
			return "<div style='color:#A9A9A9;'>" + uiSetting.placeholder + "</div>";
		}
		return html;
	},
	File: function (ui, boDefName, boItemDefName, uiId, boItemId, readonly, uiSetting, tooltip) {
		var record = ui.rowData;
		var boDefId = uiSetting.boDefId;
		var boId = record.ID;
		var value = record[boItemDefName];
		var html;
		if (value != null && value.length > 0) {
			html = AWSFile.getFilesHtml(value);
		} else {
			html = "<img src=\"../commons/js/jquery/themes/default/ui/images/icon_12.png\" style=\"vertical-align: top;margin-top: 3px;margin-left: 2px;\"> " + 附件;
		}
		return "<div style='cursor:pointer;word-break: normal;overflow: hidden;text-overflow: ellipsis;' title='" + tooltip + "' onclick=UIUtil.openFile('" + boDefId + "','" + boId + "'," + readonly + ",'" + boItemDefName + "'," + awsui.encode(uiSetting).replace(/\ /g, "nbsp;") + "," + ui.rowIndxPage + "); >" + html + "</div>";
	},
	Textarea: function (ui, boDefName, boItemDefName, uiId, uiSetting, readonly) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		var html = value;
		if (html == "" && uiSetting.placeholder && readonly == false) {
			return "<div style='color:#A9A9A9;'>" + uiSetting.placeholder + "</div>";
		}
		return html;
	},
	HTMLEditor: function (ui, boDefName, boItemDefName, uiId, boItemId, readonly, uiSetting) {
		var record = ui.rowData;
		var boId = record.ID;
		var value = record[boItemDefName];
		return "<div style='cursor:pointer' onclick=UIUtil.openHTMLEditor('" + boDefName + "','" + boId + "'," + readonly + ",'" + boItemDefName + "'," + awsui.encode(uiSetting) + "," + ui.rowIndxPage + "); >" + 详细信息 + "</div>";
	},
	Select2: function (ui, boDefName, boItemDefName, uiId, config) {
		var record = ui.rowData, rowIndx = ui.rowIndxPage, colIndx = ui.colIndx, dataIndx = ui.dataIndx;
		var separator = config.separator || ",";
		var value = record[dataIndx], displayValue = record[boItemDefName + "_DISPLAYVALUE"]; // 初始显示值
		if (record[dataIndx + "_FINDTEXT"] == true && value) { // 如果是被动回填值，那么查询数据源，返回显示值
			record[dataIndx + "_FINDTEXT"] = false;
			var findText = function () {
				displayValue = "";
				var dataSource = config.dataSource;
				var s = config.separator || ",";
				var arr = value.split(s);
				for (var i in arr) {
					var v = arr[i];
					for (var j in dataSource) {
						var item = dataSource[j];
						if (item.id == v) {
							displayValue += item.text + s;
							break;
						}
					}
				}
				if (displayValue.length > 0) {
					displayValue = displayValue.substring(0, displayValue.length - 1);
				}
				record[boItemDefName + "_DISPLAYVALUE"] = displayValue;
				return displayValue;
			};
			if (Object.prototype.toString.call(config.data) == '[object Array]') {
				config.dataSource = config.data;
				displayValue = findText();
			} else {
				var bindValue = "";
				if (config.cascade) {
					bindValue = {};
					var cascade = config.cascade;
					for (var k in config.cascade) { // 把要级联的数据分别转数组
						var id = cascade[k];
						var separator = $("#" + id).data("separator") || ",";
						var v = record[id].split(separator);
						bindValue[id] = v;
					}
					bindValue = JSON.stringify(bindValue)
				}
				awsui.ajax.request({
					type: "POST",
					url: "./jd",
					async: false,
					dataType: "json",
					data: {
						sid: $("#sid").val(),
						cmd: "CLIENT_UI_SELECT2_SOURCE",
						boEntityName: boDefName,
						boItemName: boItemDefName,
						config: awsui.encode(config),
						bindValue: bindValue
					},
					success: function (r) {
						config.dataSource = r;
						displayValue = findText();
					}
				});
			}
		} else {
			displayValue = displayValue || value || "";
		}
		if (displayValue == "" && config.placeholder) {
			return "<div style='color:#A9A9A9;'>" + config.placeholder + "</div>";
		}
		return "<span id='" + boItemDefName + "' name='" + boItemDefName + "' separator ='" + separator + "'>" + displayValue + "</span>";
	},
	Select: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var editorValue = record[dataIndx];
		var rowIndx = ui.rowIndx;
		var colIndx = ui.colIndx;
		var dataType = uiSetting.dataType;
		var data;
		if (dataType == "sampleText") {
			data = uiSetting.dataSource;
		} else {
			data = $("tr[pq-row-indx=" + rowIndx + "] td[pq-col-indx=" + colIndx + "]").data("dataSource");
		}
		var isAdvance = uiSetting.isAdvance;
		var separator = isAdvance ? uiSetting.separator : ",";
		var valueArray = value.split(separator);
		//遍历data中的value-label对获取显示值；
		var getLabel = function () {
			var isMultiple = uiSetting.multiple;
			var values = value.split(separator);
			value = "";
			if (data) {
				if (!(data instanceof Array)) {
					var arr = [];
					for (var o in data) {
						var tempObj = {};
						tempObj.value = o;
						tempObj.label = data[o];
						arr.push(tempObj);
					}
					data = arr;
				}
				for (var i = 0; i < data.length; i++) {
					if ($.inArray(data[i].value, values) > -1) {
						value += data[i].label + separator;
					}
				}
				if (value.length > 0) {
					value = value.substring(0, value.length - 1);
				} else {
					value = values.toString();
				}
				record[boItemDefName + "_DISPLAYVALUE"] = value;
			} else {
				// 1.初始渲染值 2.其他字典回填
				value = record[boItemDefName + "_DISPLAYVALUE"] || values.toString() || "";
			}
		};
		//render时如果是级联下拉列表处理显示值，列表数据源data第一次需ajax请求获取
		if (uiSetting.cascade && uiSetting.cascade != "") {
			var cascadeValue = {};
			for (var key in uiSetting.cascade) {
				var fieldName = uiSetting.cascade[key].toUpperCase();
				var tempValue = record[fieldName];
				if (!(tempValue instanceof Array)) {
					tempValue = tempValue.split(",");
				}
				cascadeValue[uiSetting.cascade[key]] = tempValue;
			}
			if (!tempCascadeDataSource[ui.colIndx]) {
				tempCascadeDataSource[ui.colIndx] = {};
			}
			if (!tempCascadeDataSource[ui.colIndx][boItemDefName]) {
				tempCascadeDataSource[ui.colIndx][boItemDefName] = [];
			}
			if (tempCascadeDataSource[ui.colIndx][boItemDefName].length == 0) {
				awsui.ajax.request({
					url: './jd',
					type: 'POST',
					async: false,
					data: {
						sid: $("#sid").val(),
						cmd: 'CLIENT_UI_COMBOBOX_SOURCE',
						bindValue: '',
						boEntityName: boDefName,
						boItemName: boItemDefName,
						config: awsui.encode(uiSetting),
						query: '',
						cascadeValue: JSON.stringify(cascadeValue)
					},
					success: function (r) {
						data = r;
						getLabel();
					}
				});
			} else {
				data = tempCascadeDataSource[ui.colIndx][boItemDefName] ? tempCascadeDataSource[ui.colIndx][boItemDefName] : [];
				getLabel();
			}
		} else {
			getLabel();
		}
		return "<span id='" + boItemDefName + "' name='" + boItemDefName + "' separator ='" + separator + "'>" + value + "</span>";
	},
	Currency: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var width = ui.column.width - 32;
		var record = ui.rowData, dataIndx = ui.dataIndx, value = record[dataIndx];
		var classStyle = "";
		var style = "";
		if (uiSetting.currencySymbol == "￥") {
			classStyle = "RMB";
		} else if (uiSetting.currencySymbol == "$") {
			classStyle = "dollar";
		} else if (uiSetting.currencySymbol == "HK") {
			classStyle = "hk_RMB";
		} else if (uiSetting.currencySymbol == "EUR") {
			classStyle = "EUR";
		} else if (uiSetting.currencySymbol == "other") {
			style = "padding-left: 16px !important;background: transparent url(" + uiSetting.symbol + ") no-repeat left center !important;";
		}
		if (value) {
			var num = "", cents = "";
			var val = new String(value);
			if (val.indexOf(".") > 0) {
				num = val.substring(0, val.indexOf("."));
				cents = val.substring(val.indexOf("."));
			} else {
				num = value;
			}
			for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
				num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
			}
			value = num + cents;
			value = value.replace("-,", "-");
			if (value.indexOf(",") == -1) {
				value = UIUtil.formatCurrency(value, uiSetting);
			}
		} else {
			value = "";
		}
		value = "<span style='width:" + width + "px;text-align: right;" + style + "' id='Currency_" + boItemDefName + "' class='aws-grid-editor-default " + classStyle + "'>" + value + "</span>";
		return value;
	},
	Number: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		//var value = record[dataIndx]+"<span id='"+boItemDefName+"' name='"+boItemDefName+"'></span>";
		var value = record[dataIndx];
		return value;
	},
	RadioGroups: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var data = uiSetting.data;
		for (var i = 0; i < data.length; i++) {
			if (data[i].value == value) {
				value = data[i].label;
				break;
			}
		}
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		return value;
	},
	CheckboxGroups: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var editorValue = record[dataIndx];
		var data = uiSetting.data;
		var separated = uiSetting.separator || ",";
		var cellDataArray = editorValue;
		if (typeof(editorValue) == "string") {
			cellDataArray = editorValue.split(separated);
		}
		if (data.length <= 3) { // 数据源小于３个，直接横向显示
			var html = "";
			for (var i = 0; i < data.length; i++) {//
				var json = data[i];
				var isChecked = "";
				if (editorValue && $.inArray(json.value, cellDataArray) > -1) {
					isChecked = "checked";
				}
				html += "&nbsp;<input id='" + boItemDefName + "' class='awsui-checkbox' separator='" + separated + "' " + isChecked + " value='" + json.value + "' type='checkbox'>&nbsp;";
				html += "<label class='awsui-checkbox-label' onclick='{$(this).prev().click();return false;  }' for='" + boItemDefName + "'>" + json.label + "</label>&nbsp;&nbsp;";
			}
			return html;
		} else {
			var rowIndx = ui.rowIndxPage, colIndx = ui.colIndx
			var value = record[dataIndx], displayValue = record[boItemDefName + "_DISPLAYVALUE"]; // 初始显示值
			if (record[dataIndx + "_FINDTEXT"] == true && value) { // 如果是被动回填值，那么查询数据源，返回显示值
				record[dataIndx + "_FINDTEXT"] = false;
				var findText = function () {
					displayValue = "";
					var dataSource = uiSetting.dataSource;
					var s = uiSetting.separator || ",";
					var arr = value.split(s);
					for (var i in arr) {
						var v = arr[i];
						for (var j in dataSource) {
							var item = dataSource[j];
							if (item.id == v) {
								displayValue += item.text + s;
								break;
							}
						}
					}
					if (displayValue.length > 0) {
						displayValue = displayValue.substring(0, displayValue.length - 1);
					}
					return displayValue;
				};
				if (Object.prototype.toString.call(config.data) == '[object Array]') {
					uiSetting.dataSource = uiSetting.data;
					displayValue = findText();
				} else {
					var bindValue = "";
					if (uiSetting.cascade) {
						bindValue = {};
						var cascade = uiSetting.cascade;
						for (var k in uiSetting.cascade) { // 把要级联的数据分别转数组
							var id = cascade[k];
							var separator = $("#" + id).data("separator") || ",";
							var v = data[id].split(separator);
							bindValue[id] = v;
						}
						bindValue = JSON.stringify(bindValue)
					}
					awsui.ajax.request({
						type: "POST",
						url: "./jd",
						async: false,
						dataType: "json",
						data: {
							sid: $("#sid").val(),
							cmd: "CLIENT_UI_SELECT2_SOURCE",
							boEntityName: boDefName,
							boItemName: boItemDefName,
							config: awsui.encode(uiSetting),
							bindValue: bindValue
						},
						success: function (r) {
							uiSetting.dataSource = r;
							displayValue = findText();
						}
					});
				}
			} else {
				if (!displayValue) {
					var value = UIUtil.getGridComboxValue(cellDataArray, data, true, separated);
					if (value == "" && editorValue != "") {
						value = editorValue;
					}
					displayValue = UIUtil.showDisplayValue(record, boItemDefName, value);
				}
				displayValue = displayValue || value || "";
			}
			var separated = uiSetting.separator || ",";
			return "<span id='" + boItemDefName + "' name='" + boItemDefName + "' separator ='" + separated + "'>" + displayValue + "</span>";
		}
	},
	Date: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		return value;
	},
	DateTime: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
//		if(value == ""){
//			return value;
//		}
//		var fmt = uiSetting.dateFmt?uiSetting.dateFmt:"yyyy-MM-dd HH:mm:ss";
//		var values = value.split(":"); // 格式化
//		if(values.length == 1){
//			if (fmt.indexOf("mm") > 0){
//				value += ":00";
//			}
//			if (fmt.indexOf("ss") > 0){
//				value += ":00";
//			}
//		} else if(values.length == 2){
//			if(fmt.indexOf("ss") > 0){
//				value += ":00";
//			}else if(fmt.indexOf("mm") < 0){
//				value = values[0];
//			}
//		} else if(values.length == 3){
//			if (fmt.indexOf("HH") > 0 && fmt.indexOf("mm") < 0){
//				value = values[0];
//			} else if (fmt.indexOf("ss") < 0){
//				value = values[0] + values[1];
//			}
//		}
		return value;
	},
	Time: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
//		if(value == ""){
//			return value;
//		}
//		var fmt = uiSetting.dateFmt?uiSetting.dateFmt:"HH:mm:ss";
//		var values = value.split(":"); // 格式化
//		if(values.length == 1){
//			if (fmt.indexOf("mm") > 0){
//				value += ":00";
//			}
//			if (fmt.indexOf("ss") > 0){
//				value += ":00";
//			}
//		} else if(values.length == 2){
//			if(fmt.indexOf("ss") > 0){
//				value += ":00";
//			}else if(fmt == "HH"){
//				value = value.substring(0,2);
//			}
//		} else if(values.length == 3){
//			if (fmt == "HH"){
//				value = value.substring(0,2);
//			} else if (fmt == "HH:mm"){
//				value = value.substring(0,5);
//			}
//		}
		if (value == "" && uiSetting.placeholder) {
			return "<div style='color:#A9A9A9;'>" + uiSetting.placeholder + "</div>";
		}
		return value;
	},
	Slider: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var data = uiSetting.data;
		for (var i = 0; i < data.length; i++) {
			if (data[i].value == value) {
				value = data[i].label;
				break;
			}
		}
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		return value;
	},
	FieldTable: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var FORM_EDITGRID_DATA_ATTR_COLUMN = record.FORM_EDITGRID_DATA_ATTR_COLUMN;
		if (typeof (FORM_EDITGRID_DATA_ATTR_COLUMN) == "string") {
			FORM_EDITGRID_DATA_ATTR_COLUMN = awsui.decode(FORM_EDITGRID_DATA_ATTR_COLUMN);
		}
		if (FORM_EDITGRID_DATA_ATTR_COLUMN.isCreate == true) {
			return "";
		}
		var formItemDefId = uiSetting.formItemDefId;
		var boId = record.ID;
		var openMode = uiSetting.openMode;
		var dlgWidth = '';
		var dlgHeight = '';
		if (openMode == "dialog") {
			dlgWidth = uiSetting.dlgWidth;
			dlgHeight = uiSetting.dlgHeight;
		} else {
			dlgWidth = uiSetting.sideWidth;
			dlgHeight = true;
		}
		var fieldTableBindId = boId;
		var link = "";
		var isDetail = $("#isDetail").val();
		var eventEdit = "编辑";
		var eventList = "明细";
		if (value.indexOf("|") > -1) {
			var array = value.split("|");
			eventEdit = array[0];
			eventList = array[1];
		}
		if (!FORM_EDITGRID_DATA_ATTR_COLUMN.readonly && isDetail != 'true' && eventEdit.length > 0) {
			link += "<a href='#' onclick=\"return AWSCommonGrid.openRowData('" + formItemDefId + "', '" + boId + "', '" + dlgWidth + "', '" + dlgHeight + "', '" + openMode + "','" + fieldTableBindId + "',false,'" + boItemDefName + "');\">" + 编辑 + "</a>&nbsp;";
		}
		if (eventList.length > 0) {
			link += "<a href='#' onclick=\"return AWSCommonGrid.openRowData('" + formItemDefId + "', '" + boId + "', '" + dlgWidth + "', '" + dlgHeight + "', '" + openMode + "','" + fieldTableBindId + "', true, '" + boItemDefName + "');\">" + 明细 + "</a>";
		}
		return link;
	},
	Button: function (ui, boDefName, boItemDefName, uiId, readonly, uiSetting, tooltip) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var click = "";
		if (!uiSetting.JavaScript) {
			click = "onclick=\"UIUtil.winOpen('" + uiSetting.buttonValue + "','" + boDefName + "','" + boItemDefName + "'," + ui.rowIndxPage + ");return false;\"";
		} else {
			click = "onclick=\'" + uiSetting.buttonValue + "\';";
			var click = "";
			if (!uiSetting.JavaScript) {
				click = "onclick=\"UIUtil.winOpen('" + uiSetting.buttonValue + "')\";return false;";
			} else {
				click = "onclick=\'" + uiSetting.buttonValue + "\';";
			}
		}
		if (!readonly || uiSetting.readonlyEfficient) {
			return "<a><span class='button blue' " + click + " title='" + tooltip + "'>" + uiSetting.buttonName + "</span></a>";
		} else {
			return "";
		}
	},
	Rating: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var data = uiSetting.data;
		for (var i = 0; i < data.length; i++) {
			if (data[i].value == value) {
				value = data[i].label;
				break;
			}
		}
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		return value;
	},
	GridDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		return "<span id='" + boItemDefName + "' name='" + boItemDefName + "' separator ='" + uiSetting.separator + "'>" + value + "</span>";
	},
	FlatDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		return value;
	},
	TreeDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		return value;
	},
	Address: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var separator = uiSetting.addressSetting ? uiSetting.addressSetting.delimiter : ",";
		value = UIUtil.showDisplayValue(record, boItemDefName, value);
		return "<span id='" + boItemDefName + "' name='" + boItemDefName + "' separator ='" + separator + "'>" + value + "</span>";
	},
	Team: function (ui, boDefName, boItemDefName, uiId, uiSetting) {  //teame
		var showvalue;
		var record = ui.rowData;
		var dataIndx = ui.dataIndx;
		var value = record[dataIndx];
		var separator = uiSetting.teamSetting.selimiter ? uiSetting.teamSetting.selimiter : ",";
		awsui.ajax.request({
			type: "POST",
			url: "./jd",
			async: false,
			data: {
				sid: $("#sid").val(),
				cmd: 'CLIENT_UI_TEAM_GET_TEAMNAMEBYID',
				teamid: value,
				selimiter: separator
			},
			ok: function (r) {
				showvalue = r.data.showvalue;
			},
			err: function (r) {
				alert('error');
			}
		});
		return showvalue;
	},
	XCode: function (ui, boDefName, boItemDefName, uiId, readonly, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx, rowIndx = ui.rowIndxPage;
		var value = record[dataIndx];
		var codeType = uiSetting.codeType;
		var png = "AWSUI.BarXCode.png";
		if (codeType == "qrCode") {
			png = "AWSUI.XCode.png";
		}
		AWSGridGetEditCellData.XCode(ui, boDefName, boItemDefName, uiId, uiSetting);
		var showV = uiSetting.gridShowType == "value" ? value : "<img src='../apps/_bpm.platform/img/ui/" + png + "' style='cursor:pointer;width:16px'>";
		return "<div id='" + boItemDefName + rowIndx + "' style='cursor:pointer;text-align: center;' onclick=\"UIUtil.openXcode('" + value + "','" + rowIndx + "','" + uiSetting.boDefId + "','" + boItemDefName + "');return false;\">" + showV + "</div>";
	},
	BOAC: function (ui, boDefName, boItemDefName, uiId, readonly, uiSetting) {
		var record = ui.rowData;
		if (readonly) {
			return "<img src='../apps/_bpm.platform/img/ui/AWSUI.BOAC.READONLY.png' border=0 >";
		}
		return "<div style='cursor:pointer' id=BOAC_" + boItemDefName + " name = 'PERMISSION'  title='' onclick=\"UIUtil.openBOAC('" + ui.rowIndxPage + "','" + record.ID + "');\" ><img src='../apps/_bpm.platform/img/ui/AWSUI.BOAC.png' border=0 ></div>";
	},
	LogoPhoto: function (ui, boDefName, boItemDefName, uiId, boItemId, readonly, uiSetting) {
		var url = uiSetting.url;
		if (readonly) {
			return "<img style='width:16px;height:16px;' src='" + uiSetting.src + "'>";
		}
		var className = boDefName + "_" + boItemDefName + "_" + url;
		AWSGridGetEditCellData.LogoPhoto(ui, boDefName, boItemDefName, uiId, uiSetting);
		return "<img style='width:16px;height:16px;cursor:pointer;' class='" + className + "'onclick=\"openLogoPhotoDialog('" + boItemDefName + "','" + $("#appId").val() + "','" + url + "','" + boItemId + "','" + boDefName + "','" + uiSetting.pic_width + "','" + uiSetting.pic_height + "','" + uiSetting.pic_title + "'," + ui.rowIndx + ")\" src='" + uiSetting.src + "'>";
	},
	SwitchButton: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var record = ui.rowData;
		var dataIndx = ui.dataIndx, rowIndx = ui.rowIndxPage;
		var value = record[dataIndx];
		if (value == "") {
			return "";
		}
		if (value == "1" || value == "true") {
			if (!uiSetting.onText) {
				uiSetting.onText = "开";
			}
			return uiSetting.onText;
		} else {
			if (!uiSetting.offText) {
				uiSetting.offText = "关";
			}
			return uiSetting.offText;
		}
	}
};
var AWSGridGetEditCellData = {
	Text: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var $cellVal = $cell.children().val();
		var length = uiSetting.length;
		var decimal = 0;
		if (uiId == 'AWSUI.Number') {
			$cellVal = getNumberEditCellData($cellVal, length);
			return $cellVal;
		} else {
			return $cellVal;
		}
	},
	Textarea: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		return $cell.children().val();
	},
	Currency: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		// var decimal = $cell.children().attr('decimal');
		// dataCell = Math.round(dataCell*Math.pow(10,decimal))/Math.pow(10,decimal);
		var $cell = ui.$cell;
		var value = $cell.children().val();
		if (uiSetting.length && uiSetting.length != '') {
			value = getNumberEditCellData(value, uiSetting.length);
		}
		return value;
	},
	CheckboxGroups: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var rowIndx = ui.rowIndx;
		var dataIndx = ui.dataIndx;
		var isAdvance = uiSetting.isAdvance;
		var separator = uiSetting.separator || ",";
		var select = $cell.find("select");
		var value = select.val();
		var valueData = select.select2("data");
		var displayValue = "";
		$.each(valueData, function (i, item) {
			displayValue += item.text + separator;
		});
		if (displayValue) {
			displayValue = displayValue.substring(0, displayValue.length - 1);
		}
		var grid = AWSGrid.getGrid(boDefName);
		var rowData = grid.awsGrid("getRowData", ui);
		rowData[boItemDefName + "_DISPLAYVALUE"] = displayValue;
		grid.awsGrid("updateRow", {
			rowData: rowData,
			track: false,
			rowCheckEditable: false,
			source: "edit",
			refresh: false
		});
		if (value && value != null) {
			return value.toString();
		} else {
			return '';
		}
	},
	Select2: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var rowIndx = ui.rowIndx;
		var dataIndx = ui.dataIndx;
		var isAdvance = uiSetting.isAdvance;
		var separator = uiSetting.separator || ",";
		var select = $cell.find("select");
		var value = "";
		var valueData = select.select2("data");
		var displayValue = "";
		$.each(valueData, function (i, item) {
			displayValue += item.text + separator;
			value += item.id + separator;
		});
		if (displayValue) {
			value = value.substring(0, value.length - 1);
			displayValue = displayValue.substring(0, displayValue.length - 1);
		}
		var grid = AWSGrid.getGrid(boDefName);
		var rowData = grid.awsGrid("getRowData", ui);
		rowData[boItemDefName + "_DISPLAYVALUE"] = displayValue;
		grid.awsGrid("updateRow", {
			rowData: rowData,
			track: false,
			rowCheckEditable: false,
			source: "edit",
			refresh: false
		});
		return value;
	},
	Select: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var isAdvance = uiSetting.isAdvance;
		var separator = ",";
		if (isAdvance && uiSetting.multiple) {
			separator = uiSetting.separator;
			var val = $cell.children().find("#Grid_" + boDefName + boItemDefName).val();
			return val;
		} else if (uiSetting.dataType == "sampleText") {
			if (isAdvance) {
				return $cell.find("input").val();
			} else {
				return $cell.find("select").val();
			}
		}
		return $cell.children().find("#Grid_" + boDefName + boItemDefName).val();
	},
	RadioGroups: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var rowIndx = ui.rowIndx;
		var dataIndx = ui.dataIndx;
		var isAdvance = uiSetting.isAdvance;
		var separator = uiSetting.separator || ",";
		var select = $cell.find("select");
		var value = select.val();
		var valueData = select.select2("data");
		var displayValue = "";
		$.each(valueData, function (i, item) {
			displayValue += item.text + separator;
		});
		if (displayValue) {
			displayValue = displayValue.substring(0, displayValue.length - 1);
		}
		var grid = AWSGrid.getGrid(boDefName);
		var rowData = grid.awsGrid("getRowData", ui);
		rowData[boItemDefName + "_DISPLAYVALUE"] = displayValue;
		grid.awsGrid("updateRow", {
			rowData: rowData,
			track: false,
			rowCheckEditable: false,
			source: "edit",
			refresh: false
		});
		return value;
	},
	Date: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
	},
	DateTime: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
	},
	Time: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
	},
	Slider: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var rowIndx = ui.rowIndx;
		var dataIndx = ui.dataIndx;
		var isAdvance = uiSetting.isAdvance;
		var select = $cell.find("select");
		var value = select.val();
		var valueData = select.select2("data");
		var displayValue = "0";
		if (valueData.length > 0) {
			displayValue = valueData[0].text;
		}
		var grid = AWSGrid.getGrid(boDefName);
		var rowData = grid.awsGrid("getRowData", ui);
		rowData[boItemDefName + "_DISPLAYVALUE"] = displayValue;
		grid.awsGrid("updateRow", {
			rowData: rowData,
			track: false,
			rowCheckEditable: false,
			source: "edit",
			refresh: false
		});
		return value;
	},
	Button: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
	},
	Rating: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var rowIndx = ui.rowIndx;
		var dataIndx = ui.dataIndx;
		var select = $cell.find("select");
		var value = select.val();
		var valueData = select.select2("data");
		var displayValue = "0";
		if (valueData.length > 0) {
			displayValue = valueData[0].text;
		}
		var grid = AWSGrid.getGrid(boDefName);
		var rowData = grid.awsGrid("getRowData", ui);
		rowData[boItemDefName + "_DISPLAYVALUE"] = displayValue;
		grid.awsGrid("updateRow", {
			rowData: rowData,
			track: false,
			rowCheckEditable: false,
			rowCheckEditable: false,
			source: "edit",
			refresh: false
		});
		return value;
	},
	GridDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		return $cell.children().find("input[type=text]").val();
	},
	FlatDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		return $cell.children("#Grid_" + boDefName + boItemDefName).val();
	},
	TreeDictionary: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		return $cell.children("#Grid_" + boDefName + boItemDefName).val();
	},
	Address: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		var grid = AWSGrid.getGrid(boDefName);
		var displayValue = [];
		var sep = $cell.find(".awsui-container").attr("delimiter");
		$cell.find(".awsui-container .awsui-item").each(function (i, item) {
			displayValue.push($(item).attr("name"));
		});
		var rowData = grid.awsGrid("getRowData", ui);
		rowData[boItemDefName + "_DISPLAYVALUE"] = displayValue.join(sep);
		grid.awsGrid("updateRow", {
			rowData: rowData,
			track: false,
			rowCheckEditable: false,
			source: "edit",
			refresh: false
		});
		return $cell.find("input[type=text]").val();
	},
	Team: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		return $cell.children("#Team_" + boDefName + boItemDefName).val();
	},
	BOAC: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
	},
	XCode: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var rowIndx = ui.rowIndx, data = ui.data;
		data[rowIndx][boItemDefName] = uiSetting.codeInfo;
		return '';
	},
	LogoPhoto: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var rowIndx = ui.rowIndx, data = ui.data;
		data[rowIndx][boItemDefName] = uiSetting.url;
		return '';
	},
	SwitchButton: function (ui, boDefName, boItemDefName, uiId, uiSetting) {
		var $cell = ui.$cell;
		return $cell.find("select").val();
	}
};
var UIUtil = {
	showDisplayValue: function (record, boItemDefName, value) {
		//处理显示规则
		var displayValue = record[boItemDefName + "_DISPLAYVALUE"];
		if (displayValue != undefined && displayValue != "") {
			return displayValue;
			//如果显示值存在，显示该值
		} else {
			return value;
		}
	},
	getGridComboxValue: function (realValue, data, isMultpart, separated) {
		var renderValue = "";
		if (!isMultpart) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].value == realValue) {
					renderValue = data[i].label;
					break;
				}
			}
		} else if (!(realValue instanceof Array)) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].value == realValue) {
					renderValue = data[i].label;
					break;
				}
			}
		} else {
			for (var i = 0; i < realValue.length; i++) {
				for (var j = 0; j < data.length; j++) {
					if (data[j].value == realValue[i]) {
						renderValue = renderValue + separated + data[j].label;
						break;
					}
				}
			}
			if (renderValue.startWith(separated)) {
				renderValue = renderValue.substring(separated.length, renderValue.length);
			}
		}
		return renderValue;
	},
	winOpen: function (url, boDefName, boItemName, rowIndx) {
		/**判断动态修改规则**/
		var rowData = [];
		var girdObj = AWSGrid.getGrid(boDefName).awsGrid('option');
		if (girdObj.dataModel.data) {
			var data = girdObj.dataModel.data;
			rowData = data[rowIndx];
		}
		var config = AWSGrid.getObject(boDefName).getRuleControl();
		if (config) {
			var modifyRule = config.modifyRule;
			if (window.dynamicRule) {
				var modify = dynamicRule.executeGridRule(modifyRule, boItemName, rowData, boDefName);
				if ("readonly" == modify) {
					return;
				}
			}
		}
		var srcURL = encodeURI(url);
		window.open(srcURL, "_newWin", 'left=50,top=50,width=860,height=430,location=no,menubar=no,toolbar=no,status=no,directories=no,scrollbars=no,resizable=no');
	},
	openXcode: function (value, rowIndx, boId, boItemName) {
		awsui.ajax.request({
			url: './jd',
			type: 'POST',
			dataType: 'json',
			alert: false,
			data: {
				sid: $("#sid").val(),
				cmd: 'CLIENT_BPM_FORM_PAGE_S_EDITGRID_GET_GRID_XCODE',
				boId: boId,
				value: value,
				boItemName: boItemName
			},
			success: function (r) {
				if (r.result == "ok") {
					var url = r.data.url;
					var html = "<div id='" + boItemName + "_" + rowIndx + "' style='text-align:center;'><div style='width:395px;height:312px;position: absolute;overflow:auto;'><img src='" + url + "' style='padding-top:50px;'></div></div>";
					if ($("#" + boItemName + "_" + rowIndx).length == 0) {
						$(html).appendTo(document.body);
					}
					$("#" + boItemName + "_" + rowIndx).dialog({
						width: 400,
						height: 400,
						title: boItemName,
						buttons: [{
							text: 关闭,
							handler: function () {
								$("#" + boItemName + "_" + rowIndx).dialog("close");
							}
						}]
					});
				}
				return false;
			}
		});
	},
	formatCurrency: function (val, config) {
		var moneyType = config.currencySymbol;
		if (config.currencySymbol == '$') {// 将数值型输入转换成货币格式
			val = val.replace('\$', '');
		} else {
			val = val.replace(moneyType, '');
		}
		var stmp = "";
		if (val == stmp)
			return;
		var ms2 = val;
		var ms3 = '';
		if (ms2.indexOf('-') == 0 && ms2.length > 1) {
			ms3 = '-';
		}
		var ms = val.replace(/[^\d\.]/g, "").replace(/(\.\d{2}).+$/, "$1").replace(/^0+([1-9])/, "$1").replace(/^0+$/, "0");
		var txt = ms.split(".");
		while (/\d{4}(,|$)/.test(txt[0]))
			txt[0] = txt[0].replace(/(\d)(\d{3}(,|$))/, "$1,$2");
		val = ms3 + txt[0] + (txt.length > 1 ? "." + txt[1] : "");
		return val;
	},
	openBOAC: function (rowIndx, boId) {
		var dlg = FrmDialog.open({
			title: 自定义权限,
			width: 700,
			height: 380,
			url: "./w",
			data: {
				sid: $("input[name=sid]").val(),
				cmd: "CLIENT_COMMON_AC_ACTION_OPEN",
				resourceId: boId,
				resourceType: "platform.process"
			},
			buttons: [{
				text: "添加",
				cls: "blue",
				handler: function () {
					dlg.win().saveAC();
				}
			}, {
				text: 关闭,
				handler: function () {
					dlg.close();
				}
			}]
		});
	},
	openFile: function (boDefId, boId, readonly, boItemName, uiSetting, rowIndx) {
		var dlg = FrmDialog.open({
			title: 附件上传,
			width: 700,
			height: 380,
			url: "./w",
			data: {
				sid: $("input[name=sid]").val(),
				cmd: "CLIENT_BPM_FORM_PAGE_S_EDITGRID_GET_GRID_FILE",
				boDefId: boDefId,
				boId: boId,
				rowIndx: rowIndx,
				boItemName: boItemName,
				processInstId: $("#processInstId").val(),
				taskInstId: $("#taskInstId").val(),
				uiSetting: awsui.encode(uiSetting),
				readonly: readonly
			}
		});
	},
	openHTMLEditor: function (boDefName, boId, readonly, boItemName, value, rowIndx) {
		/**判断动态修改规则**/
		var rowData = [];
		var girdObj = AWSGrid.getGrid(boDefName).awsGrid('option');
		if (girdObj.dataModel.data) {
			var data = girdObj.dataModel.data;
			rowData = data[rowIndx];
		}
		var config = AWSGrid.getObject(boDefName).getRuleControl();
		if (config) {
			var modifyRule = config.modifyRule;
			if (window.dynamicRule) {
				var modify = dynamicRule.executeGridRule(modifyRule, boItemName, rowData, boDefName);
				if ("readonly" == modify) {
					readonly = true;
				}
			}
		}
		/**判断动态修改规则end**/
		var buttons;
		if (!readonly) {
			buttons = [{
				text: 保存,
				cls: "blue",
				handler: function () {
					FrmDialog.win().saveHTMLCallBack();
					$.simpleAlert(保存成功, "ok", 2000);
					//	FrmDialog.win().saveTEXTAREACallBack();
				}
			}, {
				text: 关闭,
				handler: function () {
					FrmDialog.close();
				}
			}];
		}
		var dialogHeight = $(window).height() - 75;
		if (dialogHeight > 535) {
			dialogHeight = 535;
		}
		var dlg = FrmDialog.open({
			title: 详细信息,
			width: 800,
			height: dialogHeight,
			buttons: buttons,
			url: "./w",
			data: {
				sid: $("input[name=sid]").val(),
				cmd: "CLIENT_BPM_FORM_PAGE_S_EDITGRID_GET_GRID_HTML",
				boDefName: boDefName,
				boId: boId,
				rowIndx: rowIndx,
				boItemName: boItemName,
				readonly: readonly
			}
		});
	},
	escapeStr: function (str) {
		str = str == null ? "" : new String(str);
		return str.replace(/\</g, "&lt").replace(/\>/g, "&gt");
	}
};

function checkGridFnEventExist(boDefName, fnName) {
	if ($("#isMainForm").val() == "true") {
		if (typeof window[boDefName + fnName] == "function") {
			return true;
		}
	} else {
		if (typeof parent.window[boDefName + fnName] == "function") {
			window[boDefName + fnName] = parent.window[boDefName + fnName];
			return true;
		}
	}
	return false;
}

/**
 *设置Grid滚动条
 * @deprecated
 */
function setGridOverflow(boDefName) {
	//$("#" + boDefName).removeClass("aws-grid-new").addClass("aws-grid-new");
}

/**
 *恢复grid的 滚动条
 * @deprecated
 */
function reSetGridOverflow(boDefName) {
	//$("#" + boDefName).removeClass("aws-grid-new");
}

function gridNumberInputFilter($target) {
	$target.on("keyup", function () {
		var value = $(this).val();
		if (value != '-' && isNaN(value.replace(/,/g, ""))) {
			$(this).val("");
		}
	});
}

function getNumberEditCellData($cellVal, length) {
	$cellVal = $cellVal.replace(/,/g, '');
	if (length.indexOf(',') > -1) {
		decimal = parseInt(length.substring(length.indexOf(",") + 1));
		return Math.round($cellVal * Math.pow(10, decimal)) / Math.pow(10, decimal);
	}
	return $cellVal;
}