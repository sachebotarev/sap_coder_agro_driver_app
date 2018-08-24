if (window.cordova) {
	jQuery.sap.registerModulePath("com.pepsico.core", jQuery.sap.getModulePath("my.sap_coder_agro_driver_app.pepsico_core_library"));
	jQuery.sap.registerModulePath("my.sapui5_components_library", jQuery.sap.getModulePath("my.sap_coder_agro_driver_app.my_sapui5_components_library"));
} else {
	jQuery.sap.registerModulePath("com.pepsico.core",
		"https://rawgit.com/ysokol/pepsico_core_library/master/src/");
	jQuery.sap.registerModulePath("my.sapui5_components_library",
		"https://rawgit.com/ysokol/my_sapui5_components_library/master/src/");
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
	"sap/m/MessageToast",
	"my/sap_coder_agro_driver_app/utils/workflow/WorkflowService",
	"my/sap_coder_agro_driver_app/utils/push/PushNotificationService"
], function(UIComponent, Device, models, OfflineStore, RuntimeException, GlobalErrorHandler, MockServer, MessageBox, MessageToast,
	WorkflowService, PushNotificationService) {
	"use strict";

	return UIComponent.extend("my.sap_coder_agro_driver_app.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			sap.ui.core.BusyIndicator.show(0);
			$.getScript("https://unpkg.com/@pusher/chatkit/dist/web/chatkit.js");
			this._oGlobalErrorHandler = new GlobalErrorHandler();
			this._oGlobalErrorHandler.attachError({
				fnHandler: (oEvent) => MessageBox.error((new RuntimeException({
					sMessage: "Unhalded Exception",
					oCausedBy: oEvent.oException
				})).toString())
			});

			this._oPushNotificationService = new PushNotificationService({
				sSmpApplicationId: "my.agro.transportation.management.driver.app"
			});
			this._oOfflineStoreDeferred = $.Deferred();
			if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
				//MockServer.init();
				this._oOfflineStore = models.createOfflineStore();
				
				//this._oOfflineStore = models.createOfflineStoreCeluweb();
				this._oOfflineStore.open().then(() => {
						sap.OData.applyHttpClient();
						//MessageToast.show("Данные Открыты");
						return this._oOfflineStore.refresh();
					})
					.then(() => this._oOfflineStoreDeferred.resolve())
					.then(() => MessageToast.show("Данные по Заказам обновлены!"));
				this._oWorkflowService = new WorkflowService({
					sWorkflowServiceUrl: "https://bpmworkflowruntimewfs-s0004431717trial.hanatrial.ondemand.com/workflow-service/rest/v1",
					oCustomHttpHeaders: {
						Authorization: "Bearer 84e2df6c6f2ee8f9e9f347757969f46"
					}
				});
				this._oPushNotificationService.init().then(() => MessageToast.show("Push Notifications initialised"));
				this._oPushNotificationService.attachProcessNotification({
					fnHandler: this.onPushNotificationReceived,
					oListener: this
				});
				this._oPushNotificationDeferred = null;
			} else {
				this._oWorkflowService = new WorkflowService({
					//sWorkflowServiceUrl: "https://bpmworkflowruntimewfs-s0004431717trial.hanatrial.ondemand.com/workflow-service/rest/v1",
					sWorkflowServiceUrl: "/bpmworkflowruntime/rest/v1",
					oCustomHttpHeaders: {
						Authorization: "Bearer 84e2df6c6f2ee8f9e9f347757969f46"
					}
				});
				this._oOfflineStoreDeferred.resolve();
			}

			this.setModel(models.createOdataModel());
			this.setModel(models.createSystemModel(), "SystemModel");
			//this.setModel(models.createOdataModelCeluweb());
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();
		},
		onPushNotificationReceived: function(oNotification) {
			if (this._oPushNotificationDeferred) {
				this._oPushNotificationDeferred.resolve(oNotification);
			}
			if (oNotification.sNotificationType === "TRANSPORTATION_REQUEST") {
				sap.OData.removeHttpClient();
				this.getModel().callFunctionExt("/ConfirmReceiveTransportationRequest", "POST", {
						TransportationNum: oNotification.sTransportationNum,
						Driver: this.getCurrentUser(),
					})
					.then(() => sap.OData.applyHttpClient())
					.then(() => MessageBox.information(
						"Поступил новый заказ на транспортировку № " + oNotification.sTransportationNum + ". Перейти к заказу?", {
							actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
							onClose: (sAction) => {
								if (sAction === sap.m.MessageBox.Action.OK) {
									sap.ui.core.BusyIndicator.show(0);
									this._oOfflineStore.flush()
										.then(() => this._oOfflineStore.refresh())
										.then(() => {
											sap.OData.removeHttpClient();
											return this.getModel().callFunctionExt("/ConfirmReadTransportationRequest", "POST", {
												TransportationNum: oNotification.sTransportationNum,
												Driver: this.getCurrentUser(),
											});
										})
										.then(() => sap.OData.applyHttpClient())
										.then(() => this.getRouter().navTo("Transportation", {
											sObjectPath: "Transportations('" + oNotification.sTransportationNum + "')"
										}));
								} else {
									this._oOfflineStore.flush()
										.then(() => this._oOfflineStore.refresh())
										.then(() => MessageToast.show("Данные заказа получены и могут быть просмотрены позднее"));
								}
							}
						}
					));

			}
		},
		getCurrentUser: function() {
			return this.getModel("SystemModel").getProperty("/currentUser");//return "S0004431717";
		},
		getCurrentTruck: function() {
			return this.getModel("SystemModel").getProperty("/truck");
		}
	});
});