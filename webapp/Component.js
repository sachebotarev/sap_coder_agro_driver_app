if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
	jQuery.sap.registerModulePath("com.pepsico.core",
		jQuery.sap.getModulePath("my.sap_coder_agro_driver_app.pepsico_core_library"));
	jQuery.sap.registerModulePath("my.sapui5_components_library",
		"https://raw.githubusercontent.com/ysokol/my_sapui5_components_library/master/src/");
} else {
	jQuery.sap.registerModulePath("com.pepsico.core",
		"https://rawgit.com/ysokol/pepsico_core_library/master/src/");
	jQuery.sap.registerModulePath("my.sapui5_components_library",
		"https://raw.githubusercontent.com/ysokol/my_sapui5_components_library/master/src/");
}
//jQuery.sap.registerModulePath("com.pepsico.core", 
//	"https://rawgit.com/ysokol/pepsico_core_library/master/src/" );
/*"https://rawgit.com/ysokol/pepsico_core_library/master/src/"*/
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"my/sap_coder_agro_driver_app/model/models",
	"my/sap_coder_agro_driver_app/utils/OfflineStore",
	"com/pepsico/core/sap/ui/base/RuntimeException",
	"com/pepsico/core/sap/ui/base/GlobalErrorHandler",
	"my/sap_coder_agro_driver_app/localService/mockserver",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(UIComponent, Device, models, OfflineStore, RuntimeException, GlobalErrorHandler, MockServer, MessageBox, MessageToast) {
	"use strict";

	return UIComponent.extend("my.sap_coder_agro_driver_app.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
				//MockServer.init();
				this._oOfflineStore = models.createOfflineStore();
				this._oOfflineStore.open().then(() => {
						sap.OData.applyHttpClient();
						MessageToast.show("Store Opened");
						return this._oOfflineStore.refresh();
					})
					.then(() => MessageToast.show("Store Refreshed"));
			}
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createOdataModel());
			UIComponent.prototype.init.apply(this, arguments);
			this._oGlobalErrorHandler = new GlobalErrorHandler();
			this._oGlobalErrorHandler.attachError({
				fnHandler: (oEvent) => MessageBox.error((new RuntimeException({
					sMessage: "Unhalded Exception",
					oCausedBy: oEvent.oException
				})).toString())
			});

			this.getRouter().initialize();
		},
		getCurrentUser: function() {
			return "S0004431717";
		}
	});
});