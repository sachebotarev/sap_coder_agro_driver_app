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
			this.getView().setModel(this._oODataModel);
			this.getView().setModel(this._oSecondaryModel, "secondaryModel");
			this.getOwnerComponent().getRouter().getRoute("RoadEvent").attachPatternMatched(this.onRouterObjectMatched, this);

		},
		onNavBack: function() {
			history.go(-1);
		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this.getView().bindElement({
					path: "/" + sObjectPath,
					parameters: {
						expand: `MediaResourceDetails`
					}
				});
				this._sRoadEventPath = "/" + sObjectPath;
				this.prepareScreenModels();
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
			this._oODataModel.readPromise(this._oODataModel.getProperty(this._sRoadEventPath + "/MediaResourceDetails"))
				.then(oMediaResource => this._oSecondaryModel.setProperty("/MediaResource", oMediaResource));
		},
		onTakePhoto: function() {
			let sMediaResourceUuid = this.generateUuid();
			//this._oODataModel.readPromise(this._sMediaResourcePath)
			//	.then(oMediaResource => {
			sap.ui.core.BusyIndicator.show(0);
			CameraFunctions.getPicture({
					quality: 30,
					destinationType: navigator.camera.DestinationType.FILE_URI
				})
				.then(sFileUri => FileSystemFunctions.resolveLocalFileSystemURL(sFileUri))
				.then(oFileEntry => FileSystemFunctions.getFileFromFileEntry(oFileEntry))
				.then(oFile => FileReaderFunctions.readAsArrayBuffer(oFile))
				.then(aArrayBuffer => {
					this._oODataModel.createPromise("/MediaResources", {
							MediaResourceUuid: sMediaResourceUuid
						})
						.then(oNewMediaResource => {
							//this._oODataModel.setProperty(oMediaResource.__metadata.uri + "/MimeType", "124");
							//this._oODataModel.submitChangesPromise().then(() => { debugger; });
							fetch(oNewMediaResource.__metadata.edit_media, {
									method: 'PUT',
									headers: {
										"Accept": "application/json",
										"Content-Type": "image/jpeg",
										"if-match": oNewMediaResource.__metadata.media_etag
									},
									body: new Blob([aArrayBuffer], {
										type: 'image/jpeg'
									})
								})
								.then(oResponse => {
									if (oResponse.ok) {
										this._oODataModel.setProperty(this._sRoadEventPath + "/MediaResourceDetails", {
											__metadata: {
												uri: oNewMediaResource.__metadata.uri.substring(1),
												media_src: oNewMediaResource.__metadata.media_src
											}
										});
										this._oODataModel.setProperty(this._sRoadEventPath + "/MediaResource", sMediaResourceUuid);
										//this.refreshMediaResource();
										sap.ui.core.BusyIndicator.hide();
										MessageToast.show("Фото загружено");
									} else {
										sap.ui.core.BusyIndicator.hide();
										MessageToast.show("Проблема с загрузкой фото");
									}
								});
						});
				});

			//});

		},
		/*onTakePhotoOld: function() {
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
								this._oODataModel.setProperty(this._sRoadEventPath + "/MediaResource", "1");
								this.refreshMediaResource();
								MessageToast.show("Фото загружено");
							} else {
								MessageToast.show("Проблема с загрузкой фото");
							}
						});
				});

		},*/
		onRoadEventSubmit: function() {
			sap.ui.core.BusyIndicator.show(0);
			this._oODataModel.setProperty(this._sRoadEventPath + "/Status", "CREATED");
			this._oODataModel.submitChangesPromise()
				.then(() => this._oOfflineStore.flush())
				.then(() => this._oOfflineStore.refresh())
				.then(() => {
					sap.ui.core.BusyIndicator.hide();
					this.onNavBack();
					MessageToast.show("Дорожное событие отправлено");
				});
		},
		generateUuid: function() {
			var uuid = "",
				i, random;
			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;

				if (i == 8 || i == 12 || i == 16 || i == 20) {
					uuid += "-";
				}
				uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
			}
			return uuid;
		}
	});
});