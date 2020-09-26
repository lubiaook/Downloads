jQuery(document).ready(function() {
});
function openFormModel(obj) {
	parent.parent.$("#bm_navigation").get(0).contentWindow.createViewTabs(obj);
}
function strGetParamTool(params , param,defaultVal){
	var rep = new RegExp(".*"+param+":(.*?),.*");
	if(rep.test(params)){
		var val = params.replace(rep,"$1");
		if(val == "true" ){
			return true;
		}
		if(val == "false"){
			return false;
		}
		return val;
	}else{
		return defaultVal == null ? false : defaultVal;
	}
}

function compatibleOlderVersions(){
	var p = $("#operatingAuthorization").val();
	var jsonArray = new Array();
	if(!/^\[.*\]$/.test(p)){
		var ps = p.split(";");
		for(var i=0,si = ps.length; i<si ;i++){
			var psi = ps[i];
			if(psi == "") continue;
			var psis = psi.split("~");
			for(var m=0,sm = psis.length; m<sm ;m++){
				var json = {};
				var psism = psis[m];
				if(psism == "") continue;
				if(m==0){
					var formDefId = strGetParamTool(psism , "formDefId");
					json.mainFormID = formDefId;
					var jsonparam = {};
					jsonparam.isFormDataAdd = strGetParamTool(psism , "isFormDataAdd");
					jsonparam.isFormDataModify = strGetParamTool(psism , "isFormDataModify");
					jsonparam.isFormDataRemove = strGetParamTool(psism , "isFormDataRemove");
					jsonparam.isFormDataSnapshot = strGetParamTool(psism , "isFormDataSnapshot");
					jsonparam.isSaveRequired = strGetParamTool(psism , "isSaveRequired");
					jsonparam.isFormDataSnapshotList = strGetParamTool(psism , "isFormDataSnapshotList");
					json[formDefId] = jsonparam;
				}else{
					var formItemDefId = strGetParamTool(psism , "formItemDefId");
					var jsonparam = {};
					jsonparam.isFormDataAdd = strGetParamTool(psism , "isFormDataAdd");
					jsonparam.isFormDataRemove = strGetParamTool(psism , "isFormDataRemove");
					json[formItemDefId] = jsonparam;
				}
				jsonArray.push(json);
			}
		}
		$("#operatingAuthorization").val(JSON.stringify(jsonArray));
	}
}

