sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"my/sap_coder_agro_driver_app/model/formatter"
], function(Controller, JSONModel, formatter) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.TransportationList", {
		formatter: formatter,
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oOfflineStore = this.getOwnerComponent()._oOfflineStore;
			this._oTransportatationListModel = new JSONModel({
				Truck: {
					IsAvailable: true
				}
			});
			this.getView().setModel(this._oTransportatationListModel);
			this.getOwnerComponent().getRouter().getRoute("TransportationList").attachPatternMatched(this.onRouterObjectMatched, this);
		},
		onTruckAvailabilityChanged: function() {
			sap.ui.core.BusyIndicator.show(0);
			if (this._oTransportatationListModel.getProperty("/Truck/IsAvailable")) {
				this._oODataModel.setProperty(`/Trucks('${this.getOwnerComponent().getCurrentTruck()}')/Status`, "READY");
			} else {
				this._oODataModel.setProperty(`/Trucks('${this.getOwnerComponent().getCurrentTruck()}')/Status`, "STOPPED");
			}
			this._oODataModel.submitChangesPromise()
				.then(() => this._oOfflineStore.flush())
				.then(() => this._oOfflineStore.refresh())
				.then(() => this.getTransportationsForDriver())
				.then(() => sap.ui.core.BusyIndicator.hide());
		},
		onRefresh: function() {
			this._oOfflineStore.flush()
				.then(() => this._oOfflineStore.refresh())
				.then(() => this.getTransportationsForDriver()
					.then(() => this.byId("PullToRefreshId").hide()));
		},
		onRouterObjectMatched: function() {
			sap.ui.core.BusyIndicator.hide();
			this.getOwnerComponent()._oOfflineStoreDeferred.done(() => this.getTransportationsForDriver());
		},
		getTransportationsForDriver: function() {
			return new Promise((fnResult, fnReject) => {
				Promise.all([
						this._oODataModel.readPromise("/Transportations", {
							urlParameters: {
								"$expand": "TruckDetails,ShippingLocationDetails,ShippingLocationDetails1",
								"$filter": "TruckDetails/Driver eq '" + this.getOwnerComponent().getCurrentUser() + "'"
							}
						}),
						this._oODataModel.readPromise("/TransportationAssignments", {
							urlParameters: {
								"$expand": "TruckDetails,TransportationDetails,TransportationDetails/ShippingLocationDetails,TransportationDetails/ShippingLocationDetails1",
								"$filter": "TruckDetails/Driver eq '" + this.getOwnerComponent().getCurrentUser() + "'"
							}
						}),
						this._oODataModel.readPromise("/Trucks", {
							urlParameters: {
								"$filter": "TruckNum eq '" + this.getOwnerComponent().getCurrentTruck() + "'"
							}
						})
					])
					.then(aResults => {
						debugger;
						let aTransportationsForDriver = aResults[0].results;
						let aAssginmentsForDriver = aResults[1].results.filter(oAssignment => [
							"REQUEST_SEND", "REQUEST_READ", "REQUEST_DELIVERED", "REJECTED"
						].includes(oAssignment.Status));
						let oTruck = aResults[2].results[0];
						aAssginmentsForDriver.forEach(oAssignment => {
							if (oAssignment.Status === "REJECTED") {
								oAssignment.TransportationDetails.Status = "090.REJECTED";
							}
						});
						aTransportationsForDriver.unshift(...aAssginmentsForDriver.map(oAssignment =>
							oAssignment.TransportationDetails));
						//aTransportationsForDriver = Array.from(new Set(aTransportationsForDriver));
						for (let i = 0; i < aTransportationsForDriver.length; i++) {
							for (let j = i + 1; j < aTransportationsForDriver.length; j++) {
								if(aTransportationsForDriver[i].TransportationNum === aTransportationsForDriver[j].TransportationNum) {
									aTransportationsForDriver.splice(j, 1);
								}
							}
						}
						this._oTransportatationListModel.setProperty("/TransportationsForDriver", aTransportationsForDriver);
						this._oTransportatationListModel.setProperty("/Truck/IsAvailable", !!(oTruck.Status !== "STOPPED"));
						fnResult();
						sap.ui.core.BusyIndicator.hide();
					});
			});

		},
		onTransportationDetailsNav: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
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