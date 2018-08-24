sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/pepsico/core/sap/ui/model/odata/v2/ODataModel",
	"com/pepsico/core/cordova/camera/CameraFunctions",
	"com/pepsico/core/cordova/file/FileSystemFunctions",
	"com/pepsico/core/web/file/FileReader/FileReaderFunctions",
	"sap/ui/model/json/JSONModel",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_driver_app/view/TransportationMapViewBuilder",
	"my/sap_coder_agro_driver_app/model/formatter",
	"my/sap_coder_agro_driver_app/model/PlanningCalendarFunctions"
], function(Controller, ODataModel, CameraFunctions, FileSystemFunctions, FileReaderFunctions, JSONModel, YandexMap,
	TransportationMapViewBuilder, formatter, planningCalendarFunctions) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.ShippingLocation", {
		formatter: formatter,
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oYandexMap = new YandexMap(this.byId("yandexMapShippingLocationId").getId());
			this._sShippingLocationPath = undefined;
			this._oScreenModel = new JSONModel({
				ShippingLocation: {

				},
				Timeline: {

				}
			});
			this.getView().setModel(this._oScreenModel);
			this.getOwnerComponent().getRouter().getRoute("ShippingLocation").attachPatternMatched(this.onRouterObjectMatched, this);
			/*this._oYandexMap.createMapControl()
				.then(() => {
					let oTransportationMapViewBuilder = new TransportationMapViewBuilder(this._oYandexMap, this);
					oTransportationMapViewBuilder.buildMapView();

					this._oYandexMap.bindElement(new sap.ui.model.Context(this._oScreenModel, "/Transportation"));
				});*/
		},
		onNavBack: function() {
			history.go(-1);
		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this._sShippingLocationPath = "/" + sObjectPath;
				this.refreshScreenModel();
			}
		},
		refreshScreenModel: function() {
			this._oODataModel.readPromise(this._sShippingLocationPath, {
					urlParameters: {
						'$expand': `TransportationDetails,
									TransportationDetails1,
									RoadEventDetails`
					}
				})
				.then(oShippingLocation => {
					debugger;
					this._oScreenModel.setProperty("/ShippingLocation", oShippingLocation);
					let oTimeline = {};
					if (this._oScreenModel.getProperty("/ShippingLocation/LocationType") === 'STORAGE') {
						oTimeline = planningCalendarFunctions.convertTranportations(oShippingLocation.TransportationDetails1.results);
						oTimeline.rows.forEach(row => row.appointments = row.appointments.filter(appointment => appointment.type === 'Type07'));
					} else {
						oTimeline = planningCalendarFunctions.convertTranportations(oShippingLocation.TransportationDetails.results);
						oTimeline.rows.forEach(row => row.appointments = row.appointments.filter(appointment => appointment.type === 'Type04'));
					}
					this._oScreenModel.setProperty("/Timeline", oTimeline);
					this._oODataModel.readPromise("/RoadEvents", {
							urlParameters: {
								'$filter': "ShippingLocation eq '" + oShippingLocation.ShippingLocationKey + "'"
							}
						})
						.then(oRoadEventDetails => {
							this._oScreenModel.setProperty("/ShippingLocation/RoadEventDetails", oRoadEventDetails.results);
							oRoadEventDetails.results.forEach((oRoadEvent, iIndex) =>
								this._oODataModel.readPromise("/MediaResources", {
									urlParameters: {
										'$filter': "MediaResourceUuid eq '" + oRoadEvent.MediaResource + "'"
									}
								})
								.then(oMediaResourceDetails =>
									this._oScreenModel.setProperty("/ShippingLocation/RoadEventDetails/" + iIndex + "/MediaResourceDetails",
										oMediaResourceDetails.results[0])
								)
							);
						});
				});
		}
	});
});