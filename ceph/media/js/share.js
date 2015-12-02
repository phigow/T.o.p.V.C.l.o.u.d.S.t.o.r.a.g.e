//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){

	loadmetapool=function() {
		var isMDS = "mds";
		var template = _.template($('#option_template').html())
		$.ajax({
			type:		"GET",
			url: 		"http://192.168.50.90:8080/listserver",
			dataType:	"json",
			success: function(data) {
				var options = "";
				for (var i = 0; i < data.length; i++) {
					if(data[i].role.indexOf(isMDS)>=0) {
						options += template(
						{
							name: 		data[i].name 
						})
					}
				}
				$("#metapool_list").html(options);
			}
		});
	};

	createnfs=function() {
		var path = $("#input_path").val();
		var acl = $("#input_acl").val();
		var meta = $("#metapool_list option:selected").val();
		$.ajax({
			type:		"POST",
			url: 		"http://192.168.50.90:8000/fsmanage/",
			dataType:	"json",
			data: 		"directory="+path+"&acl="+acl+"&node="+meta,
			success: function(data) {
				$("#result").html(data.result);
				$("#return").html(data.info);
			}
		});
	};

	predelete=function(nfsPath) {
		$("#delinfo").html(nfsPath);
	};

	deletenfs=function() {
		$.ajax({
			type:		"GET",
			url: 		"http://192.168.50.90:8000/fsmanage/?cmd=delnfs",
			dataType:	"json",
			success: function(data) {
				$("#result").html(data.result);
				$("#return").html(data.info);
			}
		});
	};
	
	reLoad = function() {
		location.reload(); 
	}
	
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
		el: $("#mds_nfs"),
		
    // Cache the template function for a single item.
    
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
				url: 		"http://192.168.50.90:8000/fsmanage/?cmd=showmds",
				dataType:	"json",
				success: function(data) {
					//alert(data)
					meta_pool=data.info[0].metadata_pool;
					//console.log(data.info[0].data_pools);
					data_pool=data.info[0].data_pools.join(',');
					$("#meta_pool").html(meta_pool);
					$("#data_pool").html(data_pool);
				}
			});

			$.ajax({
				type:		"GET",
				url: 		"http://192.168.50.90:8000/fsmanage/?cmd=shownfs",
				dataType:	"json",
				success: function(data) {
					//alert(data)
					nfs=data.info;
					if(data.result=="success") {
						if(nfs=="no exports") {						
							//$("#operation").html("<a href='#doCreate' data-toggle='modal' onclick='loadmetapool()'>创建</a>");
						}
						else {
							$("#path").html(nfs.split(' ')[0]);
							$("#acl").html(nfs.split(' ')[1]);
							//$("#operation").html("<a href='#doDelete' data-toggle='modal' onclick='predelete(\""+nfs.split(' ')[0]+"\")'>删除</a>");
						}
					}
				}
			});
		}
	});

	var serverDetailView = new ServerDetailView();
});