//opa新格式
//[{主表ID:{属性对象(附加isMain:true)},子表ID:{属性对象},"mainFormID":"主表ID"}]
function setFormOPA(formDefId, opa) {
	compatibleOlderVersions();
	var operatingAuthorization = $("#operatingAuthorization").val();
	if (operatingAuthorization == "") {
	    return;
	}
	var jsonArray = JSON.parse(operatingAuthorization);
	for (var i = 0, si = jsonArray.length; i < si; i++) {
	    var json = jsonArray[i];
	    if (json[formDefId]) {
	        jsonArray.splice(i, 1);
	        break;
	    }
	}
	if (opa) {
	    var json = {};
	    for (var i = 0; i < opa.length; i++) {
	        var o = opa[i];
	        //兼容旧数据
	        for (var j = 0, si = jsonArray.length; j < si; j++) {
	            var t = jsonArray[j];
	            if (i == 0) {
	                if (t[o["formDefId"]]) {
	                    jsonArray.splice(j, 1);
	                    break;
	                }
	            } else {
	                if (t[o["formItemDefId"]]) {
	                    jsonArray.splice(j, 1);
	                    break;
	                }
	            }
	        }
	        //兼容旧数据
	        if (i == 0) {
	            var formDefId = o["formDefId"];
	            json.mainFormID = formDefId;
	            var jsonparam = {};
	            jsonparam.isFormDataAdd = o["isFormDataAdd"];
	            jsonparam.isFormDataModify = o["isFormDataModify"];
	            jsonparam.isFormDataRemove = o["isFormDataRemove"];
	            jsonparam.isFormDataSnapshot = o["isFormDataSnapshot"];
	            jsonparam.isSaveRequired = o["isSaveRequired"];
	            jsonparam.isFormDataSnapshotList = o["isFormDataSnapshotList"];
	            jsonparam.isEditSecurity = o["isEditSecurity"];
	            json[formDefId] = jsonparam;
	        } else {
	            var formItemDefId = o["formItemDefId"];
	            var jsonparam = {};
	            jsonparam.isFormDataAdd = o["isFormDataAdd"];
	            jsonparam.isFormDataRemove = o["isFormDataRemove"];
	            jsonparam.isFIRefBtn = o["isFIRefBtn"];
	            jsonparam.isFISaveMainWhenAdded = o["isFISaveMainWhenAdded"];
	            json[formItemDefId] = jsonparam;
	            //增加子表插入前是否检测主表保存的选项
	            //isMainFormSaveRequire
	        }
	    }
	    jsonArray.push(json);
	}
	//兼容旧数据
	if (jsonArray.length > 1) {
	    for (var i = 0, size = jsonArray.length; i < size; i++) {
	        var jo = jsonArray[i];
	        if (jo.mainFormID == null) {
	            jo = {
	                "back": jo
	            }
	        }
	    }
	}
	//兼容旧数据
	$("#operatingAuthorization").val(JSON.stringify(jsonArray));
	return;

	//以下是旧代码实现，已经作废
	// var formOpa = "formDefId:"+formDefId;
	// var formOpaIndex = operatingAuthorization.indexOf(formOpa);
	// if (formOpaIndex > -1) {
		// var tmpFormOpa = operatingAuthorization.substring(formOpaIndex);
		// var finalFormOpa = tmpFormOpa.substring(0, tmpFormOpa.indexOf(";")+1);
		// operatingAuthorization = operatingAuthorization.replace(finalFormOpa, "");
	// }
	// var newOpa = "";
	// if (opa) {
		// for(var i=0;i<opa.length;i++){
			// var o = opa[i];
			// if(i == 0){
				// newOpa += "formDefId:" + o["formDefId"] + ",";
				// newOpa += "isFormDataAdd:" + o["isFormDataAdd"] + ",";
				// newOpa += "isFormDataModify:" + o["isFormDataModify"] + ",";
				// newOpa += "isFormDataRemove:" + o["isFormDataRemove"] + ",";
				// newOpa += "isFormDataSnapshot:" + o["isFormDataSnapshot"] + ",";
				// newOpa += "isSaveRequired:" + o["isSaveRequired"] + ",";
				// newOpa += "isFormDataSnapshotList:" + o["isFormDataSnapshotList"];
			// }else{
				// newOpa += "formItemDefId:" + o["formItemDefId"] + ",";
				// newOpa += "isFormDataAdd:" + o["isFormDataAdd"] + ",";
				// newOpa += "isFormDataRemove:" + o["isFormDataRemove"];
				// //增加子表插入前是否检测主表保存的选项
				// //isMainFormSaveRequire
			// }
			// newOpa += i != opa.length -1 ? "~" : "";
		// }
		// newOpa += ";";
	// }
	// operatingAuthorization += newOpa;
	// $("#operatingAuthorization").val(operatingAuthorization.replace(/^;/,""));
}

function openForms() {
	var sessionId = jQuery('#sid').val();
	var processDefId = jQuery('#processDefId').attr('value');
	var elementId = jQuery('#elementId').attr('value');
	var appId = parent.jQuery('#appId').attr('value');
	var url = encodeURI('./w?sid=' + sessionId + '&cmd=CONSOLE_M_PROCESS_USERTASK_ACTIVEAPP_SELECTFORM_OPEN&processDefId=' + processDefId + '&elementId=' + elementId + '&appId=' + appId + '&newTime=' + new Date().toLocaleString());
	openDlg('selectFormIframe', 'selectFormDialog', 530, 270, '表单库', url, []);
}

function openDlg(iframeId, dialogId, width, height, title, url, btn, isShow) {
	if (document.getElementById(dialogId).style.display != 'none') {
		return false;
	}
	jQuery('#' + iframeId).attr('src', url);
	jQuery('#' + dialogId).attr('title', title);
	jQuery('#' + dialogId+"_content").css({
		height : $(window).height() - 140
	});
	var option = {width : width};
	if (btn) {
		option["buttons"] = btn;
	}
	if(isShow==undefined){
		isShow=true;
	}
	
	option["closable"] = isShow;
	option["onClose"] = function() {
		jQuery('#' + iframeId).attr('src', "../commons/wait.htm");
	};
	jQuery("#" + dialogId).dialog(option);
	return false;
}

