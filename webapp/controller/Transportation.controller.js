sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/pepsico/core/sap/ui/model/odata/v2/ODataModel",
	"com/pepsico/core/cordova/camera/CameraFunctions",
	"com/pepsico/core/cordova/file/FileSystemFunctions",
	"com/pepsico/core/web/file/FileReader/FileReaderFunctions",
	"sap/ui/model/json/JSONModel",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_driver_app/view/TransportationMapViewBuilder",
	"my/sap_coder_agro_driver_app/model/formatter",
	"my/sap_coder_agro_driver_app/model/PlanningCalendarFunctions",
	"sap/m/MessageToast",
], function(Controller, ODataModel, CameraFunctions, FileSystemFunctions, FileReaderFunctions, JSONModel, YandexMap,
	TransportationMapViewBuilder, formatter, planningCalendarFunctions, MessageToast) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.Transportation", {
		formatter: formatter,
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oOfflineStore = this.getOwnerComponent()._oOfflineStore;
			this._oYandexMap = new YandexMap(this.byId("yandexMapId").getId());
			this._sTransportationPath = undefined;
			this._oWorkflowService = this.getOwnerComponent()._oWorkflowService;
			this._oScreenModel = new JSONModel({
				Transportation: {},
				Chat: {
					Messages: [],
					UnreadMessagesCount: 0,
					IsInFocus: false
				},
				Timeline: {},
				Workflow: {
					TaskId: ""
				}
			});
			this.getView().setModel(this._oScreenModel);
			this.getOwnerComponent().getRouter().getRoute("Transportation").attachPatternMatched(this.onRouterObjectMatched, this);
			this._oYandexMap.createMapControl()
				.then(() => {
					let oTransportationMapViewBuilder = new TransportationMapViewBuilder(this._oYandexMap, this);
					oTransportationMapViewBuilder.buildMapView();

					this._oYandexMap.bindElement(new sap.ui.model.Context(this._oScreenModel, "/Transportation"));
				});
			this._oChatManagerLoaded = $.Deferred();
			//$.getScript("https://unpkg.com/@pusher/chatkit/dist/web/chatkit.js", () => {
				const oTokenProvider = new Chatkit.TokenProvider({
					url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/581182a8-e5bc-46db-95f9-0fa82fa3974d/token"
				});
				this._oChatManager = new Chatkit.ChatManager({
					instanceLocator: "v1:us1:581182a8-e5bc-46db-95f9-0fa82fa3974d",
					userId: this.getOwnerComponent().getCurrentUser(),
					tokenProvider: oTokenProvider
				});
				this._oChatManagerLoaded.resolve();
			//});

			this.byId("chatIconTabFilterId").addEventDelegate({
				onfocusout: () => {
					this._oScreenModel.setProperty("/Chat/IsInFocus", false);
				}
			});
			this.byId("chatIconTabFilterId").addEventDelegate({
				onfocusin: () => {
					this._oScreenModel.setProperty("/Chat/IsInFocus", true);
					this._oScreenModel.setProperty("/Chat/UnreadMessagesCount", 0);
				}
			});
		},
		convertGeoLocation: function (sGeoLocation) {
			let aGeoLocationCoordinates = [0, 0];
			aGeoLocationCoordinates[0] = Number(sGeoLocation.split(",")[0].trim());
			aGeoLocationCoordinates[1] = Number(sGeoLocation.split(",")[1].trim());
			return aGeoLocationCoordinates;
		},
		onOpenInNavigator: function() {
			let sFromGeoLocation = this._oScreenModel.getProperty("/Transportation/TruckDetails/GeoLocation");
			let sToGeoLocation = this._oScreenModel.getProperty("/Transportation/ShippingLocationDetails/GeoLocation");
			window.open("yandexnavi:build_route_on_map?" + 
				"lat_from=" + this.convertGeoLocation(sFromGeoLocation)[0] + 
				"&lon_from=" + this.convertGeoLocation(sFromGeoLocation)[1] + 
				"0&lat_to=" + this.convertGeoLocation(sToGeoLocation)[0] +
				"&lon_to=" + this.convertGeoLocation(sToGeoLocation)[1], "_system");	
		},
		onNavBack: function() {
			history.go(-1);
		},
		onViewRefresh: function() {
			this._oOfflineStore.flush()
				.then(() => this._oOfflineStore.refresh())
				.then(() => this.refreshScreenModel())
				.then(() => this.byId("PullToRefreshId").hide());
		},
		ShippingLocationDetailsNav: function(sShippingLocationKey) {
			this.getOwnerComponent().getRouter().navTo("ShippingLocation", {
				sObjectPath: "ShippingLocations('" + sShippingLocationKey + "')"
			});
		},
		onTransportationAccept: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			this._oWorkflowService.patchContext(this._oScreenModel.getProperty("/Transportation/WorkflowInstanceId"), {
					oTransportation: {
						sAcceptedDriver: this.getOwnerComponent().getCurrentUser()
					}
				})
				.then(() => this._oWorkflowService.completeTask(this._oScreenModel.getProperty("/Workflow/TaskId")))
				.then(() => MessageToast.show("Подтверждение отправлено"));

			this.getOwnerComponent()._oPushNotificationDeferred = $.Deferred();
			$.when(this.getOwnerComponent()._oPushNotificationDeferred)
				.done((oNotification) => {
					sap.OData.removeHttpClient();
					this._oODataModel.callFunctionExt("/ProcessTruckStatusChange", "POST", {
						TruckNum: this.getOwnerComponent().getCurrentTruck(),
						NewStatus: "BUSY"
					})
						.then(() => sap.OData.applyHttpClient())
						.then(() => this._oOfflineStore.flush())
						.then(() => this._oOfflineStore.refresh())
						.then(() => this.refreshScreenModel())
						.then(() => {
							sap.ui.core.BusyIndicator.hide();
							MessageToast.show("Подтверждение получено");
						});
				});
		},
		onTransportationCompleted: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			this._oWorkflowService.completeTask(this._oScreenModel.getProperty("/Workflow/TaskId"))
				.then(() => {
					MessageToast.show("Подтверждение отправлено");
					sap.OData.removeHttpClient();
					this._oODataModel.callFunctionExt("/ProcessTruckStatusChange", "POST", {
						TruckNum: this.getOwnerComponent().getCurrentTruck(),
						NewStatus: "READY"
					})
						.then(() => sap.OData.applyHttpClient())
						.then(() => this._oOfflineStore.flush())
						.then(() => this._oOfflineStore.refresh())
						.then(() => this.getOwnerComponent().getRouter().navTo("TransportationList"));
				});
		},
		onTransportationReject: function(oEvent) {

		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this._sTransportationPath = "/" + sObjectPath;
				this.refreshScreenModel();
			}
		},
		connectToChatRoom: function() {
			this._oScreenModel.setProperty("/Chat/IsConnected", true);
			this._oScreenModel.setProperty("/Chat/UnreadMessagesCount", 0);
			this._oScreenModel.setProperty("/Chat/Messages", []);
			this._oChatManager
				.connect()
				.then(currentUser => {
					this._oChatCurrentUser = currentUser;
					currentUser.subscribeToRoom({
						roomId: parseInt(this._oScreenModel.getProperty("/Transportation/PusherRoomId")),
						hooks: {
							onNewMessage: message => {
								let aMessages = this._oScreenModel.getObject("/Chat/Messages");
								aMessages.push({
									MessageDateTime: Date.parse(message.createdAt),
									//MessageTitle: "написал",
									MessageText: message.text,
									UserName: message.sender.name + " (" + message.senderId + ")"
								});
								if (aMessages.length > 4) {
									aMessages.shift();
								}
								this._oScreenModel.setProperty("/Chat/Messages", aMessages);
								if (this._oScreenModel.getProperty("/Chat/IsInFocus") === false && this._oScreenModel.getProperty(
										"/Chat/UnreadMessagesCount") < 4) {
									this._oScreenModel.setProperty("/Chat/UnreadMessagesCount",
										this._oScreenModel.getProperty("/Chat/UnreadMessagesCount") + 1);
									if (message.senderId !== this.getOwnerComponent().getCurrentUser()) {
										MessageToast.show("Поступило новое сообщение к заказу № " + this._oScreenModel.getProperty(
											"/Transportation/TransportationNum"));
									}
								}

							}
						}
					});
				});
		},
		onChatSendMessage: function() {
			if (!this._oScreenModel.getProperty("/Chat/NewMessage")) {
				return;
			}
			this._oChatCurrentUser.sendMessage({
				text: this._oScreenModel.getProperty("/Chat/NewMessage"),
				roomId: parseInt(this._oScreenModel.getProperty("/Transportation/PusherRoomId"))
			});
			this._oScreenModel.setProperty("/Chat/NewMessage", "");
		},
		refreshScreenModel: function() {
			return new Promise((fnResolve, fnReject) => {
				this._oODataModel.readPromise(this._sTransportationPath, {
						urlParameters: {
							'$expand': `ShippingLocationDetails,
									ShippingLocationDetails1,
									TransportationMessageLogDetails,
									TruckDetails,
									TruckDetails/CarrierDetails,
									MediaResourceDetails,
									TransportationItemDetails`
						}
					})
					.then(oTransportation => {
						this._oScreenModel.setProperty("/Transportation", oTransportation);
						this._oScreenModel.setProperty("/Transportation/ShippingLocationDetails/ProcessingTimeScore", 2);
						this._oScreenModel.setProperty("/Transportation/ShippingLocationDetails1/ProcessingTimeScore", 4);
						if (!this._oScreenModel.getProperty("/Chat/IsConnected")) {
							this._oChatManagerLoaded.done(() => this.connectToChatRoom());
						}
						this._oODataModel.readPromise("/RoadEvents", {
								urlParameters: {
										"$filter": "ShippingLocation eq '" + oTransportation.ShipFrom + "'"
								}
							})
							.then((aRoadEvents) => aRoadEvents.results && this._oScreenModel.setProperty("/Transportation/ShippingLocationDetails/RoadEventCount", 
								aRoadEvents.results.length + 1 - 1))
							.catch(() => {});
					})
					.then(() => this._oODataModel.readPromise("/TransportationAssignments", {
						urlParameters: {
							"$expand": `TruckDetails`,
							"$filter": "TruckDetails/Driver eq '" + this.getOwnerComponent().getCurrentUser() +
								"' and Transportation eq '" + this._oScreenModel.getProperty("/Transportation/TransportationNum") + "'"
						}
					}))
					.then(aAssignmentDetails => {
						this._oScreenModel.setProperty("/Transportation/Truck", aAssignmentDetails.results[0].Truck);
						this._oScreenModel.setProperty("/Transportation/TruckDetails", aAssignmentDetails.results[0].TruckDetails);
						for (let sProperty in aAssignmentDetails.results[0]) {
							if (sProperty.indexOf("DateTime") !== -1 || sProperty.indexOf("TimeMinutes") !== -1 || sProperty.indexOf("MileageKm")  !== -1) {
								this._oScreenModel.setProperty("/Transportation/" + sProperty, aAssignmentDetails.results[0][sProperty]);
							}
						}
						if (aAssignmentDetails.results[0].Status === "REJECTED") {
							this._oScreenModel.setProperty("/Transportation/Status", "090.REJECTED");
						}
						this._oScreenModel.setProperty("/Timeline", planningCalendarFunctions.convertTranportations([this._oScreenModel.getProperty(
							"/Transportation")]));
						// read workflow task ID for current transportation
						this._oWorkflowService.getOpenedTasksByUser(this.getOwnerComponent().getCurrentUser())
							.then(aTasks => aTasks.forEach(oTask => {
								this._oWorkflowService.getTaskContext(oTask.id).then(oTaskContext => {
									if (oTaskContext.oTransportation.sTransportationNum === this._oScreenModel.getProperty(
											"/Transportation/TransportationNum")) {
										//this._oWorkflowService.getTaskDetails(oTask.id)
										this._oScreenModel.setProperty("/Workflow/TaskId", oTask.id);
									}
								});
							}));
						fnResolve();
						sap.ui.core.BusyIndicator.hide();
					});
			});
		},

		onAddRoadEvent: function(oEvent) {
			let sNewRoadEventUuid = this.generateUuid();
			this._oODataModel.createPromise("/RoadEvents", {
					RoadEventUuid: sNewRoadEventUuid,
					EventDateTime: new Date(),
					GeoLocation: "",
					Transportation: this._oODataModel.getProperty(this._sTransportationPath).TransportationNum,
					Truck: this._oODataModel.getProperty(this._sTransportationPath).Truck,
					Driver: this.getOwnerComponent().getCurrentUser()
				})
				.then((oNewRoadEvent) => {
					if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
						this.getOwnerComponent().getRouter().navTo("RoadEvent", {
							sObjectPath: this._oODataModel.getRelatedPath(oNewRoadEvent.__metadata.uri).slice(1)
						});
					} else {
						this.getOwnerComponent().getRouter().navTo("RoadEvent", {
							sObjectPath: this._oODataModel.createKey("/RoadEvents", {
								RoadEventUuid: sNewRoadEventUuid
							}).slice(1)
						});
					}
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

		/*,
		onLoadImage: function() {
			//this.getOwnerComponent()._oOfflineStore.registerStreamRequest();
			let that = this;
			this._oODataModel.readPromise("/MediaResources('1')").then(oData => {
					alert(JSON.stringify(oData, null, 4));
					that.getView().byId("TextId").setText(oData.__metadata.media_src);
					that.getView().byId("ImageId").setSrc(oData.__metadata.media_src);
				});
		},
		onTakePhoto: function() {
			let that = this;
			let oData = this._oODataModel.getObject("/MediaResources('1')");
			debugger;
			CameraFunctions.getPicture({
					quality: 50,
					destinationType: navigator.camera.DestinationType.FILE_URI
				})
				.then(sFileUri => FileSystemFunctions.resolveLocalFileSystemURL(sFileUri))
				.then(oFileEntry => FileSystemFunctions.getFileFromFileEntry(oFileEntry))
				.then(oFile => FileReaderFunctions.readAsArrayBuffer(oFile))
				.then(aArrayBuffer => fetch(oData.__metadata.edit_media, {
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
						alert("Media updated. Src: " + oData.__metadata.media_src);
					} else {
						alert("Update failed! Status: " + oResponse.status);
					}
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
		}*/
	});
});

/*this._oODataModel.metadataLoaded()
	.then(() => {
		this.getView().bindElement({
			path: "/" + sObjectPath,
			parameters: {
				expand: `ShippingLocationDetails,
						ShippingLocationDetails1,
						TransportationMessageLogDetails,
						TransportationAssignmentDetails/TruckDetails/CarrierDetails,
						TransportationLocationAssignmentDetails/ShippingLocationDetails,
						TruckDetails,
						TruckDetails/CarrierDetails,
						MediaResourceDetails`
			}
		});
		this._sTransportationPath = "/" + sObjectPath;

	});*/
/*$.when(this._oYandexMapApiInitialized)
			.done((oYmaps) => this.bindMap("/" + sObjectPath));
		this.bindCalendar("/" + sObjectPath);*/