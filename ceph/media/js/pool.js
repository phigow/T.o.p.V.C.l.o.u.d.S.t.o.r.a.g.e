//Load the application once the DOM is ready, using `jQuery.ready`:

$(function(){
	//alert(serverIp);
	
	var _cephUrl = "http://192.168.50.90:8000/";
	var _cherryUrl = "http://192.168.50.90:8080/";
	
	reLoad = function() {
		location.reload(); 
	}

	updateRuleset=function() {
		var template = _.template($('#select_template').html());
		$.ajax({
				type:		"GET",
				url: 		_cephUrl + 'spacemanage/?cmd=poolruleset',
				dataType:	"json",
				success: function(data) {
					//console.log(data.info["0"].ruleset_tag);
					//console.log(data.info["0"].ruleset_name);
					var options ="";
					for(var i = 0; i < data.info.length; i++){
						options += template(
						{
							name: 	data.info[i].ruleset_tag,
							tag: 	data.info[i].ruleset_name
						})
					}
					$("#select2_sample3").html(options);
				}
			}
		)
	};

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

	changeSize=function() {
		if($("input[type='checkbox']:checked").length) {
			var new_size = $("#input_size").val();
			var poolname = $("input[type='checkbox']:checked").attr("name");
			//console.log(poolname);
			$.ajax({
					type:		"POST",
					url: 		_cephUrl + 'spacemanage/',
					dataType:	"json",
					data:  		"cmd=poolquota&poolname="+poolname+"&type=max_bytes&size="+new_size, 
					success: function(data) {
						//console.log(data.result);
						$("#result").html(data.result);
						$("#return").html(data.info);
						//alert(data.result);
						//location.reload(); 
						$.ajax({
							type: 		"GET",
							url: 		_cherryUrl + "operate?op=Change Size of Pool " + poolname,
						})
					}
				}
			)
		}
		else {
			alert("请勾选池");
		}
	};

	configureInit=function() {
		if($("input[type='checkbox']:checked").length) {
			var name = $("input[type='checkbox']:checked").attr("name");
			var mbyte = $("input[type='checkbox']:checked").attr("mbyte");
			var flush = $("input[type='checkbox']:checked").attr("flush");
			var evict = $("input[type='checkbox']:checked").attr("evict");
			$("#name")[0].value=name;
			$("#set_mbyte")[0].value=mbyte;
			$("#set_flushage")[0].value=flush;
			$("#set_evictage")[0].value=evict;
		}
		else {
			alert("请勾选池");
			reLoad();
		}
	};
	
	configure=function() {
		var poolname = $("#name")[0].value;
		var mbyte = $("#set_mbyte")[0].value;
		var flush = $("#set_flushage")[0].value;
		var evict = $("#set_evictage")[0].value;
		$.ajax({
			type:		"POST",
			url: 		_cephUrl + 'spacemanage/',
			dataType:	"json",
			data:  		"cmd=poolargsset&poolname="+poolname+"&mbyte="+mbyte+"&flushage="+flush+"&evictage="+evict, 
			success: function(data) {
				//console.log(data.result);
				$("#result").html(data.result);
				$("#return").html(data.info);
				//alert(data.result);
				//location.reload();  
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Setting Pool " + poolname,
				})
			}
		})
	};

	createPool=function() {
		var poolname = $("#input_label").val();
		var pg_num = $("#input_copy").val();
		var type = $("select[name='input_type'] option:selected").val();
		var rule = $("select[name='input_ruleset'] option:selected").val();
		var replica = $("#input_replica").val();
		$.ajax({
			type:		"POST",
			url: 		_cephUrl + 'spacemanage/',
			dataType:	"json",
			data:  		"cmd=pool&poolname="+poolname+"&pg_num="+pg_num+"&type="+type+"&replica="+replica+"&rule="+(rule == null?"":rule), 
			success: function(data) {
				//console.log(data.result);
				$("#result").html(data.result);
				$("#return").html(data.info);
				//alert(data.result);
				//location.reload(); 
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Create Pool " + poolname,
				}) 
			}
		})

	};

	preDelete=function() {
		if($("input[type='checkbox']:checked").length) {
			var meta = "";
			var mds = [];
			var poolname = $("input[type='checkbox']:checked").attr("name");
			$.ajax({
				type:		"GET",
				url:		_cephUrl + "fsmanage?cmd=showmds",
				dataType:	"json",
				//async:		false,
				success:	function(data) {
					//console.log(data);
					meta = data.info[0].metadata_pool;
					mds = data.info[0].data_pools;
		                        if(poolname == meta) {
	                                        alert("该池不能删除");      
                                                reLoad();
                                        }
                                        if(mds.indexOf(poolname) > -1) {
 		                                alert("该池不能删除");
                                                reLoad();
                                        }
				},
				error:		function(data) {
					console.log(data);
				}
			});
			console.log(poolname);
			//var poolname = $("input[type='checkbox']:checked").attr("name");	
			if(poolname == meta) {
				alert("该池不能删除");
				reLoad();
			}
			if(mds.indexOf(poolname) > -1) {
				alert("该池不能删除");
				reLoad();
			}
			$("#deleteInfo").html(poolname);
		}
		else {
			alert("请勾选池");
			reLoad();
		}
	};

	deletePool=function() {
		var poolname = $("#deleteInfo").text();
		//console.log(poolname);
		$.ajax({
			type:		"GET",
			url: 		_cephUrl + 'spacemanage/?cmd=pooldel&poolname='+poolname,
			dataType:	"json",
			success: function(data) {
				//console.log(data.result);
				$("#result").html(data.result);
				$("#return").html(data.info);
				//alert(data.result);
				//location.reload();  
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Delete Pool " + poolname,
				})
			}
		})
	};

	preDeleteTier=function(cachepool, mainpoolid) {
		$.ajax({
			type:		"GET",
			url: 		_cephUrl + 'spacemanage/?cmd=poollist',
			dataType:	"json",
			asyc: 		"false",
			success: function(data) {
				var pools = data.info.pools;
				for (var i = pools.length - 1; i >= 0; i--) {
					if(pools[i].pool == mainpoolid) {
						$("#mainPool").html(pools[i].pool_name);
						$("#cachePool").html(cachepool);
					}
				}
			}
		});
	};

	deleteTier=function() {
		$.ajax({
			type: 		"POST",
			url: 		_cephUrl + "spacemanage/",
			dataType: 	"json",
			data: 		"cmd=pooltierdelete&poolname=" + $("#mainPool").text() + "&cachepool=" + $("#cachePool").text(),
			success: 	function(data) {
				$("#doOperate").modal('show');
				$("#result").html(data.result);
				$("#return").html(data.info); 
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Tier delete Pool " + $("#cachePool").text(),
				})				
			}
		})
	};

	fillTiers=function() {
		$.ajax({
			type:		"GET",
			url: 		_cephUrl + 'spacemanage/?cmd=poollist',
			dataType:	"json",
			success: function(data) {
				var mainPool = "";
				var cachePool = "";
				var pools = data.info.pools;
				var template = _.template($('#select_template').html());

				for (var i = 0; i < pools.length; i++) {
					var ruleset = pools[i].crush_ruleset;
					//if(ruleset == 2) {
						cachePool += template({
							tag: 	pools[i].pool_name,
							name: 	pools[i].pool_name
						})
					//}
					//else {
						mainPool += template({
							tag: 	pools[i].pool_name,
							name: 	pools[i].pool_name
						})
					//}
				}
				$("select[name='input_poolname']").html(mainPool);
				$("select[name='input_cachepool']").html(cachePool);
			}
		})
	};

	addTier=function() {
		var opmode = $("select[name='input_opmode'] option:selected").val();
		var poolname = $("select[name='input_poolname'] option:selected").val();
		var cachepool = $("select[name='input_cachepool'] option:selected").val();
		$.ajax({
			type:		"POST",
			url: 		_cephUrl + 'spacemanage/',
			dataType:	"json",
			data:  		"cmd=pooltiercreate&opmode="+opmode+"&poolname="+poolname+"&cachepool="+cachepool,
			success: function(data) {
				//console.log(data.result);
				$("#result").html(data.result);
				$("#return").html(data.info);
				//alert(data.result);
				//location.reload(); 
				$.ajax({
					type: 		"GET",
					url: 		_cherryUrl + "operate?op=Tier add Pool " + cachepool,
				})	
			}
		})
	};

	delConfirm=function(poolname,cachemode) {
		console.log(poolname+cachemode);
		if(cachemode=="readonly") {
			alert("该池不能删除");
			location.reload();
		}
		else {
			$.ajax({
				type:		"POST",
				url: 		_cephUrl + 'spacemanage/',
				dataType:	"json",
				data:  		"cmd=cachedataquery&cachepool=" + poolname,
				success: function(data) {
					if(data.result=="failed") {
						alert(data.info);
						location.reload(); 
					}
					else if(data.result=="success") {						
						alert("可以删除");
					}
				}
			})
		}
		$("#deleteInfo").html(poolname);
		/*$.ajax({
			type:		"POST",
			url: 		_cephUrl + 'spacemanage/',
			dataType:	"json",
			data:  		"cmd=pooltiercreate&opmode="+opmode+"&poolname="+poolname+"&cachepool="+cachepool,
			success: function(data) {
				//console.log(data.result);
				$("#result").html(data.result);
				$("#return").html(data.info);
				//alert(data.result);
				//location.reload(); 
			}
		})*/
	};

	radioButton=function(obj) {
		var status = obj[0].checked;
		$("input[type='checkbox']").each(function () {
    		this.checked = false;
		})
		obj[0].checked = status;
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
		el: $("#pool-table-tbody"),
		
    // Cache the template function for a single item.
		template: _.template($('#list_template').html()),
    
		initialize: function() {
			this.render();
		},
		
		render: function() {
			var self = this;
			//console.log(serverIp);
			serverDetail.fetch({
				url:_cephUrl + 'spacemanage/?cmd=poollist', 
				success:function(iDetail, response) {
				//console.log(iDetail.get("info").pools);
				var disks = iDetail.get("info").pools;
				var tbody = "";

				for (var i = 0; i < disks.length; i++) {
					//console.log(disks[i]);
					//console.log(disks[i].tier_of);
					var pooltype = disks[i].type;
					if(pooltype == 1) {
						pooltype = "副本";
					}
					if(pooltype == 3) {
						pooltype = "纠删码";
					}
					tbody += self.template(
					{
						id:					disks[i].pool,
						name:				disks[i].pool_name, 
						type:				pooltype, 
						size:				disks[i].size,   
						quota:				disks[i].quota_max_bytes,
						tier:				disks[i].tier_of,
						tier_id:			disks[i].tiers[0],

						//popup params
						stripe_width:			disks[i].stripe_width,
						crush_ruleset:			disks[i].crush_ruleset,
						pg_num:					disks[i].pg_num,
						cache_min_flush_age:	disks[i].cache_min_flush_age,
						hit_set_period:			disks[i].hit_set_period,
						cache_mode:				disks[i].cache_mode,
						target_max_bytes:		disks[i].target_max_bytes,
						hit_set_count:			disks[i].hit_set_count,
						hit_set_params_type:	disks[i].hit_set_params.type,

						//confiure init
						cache_min_evict_age: 	disks[i].cache_min_evict_age,

						//can be delete
						deleteIcon: 			disks[i].tier_of>=0?'<a href="#doDeleteTier" onclick="preDeleteTier(\''+disks[i].pool_name+'\',\''+disks[i].tier_of+'\')" data-toggle="modal"><span class="icon-bitbucket"/></a>':''
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
