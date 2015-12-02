// Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){
	
	var _cherryUrl = 'http://192.168.50.90:8080/';
	var _urlBase = 'http://192.168.50.90:8080';
	
	_sIp	= '';
	_sPort	= '';
	
	delConfirm = function(){ 
		var delIp = [];
		$("input[name='cbox']:checked").each(function () {
    		delIp.push(this.value)
		})
		//alert(sIp + '|' + sPort);
		if(delIp.length)
			//$("#confirm").html(delIp.join(','));
		{
			swal({
				title: "注销确认",
				text: "服务器 " + delIp.join(',') + " 将从集群中注销",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "确认注销",
				cancelButtonText: "取消",
				closeOnConfirm: false
			},
			function(){
			  	doDelete(delIp);
			});
		}
		else
		{
			swal("请勾选至少一个服务器","","info");
		}
		//	$("#confirm").html("<未选定>");
	}
	
	doDelete = function(delIp) {
		//var delIp = $("#confirm").html().split(',');
		for(var i=0;i<delIp.length;++i) {
			//$('#doOperate').modal('show');
			var serverIp = delIp[i];
			$.ajax({
				type:		"GET",
				url: 		_urlBase+'/delserver?ip=' + delIp[i],
				dataType:	"html",
				success: function(data) {
					if(data=="yes") {
						swal({
							title: "服务器注销成功",
							type: "success"
						},
						function(){
							reLoad();
						});	
						$.ajax({
							type: 		"GET",
							url: 		_cherryUrl + "operate?op=Unregister Server " + serverIp,
						})					
					}
					else {
						swal({
							title: "服务器注销失败",
							type: "warning"
						},
						function(){
							reLoad();
						});
					}
				}
			})
		}
		//alert(_sIp + '|' + _sPort);
	}
	
	doRegister = function() {
		
		$("#return").html("注册中...");
		var form = $('#register_form');

		var serverName = $('#input_label', form).val();
		var serverIp = $('[name="serverIp"]', form).val();
		//alert(data)

		$('#doOperate').modal('show');
		$.ajax({
			type:		"GET",
			url: 		_urlBase+'/addserver?node=' + serverName + '&ip=' + serverIp,
			dataType:	"html",
			success: function(data) {
				//alert(data)
				$("#return").html(data=="yes"?"服务器注册成功":"服务器注册失败");
				$("#ok").removeAttr("disabled");
				if(data == "yes") {
					$.ajax({
						type: 		"GET",
						url: 		_cherryUrl + "operate?op=Register Server " + serverIp,
					})
				}
			}
		})	
		
	}

	shutdown = function() {
		var delIp = [];
		$("input[name='cbox']:checked").each(function () {
    		delIp.push(this.value)
		})
		//alert(sIp + '|' + sPort);
		if(delIp.length)
			//$("#confirm").html(delIp.join(','));
		{
			for(var i=0;i<delIp.length;++i) {
				$.ajax({
					type:		"POST",
					url: 		"http://" + delIp[i] +":8000/hdinfo/",
					dataType:	"html",
					data: 		"cmd=os_halt",
					success: function(data) {
						if(data=="yes") {
							swal({
								title: "服务器操作成功",
								type: "success"
							},
							function(){
								reLoad();
							});	
							$.ajax({
								type: 		"GET",
								url: 		_cherryUrl + "operate?op=Shut down " + serverIp,
							})					
						}
						else {
							swal({
								title: "服务器操作失败",
								type: "warning"
							},
							function(){
								reLoad();
							});
						}
					}
				})
			}
		}
		else
		{
			swal("请勾选至少一个服务器","","info");
		}
	}

	reboot = function() {
		var delIp = [];
		$("input[name='cbox']:checked").each(function () {
    		delIp.push(this.value)
		})
		//alert(sIp + '|' + sPort);
		if(delIp.length)
			//$("#confirm").html(delIp.join(','));
		{
			for(var i=0;i<delIp.length;++i) {
				$.ajax({
					type:		"POST",
					url: 		"http://" + delIp[i] +":8000/hdinfo/",
					dataType:	"html",
					data: 		"cmd=os_reboot",
					success: function(data) {
					//	if(data=="yes") {
							swal({
								title: "服务器操作成功",
								type: "success"
							},
							function(){
								reLoad();
							});	
							$.ajax({
								type: 		"GET",
								url: 		_cherryUrl + "operate?op=Reboot " + serverIp,
							})					
					//	}
					//	else {
					//		swal({
					//			title: "服务器操作失败",
					//			type: "warning"
					//		},
					//		function(){
					//			reLoad();
					//		});
					//	}
					},
					error: function(data) {
						swal("操作飘散在风里");
					}
				})
			}
		}
		else
		{
			swal("请勾选至少一个服务器","","info");
		}
	}
	
	reLoad = function() {
		location.reload(); 
	}

	ServerSingle = Backbone.Model.extend ({
  	
		urlRoot: "server.html", 
  
		defaults: function() {
			return {
				name: null,
				role: null,
				ip: null,
				runtime: null,
				loads: null,
				status: null
			};
		}
	});

	ServerList = Backbone.Collection.extend({
		
		model: ServerSingle,
		
		URL: "server.html",
	});
	
	var ServerLists = new ServerList;
	
	ServerView = Backbone.View.extend({

		tagName: "tr",
	
		template: _.template($('#list_template').html()),
    
		initialize: function() {
			
			this.listenTo(this.model, 'change', this.render);
		},
		
		render: function() {
			
			var status = this.model.get('status')=='success' ? "正常" : "异常";

			var statusbadge = this.model.get('status')=='success' ? "badge badge-success" : "badge badge-important";
			
			this.$el.html(this.template({
					url:         		"serverInfo.html#"+this.model.get("ip"),
					name:				this.model.get("name"),
				 	role: 				this.model.get('role'), 
				 	ipAddress: 			this.model.get("ip"),
				 	status:				status,
					statusbadge:		statusbadge,
					runTime:			this.model.get('runtime'),
					loads: 				this.model.get('loads')}));
			
			return this;
		}
	});
	
	var ServerApp = Backbone.View.extend({
		
		el: $("#sample_3"),
    
		initialize: function() {
			this.listenTo(ServerLists, 'add', this.addOne);
			this.listenTo(ServerLists, 'reset', this.addAll);
			this.listenTo(ServerLists, 'all', this.render);
			ServerLists.fetch({url:_urlBase + '/listserver/'});
			console.log(ServerLists);
    	/*
    	// ======= test data begin... ======= 
    	var i1 = new ServerSingle({imageName: "busybox",
    											imageVersion: "latest",
    											createdTime: "2014年12月8日 14：37",
    											parentId: "cda168b619498a85709e946ab72216103d0b6fdcaa15c73dbe3330de1b887264",
    											size: "1.8G"});
    	var i2 = new ServerSingle({imageName: "looper",
    													imageVersion: "looper90@gmail.com",
    													createdTime: "Suspended",
    													parentId: "x",
    													size: "x"});
    	ServerLists.add(i1);
    	ServerLists.add(i2);
    	// ======= test data end... ======= 
    	*/
		},
		
		// Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<tbody>`.
			addOne: function(serverSingle) {
				//alert("1");
				var view = new ServerView({model: serverSingle});
				this.$("#server-table-tbody").append(view.render().$el.html());
			},
    
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
			render: function() {
				//alert("2");
    			//this.$el.show();
				this.$("#server-table-tbody").hide();
			},
    

    // Add all items in the **Containers** collection at once.
			addAll: function() {
				//alert("3");
				ServerLists.each(this.addOne, this);
			},
		});
		


	//----------------------------
	

	
	var IApp = new ServerApp;
	
	

	/*
	AppView = Backbone.View.extend({
		el: $("body"),
		initialize: function() {
			this.disks = new Disks(null,{view:this})	
		},
		events: {
			"click #check": "checkIn",	
		},
		checkIn: function(event) {
			DiskLists.fetch({url:_urlBase+'?action=LIST_VOLUMES'});	
			var disk = new Disk({rbdName: this.model.get('rbdName')});
			alert(disk)
			this.disks.add(disk);
		},
		addOneDisk: function() {
			 $("#world-list").append("<option value=>" + model.get('rbdName') + ">" + model.get('rbdName') + "</option>");
		}
	});
	var appview = new AppView;
	
	*/
});
