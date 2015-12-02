// Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){

	var _cherryUrl = "http://192.168.50.90:8080/";
	
	var delOsd = [];
	var osdIp = [];
	
	reLoad = function() {
		location.reload(); 
	}

	delConfirm = function(obj){ 
		delOsd = [];
		osdIp = [];
		$("input[name='cbox']:checked").each(function () {
    		delOsd.push(this.value);
    		osdIp.push(this.attr(ip));
		})
		//alert(sIp + '|' + sPort);
		if(delOsd)
			$("#confirm").html(delOsd.join(','));
		else
			$("#confirm").html("<δѡ¶¨>");
	}
	
	doDelete = function(ips) {
		for(var i=0;i<delOsd.length;++i) {
			$('#doOperate').modal('show');
			$("#return").html("删除中...");
			var del_osd = delOsd[i];
			for(var i=0;i<osds.length;++i) {
				$.ajax({
					type:		"POST",
					url: 		'http://'+osdIp[i]+':8000/storstruct/',
					dataType:	"json",
					data:  		"cmd=delete&osd="+delOsd[i], 
					success: function(data) {
						//console.log(data.result);
						$("#ok").removeAttr("disabled");
						$("#operResult").html(data.result);
						$("#return").html(data.info);	
						$.ajax({
							type: 		"GET",
							url: 		_cherryUrl + "operate?op=Remove Osd " + del_osd,
						})
					}
				}
			)}
            $.ajax({
                    type:           "GET",
                    url:            _cherryUrl + 'delosd?osd=\''+delOsd[i]+'\'&ip=\''+osdIp[i]+'\'',
            })
		}
		//alert(_sIp + '|' + _sPort);
	}

	addOsd = function() {
		var osdName = $("#input_label").val();
		var ipLocate = $("#input_ipv4").val()
		//console.log(osdName);
		//console.log(ipLocate);

		$('#doOperate').modal('show');
		$("#return").html("操作中...");
		$.ajax({
			type:		"POST",
			url: 		'http://'+ipLocate+':8000/storstruct/',
			dataType:	"json",
			data:  		"cmd=add&osd="+osdName, 
			success: function(data) {
				//console.log(data);
				$("#ok").removeAttr("disabled");
				$("#operResult").html(data.result);
				$("#return").html(data.info);	
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Add Osd " + osdName,
				})
			}
		});
        $.ajax({
                type:           "GET",
                url:            _cherryUrl + 'addosd?osd=\''+osdName+'\'&ip=\''+ipLocate+'\'',
        })
	}
	
	OsdSingle = Backbone.Model.extend ({
  	
		urlRoot: "disk.html", 
  
		defaults: function() {
			return {
				name: null,
				ip: null,
				slot: null,
				mnt: null,
				dev: null,
				usage: null,
				percentage: null,
				weight: null,
				status: null
			};
		}
	});

	OsdList = Backbone.Collection.extend({
		
		model: OsdSingle,
		
		URL: "disk.html",
	});
	
	var OsdLists = new OsdList;
	
	OsdView = Backbone.View.extend({

		tagName: "tr",
	
		template: _.template($('#list_template').html()),
    
		initialize: function() {
			
			this.listenTo(this.model, 'change', this.render);
		},
		
		render: function() {

			var status = this.model.get('status')
			
			if(status == "up") { // "%u5DF2%u542F%u52A8"
				statusClass = "icon-play";
				statusBadgeClass = "\'badge badge-success tooltips\'";
			}
			else if(status == "down") { // "%u5DF2%u542F%u52A8"
				statusClass = "icon-play";
				statusBadgeClass = "\'badge badge-important tooltips\'";
			}
			else if(status == "False") { // "%u5DF2%u542F%u52A8"
				statusClass = "icon-play";
				statusBadgeClass = "\'badge badge-info tooltips\'";
			}

			var statusbadge = this.model.get('status')=='success' ? "badge badge-success" : "badge badge-important";
			
			this.$el.html(this.template({
					name:				this.model.get("name"),
				 	ip: 				this.model.get("ip"),
				 	slot: 				this.model.get("slot"),
				 	mnt: 				this.model.get("mnt"),
				 	dev: 				this.model.get("dev"),
				 	usage: 				this.model.get("usage"),
				 	percentage: 		this.model.get("percentage"),
				 	weight: 			this.model.get("weight"),
				 	status:				status,
					statusbadge:		statusBadgeClass}));
			
			return this;
		}
	});
	
	var OsdApp = Backbone.View.extend({
		
		el: $("#sample_3"),
    
		initialize: function() {
			this.listenTo(OsdLists, 'add', this.addOne);
			this.listenTo(OsdLists, 'reset', this.addAll);
			this.listenTo(OsdLists, 'all', this.render);
			OsdLists.fetch({url:_cherryUrl + 'listosd/'});
			console.log(OsdLists);
		},
		
		// Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<tbody>`.
			addOne: function(OsdSingle) {
				//alert("1");
				var view = new OsdView({model: OsdSingle});
				this.$("#osd-table-tbody").append(view.render().$el.html());
			},
    
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
			render: function() {
				//alert("2");
    			//this.$el.show();
				this.$("#osd-table-tbody").hide();
			},
    

    // Add all items in the **Containers** collection at once.
			addAll: function() {
				//alert("3");
				OsdLists.each(this.addOne, this);
			},
		});

	Operate = Backbone.Model.extend ({
		defaults:{
		
		}
	
	});
	
	var operate = new Operate();
	
	OperateView = Backbone.View.extend ({
		
		el: "#operate_osd",
		
		initialize: function() {
			this.render();
		},
		
		render: function(context) {
			var template = _.template($("#opearte_template").html(),context);
			$(this.el).html(template);
		},
		
		events: {
			'click a.start' 	:	'doStart',
			'click a.stop'		:	'doStop',
			'click a.restart'	:	'doRestart',
			'click a.delConfirm':	'delConfirm',
			'click #delete'		:	'doDelete'
		},
		
		doStart: function(event) {	
			var osds = [];
			var osdIp = [];
			$("#return").html("启动中...");
			$("input[name='cbox']:checked").each(function () {
	    		osds.push(this.value);
	    		osdIp.push($(this).attr("ip"));
			})	
			for(var i=0;i<osds.length;++i) {
				var osd = delOsd[i];	
				$.ajax({
					type:		"POST",
					url: 		'http://'+osdIp[i]+':8000/storstruct/',
					dataType:	"json",
					data:  		"cmd=start&osd="+osds[i], 
					success: function(data) {
						//console.log(data.result);
						$("#ok").removeAttr("disabled");
						$("#operResult").html(data.result);
						$("#return").html(data.info);	
						$.ajax({
							type: 		"GET",
							url: 		_cherryUrl + "operate?op=Start Osd " + osd,
						})						
					}
				}
			);
				$.ajax({
					type:		"GET",
					url: 		_cherryUrl + 'startosd?osd=\''+osds[i]+'\'&ip=\''+osdIp[i]+'\'',
				})
			}	
		},
		
		doStop: function(event) {
			var osds = [];
			var osdIp = [];
			$("#return").html("停止中...");
			$("input[name='cbox']:checked").each(function () {
	    		osds.push(this.value);
	    		osdIp.push($(this).attr("ip"));
			})	
			for(var i=0;i<osds.length;++i) {	
				var osd = osds[i];
				$.ajax({
					type:		"POST",
					url: 		'http://'+osdIp[i]+':8000/storstruct/',
					dataType:	"json",
					data:  		"cmd=stop&osd="+osds[i], 
					success: function(data) {
						//console.log(data.result);
						$("#ok").removeAttr("disabled");
						$("#operResult").html(data.result);
						$("#return").html(data.info);
						$.ajax({
							type: 		"GET",
							url: 		_cherryUrl + "operate?op=Stop Osd " + osd,
						})	
					}
				}
			);
				$.ajax({
					type:		"GET",
					url: 		_cherryUrl + 'stoposd?osd=\''+osds[i]+'\'&ip=\''+osdIp[i]+'\'',
				})
			}
		},
		
		doRestart: function(event) {
			var osds = [];
			var osdIp = [];
			$("#return").html("重启中...");
			$("input[name='cbox']:checked").each(function () {
	    		osds.push(this.value);
	    		osdIp.push($(this).attr("ip"));
			})	
			for(var i=0;i<osds.length;++i) {	
				var osd = osds[i];
				$.ajax({
					type:		"POST",
					url: 		'http://'+osdIp[i]+':8000/storstruct/',
					dataType:	"json",
					data:  		"cmd=restart&osd="+osds[i], 
					success: function(data) {
						//console.log(data.result);
						$("#ok").removeAttr("disabled");
						$("#operResult").html(data.result);
						$("#return").html(data.info.toString());
						$.ajax({
							type: 		"GET",
							url: 		_cherryUrl + "operate?op=Restart Osd " + osd,
						})	
					}
				}
			)}
		},
		
		delConfirm: function(obj){ 
			delOsd = [];
			osdIp = [];
			$("input[name='cbox']:checked").each(function () {
	    		delOsd.push(this.value);
	    		osdIp.push($(this).attr("ip"));
			})
			console.log(delOsd.join(','));
			if(delOsd) {
				$("#confirm").html(delOsd.join(','));
			}
			else {
				$("#confirm").html("<未选定>");
			}
		},
		
		doDelete: function(ips) {
			$('#doOperate').modal('show');	
			$("#return").html("删除中...");
			for(var i=0;i<delOsd.length;++i) {
				var del_osd = delOsd[i];	
				$.ajax({
					type:		"POST",
					url: 		'http://'+osdIp[i]+':8000/storstruct/',
					dataType:	"json",
					data:  		"cmd=delete&osd="+delOsd[i], 
					success: function(data) {
						//console.log(data.result);
						$("#ok").removeAttr("disabled");
						$("#operResult").html(data.result);
						$("#return").html(data.info);
						$.ajax({
							type: 		"GET",
							url: 		_cherryUrl + "operate?op=Remove Osd " + del_osd,
						})
					}
				}
			);
			$.ajax({
                   		 type:           "GET",
                   		 url:            _cherryUrl + 'delosd?osd=\''+delOsd[i]+'\'&ip=\''+osdIp[i]+'\'',
               		})
			}
			//alert(_sIp + '|' + _sPort);
		}
	});
	
	var operateView = new OperateView();	
	var osdApp = new OsdApp;

});