function selectFrom(processDefId, elementId) {
	var node = document.getElementById("selectFormIframe").contentWindow.tree.getSelectedNode();
	if (!node || !node.formId) {
		$.simpleAlert("请选择表单", "info", 2000);
		return false;
	}
	if($("#operatingAuthorization").val().indexOf(node.formId) > -1){
		$.simpleAlert("此表单已绑定，请重新选择", "info", 2000);
		return false;
	}
	var formSets = jQuery("#formSets").val();
	var params = {};
	//绑定表单
	params = {
		sid : document.getElementById('sid').value,
		cmd : 'CONSOLE_M_PROCESS_USERTASK_ACTIVEAPP_BINDFORM_SAVE',
		processDefId : processDefId,
		elementId : elementId,
		formIdList : formSets + "|" + node.formId
	};
	jQuery.ajax({
		type : "POST",
		url : './w',
		data : params,
		success : function(data) {
			$.simpleAlert("绑定成功", "ok", 1000);
			data = JSON.parse(data);
			jQuery("#formSets").val(data.formSets);
			jQuery("#formListHtml").html(data.html);
			jQuery("#source").html(data.ImpExpSelectOption);
			opas = data.opaDefault;//从服务器端获取第一次添加表单的默认权限
			setFormOPA(node.formId, opas);
			jQuery("#selectFormDialog").dialog("close");
		}
	});
}

function removeBindReport(processDefId, elementId, id, isMain) {
	var options = {
		title : "提示",
		content : "确认删除绑定的这个表单吗？",
		model : false,
		onConfirm : function() {
			var frmMain = document.getElementById('frmMain');
			frmMain.cmd.value = 'CONSOLE_M_PROCESS_USERTASK_ACTIVEAPP_FORM_SUB_REMOVE';
			frmMain.target = "_self";
			var params = {
				sid : jQuery('#sid').val(),
				cmd : 'CONSOLE_M_PROCESS_USERTASK_ACTIVEAPP_FORM_SUB_REMOVE',
				processDefId : processDefId,
				elementId : elementId,
				id : id,
				isMain : isMain,
				formSets : jQuery("#formSets").val()
			};
			jQuery.ajax({
				type : "POST",
				url : './w',
				data : params,
				success : function(data) {
					$.simpleAlert("删除成功", "ok", 1000);
					data = JSON.parse(data);
					jQuery("#formSets").val(data.formSets);
					jQuery("#formListHtml").html(data.html);
					jQuery("#source").html(data.ImpExpSelectOption);
					setFormOPA(id);
					
					if ($.trim(jQuery("#formListHtml").html()) == "") {
						jQuery("#formListHtml").html("<tr><td align='center'>请点击右上方“表单库”按钮绑定一个表单</td></tr>");
					}
				}
			});
		}
	};
	$.confirm(options);
}

function execOrder(processDefId, elementId, id, cmd) {
	var params = {
		sid : jQuery('#sid').val(),
		cmd : cmd,
		processDefId : processDefId,
		elementId : elementId,
		idList : id,
		formSets : jQuery("#formSets").val()
	};
	jQuery.ajax({
		type : "POST",
		url : './w',
		data : params,
		success : function(data) {
			data = JSON.parse(data);
			jQuery("#formSets").val(data.formSets);
			jQuery("#formListHtml").html(data.html);
		}
	});
}

/**
 * 切换内部表单和URL表单
 * @param {Object} obj 0:内部表单，1:URL表单
 */
function changeFormType(obj) {
	if (obj.value == 0) {
		$("#FormContent").show();
		$("#URLContent").hide();

		$("#FormBtn").show();
		$("#URLBtn").hide();

	} else {
		$("#FormContent").hide();
		$("#URLContent").show();

		$("#FormBtn").hide();
		$("#URLBtn").show();
	}
}

function setFieldPermission(formId) {
	var isDw = $("#li1:hidden").length;
	var width = 800;
	width = isDw != 1 ? width : (($(window).width() - 70) > width ? width : ($(window).width() - 70));
	openDlg('rIframe', 'rDialog', width, $(window).height() - 140, '字段权限设置', "", [{
		text : '确定',
		cls : "blue",
		handler : function() {
			var opa = window.frames["rIframe"].getFormOPA();
			setFormOPA(opa[0].formDefId, opa);
			if (opa[0].isFormDataModify == false) {
				formReadonly = true;
				$("#FormLockFlag-" + opa[0].formDefId).html("<img src='../commons/img/lock_16.png' style='vertical-align: initial;margin-left: 5px;' title='表单不可修改' />");
			} else {
				$("#FormLockFlag-" + opa[0].formDefId).html("");
			}
			window.frames["rIframe"].saveFieldSecurityAll();
			parent.enableAll();
		}
	}, {
		text : '取消',
		handler : function() {
			jQuery("#rDialog").dialog("close");
			parent.enableAll();
		}
	}],false);
	var frm = document.getElementsByName('frmMain3')[0];
	frm.cmd.value = 'CONSOLE_M_PROCESS_USERTASK_ACTIVEAPP_ACCESSLIST_PAGE';
	frm.formId.value = formId;
	frm.formSets.value = jQuery("#formSets").val();
	frm.opa.value = jQuery("#operatingAuthorization").val();
	frm.target = "rIframe";
	frm.isDw.value = isDw;
	setTimeout(function () {
	frm.submit();
	}, 10);
	parent.disableAll();
	return false;
}

