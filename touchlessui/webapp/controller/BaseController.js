sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/base/util/deepExtend",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, UIComponent, Fragment, MessageBox, MessageToast, deepExtend, History, Filter, FilterOperator) {

    var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";
    "use strict";

    return Controller.extend("touchlessui.controller.BaseController", {

        resetState: function () {
            var iJSON = {"href":null,"ui":{"header":{"purchaseOrderNumber":{"id":"idPurchaseOrder"},"documentDate":{"id":"idDocDate"},"documentNumber":{"id":"idVendorInvoice"},"currencyCode":{"id":"idCurrency"},"grossAmount":{"id":"idGrossAmt"},"netAmount":{"id":"idNetAmt"},"senderName":{"id":"idSenderName"},"receiverName":{"id":"idReceiverName"}}},"sDialogTitle":null,"DocxLines":[],"NonPoDocxLines":[],"notes":[],"UserList":[],"Filelist":[],"lock":{"lockedBy":null,"lockedAt":null,"user":null},"props":{"gEditMode":false,"POMode":true,"FileEditMode":false,"lineItemTable":{"editMode":false},"totalAmount":0,"totalAmountUnit":0},"valuehelps":{"currency":[],"taxcode":[],"partbank":[],"paymentterms":[],"invdoctyp":[{"Type":"PO","Blart":"RE"},{"Type":"PO","Blart":"ZE"},{"Type":"NONPO","Blart":"KR"},{"Type":"NONPO","Blart":"KG"},{"Type":"NONPO","Blart":"ZM"}]},"master":{"list":null},"detail":{"header":null,"edited":{"CompCode":"","Vendor":""}},"detailDetail":{"header":{"purchaseOrderNumber":{"name":"purchaseOrderNumber","value":null},"documentDate":{"name":"documentDate","value":null},"documentNumber":{"name":"documentNumber","value":null},"grossAmount":{"name":"grossAmount","value":null},"netAmount":{"name":"netAmount","value":null},"senderName":{"name":"senderName","value":null},"receiverName":{"name":"receiverName","value":null}}},"dox":{},"token":null};
            this.packageId = undefined;

            var oModel = this.getOwnerComponent().getModel("appmodel");
            oModel.setProperty("/", iJSON);
        },

        loadDashboard: function () {

            var aURL = "/api/dashboard";
            sap.ui.core.BusyIndicator.show()
            $.ajax({
                url: aURL,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "cache": false,
                },
                dataType: "json",
                async: true,
                success: function (oData) {

                    this.getOwnerComponent().getModel("appmodel").setProperty("/master/list", oData)
                    sap.ui.core.BusyIndicator.hide()
                }.bind(this),
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error loading data " + textStatus);
                    console.log(errorThrown);

                }.bind(this)
            });
        },

        onForwardPress: function (oEvent) {
            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel("appmodel");
            this.sAction = oEvent.getSource().getText();

            this.getUsers();

            this.packageId = oModel.getProperty("/detail/header/PackageId");
            if (!this.packageId) {
                this.packageId = this.oCtx.getObject('PackageId');
            }

            var STATUS = oModel.getProperty(this.oCtx + "/DocStatus");
            if(STATUS === "POSTED" || STATUS === "REJSAP" || STATUS === "REJRTV" ) {

                MessageBox.error("This document can no longer be forwarded or assinged.");
                return;
            }

            oModel.setProperty("/sDialogTitle", this.sAction + " to user");

            //create dialog
            if (!this.byId("idAssignToDialog")) {
                //load asynchronous fragment (XML)
                Fragment.load({
                    id: oView.getId(),
                    name: "touchlessui.view.fragments.ForwardTo",
                    controller: this
                }).then(function (oMenu) {
                    //connect Menu to rootview of this component (models, lifecycle)
                    oView.addDependent(oMenu);
                    oMenu.open();
                });
            } else {
                this.byId("idAssignToDialog").open();
            }
        },

        onFwdConfirm: function (oEvent) {
            var that = this;
            var url;
            var assignTo = oEvent.getParameter('selectedItem').getBindingContext('appmodel').getObject('Email');

            if (this.sAction === 'Assign') {
                url = '/api/process/assign';

                this.ajax('POST', url, {
                    packageId: this.packageId,
                    assignTo: assignTo
                })
                    .then(function (data) {
                        MessageBox.success("Assigned to " + assignTo);
                       // that.loadDashboard();
                    })
                    .catch(function (xhr, sStatus, sError) {
                        MessageBox.error("Unable to assign to " + assignTo, {
                            details: xhr,
                            styleClass: sResponsivePaddingClasses
                        });
                        that.loadDashboard();
                    });

            } else if (this.sAction === 'Forward') {
                url = '/api/process/forward';

                this.ajax('POST', url, {
                    packageId: this.packageId,
                    forwardTo: assignTo
                })
                    .then(function (data) {
                        MessageBox.success("Forwarded to " + assignTo);
                        that.loadDashboard();
                    })
                    .catch(function (xhr, sStatus, sError) {
                        MessageBox.error("Unable to forward to " + assignTo, {
                            details: xhr,
                            styleClass: sResponsivePaddingClasses
                        });
                        that.loadDashboard();
                    });
            }
        },

        onFwdSearch: function (oEvent) {
            sValue = oEvent.getParameter("value");
            if (sValue) {
                var sFilter = new Filter({
                    filters: [
                        new Filter("FirstName", FilterOperator.Contains, sValue),
                        new Filter("LastName", FilterOperator.Contains, sValue)
                    ]
                });
            }
            var oList = this.getView().byId("idAssignToDialog");
            var oBinding = oList.getBinding("items");
            oBinding.filter(sFilter);
        },

        onRejectPress: function (oEvent) {
            var oView = this.getView();
            //create dialog
            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: oView.getId("idRejectInvoice"),
                    name: "touchlessui.view.fragments.RejectDialog",
                    controller: this
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oDialog);
                    oDialog.open();;
                });
            } else {
                this.getView().byId("idRejectInvoice").open();
            }

        },

        onRejectInvoice: function (oEvent) {

            var url = "/api/process/reject?sMode="
            var oModel = this.getOwnerComponent().getModel("appmodel");
            var sButtonTxt = oEvent.getSource().getText();
            var packageId = oModel.getProperty("/detail/header/PackageId");
            var sText = this.getView().byId("idRejText").getValue();
            var sMsg;

            if (sButtonTxt === "Return to Vendor") {
                url = url + "REJRTV" + "&" + "packageId=" + packageId;
                sMsg = "Invoice returned to vendor";
            } else {
                url = url + "REJSAP" + "&" + "packageId=" + packageId;
                sMsg = "Invoice rejected for manual entry in SAP";
            }

            this.ajax('POST', url, {
                // packageId: packageId,
                // sText: sText
            })
                .then(function (data) {
                    MessageToast.show(sMsg);
                })
                .catch(function (xhr, sStatus, sError) {
                    MessageToast.show(sMsg)
                });
            this.getView().byId("idRejectInvoice").close();
        },

        onCancelReject: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        getUsers: function (oEvent) {
            var oModel = this.getOwnerComponent().getModel("appmodel");
            var oView = this.getView();
            var url = "/api/dashboard/users";

            $.ajax({
                url: url,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "cache": false,
                },
                dataType: "json",
                async: true,
                success: function (data) {
                    // console.log(data);
                    oModel.setProperty("/UserList", data);

                }.bind(this),
                error: function (error) {
                    console.log('error loading users', error)
                }.bind(this)
            });
        },

        ajax: function (method, url, body) {
            return new Promise(function (resolve, reject) {
                var token;

                function getCsrf() {
                    return new Promise(function (resolve, reject) {
                        $.ajax({
                            url: "/api/notes/token",
                            method: 'GET',
                            headers: {
                                'X-CSRF-Token': 'Fetch'
                            },
                            async: false,
                            success: function (data, textStatus, request) {
                                token = request.getResponseHeader('x-csrf-token');
                                resolve(data);
                            },
                            error: function (err) {
                                reject(err)
                            }
                        });
                    });
                };

                function getData() {
                    return new Promise(function (resolve, reject) {
                        $.ajax({
                            url: url,
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'cache': false,
                                'X-CSRF-Token': token
                            },
                            dataType: 'json',
                            data: body ? JSON.stringify(body) : undefined,
                            async: false,
                            success: function (data, textStatus, request) {

                                resolve(data);
                            },
                            error: function (err) {
                                reject(err)
                            }
                        });
                    });
                }

                getCsrf()
                    .then(function (data) {
                        getData()
                            .then(function (data) {
                                resolve(data);
                            })
                            .catch(function (error) {
                                reject(error);
                            });

                    }).catch(function (error) {
                        console.log(error);
                        reject(error);
                    });
            });
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        onGoBackPress: function () {
            var oHistory, sPreviousHash;

            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("master", {}, true /*no history*/);
            }

        },

        onCancelPress: function () {
            this.getRouter().navTo("master", {}, true /*no history*/);

            // var hashUrl = window.location.hash;
            // var fullUrl = window.location.href;
            // var initUrl = fullUrl.split(hashUrl)[0];
            // window.history.replaceState({}, document.title, initUrl)
            // window.location.replace(initUrl);
        }
    });
});