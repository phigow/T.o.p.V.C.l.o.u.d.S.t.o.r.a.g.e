//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){

	var _cephUrl = "http://192.168.50.90:8000/";
	var _cherryUrl = 'http://192.168.50.90:8080/';

	loadImg=function() {
		var template = _.template($('#option_template').html());
		var meta = "";
		var mds = [];
		$.ajax({
			type:		"GET",
			url:		_cephUrl + "fsmanage?cmd=showmds",
			dataType:	"json",
			async:		false,
			success:	function(data) {
				//console.log(data);
				meta = data.info[0].metadata_pool;
				mds = data.info[0].data_pools;
			},
			error:		function(data) {
				console.log(data);
			}
		});
		
		$.ajax({
			type:		"GET",
			url: 		_cephUrl + "spacemanage/?cmd=poollist",
			dataType:	"json",
			success: function(data) {
				var pool_list = data.info.pools;
				var options = "";
				for (var i = pool_list.length - 1; i >= 0; i--) {	
					if(pool_list[i].pool_name == meta) {
						continue;
					}
					if(mds.indexOf(pool_list[i].pool_name) > -1) {
						continue;
					}
					options += template(
					{
						name:			pool_list[i].pool_name
					})
				}
				$("[name='input_pool']").html(options);
			}
		});		
	};

	ajaxLoad=function() {
		var template = _.template($('#option_template').html());
		var pool_name = $("[name='input_pool'] option:selected").val();
		$.ajax({
			type:		"GET",
			url: 		_cephUrl + "imageop/",
			dataType:	"json",
			success: function(data) {
				var img_list = data.info;
				var options = "";
				for (var i = img_list.length - 1; i >= 0; i--) {
					if(img_list[i].pool != pool_name) {
						continue;
					}
					options += template(
					{
						name:			img_list[i].name
					})
				}
				$("[name='input_img']").html(options);
			}
		});

	};
	
	createIscsi=function() {
		iscsi_name = $("#input_name").val();
		pool_name = $("[name='input_pool'] option:selected").val();
		img_name = $("[name='input_img'] option:selected").val();
		write_cache = $("#input_cache")[0].checked ? "on":"off";
		console.log(write_cache);
		$.ajax({
			type:		"POST",
			url: 		_cephUrl + "tgtmanage/",
			dataType:	"json",
			data: 		"targetname="+iscsi_name+"&lunnum=4&poolname="+pool_name+"&imgname="+img_name+"&writecache="+write_cache,
			success: function(data) {
				$("#result").html(data.result);
				$("#return").html(data.info);
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Create ISCSI " + iscsi_name,
				})
			}
		})
	};
	
	preDelete=function() {
		if($("input[type='checkbox']:checked").length) {
			var delname = $("input[type='checkbox']:checked").attr("name");
			alert("请确认已卸载了 " + delname + " 的挂载");
			$("#delinfo").html(delname);
		}
		else {
			alert("请勾选池");
			reLoad();
		}
	};

	delIscsi=function() {
		var delname = $("input[type='checkbox']:checked").attr("name");
		$.ajax({
			type:		"GET",
			url: 		_cephUrl + "tgtmanage/?cmd=rmtgt&tgtname="+delname,
			dataType:	"json",
			success: function(data) {
				$("#result").html(data.result);
				$("#return").html(data.info);
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Delete ISCSI " + iscsi_name,
				})
			}
		})
	};

	reLoad = function() {
		location.reload(); 
	};

	radioButton=function(obj) {
		var status = obj[0].checked;
		$("input[type='checkbox']").each(function () {
    		this.checked = false;
		})
		obj[0].checked = status;
	};
	
	ServerDetail = Backbone.Model.extend ({
	
		urlRoot:"imageInfo.html",
  	
  		// Default attributes for the container item.
  		defaults: function() {
			return {
				node_name:				null,
				os_type:				null,
				os_release:				null, 
				kernel:					null,  
				cpu_cores:				null,
				model_name:				null,
				Product_Name:			null,
				Serial_Number:			null,
				manufacturer:			null,
				memTotal:				null, 
				swapTotal:				null,
				ceph_role:				null,  
				scsiinfo:				null
      		};
		}
	});
	
	var serverDetail = new ServerDetail();
	
	// ServerDetail View
	
	ServerDetailView = Backbone.View.extend ({
		el: $("#iscsi-table-tbody"),
		
    // Cache the template function for a single item.
		template: _.template($('#iscsi_template').html()),
    
		initialize: function() {
			this.render();
		},
		
		render: function() {
			var self = this;
			//console.log(serverIp);
			var meta_pool="";
			var data_pool="";
			var nfs="";
			
			$.ajax({
				type:		"GET",
				url: 		_cephUrl + "tgtmanage/?cmd=showtgt",
				dataType:	"json",
				success: function(data) {
					var iscsi_list = data.info.iscsi;
					var tbody = "";
					for(var i = 0; i < iscsi_list.length; i++) {
						tbody += self.template(
						{
							name:		iscsi_list[i].name,
							iqn:		iscsi_list[i].tgtinfo[0],
							online:		iscsi_list[i].tgtinfo[15].split(':')[1]=="Yes"?"在线":"离线",
							size:		iscsi_list[i].tgtinfo[14],
							path:		iscsi_list[i].tgtinfo[22].split(':')[1],
						});
					}
					self.$el.html(tbody);
				}
			});			
		}
	});

	var serverDetailView = new ServerDetailView();
});
