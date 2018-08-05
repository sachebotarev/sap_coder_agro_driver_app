sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.TransportationList", {
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oTransportatationListModel = new JSONModel();
			this.getView().setModel(this._oTransportatationListModel);
			this.getTransportationsForDriver();
		},
		getTransportationsForDriver: function() {
			Promise.all([
				this._oODataModel.readPromise("/Transportations", {
					urlParameters: {
						"$expand": "TruckDetails",
						"$filter": "TruckDetails/Driver eq '" + this.getOwnerComponent().getCurrentUser() + "'"
					}
				}),
				this._oODataModel.readPromise("/TransportationAssignments", {
					urlParameters: {
						"$expand": "TruckDetails,TransportationDetails",
						"$filter": "TruckDetails/Driver eq '" + this.getOwnerComponent().getCurrentUser() + "'"
					}
				})
			])
			.then(aResults => {
				let aTransportationsForDriver = aResults[0].results;
				let aAssginmentsForDriver = aResults[1].results;
				aTransportationsForDriver.unshift(...aAssginmentsForDriver.map(oAssignment =>
					oAssignment.TransportationDetails));
				this._oTransportatationListModel.setProperty("/TransportationsForDriver", aTransportationsForDriver);
			});
		},
		onTransportationDetailsNav: function(oEvent) {
			let sObjectPath = oEvent.getSource().getBindingContext().getPath().substring(1);
			this.getOwnerComponent().getRouter().navTo("Transportation", {
				sObjectPath: "Transportations('" + this._oTransportatationListModel.getProperty("/" + sObjectPath + "/TransportationNum") + "')"
			});
		},
		onOfflineStoreNav: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("OfflineStore");
		}
	});
});