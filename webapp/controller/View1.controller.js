sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"my/sap_coder_agro_driver_app/utils/FileSystemService"
], function(Controller, ODataModel, FileSystemService) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.View1", {
		onInit: function() {
			//this._oJSONModel = new sap.ui.model.json.JSONModel();
			if (document.URL.indexOf('http://') === -1 && document.URL.indexOf(
					'https://') === -1) {
				this.oODataModel = new ODataModel(
					"https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_agro_transp_mangm_odata", {
						json: true,
						useBatch: false,
						defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
						defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put,
						loadMetadataAsync: false,
						tokenHandling: true
					}
				);
			} else {
				this.oODataModel = new ODataModel(
					"/odata", {
						json: true,
						useBatch: false,
						defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
						defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put,
						loadMetadataAsync: false,
						tokenHandling: true
					}
				);
			}
			this.getView().setModel(this.oODataModel);
		},
		onLoadImage: function() {
			debugger;
			//this.getOwnerComponent()._oOfflineStore.registerStreamRequest();
			let that = this;
			this.oODataModel.read("/MediaResources('1')", {
				success: function(data, request) {
					alert(JSON.stringify(data, null, 4));
					that.getView().byId("TextId").setText(data.__metadata.media_src);
					that.getView().byId("ImageId").setSrc(data.__metadata.media_src);
				}
			});
			/*if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
				this.getView().byId("ImageId").setSrc("https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_agro_transp_mangm_odata/MediaResources('1')/$value");
			} else {
				this.getView().byId("ImageId").setSrc("/odata/MediaResources('1')/$value");
			}*/

		},
		captureSingleImage: function() {
			// start image capture

		},
		onTakePhoto: function() {
			let that = this;
			let oData = this.oODataModel.getObject("/MediaResources('1')");
			let oFileSystemService = new FileSystemService();
			debugger;
			navigator.camera.getPicture((sFile) => {
				var filename = sFile.replace(/^.*[\\\/]/, '');
				oFileSystemService.openFile("file:///storage/emulated/0/Android/data/my.agro.transportation.management.driver.app/cache/", filename)
				.then(fileEntry => oFileSystemService.readFileAsBlob(fileEntry))
				.then(oBlob => {
					let xhr = new XMLHttpRequest();
					xhr.open("PUT", oData.__metadata.edit_media, true);
					xhr.setRequestHeader("Accept", "application/json");
					xhr.setRequestHeader("Content-Type", "image/jpeg");
					//xhr.setRequestHeader("if-match", oData.__metadata.media_etag);
					xhr.onreadystatechange = function() {
						if (xhr.readyState === 4) {
							if (xhr.status === 204) {
								alert("Media updated. Src: " + oData.__metadata.media_src);
							} else {
								alert("Update failed! Status: " + xhr.status);
							}
						}
					};
					xhr.send(oBlob);
	
					/*let xhr2 = new XMLHttpRequest();
					xhr2.open("PUT", "https://agrotrnspmngms0004431717trial.hanatrial.ondemand.com/MyOrders/odata/MediaResources('1')/$value", true);
					xhr2.setRequestHeader("Content-Type", "image/jpeg");
					xhr2.send(oBlob);*/
				});

				
			}, () => {}, {
				quality: 50,
				destinationType: navigator.camera.DestinationType.FILE_URI
			});
		},
		onInitStore: function() {
			this.getOwnerComponent()._oOfflineStore.init();
		},
		onOpenStore: function() {
			this.getOwnerComponent()._oOfflineStore.openStore();
		},
		onCloseStore: function() {
			this.getOwnerComponent()._oOfflineStore.closeStore();
		},
		onClearStore: function() {
			this.getOwnerComponent()._oOfflineStore.clearStore();
		},
		onFlushStore: function() {
			this.getOwnerComponent()._oOfflineStore.flushStore();
		}
	});
});