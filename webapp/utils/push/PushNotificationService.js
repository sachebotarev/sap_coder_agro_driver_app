sap.ui.define([
	"sap/ui/base/Object",
	"my/sap_coder_agro_driver_app/utils/push/PushNotificationException"
], function(Object, PushNotificationException) {
	"use strict";
	return Object.extend("my.sap_coder_agro_driver_app.utils.push.PushNotificationService", {
		constructor: function({
			sSmpApplicationId = "",
			sSendNotificationUser = "",
			sSendNotificationPassword = "",
		} = {}) {
			this._sSmpApplicationId = sSmpApplicationId;
			this._sSendNotificationUser = sSendNotificationUser;
			this._sSendNotificationPassword = sSendNotificationPassword;
			this._aHandlers = new Map();
		},

		init: function() {
			var nTypes = sap.Push.notificationType.SOUNDS | sap.Push.notificationType.ALERT;
			var that = this;
			return new Promise(function(fnResolve, fnReject) {
				sap.Push.registerForNotificationTypes(nTypes,
					fnResolve,
					(oError) =>  {
						alert("registerForNotificationTypes failed");
						fnReject(new PushNotificationException({
							sMessage: "registerForNotificationTypes failed",
							oCausedBy: oError
						})); 
					},
					/*processNotification*/
					$.proxy(that.onProcessNotification, that),
					null /* optional GCM Sender ID */ );
				sap.Push.initPush($.proxy(that.onProcessNotification, that));
			});
		},

		attachProcessNotification: function({
			fnHandler = undefined,
			oListener = null,
			oData = {}
		} = {}) {
			this._aHandlers.set(fnHandler, {
				fnHandler: fnHandler.bind(oListener || {}),
				oListener: oListener,
				oData: oData
			});
		},
		
		detachProcessNotification: function(fnHandler) {
			this._aHandlers.delete(fnHandler);
		},

		sendNotificationAll: function(sTitle, sData) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var mRequestData = {
					"alert": sTitle,
					"data": sData
				};

				var sRequestData = JSON.stringify(mRequestData);

				var oRequest = {
					"async": true,
					"crossDomain": true,
					"url": "https://hcpms-s0004431717trial.hanatrial.ondemand.com/restnotification/application/" + that._sSmpApplicationId + "/",
					"method": "POST",
					"headers": {
						"Authorization": "Basic czAwMDQ0MzE3MTc6WnNlNHJmdmcjMQ==",
						"Accept-Encoding": "gzip, deflate",
						"Accept": "*/*",
						"Content-Length": sRequestData.length,
						"Content-Type": "application/json",
						"Cache-Control": "no-cache"
					},
					"processData": false,
					"data": sRequestData
				};

				$.ajax(oRequest)
					.done(function(oData, sTextStatus, oJqXHR) {
						resolve(oData);
					})
					.fail(function(oJqXHR, sTextStatus, oErrorThrown) {
						reject(new PushNotificationException({
							sMessage: "failed sendNotificationAll",
							oCausedBy: oErrorThrown
						} ));
					});
			});
		},

		onProcessNotification: function(oNotification) {
			this._aHandlers.forEach((oValue, oKey, oMap) => {
				oValue.fnHandler(oNotification);
			});

			/*var that = this;
			sap.m.MessageBox.confirm("New Notification: " + oNotification.title + ".\r\n" + "Navigate to Sales Order?", {
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that._oUiComponent.getRouter().navTo("SalesOrder", {
								objectPath: oNotification.data
							});
						}
						that.setPushFeedbackStatus('consumed', oNotification.additionalData.notificationId);
					}
				});*/

		},

		setPushFeedbackStatus: function(sStatus, sNotificationId) {
			return new Promise(function(resolve, reject) {
				sap.Push.setPushFeedbackStatus(sStatus, sNotificationId,
					function(sStatus) {
						resolve(sStatus);
					},
					function(oException) {
						reject(new MyException("PushNotificationService", "Failed setPushFeedbackStatus()", oException));
					});
			});
		}

	});
});