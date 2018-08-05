sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/pepsico/core/sap/ui/model/odata/v2/ODataModel",
	"com/pepsico/core/cordova/camera/CameraFunctions",
	"com/pepsico/core/cordova/file/FileSystemFunctions",
	"com/pepsico/core/web/file/FileReader/FileReaderFunctions",
	"sap/ui/model/json/JSONModel",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sap_coder_agro_driver_app/view/TransportationMapViewBuilder"
], function(Controller, ODataModel, CameraFunctions, FileSystemFunctions, FileReaderFunctions, JSONModel, YandexMap,
	TransportationMapViewBuilder) {
	"use strict";

	return Controller.extend("my.sap_coder_agro_driver_app.controller.Transportation", {
		onInit: function() {
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oScreenModel = new JSONModel({
				Transportation: {
					
				},
				Chat: {
					Messages: []
				}
			});
			this._oYandexMap = new YandexMap(this.byId("yandexMapId").getId());
			this._sTransportationPath = undefined;
			this.getView().setModel(this._oScreenModel);
			this.getOwnerComponent().getRouter().getRoute("Transportation").attachPatternMatched(this.onRouterObjectMatched, this);
			this._oYandexMap.createMapControl()
				.then(() => {
					let oTransportationMapViewBuilder = new TransportationMapViewBuilder(this._oYandexMap, this);
					oTransportationMapViewBuilder.buildMapView();

					this._oYandexMap.bindElement(new sap.ui.model.Context(this._oScreenModel, "/Transportation"));
				});
			$.getScript("https://unpkg.com/@pusher/chatkit/dist/web/chatkit.js", () => {
				this.refreshChat();
			});
		},
		onRouterObjectMatched: function(oEvent) {
			let sObjectPath = oEvent.getParameter("arguments").sObjectPath;
			if (sObjectPath && sObjectPath !== "") {
				this._sTransportationPath = "/" + sObjectPath;
				this.refreshScreenModel();
			}
		},
		refreshChat: function() {
			const oTokenProvider = new Chatkit.TokenProvider({
					url: "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/581182a8-e5bc-46db-95f9-0fa82fa3974d/token"
				});
				const oChatManager = new Chatkit.ChatManager({
					instanceLocator: "v1:us1:581182a8-e5bc-46db-95f9-0fa82fa3974d",
					userId: "dispatcher",
					tokenProvider: oTokenProvider
				});
				oChatManager
					.connect()
					.then(currentUser => {
						currentUser.subscribeToRoom({
							roomId: currentUser.rooms[0].id,
							hooks: {
								onNewMessage: message => {
									let aMessages = this._oScreenModel.getObject("/Chat/Messages");
									aMessages.push({
										MessageDateTime: new Date(),
										MessageTitle: "titel",
										MessageText: message.text,
										UserName: message.senderId
									});
									this._oScreenModel.setProperty("/Chat/Messages", aMessages);
								}
							}
						});
					});
		},
		refreshScreenModel: function() {
			this._oODataModel.readPromise(this._sTransportationPath, {
					urlParameters: {
						'$expand': `ShippingLocationDetails,
									ShippingLocationDetails1,
									TransportationMessageLogDetails,
									TruckDetails,
									TruckDetails/CarrierDetails,
									MediaResourceDetails`
					}
				})
				.then(oTransportation => this._oScreenModel.setProperty("/Transportation", oTransportation))
				.then(() => this._oODataModel.readPromise("/TransportationAssignments", {
					urlParameters: {
						"$expand": "TruckDetails",
						"$filter": "TruckDetails/Driver eq '" + this.getOwnerComponent().getCurrentUser() +
							"' and Transportation eq '" + this._oScreenModel.getProperty("/Transportation/TransportationNum") + "'"
					}
				}))
				.then(aAssignmentDetails => {
					this._oScreenModel.setProperty("/Transportation/Truck", aAssignmentDetails.results[0].Truck);
					this._oScreenModel.setProperty("/Transportation/TruckDetails", aAssignmentDetails.results[0].TruckDetails);
				});
		},
		
		onAddRoadEvent: function(oEvent) {
			let sNewRoadEventUuid = this.generateUuid();
			this._oODataModel.createPromise("/RoadEvents", {
					RoadEventUuid: sNewRoadEventUuid,
					EventDateTime: new Date(),
					GeoLocation: "",
					Transportation: this._oODataModel.getProperty(this._sTransportationPath).TransportationNum,
					Truck: this._oODataModel.getProperty(this._sTransportationPath).Truck
						//Driver: "TBD"
				})
				.then((oNewRoadEvent) => {
					if (document.URL.indexOf('http://') === -1 && document.URL.indexOf(
							'https://') === -1) {
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