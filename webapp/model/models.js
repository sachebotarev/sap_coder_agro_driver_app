sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"com/pepsico/core/sap/ui/model/odata/v2/ODataModel",
	"com/pepsico/core/sap/mobile/kapsel/odata/OfflineStore",
	"sap/ui/Device",
], function(JSONModel, ODataModel, OfflineStore, Device) {
	"use strict"; 
	// https://agrotrnspmngms0004431717trial.hanatrial.ondemand.com/MyOrders/odata/
	return {
		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createSystemModel: function() {
			var oModel = new JSONModel({
				currentUser: "S0004431717",
				truck: "4000"
			});
			return oModel;
		},
		createOdataModel: function() {
			if (document.URL.indexOf('http://') === -1 && document.URL.indexOf(
					'https://') === -1) {
				return new ODataModel(
					"https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_agro_transp_mangm_odata", {
						json: true,
						useBatch: true,
						defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
						defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Patch,
						loadMetadataAsync: false,
						tokenHandling: true
					}
				);
			} else {
				return new ODataModel(
					"/odata", {
						json: true,
						useBatch: true,
						defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
						defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put,
						loadMetadataAsync: false,
						tokenHandling: true
					}
				);
			}
		},
		createOdataModelCeluweb: function() {
			if (document.URL.indexOf('http://') === -1 && document.URL.indexOf(
					'https://') === -1) {
				return new ODataModel(
					"https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/pepsico_dv1_zcustomer_srv", {
						json: true,
						useBatch: true,
						defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
						defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put,
						loadMetadataAsync: false,
						tokenHandling: true
					}
				);
			} else {}
		},
		createOfflineStoreCeluweb: function() {
			return new OfflineStore({
				"name": "CustomerStore",
				"host": "hcpms-s0004431717trial.hanatrial.ondemand.com",
				"port": "443",
				"https": true,
				"storePath": "/sdcard",
				"serviceRoot": "/pepsico_dv1_zcustomer_srv",
				"definingRequests": {
					"CustomerSet": "/CustomerSet",
					"File1Set": {
						"url": "/OfflineFile1Set?$filter=PrvCustNo eq '9999'",
						"retrieveStreams": true
					}
				}
			});
		},
		createOfflineStore: function() {
			return new OfflineStore({
				"name": "TransportationStore",
				"host": "hcpms-s0004431717trial.hanatrial.ondemand.com",
				"port": "443",
				"https": true,
				"storePath": "/sdcard",
				"serviceRoot": "/my_agro_transp_mangm_odata",
				"definingRequests": {
					"Transportations": `/Transportations?$expand=	ShippingLocationDetails,
																	ShippingLocationDetails1,
																	TransportationMessageLogDetails,
																	TransportationAssignmentDetails/TruckDetails/CarrierDetails,
																	TransportationLocationAssignmentDetails/ShippingLocationDetails,
																	TruckDetails,
																	TruckDetails/CarrierDetails,
																	MediaResourceDetails,
																	TransportationItemDetails`,
					"Trucks": '/Trucks?$expand=CarrierDetails',
					"RoadEvents": '/RoadEvents?$expand=MediaResourceDetails',
					"ShippingLocations": '/ShippingLocations?$expand=TransportationDetails,TransportationDetails1,RoadEventDetails',
					"MediaResources": {
						url: "/MediaResources",
						retrieveStreams: true
					}
				}
			});
		}
	};
});