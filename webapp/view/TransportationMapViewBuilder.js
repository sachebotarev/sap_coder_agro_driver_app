sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_components_library/yandex/maps/YandexMap",
	"my/sapui5_components_library/yandex/maps/MapPlacemark",
	"my/sapui5_components_library/yandex/maps/PlacemarkDetail",
	"my/sapui5_components_library/yandex/maps/PlacemarkAction",
	"my/sapui5_components_library/yandex/maps/MapPlacemarkCollection",
	"my/sapui5_components_library/yandex/maps/MapRoute"
], function(Object, YandexMap, MapPlacemark, PlacemarkDetail, PlacemarkAction, MapPlacemarkCollection, MapRoute) {
	"use strict";
	/*eslint-env es6*/
	/*global ymaps*/

	// https://tech.yandex.ru/maps/jsbox/2.1/object_manager_spatial
	return Object.extend("my.sap_coder_agro_wf_drivers_app.view.TransportationMapViewBuilder", {
		constructor: function(oYandexMap, oController) {
			Object.apply(this);
			this._oYandexMap = oYandexMap;
			this._oController = oController;
		},
		buildMapView: function() {
			this._oYandexMap.init({
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				//sMapControlId: this._sMapControlId,
				oParams: {
					sCenterProperty: "ShippingLocationDetails/GeoLocation",
					aPlacemarks: [this.createShipFromPlacemark(), this.createShipToPlacemark(), this.createTruckPlacemark()],
					/*aPlacemarkCollections: [
						this.createTruckPlacemarkCollection(),
						this.createShipToPlacemarkCollection()
					],*/
					aRoutes: this.createRoutes()
				}
			});
		},
		createShipFromPlacemark: function() {
			return new MapPlacemark({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sGeoLocationProperty: "ShippingLocationDetails/GeoLocation",
					sIcon: "images/farm.png",
					aBottomDetails: [new PlacemarkDetail({
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								fnIcon: (oContext) =>
									(oContext.getProperty("ShippingLocationDetails/ProcessingTimeScore") === 1) ? "images/status_1_of_5.png" :
									(oContext.getProperty("ShippingLocationDetails/ProcessingTimeScore") === 2) ? "images/status_2_of_5.png" :
									(oContext.getProperty("ShippingLocationDetails/ProcessingTimeScore") === 3) ? "images/status_3_of_5.png" :
									(oContext.getProperty("ShippingLocationDetails/ProcessingTimeScore") === 4) ? "images/status_4_of_5.png" :
									(oContext.getProperty("ShippingLocationDetails/ProcessingTimeScore") === 5) ? "images/status_5_of_5.png" : "images/unknown.png",
								sIconWidth: "12px",
								sIconHeight: "12px"
							}
						}),
						new PlacemarkDetail({
							oParams: {
								fnIcon: (oContext) => (oContext.getProperty("ShippingLocationDetails/RoadEventCount") > 0) ? "images/alert.png" : "",
								sIconWidth: "12px",
								sIconHeight: "12px"
							}
						})],
					aRightDetails: [new PlacemarkDetail({
						oParams: {
							fnText: (oContext) => ""
						}
					})],
					aHintDetails: [
						new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>Ферма</b>: " + oContext.getProperty("ShippingLocationDetails/Description") +
									" (" + oContext.getProperty("ShippingLocationDetails/ShippingLocationKey") + ")"
							}
						}),
						new PlacemarkDetail({
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								fnText: (oContext) => "<b>Адрес</b>: " + oContext.getProperty("ShippingLocationDetails/RegionName") + ", " + 
									 oContext.getProperty("ShippingLocationDetails/City") + ", " +
									 oContext.getProperty("ShippingLocationDetails/Street") + ", " +
									 oContext.getProperty("ShippingLocationDetails/AddressLine")
							}
						}),
						new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>Время подъезда</b>: " + oContext.getProperty("ArrivalTimeMinutes") + " мин."
							}
						}),
						new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>Расстояние</b>: " + oContext.getProperty("ArrivalMileageKm") + " км"
							}
						}),
						new PlacemarkDetail({
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								fnText: (oContext) => "<b>Время ожидания погрузки</b>: " + oContext.getProperty("LoadQueueTimeMinutes") + " мин."
							}
						}),
						new PlacemarkDetail({
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								fnText: (oContext) => "<b>Время погрузки</b>: " + oContext.getProperty("LoadTimeMinutes") + " мин."
							}
						})
					],
					aPlacemarkActions: [new PlacemarkAction({
						oParams: {
							fnText: (oContext) => "Подробнее",
							fnOnPress: (
								oContext
							) => this._oController.ShippingLocationDetailsNav(oContext.getProperty("").ShippingLocationDetails.ShippingLocationKey)
						}
					})]
				}
			});
		},
		createShipToPlacemark: function() {
			return new MapPlacemark({
				oMapControl: this._oYandexMap,
				oParams: {
					sGeoLocationProperty: "ShippingLocationDetails1/GeoLocation",
					sIcon: "images/warehouse.png",
					aBottomDetails: [new PlacemarkDetail({
						//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
						oParams: {
							fnIcon: (oContext) =>
								(oContext.getProperty("ShippingLocationDetails1/ProcessingTimeScore") === 1) ? "images/status_1_of_5.png" :
								(oContext.getProperty("ShippingLocationDetails1/ProcessingTimeScore") === 2) ? "images/status_2_of_5.png" :
								(oContext.getProperty("ShippingLocationDetails1/ProcessingTimeScore") === 3) ? "images/status_3_of_5.png" :
								(oContext.getProperty("ShippingLocationDetails1/ProcessingTimeScore") === 4) ? "images/status_4_of_5.png" :
								(oContext.getProperty("ShippingLocationDetails1/ProcessingTimeScore") === 5) ? "images/status_5_of_5.png" : "images/unknown.png",
							sIconWidth: "12px",
							sIconHeight: "12px"
						}
					})],
					aRightDetails: [new PlacemarkDetail({
						oParams: {
							fnText: (oContext) => ""
						}
					})],
					aHintDetails: [
						new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>База хранения</b>: " + oContext.getProperty("ShippingLocationDetails1/Description") +
									" (" + oContext.getProperty("ShippingLocationDetails1/ShippingLocationKey") + ")"
							}
						}),
						new PlacemarkDetail({
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								fnText: (oContext) => "<b>Адрес</b>: " + oContext.getProperty("ShippingLocationDetails1/RegionName") + ", " + 
									 oContext.getProperty("ShippingLocationDetails1/City") + ", " +
									 oContext.getProperty("ShippingLocationDetails1/Street") + ", " +
									 oContext.getProperty("ShippingLocationDetails1/AddressLine")
							}
						}),
						new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>Время в пути</b>: " + oContext.getProperty("TravelTimeMinutes") + " мин."
							}
						}),
						new PlacemarkDetail({
							oParams: {
								fnText: (oContext) => "<b>Расстояние</b>: " + oContext.getProperty("TravelMileageKm") + " км"
							}
						}),
						new PlacemarkDetail({
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								fnText: (oContext) => "<b>Время ожидания разгрузки</b>: " + oContext.getProperty("UnloadQueueTimeMinutes") + " мин."
							}
						}),
						new PlacemarkDetail({
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								fnText: (oContext) => "<b>Время разгрузки</b>: " + oContext.getProperty("UnloadTimeMinutes") + " мин."
							}
						})
					],
					aPlacemarkActions: [new PlacemarkAction({
						//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
						oParams: {
							fnText: (oContext) => "Подробнее",
							fnOnPress: (
									oContext
								) =>
								this._oController.ShippingLocationDetailsNav(oContext.getProperty("").ShippingLocationDetails1.ShippingLocationKey)
						}
					})]
				}
			});
		},
		createTruckPlacemark: function() {
			return new MapPlacemark({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
				oParams: {
					sGeoLocationProperty: "TruckDetails/GeoLocation",
					sIcon: "images/truck_257_136.png",
					aBottomDetails: [new PlacemarkDetail({
						oParams: {
							fnText: (oContext) => ""
						}
					})],
					oCenterDetails: new PlacemarkDetail({
						oParams: {
							fnText: (oContext) => ""
						}
					})
				}
			});
		},
		createRoutes: function() {
			return [
				new MapRoute({
					oMapControl: this._oYandexMap,
					oParams: {
						sFromProperty: "TruckDetails/GeoLocation",
						sToProperty: "ShippingLocationDetails/GeoLocation",
						sColor: "#696969",
						sActiveColor: "#696969"
					}
				}),
				new MapRoute({
					oMapControl: this._oYandexMap,
					oParams: {
						sFromProperty: "ShippingLocationDetails/GeoLocation",
						sToProperty: "ShippingLocationDetails1/GeoLocation",
						sColor: "#00008B",
						sActiveColor: "#00008B"
					}
				})
			];
		}

		/*createTruckPlacemarkCollection: function () {
			return new MapPlacemarkCollection({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sItemsPath: "TransportationAssignmentDetails",
					fnPlacemarkConstructor: (oMapControl, sItemPath) => {
						return new MapPlacemark({
							oMapControl: oMapControl,
							//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
							oParams: {
								sGeoLocationProperty: "TruckDetails/GeoLocation",
								sSelectedProperty: "Selected",
								sIcon: "images/truck_257_136.png",
								fnIsActive: (oContext) => oContext.getProperty("Status") !== "INACTIVE",
								aBottomDetails: [
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnIcon: (oContext) =>
												(oContext.getProperty("Preferred")) ? "images/star.png" : "",
											sIconWidth: "12px",
											sIconHeight: "12px"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnIcon: (oContext) =>
												(oContext.getProperty("ArrivalTimeScore") === 1) ? "images/status_1_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 2) ? "images/status_2_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 3) ? "images/status_3_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 4) ? "images/status_4_of_5.png" :
												(oContext.getProperty("ArrivalTimeScore") === 5) ? "images/status_5_of_5.png" : "images/unknown.png",
											sIconWidth: "12px",
											sIconHeight: "12px"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnIcon: (oContext) =>
												(oContext.getProperty("Status") === "REQUEST_SEND") ? "images/message_sent.png" : "",
											sIcon: "images/checked.png",
											sIconWidth: "12px",
											sIconHeight: "6px"
										}
									})
								],
								aRightDetails: [],
								oCenterDetails: new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										fnText: (oContext) => oContext.getProperty("AssignmentIndex")
									}
								}),
								aHintDetails: [
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Truck:</b> " + oContext.getProperty("Truck") +
												" (" + oContext.getProperty("TruckDetails/Description") + ")"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Carrier:</b> " + oContext.getProperty("TruckDetails/Carrier") +
												" (" + oContext.getProperty("TruckDetails/CarrierDetails/Name") + ")"
										}
									}),
									new PlacemarkDetail({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Arrival Time:</b> " + oContext.getProperty("ArrivalTimeMinutes") + " min"
										}
									}),
									new PlacemarkDetail({
										oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "<b>Max Capacity:</b> " + oContext.getProperty("TruckDetails/MaxWeight") + " ton"
										}
									})
								],
								oTopRightDetails: new PlacemarkDetail({
									//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
									oParams: {
										sIcon: "images/checked.png",
										sIconWidth: "10px",
										sIconHeight: "10px",
										fnIsVisible: (oContext) => oContext.getProperty("Status") === "ACCEPTED"
									}
								}),
								aPlacemarkActions: [new PlacemarkAction({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "Assign Truck",
											fnOnPress: (
													oContext
												) =>
												this._oController.onAcceptTruck(oContext.getProperty("Transportation"), oContext.getProperty("Truck"))
										}
									}),
									new PlacemarkAction({
										//oContext: new sap.ui.model.Context(this._oODataModel, "/" + sItemPath),
										oParams: {
											fnText: (oContext) => "Details",
											fnOnPress: (
													oContext
												) =>
												this._oController.onNavigateToTruckDetails(oContext.getProperty("").TruckDetails.__ref)
										}
									})
								]
							}
						});
					}
				}
			});
		},
		createShipToPlacemarkCollection: function () {
			return new MapPlacemarkCollection({
				oMapControl: this._oYandexMap,
				//oContext: new sap.ui.model.Context(this._oODataModel, this._sTransportationPath),
				oParams: {
					sItemsPath: "TransportationLocationAssignmentDetails",
					fnPlacemarkConstructor: (oMapControl, sItemPath) => {
						
					}
				}
			});
		}*/
	});
});