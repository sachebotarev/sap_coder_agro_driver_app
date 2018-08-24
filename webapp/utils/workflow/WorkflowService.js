sap.ui.define([
	"sap/ui/base/Object",
	"com/pepsico/core/sap/hcp/workflow/WorkflowException"
], function(Object, WorkflowException) {
	"use strict";
	return Object.extend("com.pepsico.core.sap.hcp.workflow.WorkflowService", {

		constructor: function({
			sWorkflowServiceUrl = "",
			oCustomHttpHeaders = {}
		} = {}) {
			this._sWorkflowServiceUrl = sWorkflowServiceUrl;
			this._oCustomHttpHeaders = oCustomHttpHeaders;

		},

		getOpenedTasksByUser: function(sUser) {
			let that = this;
			return new Promise(function(fnResolve, fnReject) {
				fetch(that._sWorkflowServiceUrl + "/task-instances?recipientUsers=" + sUser + "&status=READY", {
					method: 'GET',
					headers: that._oCustomHttpHeaders
				})
				.then(oResponse => {
					if (oResponse.ok) {
						return oResponse.json();
					}
					new WorkflowException({
						sMessage: "Failed getTaskContext",
						oCausedBy: oResponse
					});
				})
				.then(fnResolve);
			});
		},

		getTaskDetails: function(sTaskId) {
			var that = this;
			return new Promise(function(resolve, reject) {
				$.ajax({
					url: that._sWorkflowServiceUrl + "/task-instances/" + sTaskId,
					method: "GET",
					async: true,
					headers: that._oCustomHttpHeaders,
					success: function(oResult, sStatus, oXhr) {
						resolve(oResult);
					},
					error: function(oXHR, sTextStatus, sErrorThrown) {
						reject(new WorkflowException({
							sMessage: "Failed getTaskDetails",
							oCausedBy: sErrorThrown
						}));
					}
				});
			});
		},

		getTaskContext: function(sTaskId) {
			var that = this;
			return new Promise(function(resolve, reject) {
				$.ajax({
					url: that._sWorkflowServiceUrl + "/task-instances/" + sTaskId + "/context",
					method: "GET",
					async: true,
					headers: that._oCustomHttpHeaders,
					success: function(oResult, sStatus, oXhr) {
						resolve(oResult);
					},
					error: function(oXHR, sTextStatus, sErrorThrown) {
						reject(new WorkflowException({
							sMessage: "Failed getTaskContext",
							oCausedBy: sErrorThrown
						}));
					}

				});
			});
		},

		completeTask: function(sTaskId) {
			var that = this;

			return that._fetchToken()
				.then(sToken => new Promise(function(resolve, reject) {
					let oCustomHttpHeaders = that._oCustomHttpHeaders;
					oCustomHttpHeaders["X-CSRF-Token"] = sToken;
					$.ajax({
						url: that._sWorkflowServiceUrl + "/task-instances/" + sTaskId,
						method: "PATCH",
						contentType: "application/json",
						async: true,
						data: "{\"status\": \"COMPLETED\"}",
						headers: oCustomHttpHeaders,
						success: function(oResult, sStatus, oXhr) {
							resolve(oResult);
						},
						error: function(oXHR, sTextStatus, sErrorThrown) {
							reject(new WorkflowException({
								sMessage: "Failed completeTask",
								oCausedBy: sErrorThrown
							}));
						}

					});
				}));
		},

		patchContext: function(sWorkflowInstanceId, oContext) {
			var that = this;
			return that._fetchToken()
				.then(sToken => new Promise(function(resolve, reject) {
					let oCustomHttpHeaders = that._oCustomHttpHeaders;
					//oCustomHttpHeaders["X-CSRF-Token"] = sToken;
					$.ajax({
						url: that._sWorkflowServiceUrl + "/workflow-instances/" + sWorkflowInstanceId + "/context",
						method: "PATCH",
						contentType: "application/json",
						async: true,
						data: JSON.stringify(oContext),
						headers: oCustomHttpHeaders,
						success: function(oResult, sStatus, oXhr) {
							resolve(oResult);
						},
						error: function(oXHR, sTextStatus, sErrorThrown) {
							reject(new WorkflowException({
								sMessage: "Failed patchContext",
								oCausedBy: sErrorThrown
							}));
						}
					});
				}));
		},

		putContext: function(sWorkflowInstanceId, oContext) {
			var that = this;
			return that._fetchToken()
				.then(sToken => new Promise(function(resolve, reject) {
					let oCustomHttpHeaders = that._oCustomHttpHeaders;
					oCustomHttpHeaders["X-CSRF-Token"] = sToken;
					$.ajax({
						url: that._sWorkflowServiceUrl + "/workflow-instances/" + sWorkflowInstanceId + "/context",
						method: "PUT",
						contentType: "application/json",
						async: true,
						data: JSON.stringify(oContext),
						headers: oCustomHttpHeaders,
						success: function(oResult, sStatus, oXhr) {
							resolve(oResult);
						},
						error: function(oXHR, sTextStatus, sErrorThrown) {
							reject(new WorkflowException({
								sMessage: "Failed patchContext",
								oCausedBy: sErrorThrown
							}));
						}
					});
				}));
		},

		startInstance: function(sWorkflowId, oContext) {
			var that = this;
			return that._fetchToken()
				.then(sToken => new Promise(function(resolve, reject) {
					let oCustomHttpHeaders = that._oCustomHttpHeaders;
					oCustomHttpHeaders["X-CSRF-Token"] = sToken;
					$.ajax({
						url: that._sWorkflowServiceUrl + "/workflow-instances",
						method: "POST",
						async: true,
						contentType: "application/json",
						headers: oCustomHttpHeaders,
						data: JSON.stringify({
							definitionId: sWorkflowId,
							context: oContext
						}),
						success: function(oResult, sStatus, oXhr) {
							resolve(oResult);
						},
						error: function(oXHR, sTextStatus, sErrorThrown) {
							reject(new WorkflowException({
								sMessage: "Failed startInstance",
								oCausedBy: sErrorThrown
							}));
						}
					});
				}));
		},

		_fetchToken: function() {
			let that = this;
			return new Promise(function(resolve, reject) {
				let oCustomHttpHeaders = that._oCustomHttpHeaders;
				oCustomHttpHeaders["X-CSRF-Token"] = "Fetch";
				$.ajax({
					url: that._sWorkflowServiceUrl + "/xsrf-token",
					method: "GET",
					async: true,
					headers: oCustomHttpHeaders,
					success: function(result, xhr, data) {
						resolve(data.getResponseHeader("X-CSRF-Token"));
					},
					error: function(oXHR, sTextStatus, sErrorThrown) {
						reject(new WorkflowException({
							sMessage: "Failed _fetchToken",
							oCausedBy: sErrorThrown
						}));
					}
				});
			});
		}

	});
});