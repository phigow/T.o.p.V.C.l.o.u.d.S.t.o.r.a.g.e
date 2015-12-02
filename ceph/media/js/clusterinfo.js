//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){

	var _cephUrl = "http://192.168.50.90:8000/";
	var _cherryUrl = "http://192.168.50.90:8080/";

	loadBasicInfo=function(){
		$.ajax(
		{
			type: 		"GET",
			url: 		_cephUrl + "storstatus/?cmd=ratestatus",
			dataType: 	"json",
			success: 	function(data){
				var template = _.template($('#size_template').html());
				$("#ceph_size").html(template({
					percent: 		100 * data.info.bytes_used / data.info.bytes_total,
					used: 			data.info.bytes_used,
					total: 			data.info.bytes_total
				}))
			}
		})

		//健康度
		$.ajax(
		{
			type: 		"GET",
			url: 		_cephUrl + "storstatus/?cmd=hth",
			dataType:	"json",
			success: 	function(data){
				if(data.result=="success"){
					var health = data.info.split('_')[1];
					var logo = "icon-remove-sign";
					if(health == "OK"){
						logo = "icon-heart";
					}
					if(health == "WARN"){
						logo = "icon-exclamation-sign";
					}
					$("#health_info").html(health);
					$("#health_logo").attr("class",logo);
				}
				else{
					$("#health_info").html("ERROR");
					$("#health_logo").attr("class","icon-remove-sign");
				}
			}
		})

		//服务器数
		$.ajax(
		{
			type: 		"GET",
			url: 		_cherryUrl + "listserver",
			dataType:	"json",
			async:     	false,
			success: 	function(data){
				var active_node = 0;
				var total_node = 0;
				for (var i = data.length - 1; i >= 0; i--) {
					total_node ++;
					if(data[i].status == "success")
						active_node ++;
				}
				$("#server_num").html(active_node +"/" + total_node);
			}
		})

		//磁盘数
		$.ajax(
		{
			type: 		"GET",
			url: 		_cherryUrl + "listosd",
			dataType:	"json",
			async:     	false,
			success: 	function(data){
				//console.log(data);
				var active_node = 0;
				var total_node = 0;
				for (var i = data.length - 1; i >= 0; i--) {
					total_node ++;
					if(data[i].status == "up")
						active_node ++;
				}
				$("#disk_num").html(active_node +"/" + total_node);
			}
		})

		//镜像数
		$.ajax(
		{
			type: 		"GET",
			url: 		_cephUrl + "imageop/",
			dataType:	"json",
			success: 	function(data){
				//console.log(data);
				if(data.result=="success")
					$("#image_num").html(data.info.length);
			}
		})

		//存储池数
		$.ajax(
		{
			type: 		"GET",
			url: 		_cephUrl + "spacemanage/?cmd=poollist",
			dataType:	"json",
			success: 	function(data){
				//console.log(data);
				if(data.result=="success")
					$("#pool_num").html(data.info.pools.length);
			}
		})

		//块设备数
		$.ajax(
		{
			type: 		"GET",
			url: 		_cephUrl + "tgtmanage/?cmd=showtgt",
			dataType:	"json",
			success: 	function(data){
				//console.log(data.info.iscsi);
				if(data.result=="success")
					$("#device_num").html(data.info.iscsi.length);
			}
		})

		//登录记录
		$.ajax(
		{
			type: 		"GET",
			url: 		_cherryUrl + "listlogin",
			dataType:	"json",
			async:     	false,
			success: 	function(data){
				//console.log(data.info.iscsi);
				var template = _.template($('#login_template').html());
				var tbody = "";
				for (var i = 0; i < data.length && i < 5; i++) {
					tbody += template({
						id: 		i+1,
						name: 		data[i].name,
						time: 		data[i].time 
					})
				}
				$("#login_tbody").html(tbody);
			}
		})

		//操作记录
		$.ajax(
		{
			type: 		"GET",
			url: 		_cherryUrl + "listoperate",
			dataType:	"json",
			async:     	false,
			success: 	function(data){
				//console.log(data.info.iscsi);
				var template = _.template($('#operate_template').html());
				var tbody = "";
				for (var i = 0; i < data.length && i < 5; i++) {
					tbody += template({
						id: 		i+1,
						name: 		data[i].name,
						time: 		data[i].time,
						operation: 	data[i].operation
					})
				}
				$("#operate_tbody").html(tbody);
			}
		})

		//磁盘阵列表
		$.ajax(
		{
			type: 		"GET",
			url: 		_cherryUrl + "listosd",
			dataType: 	"json",
			async:     	false,
			success: 	function(data){
				var template = _.template($("#osd_table_template").html());
				var tbody = "";
				var up = "normal";
				var down = "fatal";
				var none = "";
				var node = [];
				var slot1 = [];
				var slot2 = [];
				var slot3 = [];
				var slot4 = [];
				var slot5 = [];
				for (var i = data.length - 1; i >= 0; i--) {
					if($.inArray(data[i].ip, node) < 0)
						node.push(data[i].ip);
				}
				for (var i = data.length - 1; i >= 0; i--) {
					if(data[i].status == "up"){
						switch (data[i].slot){
							case 1: 	slot1[$.inArray(data[i].ip, node)] = up;	break;
							case 2: 	slot2[$.inArray(data[i].ip, node)] = up;	break;
							case 3: 	slot3[$.inArray(data[i].ip, node)] = up;	break;
							case 4: 	slot4[$.inArray(data[i].ip, node)] = up;	break;
							case 5: 	slot5[$.inArray(data[i].ip, node)] = up;	break;
							default: 	break;
						}
					}
					if(data[i].status == "down"){
						switch (data[i].slot){
							case 1: 	slot1[$.inArray(data[i].ip, node)] = down;	break;
							case 2: 	slot2[$.inArray(data[i].ip, node)] = down;	break;
							case 3: 	slot3[$.inArray(data[i].ip, node)] = down;	break;
							case 4: 	slot4[$.inArray(data[i].ip, node)] = down;	break;
							case 5: 	slot5[$.inArray(data[i].ip, node)] = down;	break;
							default: 	break;
						}
					}
				}
				for (var i = 0; i < node.length; i++) {
					tbody += template({
						id: 		i + 1,
						slot1: 		slot1[i],
						slot2: 		slot2[i],
						slot3: 		slot3[i],
						slot4: 		slot4[i],
						slot5: 		slot5[i]
					})
				}
				$("#osd_tbody").html(tbody);
			}
		})
	}

	var init = loadBasicInfo();
});