function saveModifyWithAjax(params, isBind) {
	jQuery.ajax({
		type : "POST",
		url : './w',
		data : params,
		success : function(data) {
			if (isBind) {
				$.simpleAlert("绑定成功", "info", 2000);
				data = JSON.parse(data);
				jQuery("#formSets").val(data.formSets);
				jQuery("#formListHtml").html(data.html);
				jQuery("#source").html(data.ImpExpSelectOption);
			}
		}
	});
}

function impAndExpFormData(formId,formTitle) {
	$('#source optgroup').hide();
	$('#impExpListTable tbody tr').hide();
	$('#source optgroup[label="'+formTitle+'"]').show();
	$('#impExpListTable tbody tr[formname="'+formTitle+'"]').show();
	var isDw = $("#li1:hidden").length;
	var width = 800;
	width = isDw != 1 ? width : (($(window).width() - 70) > width ? width : ($(window).width() - 70));
	$('#source').val('');
	$('#action').val('');
	$('#dataType').val('Excel');
	 $("#dataType").prop("disabled", false);
	$("#eDialog").dialog({
		    height :$(window).height() - 52,
		    width:width,
			buttons:[
				{text:'确定',cls:"blue",handler:function(){
					$('tr.newAdd').removeClass('newAdd');
					$("#eDialog").dialog("close");
				}},
				{text:'取消',handler:function(){
					$('#impExpListTable tr[class="newAdd"]').each(function(){
						this.remove();
					});
					$("#eDialog").dialog("close");
				}}
				],
			onClose : function(){
				$('#impExpListTable tr[class="newAdd"]').each(function(){
					this.remove();
				});
			}
		});
	
}

function bindForm(mark) {
	var node = document.getElementById(iframeId).contentWindow.tree.getSelectedNode();
	if (!node || !node.formId) {
		$.simpleAlert("请选择表单", "info", 2000);
		return false;
	}
	var formSets = jQuery("#formSets").val();
	var params;
	//绑定表单
	params = {
		sid : document.getElementById('sid').value,
		cmd : 'CONSOLE_M_PROCESS_USERTASK_ACTIVEAPP_BINDFORM_SAVE',
		formIdList : formSets + "|" + node.formId
	};
	saveModifyWithAjax(params, true);
}

function openAC(resourceId, resourceType) {
	var isDw = $("#li1:hidden").length;
	var width = 740;
	width = isDw != 1 ? width : (($(parent.window).width() - 70) > width ? width : ($(parent.window).width() - 70));
	var frmdlg = isDw == 1 && $(window).width() < 685 ? parent.FrmDialog : FrmDialog;
	frmdlg.open({
		id : "acVisitForm",
		title : "访问权限",
		width : width,
		closable:false,
		height : $(window).height() - 50,
		url : "./w",
		data : {
			sid : $("input[name=sid]").val(),
			cmd : "CLIENT_COMMON_AC_ACTION_OPEN",
			resourceId : resourceId,
			resourceType : resourceType
		},
		buttons : [{
			text : '添加',
			cls : "blue",
			handler : function() {
				frmdlg.win().saveAC();
				//parent.enableAll();
			}
		}, {
			text : '关闭',
			handler : function() {
				frmdlg.close();
				//parent.enableAll();
			}
		}]
	});
	
	//parent.disableAll();
}

function openPreviewForm(url) {
	var width = window.screen.availWidth;
	var height = window.screen.availHeight;
	w = width * 0.8;
	h = height * 0.86;
	l = (width - w) / 2;
	t = (height - h) / 2;
	window.open(url,'_blank','width='+w+',height='+h+',top='+t+',left='+l+',location=no,menubar=no,toolbar=no,status=no,directories=no,scrollbars=yes,resizable=yes');
}