sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.OfflineStore", {
		onInit: function() {
			this._oOfflineStore = this.getOwnerComponent()._oOfflineStore;
		},
		onOpenStore: function() {
			this._oOfflineStore.open().then(() => MessageToast.show("Store Opened"));
		},
		onCloseStore: function() {
			this._oOfflineStore.close().then(() => MessageToast.show("Store Closed"));
		},
		onClearStore: function() {
			this._oOfflineStore.clear().then(() => MessageToast.show("Store Cleared"));
		},
		onFlushStore: function() {
			this._oOfflineStore.flush().then(() => MessageToast.show("Store Flushed"));
		}
	});
});