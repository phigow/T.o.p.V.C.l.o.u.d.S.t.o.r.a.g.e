//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){
			
	// chartsInfo Model

	chartsInfo = Backbone.Model.extend ({
	
		urlRoot:"cluster.html",
  	
  		// Default attributes for the container item.
  		defaults: function() {
			return {
				iops:				null,
				reat:				null,
				write:				null
      		};
		}
	});
	
	var chartsInfo = new chartsInfo();
	
	// chartsInfo View
	
	chartsInfoView = Backbone.View.extend ({
		el: $("#linegraph"),
		
    // Cache the template function for a single item.
		template: _.template($('#charts_template').html()),
    
		initialize: function() {
			this.render();
		},
		
		render: function() {
			var self = this;
			//console.log(serverIp);
			chartsInfo.fetch({url:'http://192.168.50.90:8000/storstatus/?cmd=ratestatus', success:function(iDetail, response) {
				
				self.$el.html(self.template(
					{
						iops:				iDetail.get("info").op_per_sec,
						read:				iDetail.get("info").read_bytes_sec,
						write:				iDetail.get("info").write_bytes_sec
					}));
				
				self.$el.show();

				
			}, error:function() {
				alert('error\n' + response);	
			}});
		}
	});
	var chartsInfoView = new chartsInfoView();
});