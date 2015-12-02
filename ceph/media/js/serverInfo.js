//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){
		
	var serverurl = window.location.hash;
	var serverIp = serverurl.substr(1,serverurl.length)
	//alert(serverIp);
	var _graphiteUrl = "http://192.168.50.90:8189/"	
	// ServerDetail Model

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
		el: $("#server-info-body"),
		
    // Cache the template function for a single item.
		template: _.template($('#server_info_template').html()),
    
		initialize: function() {
			this.render();
		},
		
		render: function() {
			var self = this;
			//console.log(serverIp);
			serverDetail.fetch({url:'http://'+serverIp+':8000/hdinfo', success:function(iDetail, response) {
				//console.log(iDetail.get('info').disksum);
				var disks = iDetail.get('info').disksum;
				var scsiinfo = "";
				while(disks -- > 0) {
					scsiinfo += iDetail.get('info')[disks] + "<br>"
				}

				self.$el.html(self.template(
					{
						node_name:				iDetail.get('info').node_name,
						os_type:				iDetail.get('info').os_type, 
						os_release:				iDetail.get('info').os_release, 
						kernel:					iDetail.get('info').kernel,   
						cpu_cores:				iDetail.get('info').cpu_cores,
						model_name:				iDetail.get('info').model_name,
						Product_Name:			iDetail.get('info').Product_Name,
						Serial_Number:			iDetail.get('info').Serial_Number,
						manufacturer:			iDetail.get('info').Manufacturer, 
						memTotal:				iDetail.get('info').MemTotal, 
						swapTotal:				iDetail.get('info').SwapTotal,
						ceph_role:				iDetail.get('info').ceph_role,  
						scsiinfo:				scsiinfo
					}));
				
				self.$el.show();
				
			}, error:function() {
				alert('error\n' + response);	
			}});
		}
	});
	
	GraphiteView = Backbone.View.extend({
		el: $("#graphite_tiles"),

		template: _.template($('#graphite_template').html()),

		initialize: function() {
			this.render();
		},
		
		render: function() {
			var self = this;
			var nodeName = "";
			serverDetail.fetch({
				url:'http://'+serverIp+':8000/hdinfo', 
				success:function(iDetail, response) {
					nodeName = iDetail.get('info').node_name;
					console.log(nodeName);
					self.$el.html(self.template(
					{
						cpu:   	_graphiteUrl + "render/?width=586&height=308&target="+nodeName+".cpu-0.cpu-wait",
						mem: 	_graphiteUrl + "render/?width=586&height=308&target="+nodeName+".memory.memory-used",
						loads:  _graphiteUrl + "render/?width=586&height=308&target="+nodeName+".load.load.shortterm",
						io:  	_graphiteUrl + "render/?width=586&height=308&target="+nodeName+".disk-sda.disk_ops.write"
					}));
					self.$el.show();
				},
				error:function() {
					nodeName = "";
				}
			});
		}
	});
	
	//var serverStatView = new ServerStatView();
	var serverDetailView = new ServerDetailView();
	var graphiteView = new GraphiteView();
});

