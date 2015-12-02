//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){
	//alert(serverIp);
	var urlparam = window.location.hash;
	var imageName = urlparam.split("#")[1];
	var poolName = urlparam.split("#")[2];

	var _url = "http://192.168.50.90:8000/imageop/";
	
	reLoad = function() {
		location.reload(); 
	}

	createsnap=function() {
		var snapName = prompt('输入快照名：');
		$.ajax({
				type:		"POST",
				url: 		_url,
				dataType:	"json",
				data: 		"cmd=poolsnap&poolname="+poolName+"&opmode=create&imagename="+imageName+"&snapname="+snapName,
				success: function(data) {
					//alert(data)
					alert(data.result);
					location.reload();
				}
			})
	};

	rollback=function(snapName) {
		$.ajax({
			type:		"POST",
			url: 		_url,
			dataType:	"json",
			data: 		"cmd=poolsnap&poolname="+poolName+"&opmode=rollback&imagename="+imageName+"&snapname="+snapName,
			success: function(data) {
				//alert(data)
				$("#result").html(data.result);
				$("#return").html(data.info);
			}
		})
	};

	deletesnap=function(snapName) {
		$.ajax({
			type:		"POST",
			url: 		_url,
			dataType:	"json",
			data: 		"cmd=poolsnap&poolname="+poolName+"&opmode=del&imagename="+imageName+"&snapname="+snapName,
			success: function(data) {
				//alert(data)
				$("#result").html(data.result);
				$("#return").html(data.info);
			}
		})
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
		el: $("#snap_list"),
		
    // Cache the template function for a single item.
		template1: _.template($('#add_new').html()),
		template2: _.template($('#snap_template').html()),
    
		initialize: function() {
			this.render();
		},
		
		render: function() {
			var self = this;
			//console.log(serverIp);

			$.ajax({
				type:		"POST",
				url: 		_url,
				dataType:	"json",
				data: 		"cmd=poolsnap&poolname="+poolName+"&opmode=query&imagename="+imageName+"&snapname=",
				success: function(data) {
					//alert(data)
					var snaps = data.info;
					var snapHTML = self.template1();
					for (var i = 0; i < snaps.length; i++) {
						snapHTML += self.template2({
							name: 		snaps[i].name,
							id: 		snaps[i].id,
							size: 		snaps[i].size/1024/1024,
						});
						if(i % 3 == 1) {
							snapHTML += "<div class='clearfix'>";
						}
					}
					$("#snap_list").html(snapHTML);
				}
			})
		}
	});

	var serverDetailView = new ServerDetailView();
});
