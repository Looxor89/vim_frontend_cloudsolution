sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ResizeHandler",
	"sap/f/FlexibleColumnLayout"
], function (JSONModel, Controller, ResizeHandler, FlexibleColumnLayout) {
	"use strict";

	return Controller.extend("touchlessui.controller.FlexibleColumnLayout", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			ResizeHandler.register(this.getView().byId("fcl"), this._onResize.bind(this));
		},

		onAfterRendering: function () {

		},

		onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();

			var sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			if (this.currentRouteName === "master") {
				// last viewed route was master
				var oMasterView = this.oRouter.getView("touchlessui.view.Master");
				this.getView().byId("fcl").removeBeginColumnPage(oMasterView);
			}

			if (oEvent.getParameter("name") === "detailDetail") {
				// last viewed route was detailDetail
				this.getView().byId("fcl").setLayout(sap.f.FlexibleColumnLayout.TwoColumnMidExpanded);
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				console.log(sLayout);
				oModel.setProperty("/layout", sLayout);
			}

		},

		onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			this._updateUIElements();

			// Save the current route name
			this.currentRouteName = sRouteName;
			this.currentPackageId = oArguments.packageId;
			// this.currentSupplier = oArguments.supplier;
		},

		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");
			this._updateUIElements();

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				// this.oRouter.navTo(this.currentRouteName, { layout: sLayout, packageId: this.currentPackageId }, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.getOwnerComponent().getModel();
			var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
			oModel.setData(oUIState);
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		},

		_onResize: function (oEvent) {
			var bPhone = (oEvent.size.width < FlexibleColumnLayout.TABLET_BREAKPOINT);
			this.getOwnerComponent().getModel().setProperty("/isPhone", bPhone);
		},
		
		_updateLayout: function (sLayout) {
			var oModel = this.getOwnerComponent().getModel();

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		}
	});
});
