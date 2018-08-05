sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/pepsico/core/cordova/camera/CameraFunctions",
	"com/pepsico/core/cordova/file/FileSystemFunctions",
	"com/pepsico/core/web/file/FileReader/FileReaderFunctions",
	"sap/m/MessageToast"
], function(Controller, JSONModel, CameraFunctions, FileSystemFunctions, FileReaderFunctions, MessageToast) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.RoadEvent", {
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oOfflineStore = this.getOwnerComponent()._oOfflineStore;
			this._oSecondaryModel = new JSONModel();
			this._sRoadEventPath = undefined;
			this._sMediaResourcePath = "/MediaResources('1')";
			this.getView().setModel(this._oODataModel);
			this.getView().setModel(this._oSecondaryModel, "secondaryModel");
			this.getOwnerComponent().getRouter().getRoute("RoadEvent").attachPatternMatched(this.onRouterObjectMatched, this);

		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this._oODataModel.metadataLoaded()
					.then(() => {
						this.getView().bindElement({
							path: "/" + sObjectPath //,
								//parameters: {
								//	expand: `MediaResourceDetails`
								//}
						});
						this._sRoadEventPath = "/" + sObjectPath;
						this.prepareScreenModels();
					});
			}
		},
		prepareScreenModels: function() {
			let oData = {
				EventTypes: [{
					EventType: "BAD_ROAD",
					Description: "Плохое состояние дороги"
				}, {
					EventType: "ROAD_COSNTRUCTION",
					Description: "Ремонт дороги"
				}, {
					EventType: "ROAD_ACCIDENT",
					Description: "Авария"
				}, {
					EventType: "NARROW_ROAD",
					Description: "Узкий проезд"
				}],
				RealtedShippingLocations: [{
					ShippingLocationKey: "",
					Description: ""
				}]
			};
			this._oODataModel.readPromise(this._oODataModel.createKey("/Transportations", {
					TransportationNum: this._oODataModel.getProperty(this._sRoadEventPath + "/Transportation")
				}))
				.then(oTransportation => Promise.all([
					this._oODataModel.readPromise(this._oODataModel.createKey("/ShippingLocations", {
						ShippingLocationKey: oTransportation.ShipFrom
					})),
					this._oODataModel.readPromise(this._oODataModel.createKey("/ShippingLocations", {
						ShippingLocationKey: oTransportation.ShipTo
					}))
				]))
				.then(aResults => {
					oData.RealtedShippingLocations.push(...aResults);
					this._oSecondaryModel.setData(oData);
					//this.refreshMeadiResource();
				});

		},
		refreshMediaResource: function() {
			this._oODataModel.readPromise(this._sMediaResourcePath)
				.then(oMediaResource => this._oSecondaryModel.setProperty("/MediaResource", oMediaResource));
		},
		onTakePhoto: function() {
			this._oODataModel.readPromise(this._sMediaResourcePath)
				.then(oMediaResource => {
					CameraFunctions.getPicture({
							quality: 30,
							destinationType: navigator.camera.DestinationType.FILE_URI
						})
						.then(sFileUri => FileSystemFunctions.resolveLocalFileSystemURL(sFileUri))
						.then(oFileEntry => FileSystemFunctions.getFileFromFileEntry(oFileEntry))
						.then(oFile => FileReaderFunctions.readAsArrayBuffer(oFile))
						.then(aArrayBuffer => fetch(oMediaResource.__metadata.edit_media, {
							method: 'PUT',
							headers: {
								"Accept": "application/json",
								"Content-Type": "image/jpeg",
							},
							body: new Blob([aArrayBuffer], {
								type: 'image/jpeg'
							})
						}))
						.then(oResponse => {
							if (oResponse.ok) {
								/*this._oODataModel.setProperty(this._sRoadEventPath + "/MediaResourceDetails", {
									__metadata: {
										uri: this._sMediaResourcePath.substring(1)
									}
								});*/
								this._oODataModel.setProperty(this._sRoadEventPath + "/MediaResource", "1");
								this.refreshMediaResource();
								MessageToast.show("Фото загружено");
							} else {
								MessageToast.show("Проблема с загрузкой фото");
							}
						});
				});

		},
		onRoadEventSubmit: function() {
			this._oODataModel.submitChangesPromise()
				.then(() => this._oOfflineStore.flush())
				.then(() => this._oOfflineStore.refresh())
				.then(() => MessageToast.show("Дорожное событие отправлено"));
		}
	});
});