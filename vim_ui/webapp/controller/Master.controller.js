sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "vim_ui/utils/formatter"
], function (BaseController, JSONModel, Sorter, MessageToast, MessageBox, Fragment, ValueState, formatter) {
    "use strict";

    return BaseController.extend("vim_ui.controller.Master", {
        formatter: formatter,

        /**
         * Initialize the controller
         * Set up router and attach the route pattern matcher.
         */
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("master").attachPatternMatched(this._onRouteMatched, this);
            this._bDescendingSort = false;
        },

        /**
         * Method triggered when the route pattern is matched.
         * Prepares the model and initializes the page state.
         */
        _onRouteMatched: function () {
            this.defineModelForCurrentPage();
            this.onGoPress();
            this.resetState();
        },

        /**
         * Define the model for the current page and attach it to the view.
         */
        defineModelForCurrentPage: function () {
            var oModel = {
                "list": []
            };
            this.getView().setModel(new JSONModel(oModel), "masterModel");
        },

        /**
         * Triggered when the user presses the "Go" button to apply filters and fetch data.
         * It constructs the query parameters from the input fields and sends an AJAX request to the backend.
         */
        onGoPress: function (oEvent) {
            var oView = this.getView();
            var sDocStatus = oView.byId("idSelectDocStatus").getSelectedKeys();
            var sAssignedTo = oView.byId("idAssignedToInp").getValue();
            var sDocCategory = oView.byId("idSelectDocumentCategory").getSelectedKey();
            var sCreatedBy = oView.byId("idSentByInp").getValue();
            var sCreatedDateFrom = oView.byId("idSentOn").getDateValue();
            var sCreatedDateTo = oView.byId("idSentOn").getSecondDateValue();

            // Build query URL with parameters
            var sUrl = this._buildFilterQuery(sDocStatus, sAssignedTo, sDocCategory, sCreatedBy, sCreatedDateFrom, sCreatedDateTo);

            // Get the master model to update the data list after the request
            var oMasterModel = this.getView().getModel("masterModel");
            sap.ui.core.BusyIndicator.show();

            const oSuccessFunction = (oData) => {
                console.log("Filtered data:", oData);
                oMasterModel.setProperty("/list", oData.value[0].result);
                sap.ui.core.BusyIndicator.hide();
                return oData;
            };

            const oErrorFunction = (XMLHttpRequest, textStatus, errorThrown) => {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("Error loading data: " + textStatus);
                console.log(errorThrown);
            };

            return this.executeRequest(sUrl, 'GET', null, oSuccessFunction, oErrorFunction);
        },

        /**
         * Helper method to build the query URL with the given parameters.
         */
        _buildFilterQuery: function (sDocStatus, sAssignedTo, sDocCategory, sCreatedBy, sCreatedDateFrom, sCreatedDateTo) {
            var url = "/odata/extended()?";
            var aParams = [];

            if (sDocStatus.length) {
                aParams.push("DOC_STATUS=" + sDocStatus);
            }
            if (sAssignedTo) {
                aParams.push("ASSIGNEDTO=" + sAssignedTo);
            }
            if (sDocCategory) {
                aParams.push("DOCCATEGORY=" + sDocCategory);
            }
            if (sCreatedBy) {
                aParams.push("CREATEDBY=" + sCreatedBy);
            }
            if (sCreatedDateFrom || sCreatedDateTo) {
                aParams.push("CREATEDAT=" + sCreatedDateFrom.toJSON() + "," + sCreatedDateTo.toJSON());
            }

            return url + aParams.join("&");
        },

        /**
         * Clear all filter input fields when the user presses the clear button.
         */
        onClearFilterBar: function (oEvent) {
            var oView = this.getView();
            oView.byId("idSelectDocStatus").setSelectedKeys(null);
            oView.byId("idAssignedToInp").setValue(null);
            oView.byId("idSelectDocumentCategory").setSelectedKey(null);
            oView.byId("idSentByInp").setValue(null);
            oView.byId("idSentOn").setDateValue(null);
            oView.byId("idSentOn").setSecondDateValue(null);
        },

        /**
         * Event handler for list item press.
         * Navigates to the detail view based on the selected package ID.
         */
        onListItemPress: function (oEvent) {
            var packageId = oEvent.getSource().getBindingContext("masterModel").getObject().PACKAGEID;
            this.oRouter.navTo("detailDetail", { layout: sap.f.LayoutType.MidColumnFullScreen, packageId: packageId });
        },

        /**
         * Unlocks a document by sending an AJAX POST request.
         */
        onUnlock: function (oEvent) {
            var url = "/odata/unlock";
            var sPackageId = this.getView().getModel("masterModel").getProperty(this.oCtx + "/PACKAGEID");

            if (!sPackageId) {
                MessageToast.show("ERROR - Document cannot be unlocked");
                return;
            }

            var body = {
                payload: {
                    PackageId: sPackageId
                }
            };

            $.ajax({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                dataType: 'json',
                data: JSON.stringify(body),
                success: function (data) {
                    MessageToast.show("Document has been unlocked");
                },
                error: function (err) {
                    console.log("FAILED TO REMOVE LOCK", err);
                    MessageToast.show("Unable to unlock Document");
                }
            });
        },

        
        onQuickEditPress: function (oEvent) {
            this.oCtx = oEvent.getSource().getBindingContext('masterModel');
            this._quickEditPress(oEvent);
        },

        /**
         * Event handler for quick edit action.
         * Loads and opens a fragment (contextual menu) for the selected list item.
         */
        _quickEditPress: function (oEvent) {
            var oControl = oEvent.getSource(),
                oView = this.getView();
                
            if (!this._oMenuFragment) {
                Fragment.load({
                    id: oView.getId(),
                    name: "vim_ui.view.fragments.MasterMenu",
                    controller: this
                }).then(function (oMenu) {
                    oView.addDependent(oMenu);
                    oMenu.openBy(oControl);
                    this._oMenuFragment = oMenu;
                }.bind(this));
            } else {
                this._oMenuFragment.openBy(oControl);
            }
        },

        onQuickMassiveEditPress: function (oEvent) {
            this.oCtx = null;
            this._quickEditPress(oEvent);
        },

        onForwardPressHandler: function (oEvent) {
            let bIsMassiveAction = this.oCtx;
            if (bIsMassiveAction) {

            } else {
                this._forwardPunctualPressHandler(oEvent);
            }
        },

        
        /**
         * Event handler to handle forward action with parameters from the selected list item.
         */
        _forwardPunctualPressHandler: function (oEvent) {
            var oMasterModel = this.getView().getModel("masterModel");
            var sDocStatus = oMasterModel.getProperty(this.oCtx + "/DOC_STATUS");
            var sPackage_Id = oMasterModel.getProperty(this.oCtx + "/PACKAGEID");
            this.onForwardPress(oEvent, oMasterModel, sPackage_Id, sDocStatus);
        },

        /**
         * Event handler for sorting the table by the "Name" column.
         * It toggles between ascending and descending order.
         */
        onSort: function (oEvent) {
            this._bDescendingSort = !this._bDescendingSort;
            var oView = this.getView(),
                oTable = oView.byId("productsTable"),
                oBinding = oTable.getBinding("items"),
                oSorter = new Sorter("Name", this._bDescendingSort);

            oBinding.sort(oSorter);
        },


        onSelectionChange: function (oEvent) {
			var oTable = oEvent.getSource(),
            aItems = oTable.getSelectedItems(),
            bShowFooter = aItems.length > 0;
            oTable.getItems().forEach(oItem => {
                if (aItems.length > 1) {
                    oItem.getAggregation("cells")[7].setEnabled(false);
                }
                oItem.setHighlight(ValueState.None);
            });
            this.getView().byId("dynamicPageId").setShowFooter(bShowFooter);
        },

        onSubmitPress: function () {
            var oTable = this.getView().byId("masterTable"),
            oMasterModel = this.getView().getModel("masterModel"),
            aSelectedItems = oTable.getSelectedItems(),
            that = this;

            aSelectedItems = aSelectedItems.map((oItem) => {
                return {
                    "PackageId": oItem.getBindingContext("masterModel").getProperty("PACKAGEID"),
                    "DocCategory": oItem.getBindingContext("masterModel").getProperty("DOCCATEGORY")
                };
            });

            MessageBox.warning("Do you really want to submit selected invoices?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                  if (sAction === MessageBox.Action.YES) {
                    sap.ui.core.BusyIndicator.show();
                    const sUrl ="/odata/massiveSubmit"
                    const oSuccessFunction = (oData) => {
                        sap.ui.core.BusyIndicator.hide();
                        var aErrorInvoicesPackageIds = oData.value[0].ErrorInvoicesPackageIds;
                        if (aErrorInvoicesPackageIds.length > 0) {
                            MessageBox.error("Some submit failed. Please adjust invoices from their details page.");
                            that._highlightErrorRows(aErrorInvoicesPackageIds);
                        } else {
                            MessageBox.success("Submit succeded");
                        }
                    };

                    const oErrorFunction = (XMLHttpRequest, textStatus, errorThrown) => {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("Backend request failed. Please try again later.");
                        aSelectedItems = aSelectedItems.map((oItem) => {
                            return oItem.PackageId;
                        });
                        that._highlightErrorRows(aSelectedItems);
                    };
                    const oBody = {
                        payload: aSelectedItems
                    }
                    that.executeRequest(sUrl, "POST", JSON.stringify(oBody), oSuccessFunction, oErrorFunction);
                  } 
                }
            });
        },

        _highlightErrorRows: function(aErrorPackageIds) {
            var oTable = this.byId("masterTable");
            var aItems = oTable.getItems();

            // Iterate over table rows and check if PACKAGEID is in the error list
            aItems.forEach(function(oItem) {
                var sPackageId = oItem.getBindingContext("masterModel").getProperty("PACKAGEID");

                // If the PACKAGEID is in the error list, set the highlight to 'Error'
                if (aErrorPackageIds.includes(sPackageId)) {
                    oItem.setHighlight(ValueState.Error); // Set the row color to red
                } else {
                    oItem.setHighlight(ValueState.None);  // Reset the highlight for non-error rows
                }
            });
        }
    });
});
