sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		
		transportationStatusIcon: function(sValue) {
			switch (sValue) {
				case "043.REQUESTS_SENT":
					return "sap-icon://pending";
				case "049.ASSIGNED":
					return "sap-icon://status-in-process";
				case "050.ARRIVED_FOR_LOAD":
					return "sap-icon://status-in-process";
				case "060.LOADED":
					return "sap-icon://status-in-process";
				case "070.ARRIVED_FOR_UNLOAD":
					return "sap-icon://status-in-process";
				case "080.CLOSED":	
					return "sap-icon://favorite";
				case "090.COMPLETED":
					return "sap-icon://complete";
				case "090.REJECTED":	
					return "sap-icon://decline";
				case "044.TRUCKS_NOT_FOUND":
					return "sap-icon://decline";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		transportationStatusState: function(sValue) {
			switch (sValue) {
				case "043.REQUESTS_SENT":
					return sap.ui.core.ValueState.Warning;
				case "049.ASSIGNED":
					return sap.ui.core.ValueState.Warning;
				case "050.ARRIVED_FOR_LOAD":
					return sap.ui.core.ValueState.Warning;
				case "060.LOADED":
					return sap.ui.core.ValueState.Warning;
				case "070.ARRIVED_FOR_UNLOAD":
					return sap.ui.core.ValueState.Warning;
				case "080.CLOSED":	
					return sap.ui.core.ValueState.Success;
				case "090.COMPLETED":
					return sap.ui.core.ValueState.Success;
				case "090.REJECTED":	
					return sap.ui.core.ValueState.Warning;
				case "044.TRUCKS_NOT_FOUND":
					return sap.ui.core.ValueState.Error;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		
		transportationStatusText: function(sValue) {
			switch (sValue) {
				case "044.TRUCKS_NOT_FOUND":
					return "Никто не Принял";
				case "043.REQUESTS_SENT":
					return "Новый";
				case "049.ASSIGNED":
					return "На пути к загрузке";
				case "050.ARRIVED_FOR_LOAD":
					return "Ожидание Загрузки";
				case "060.LOADED":
					return "Перевозка";
				case "070.ARRIVED_FOR_UNLOAD":
					return "Ожидание Разгрузки";
				case "080.CLOSED":	
					return "Выполнено";
				case "090.COMPLETED":
					return "Закрыто";
				case "090.REJECTED":	
					return "Отклонено";
				default:
					return sValue;
			}
		},
		
		equipmentStatusIcon: function(sValue) {
			switch (sValue) {
				case "In Service":
					return "sap-icon://accept";
				case "Not Working":
					return "sap-icon://decline";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		equipmentStatusState: function(sValue) {
			switch (sValue) {
				case "In Service":
					return sap.ui.core.ValueState.Success;
				case "Not Working":
					return sap.ui.core.ValueState.Error;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		
		routeStatusIcon: function(sValue) {
			switch (sValue) {
				case "DONE":
					return "sap-icon://complete";
				case "EXEC":
					return "sap-icon://status-in-process";
				case "PLAN":
					return "sap-icon://future";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		routeStatusState: function(sValue) {
			switch (sValue) {
				case "DONE":
					return sap.ui.core.ValueState.Success;
				case "EXEC":
					return sap.ui.core.ValueState.Warning;
				case "PLAN":
					return sap.ui.core.ValueState.Warning;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		
		visitStatusIcon: function(sValue) {
			switch (sValue) {
				case "CLOSED":
					return "sap-icon://complete";
				case "OPENED":
					return "sap-icon://status-in-process";
				case "PLAN":
					return "sap-icon://future";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		visitStatusState: function(sValue) {
			switch (sValue) {
				case "CLOSED":
					return sap.ui.core.ValueState.Success;
				case "OPENED":
					return sap.ui.core.ValueState.Warning;
				case "PLAN":
					return sap.ui.core.ValueState.Warning;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		statusEditable: function(sValue) {
			switch (sValue) {
				case "DRAFT":
					return true;
				default:
					return false;
			}
		},
		statusDisplayChange: function(sValue) {
			switch (sValue) {
				case "DRAFT":
					return "Change";
				default:
					return "Display";
			}
		},
		statusUndoSubmissionAllowed: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return true;
				default:
					return false;
			}
		},
		statusState: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return sap.ui.core.ValueState.Success;
				case "DRAFT":
					return sap.ui.core.ValueState.Warning;
				default:
					return sap.ui.core.ValueState.Warning;
			}
		},
		statusIcon: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return "sap-icon://accept";
				case "DRAFT":
					return "sap-icon://status-in-process";
				default:
					return sap.ui.core.ValueState.Warning;
			}
		}

	};

});