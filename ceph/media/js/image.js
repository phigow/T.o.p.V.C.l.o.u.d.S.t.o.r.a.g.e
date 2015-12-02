//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){
	//alert(serverIp);
	var _cephUrl = "http://192.168.50.90:8000/";
	var _cherryUrl = "http://192.168.50.90:8080/";
	
	// ServerDetail Model
	updateData=function(pool_name,stripe_width,crush_ruleset,pg_num,cache_min_flush_age,
		hit_set_period,cache_mode,target_max_bytes,hit_set_count,hit_set_params_type) {
		var template = _.template($('#detail_popup_template').html());
		//console.log(name);
		$("#pool_detail").html(template(
					{
						pool_name:				pool_name,
						stripe_width:			stripe_width,
						crush_ruleset:			crush_ruleset,
						pg_num:					pg_num,
						cache_min_flush_age:	cache_min_flush_age,
						hit_set_period:			hit_set_period,
						cache_mode:				cache_mode,
						target_max_bytes:		target_max_bytes,
						hit_set_count:			hit_set_count,
						hit_set_params_type:	hit_set_params_type
					}));
	};

	loadPool = function() {
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
		template=_.template($('#select_template').html());
		$.ajax({
			type:		"GET",
			url: 		_cephUrl + 'spacemanage/?cmd=poollist',
			dataType:	"json",
			success: function(data) {
				var pools = data.info.pools;
				var options = "";
				for (var i = pools.length - 1; i >= 0; i--) {	
					if(pools[i].pool_name == meta) {
						continue;
					}
					if(mds.indexOf(pools[i].pool_name) > -1) {
						continue;
					}
					options += template({
						name: 		pools[i].pool_name
					})
				}
				$("[name='poollist']").html(options);
			}
		})
	};

	createImg = function() {
		var poolName = $("[name='poollist'] option:selected").val();
		var imgName = $("#input_label").val();
		var size = $("#input_size").val();
		$.ajax({
			type: 		"POST",
			url: 		_cephUrl + "imageop/",
			dataType: 	"json",
			data: 		"cmd=createimage&poolname=" + poolName + "&imgname=" + imgName + "&imgsize=" + size + "&imgformat=2",
			success: 	function(data) {
				$("#doOperate").modal('show');
				$("#result").html(data.result);
				$("#return").html(data.info);
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Create Image " + imgName,
				})
			}
		})		
	}
	
	reLoad = function() {
		location.reload(); 
	};

	preDelete=function(imgName,poolName) {
		$("#deleteInfo").html(imgName);
		$("#delInfo").html(poolName);
	};

	deleteImg=function() {
		var imageName = $("#deleteInfo").html();
		var poolName = $("#delInfo").html();
		$.ajax({
			type:		"POST",
			url: 		_cephUrl + "imageop/",
			dataType:	"json",
			data: 		"cmd=delimage&poolname="+poolName+"&imgname="+imageName,
			success: function(data) {
				//alert(data)
				$("#result").html(data.result);
				$("#return").html(data.info);
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Delete Image " + imageName,
				})
			}
		})
	};

	ServerDetail = Backbone.Model.extend ({
	
		urlRoot:"serverinfo.html",
  	
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
		el: $("#image-table-tbody"),
		
    // Cache the template function for a single item.
		template: _.template($('#list_template').html()),
    
		initialize: function() {
			this.render();
		},
		
		render: function() {
			var self = this;
			//console.log(serverIp);
			serverDetail.fetch({
				url:_cephUrl + 'imageop/', 
				success:function(iDetail, response) {
				console.log(iDetail.get("info"));
				var disks = iDetail.get("info");
				console.log(disks);
				var tbody = "";

				for (var i = 0; i < disks.length; i++) {
					//console.log(disks[i]);
					tbody += self.template(
					{
						name:				disks[i].name, 
						pool:				disks[i].pool, 
						size:				disks[i].size/1048576,   
						object_size:		disks[i].object_size/1048576,
						format:				disks[i].format
					})
				}

				self.$el.html(tbody);
				
				self.$el.show();
				
			}, error:function() {
				alert('error\n' + response);	
			}});
		}
	});

	var serverDetailView = new ServerDetailView();
});