define([
	'jquery',
	'underscore',
	'backbone',
	'App',
	'models/VAppState',
	'utils/Globals',
	'utils/Utils'
], function($, _, Backbone, App, VAppState, Globals, Utils) {
	var AppRouter = Backbone.Router.extend({
		routes: {
			// Define some URL routes
			// ''						: 'dashboardAction',
			''						: 'parserRegistryAction',
			'!/dashboard'			: 'dashboardAction',
			'!/parser-registry'		: 'parserRegistryAction',
			'!/device-catalog'		: 'deviceCatalogAction',
			'!/device-catalog/:pid'	: 'deviceDetailAction',
			'!/configuration'		: 'configurationAction',
			'!/topology'			: 'topologyAction',
			'!/topology-editor'		: 'topologyEditorAction',
			'!/topology-editor/:pid': 'topologyEditorAction',

			// Default
			'*actions': 'defaultAction'
		},

		initialize: function() {
			this.showRegions();
			this.listenTo(this, 'route', this.postRouteExecute, this);
		},

		showRegions: function() {
			require(['views/site/Header'],function(HeaderView){
				App.rHeader.show(new HeaderView({
					appState: VAppState
				}));
			});
		},

		/**
		 * @override
		 * Execute a route handler with the provided parameters. This is an
		 * excellent place to do pre-route setup or post-route cleanup.
		 * @param  {Function} callback - route handler
		 * @param  {Array}   args - route params
		 */
		execute: function(callback, args) {
			this.preRouteExecute();
			if (callback) callback.apply(this, args);
			this.postRouteExecute();
		},

		preRouteExecute: function() {
			// console.log("Pre-Route Change Operations can be performed here !!");
		},

		postRouteExecute: function(name, args) {
			// console.log("Post-Route Change Operations can be performed here !!");
			// console.log("Route changed: ", name);
		},

		/**
		 * Define route handlers here
		 */
		dashboardAction: function() {
			VAppState.set({
				'currentTab' : Globals.AppTabs.Dashboard.value
			});
			require(['views/site/Dashboard'],function(DashboardView){
				App.rContent.show(new DashboardView());
			});
		},
		
		parserRegistryAction: function(){
			VAppState.set({
				'currentTab' : Globals.AppTabs.ParserRegistry.value
			});
			require(['views/parser/ParserListingView'],function(ParserListingView){
				App.rContent.show(new ParserListingView());
			});
		},

		deviceCatalogAction: function(){
			VAppState.set({
				'currentTab' : Globals.AppTabs.DeviceCatalog.value
			});
			require(['views/device/DeviceCatalogView'],function(DeviceCatalogView){
				App.rContent.show(new DeviceCatalogView());
			});
		},

		deviceDetailAction: function(id){
			VAppState.set({
				'currentTab' : Globals.AppTabs.DeviceCatalog.value
			});
			require(['models/VDatasource'], function(VDatasource){
				var dsModel = new VDatasource();
				dsModel.set('dataSourceId',id);
				dsModel.getOnlyDatasource({
					id: id,
					success: function(model, response, options){
						var tModel = new VDatasource(model.entity);
						require(['views/datasource/DataSourceDetails'], function(DataSourceDetailsView){
							App.rContent.show(new DataSourceDetailsView({
								dsModel: tModel
							}));
						});
					},
					error: function(model, response, options){
						Utils.showError(model, response);
					}
				});
			});
		},

		configurationAction: function(){
			VAppState.set({
				'currentTab' : 0
			});
			require(['collection/VClusterList', 'views/config/ConfigView'], function(VClusterList, configView){
				var collection = new VClusterList(),
					createStormCluster = true,
					createKafkaCluster = true,
					createHdfsCluster = true;
				collection.fetch({
					async: false,
			        success: function(collection, response, options){
			          if(collection.models.length){
			            _.each(collection.models, function(model){
			              if(model.get('type') === 'STORM'){
			                createStormCluster = false;
			              } else if(model.get('type') === 'KAFKA'){
			                createKafkaCluster = false;
			              } else if(model.get('type') === 'HDFS'){
			              	createHdfsCluster = false;
			              }
			            });
			          }
			        }
			    });
			    App.rContent.show(new configView({
					clusterCollection: collection,
					createStormCluster: createStormCluster,
					createKafkaCluster: createKafkaCluster,
					createHdfsCluster: createHdfsCluster
				}));
			});
		},

		topologyAction: function(){
			VAppState.set({
				'currentTab' : Globals.AppTabs.DataStreamEditor.value
			});
			require(['views/topology/TopologyListingMaster'], function(TopologyListingMaster){
				App.rContent.show(new TopologyListingMaster());
			});
		},

		topologyEditorAction: function(id){
			VAppState.set({
				'currentTab' : Globals.AppTabs.DataStreamEditor.value
			});

			if(id){
				require(['models/VTopology'], function(VTopology){
					var vTopology = new VTopology();
					vTopology.set('id', id);
					vTopology.fetch({
						success: function(model, response, options){
							vTopology.set(response.entity);
							delete vTopology.attributes.entity;
							delete vTopology.attributes.responseCode;
							delete vTopology.attributes.responseMessage;
							require(['views/topology/DataStreamMaster'], function(DataStreamMaster){
								App.rContent.show(new DataStreamMaster({
									model: vTopology
								}));
							});
						},
						error: function(model, response, options){
							Utils.showError(model, response);
						}
					});
				});
			} else {
				require(['views/topology/DataStreamMaster'], function(DataStreamMaster){
					App.rContent.show(new DataStreamMaster());
				});
			}
		},
		
		defaultAction: function(actions) {
			// We have no matching route, lets just log what the URL was
			console.log('No route:', actions);
		}
	});

	return AppRouter;

});