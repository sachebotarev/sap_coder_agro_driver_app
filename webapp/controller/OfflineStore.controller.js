sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"com/pepsico/core/cordova/camera/CameraFunctions",
	"com/pepsico/core/cordova/file/FileSystemFunctions",
	"com/pepsico/core/web/file/FileReader/FileReaderFunctions"
], function(Controller, MessageToast, CameraFunctions, FileSystemFunctions, FileReaderFunctions) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.OfflineStore", {
		onInit: function() {
			this._oOfflineStore = this.getOwnerComponent()._oOfflineStore;
			this._oOdataModel = this.getOwnerComponent().getModel();
			this.getView().setModel(this.getOwnerComponent().getModel());
		},
		onNavBack: function() {
			history.go(-1);
		},
		onOpenStore: function() {
			this._oOfflineStore.open().then(() => {
				MessageToast.show("Store Opened"); 
				sap.OData.applyHttpClient(); 
			});
		},
		onCloseStore: function() {
			this._oOfflineStore.close().then(() => MessageToast.show("Store Closed"));
		},
		onClearStore: function() {
			this._oOfflineStore.clear().then(() => MessageToast.show("Store Cleared"));
		},
		onFlushStore: function() {
			this._oOfflineStore.flush().then(() => MessageToast.show("Store Flushed"));
		},
		onErrorsArchiveRefresh: function() {
			this.getOwnerComponent().getModel().readPromise("/ErrorArchive").then(() => MessageToast.show("ErrorArchive refreshed"));
		},
		onTest: function() {
			this.getOwnerComponent()._oPushNotificationService.sendNotificationAll("test", "test");
			/*debugger;
			let sUuid = this.generateUuid();
			alert(sUuid);
			CameraFunctions.getPicture({
					quality: 30,
					destinationType: navigator.camera.DestinationType.FILE_URI
				})
				.then(sFileUri => FileSystemFunctions.resolveLocalFileSystemURL(sFileUri))
				.then(oFileEntry => FileSystemFunctions.getFileFromFileEntry(oFileEntry))
				.then(oFile => FileReaderFunctions.readAsArrayBuffer(oFile))
				.then(aArrayBuffer => {
					this._oOdataModel.createPromise("/CustomerSet", {
							Tax1: "Z127",
							Name1: "Test",
							Guid: sUuid
							
						})
						.then(oNewCustomer =>  {
							// this._oOfflineStore.getStore().serviceRoot this._oOdataModel.sServiceUrl
							debugger;
							let sUrl =  this._oOfflineStore.getStore().offlineServiceRoot + "OfflineFile1Set";
							fetch(sUrl, {
									method: 'POST',
									headers: {
										"Accept": "application/json",
										"Content-Type": "image/jpeg",
										"slug": sUuid
										//"if-match": oNewMediaResource.__metadata.media_etag
									},
									body: new Blob([aArrayBuffer], {
										type: 'image/jpeg'
									})
								})
								.then(oResponse => {
									if (oResponse.ok) {
										//this._oODataModel.setProperty(this._sRoadEventPath + "/MediaResource", "1");
										//this.refreshMediaResource();
										MessageToast.show("Фото загружено");
									} else {
										MessageToast.show("Проблема с загрузкой фото");
									}
								});
						});
				});*/
		},
		generateUuid: function() {
			var sUuid = "";
			for (var i = 0; i < 32; i++) {
				var iRandomValue = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					sUuid += "-";
				}
				sUuid += (i === 12 ? 4 : (i === 16 ? (iRandomValue & 3 | 8) : iRandomValue)).toString(16);
			}
			return sUuid;
		}
	});
});