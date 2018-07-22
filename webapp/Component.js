jQuery.sap.registerModulePath("com.pepsico.core", "https://rawgit.com/ysokol/pepsico_core_library/master/src/");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"my/sap_coder_agro_driver_app/model/models",
	"my/sap_coder_agro_driver_app/utils/OfflineStore",
	"com/pepsico/core/sap/ui/base/RuntimeException",
	"com/pepsico/core/sap/ui/base/GlobalErrorHandler",
	"my/sap_coder_agro_driver_app/localService/mockserver",
], function(UIComponent, Device, models, OfflineStore, RuntimeException, GlobalErrorHandler, MockServer) {
	"use strict";

	return UIComponent.extend("my.sap_coder_agro_driver_app.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			this._oOfflineStore = new OfflineStore(this);
			
			if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
				MockServer.init(); 
			}
			UIComponent.prototype.init.apply(this, arguments);
			this.setModel(models.createDeviceModel(), "device");
			this._oGlobalErrorHandler = new GlobalErrorHandler();
			this._oGlobalErrorHandler.attachError({
				fnHandler: (oEvent) => alert((new RuntimeException({
					sMessage: "Unhalded Exception",
					oCausedBy:oEvent.oException
				})).toString())
			});                         
		}
	});
});