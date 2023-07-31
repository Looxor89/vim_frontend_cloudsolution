/* global _:true */
sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/base/util/deepExtend",
  "sap/ui/core/Fragment",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "touchlessui/utils/formatter",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/MessagePopover",
  "sap/m/MessageItem",
  "sap/base/util/uid",
  "touchlessui/utils/moment",
  "touchlessui/utils/lodash",
], function (BaseController, JSONModel, deepExtend, Fragment, Filter, FilterOperator, formatter, MessageToast, MessageBox, MessagePopover, MessageItem, uid, Moment, Lodash) {
  "use strict";

  var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

  return BaseController.extend("touchlessui.controller.DetailDetail", {
    formatter: formatter,
    onInit: function () {
      this.createMessagePopover();

      //this._sLoggedInUser = "rajat.f.jain@capgemini.com";//sap.ushell.Container.getUser().getEmail();

      var oExitButton = this.getView().byId("exitFullScreenBtn"),
        oEnterButton = this.getView().byId("enterFullScreenBtn");

      this.oRouter = this.getOwnerComponent().getRouter();
      this.oModel = this.getOwnerComponent().getModel();
      this.appmodel = this.getOwnerComponent().getModel("appmodel");

      this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onRouteMatched, this);

      [oExitButton, oEnterButton].forEach(function (oButton) {
        oButton.addEventDelegate({
          onAfterRendering: function () {
            if (this.bFocusFullScreenButton) {
              this.bFocusFullScreenButton = false;
              oButton.focus();
            }
          }.bind(this)
        });
      }, this);

      // var oPOInput = this.getView().byId("idPurchaseOrder");

      // var oDelegate = {
      //   onkeydown: function(oEvent){
      //     //debugger;
      //     // Act when the keydown event is fired on the element
      //   },
      //   onAfterRendering: function(oEvent){
      //     //debugger
      //     // Act when the afterRendering event is fired on the element
      //   }
      // };
      // oPOInput.addEventDelegate(oDelegate);

      this.oReadOnlyTemplate = this.getView().byId("readTemplate");
      this.oTaxTemplate = this.getView().byId("idTaxCodeTmp");

      // var oTaxTemplate = new sap.ui.core.Item({
      //   key: "{appmodel>Taxcode}",
      //   text: "{appmodel>Text}"
      // });

      this.oEditableTemplate = new sap.m.ColumnListItem({
        cells: [
          new sap.m.Input({
            value: "{appmodel>InvoiceLineItem}",
            type: "Number",
            maxLength: 10
          }), new sap.m.Input({
            value: "{appmodel>Description}",
            maxLength: 50
          }), new sap.m.Input({
            value: {
              path: 'appmodel>Amount',
              type: 'sap.ui.model.odata.type.Decimal',
              formatOptions: {
                minFractionDigits: 0,
                maxFractionDigits: 3,
                groupingEnabled: false
              },
              constraints: {
                precision: 23,
                scale: 4
              },
            },
            liveChange: this.calcTotals.bind(this)
          }), new sap.m.Input({
            value: {
              path: 'appmodel>Quantity',
              type: 'sap.ui.model.odata.type.Decimal',
              formatOptions: {
                minFractionDigits: 0,
                maxFractionDigits: 3,
                groupingEnabled: false
              },
              constraints: {
                precision: 13,
                scale: 3
              },
            },
          }), new sap.m.TextArea({
            value: "{appmodel>UoM}",
            maxLength: 3
          }), new sap.m.Input({
            value: "{appmodel>TaxCode}",
            // valueHelpOnly: true,
            showValueHelp: true,
            valueHelpRequest: this.onTaxCodeVH.bind(this),
            maxLength: 2
          }),
          // new sap.m.Input({
          //   value: "{appmodel>TaxAmount}"
          // }), 
          new sap.m.Input({
            value: "{appmodel>PONumber}-{appmodel>POLineItem}",
            // valueHelpOnly: true,
            showValueHelp: true,
            valueHelpRequest: this.onPurchOrderVH.bind(this),
            maxLength: 16
          })

        ]
      });


      // NON PO LineItem Table
      this.oReadOnlyTemplateNPo = this.getView().byId("readNonPOTemplate");

      this.oEditableTemplateNPo = new sap.m.ColumnListItem({
        cells: [
          new sap.m.Input({
            value: "{appmodel>InvoiceLineItem}",
            type: "Number",
            maxLength: 10
          }),
          new sap.m.Select({
            selectedKey: "{appmodel>CDInd}",
            change: this.calcTotals.bind(this),
            items: [
              new sap.ui.core.Item({
                key: "false",
                text: "Debit"
              }),
              new sap.ui.core.Item({
                key: "true",
                text: "Credit"
              })
            ]
          }),
          new sap.m.Input({
            value: "{appmodel>Bukrs}",
            maxLength: 4,
            showValueHelp: true,
            valueHelpRequest: function (oEvent) {
              this.onCompCodeVH2(oEvent, 'item')
            }.bind(this)
          }),
          new sap.m.Input({
            value: "{appmodel>GLAcc}",
            showValueHelp: true,
            valueHelpRequest: this.onGLAcctVH2.bind(this),
            maxLength: 10
          }),
          new sap.m.Input({
            value: {
              path: 'appmodel>Amount',
              type: 'sap.ui.model.odata.type.Decimal',
              formatOptions: {
                minFractionDigits: 1,
                maxFractionDigits: 3,
                groupingEnabled: false
              },
              constraints: {
                precision: 23,
                scale: 4
              },
            },
            liveChange: this.calcTotals.bind(this)
          }),
          new sap.m.Input({
            value: "{appmodel>TaxCode}",
            showValueHelp: true,
            valueHelpRequest: this.onTaxCodeVH.bind(this),
            maxLength: 2
          }),
          new sap.m.Input({
            value: {
              path: 'appmodel>TaxAmount',
              type: 'sap.ui.model.odata.type.Decimal',
              formatOptions: {
                minFractionDigits: 1,
                maxFractionDigits: 3,
                groupingEnabled: false
              },
              constraints: {
                precision: 23,
                scale: 4
              },
            },
          }),
          new sap.m.Input({
            value: "{appmodel>CostCen}",
            showValueHelp: true,
            valueHelpRequest: this.onCostCenterVH2.bind(this),
            maxLength: 10
          }),
          new sap.m.Input({
            value: "{appmodel>ProfitCen}",
            showValueHelp: true,
            valueHelpRequest: this.onProfitCenterVH.bind(this),
            maxLength: 10
          }),
          new sap.m.Input({
            value: "{appmodel>WBSElem}",
            showValueHelp: true,
            valueHelpRequest: this.onWBSElementVH.bind(this),
            maxLength: 24
          })
        ]
      });

    },

    createMessagePopover: function () {
      var that = this;

      // "message": item.MESSAGE._text,
      // "type": item.TYPE._text,
      // "system": item.SYSTEM._text,
      // "number": item.NUMBER._text,
      // "log_msg_no": item.LOG_MSG_NO._text,
      // "msg_id": item.ID._text,

      this.oMP = new MessagePopover({
        items: {
          path: "msg>/aMsg",
          template: new MessageItem(
            {
              title: "{msg>message}",
              subtitle: "{msg>system}",
              type: {
                path: "msg>type",
                formatter: formatter.toMsgType
              },
              description: "{msg>message}\n{msg>msg_id} {msg>log_msg_no} {msg>number}"
            })
        }
      });

      this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
    },

    handleMessagePopoverPress: function (oEvent) {
      if (!this.oMP) {
        this.createMessagePopover();
      }
      this.oMP.toggle(oEvent.getSource());
    },

    resetUIState: function () {
      // this.appmodel.setProperty("/props/POMode", false);

      var ui = this.appmodel.getProperty("/ui/header");

      for (var prop in ui) {
        if (Object.prototype.hasOwnProperty.call(ui, prop)) {
          // do stuff
          this._removeCssConfidence(ui[prop].id);
        }
      }

      // Clear all fields which are not using data binding
      this.getView().byId("idFreeTxt").setValue(null);
      this.getView().byId("idCompanyCodeTxt").setText(null);
      this.getView().byId("idDiscountAmt").setValue(null);
      this.getView().byId("idInvDocType").setValue(null);

      // payement terms
       this.getView().byId("idPaymentTerms").setSelectedKey(null);
      
      // tax code
      this.getView().byId("idTaxCode").setSelectedKey(null);

      // bank
      this.getView().byId("idBankKey").setSelectedKey(null);
      this.getView().byId("bankntxt").setText(null);
      this.getView().byId("routingtxt").setText(null);
      this.getView().byId("ibantxt").setText(null);

      // tax
      this.getView().byId("idHTaxAmt").setValue(null);
      this.getView().byId("idTaxExemptAmt").setValue(null);
      this.getView().byId("idCalcTaxInd").setSelected(false);

      // credit memo check
      this.getView().byId("idInvInd").setSelected(false);
      this.getView().byId("idShippingAmount").setValue(null);

      // Bind read only template
      var oTable = this.getView().byId("idInvLineItemTable");
      oTable.bindAggregation("items", {
        path: "appmodel>/DocxLines",
        template: this.oReadOnlyTemplate,
        templateShareable: true,
        key: "InvoiceLineItem"
      }).setKeyboardMode("Navigation");
      var oTable = this.getView().byId("idNPOInvLineTable");
      oTable.bindAggregation("items", {
        path: "appmodel>/NonPoDocxLines",
        template: this.oReadOnlyTemplateNPo,
        templateShareable: true,
        key: "InvoiceLineItem"
      }).setKeyboardMode("Navigation");

    },

    rebindTable: function (oTemplate, sKeyboardMode) {
      if (this.appmodel.getProperty("/props/POMode")) {

        var oTable = this.getView().byId("idInvLineItemTable");
        oTable.bindAggregation("items", {
          path: "appmodel>/DocxLines",
          template: oTemplate,
          templateShareable: true,
          key: "InvoiceLineItem"
        }).setKeyboardMode(sKeyboardMode);
      } else {
        var oTable = this.getView().byId("idNPOInvLineTable");
        oTable.bindAggregation("items", {
          path: "appmodel>/NonPoDocxLines",
          template: oTemplate,
          templateShareable: true,
          key: "InvoiceLineItem"
        }).setKeyboardMode(sKeyboardMode);
      }
    },

    fetchNotes: function (packageId) {
      var sURL = "/api/notes?packageId=" + packageId;

      return new Promise(function (resolve, reject) {
        $.ajax({
          url: sURL,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "cache": false,
          },
          dataType: "json",
          async: true,
          success: function (data) {
            this.appmodel.setProperty("/notes", data);
            this.appmodel.refresh();
            resolve(data);
          }.bind(this),
          error: function (err) {
            reject(err)
          }.bind(this)
        });
      }.bind(this));
    },

    onAddNotes: function (oEvent) {
      var that = this;
      var sNotes = this.getView().byId("idNotesTxtArea").getValue();

      var obj = {
        PackageId: this._packageId,
        Subject: 'Comment',
        Note: sNotes
      };

      var token;

      function getCsrf() {
        return new Promise(function (resolve, reject) {
          $.ajax({
            url: "/api/notes/token",
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'cache': false,
              'X-CSRF-Token': 'Fetch'
            },
            dataType: 'json',
            async: true,
            success: function (data, textStatus, request) {

              token = request.getResponseHeader('X-Csrf-Token');
              resolve(data)
            }, //2XX
            error: function (err) {
              reject(err)
            } // 4XX
          });

        });

      }

      function postNote() {
        return new Promise(function (resolve, reject) {
          $.ajax({
            url: "/api/notes",
            method: "POST",
            headers: {
              'X-CSRF-Token': token,
              "Content-Type": "application/json",
              "Accept": "application/json",
              "cache": false,
            },
            dataType: "json",
            data: JSON.stringify(obj),
            async: true,
            success: function (data) {
              resolve(data)
              that.getView().byId("idNotesTxtArea").setValue("");
              MessageToast.show("Successfully posted the note");
            },
            error: function (err) {
              reject(err)
              that.getView().byId("idNotesTxtArea").setValue("");
              MessageToast.show("Errored while posting the note");
            }
          });
        });
      }
      sap.ui.core.BusyIndicator.show();
      getCsrf()
        .then(postNote())
        .then(that.fetchNotes(that._packageId))
        .then(function (data) {
          console.log('post notes success', data);
          sap.ui.core.BusyIndicator.hide();
        })
        .catch(function (err) {
          sap.ui.core.BusyIndicator.hide();
          console.log('post notes error', err);
        });
    },

    onClearNotes: function (oEvent) {
      this.getView().byId("idNotesTxtArea").setValue("");
    },

    fetchFileList: function (packageId) {
      var sURL = "/api/dashboard/list?packageId=" + packageId;

      return new Promise(function (resolve, reject) {
        $.ajax({
          url: sURL,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "cache": false,
          },
          dataType: "json",
          async: true,
          success: function (data) {
            for (let index = 0; index < data.length; index++) {
              if (data[index].IsMain === 0)
                data[index].IsMain = false;
              else
                data[index].IsMain = true;
            }
            this.appmodel.setProperty("/Filelist", data);
            this.appmodel.refresh();
            resolve(data)
          }.bind(this),
          error: function (err) {
            reject(err)
          }.bind(this)
        });
      }.bind(this));
    },

    handleCancelGEdit: function () {

      var oModel = this.getOwnerComponent().getModel("appmodel");
      var URL = "/api/process/lock";
      oModel.setProperty("/props/gEditMode", false);

      this.appmodel.setProperty("/props/lineItemTable/editMode", false);

      this.ajax("DELETE", URL, {
        packageId: this._packageId
      }).then(function (data) {
        // if success means lock was removed
        console.log(data);

        var oModel = this.getOwnerComponent().getModel("appmodel");
        oModel.setProperty("/props/gEditMode", false);

        this.appmodel.setProperty("/props/lineItemTable/editMode", false);


        MessageToast.show("Document unlocked");

        // Make PO_INV_LINE table uneditable

        if (this.appmodel.getProperty("/props/POMode")) {

          this.rebindTable(this.oReadOnlyTemplate, "Navigation");
          this.getView().byId("idInvLineItemTable").setMode("None");
        } else {

          this.rebindTable(this.oReadOnlyTemplateNPo, "Navigation");
          this.getView().byId("idNPOInvLineTable").setMode("None");
        }

      }.bind(this)).catch(function (err) {
        console.log("FAILED TO REMOVE LOCK", err);
        MessageToast.show("Unable to unlock Document");
      });

      // // Make PO_INV_LINE table un-editable
      // this.rebindTable(this.oReadOnlyTemplate, "Navigation");
      // this.getView().byId("idInvLineItemTable").setMode("None");
    },

    handleGEdit: function () {

      var URL = "/api/process/lock"
      // try to get lock
      this.ajax("POST", URL, {
        packageId: this._packageId
      }).then(function (data) {
        // if success means lock was set
        console.log(data);

        var oModel = this.getOwnerComponent().getModel("appmodel");
        oModel.setProperty("/props/gEditMode", true);

        this.appmodel.setProperty("/props/lineItemTable/editMode", true);

        MessageToast.show("Document locked");

        // Make PO_INV_LINE table editable
        if (this.appmodel.getProperty("/props/POMode")) {
          this.getView().byId("idInvLineItemTable").setMode("MultiSelect");
          this.rebindTable(this.oEditableTemplate, "Edit");
        } else {
          this.getView().byId("idNPOInvLineTable").setMode("MultiSelect");
          this.rebindTable(this.oEditableTemplateNPo, "Edit");
        }

      }.bind(this)).catch(function (err) {
        console.log("FAILED TO SET LOCK", err);
      });
      
    },

    onEditInvLineItems: function (oEvent) {
      // this.aProductCollection = deepExtend([], this.oModel.getProperty("/DocxLines"));
      this.appmodel.setProperty("/props/lineItemTable/editMode", oEvent.getParameter("pressed"));

      if (oEvent.getParameter("pressed")) {
        this.getView().byId("idInvLineItemTable").setMode("MultiSelect");
        this.rebindTable(this.oEditableTemplate, "Edit");
      } else {
        this.rebindTable(this.oReadOnlyTemplate, "Navigation");
        this.getView().byId("idInvLineItemTable").setMode("None");
      }
    },

    onAddRow: function (oEvent) {
      if (this.appmodel.getProperty("/props/POMode")) {
        var aDocxLines = this.getOwnerComponent().getModel("appmodel").getProperty("/DocxLines");
        aDocxLines.push({
          "InvoiceLineItem": "",
          "Description": "",
          "Amount": 0,
          "Currency": null,
          "Quantity": 1,
          "UoM": null,
          "PONumber": null,
          "POLineItem": null,
          "TaxCode": null,
          "TaxName": null,
        });
        this.getOwnerComponent().getModel("appmodel").setProperty("/DocxLines", aDocxLines);
      } else {
        var aNonPoDocxLines = this.getOwnerComponent().getModel("appmodel").getProperty("/NonPoDocxLines");
        aNonPoDocxLines.push({
          "InvoiceLineItem": "",
          "Description": "",
          "CDInd": "false",
          "CompanyCode": null,
          "Amount": 0,
          "Currency": null,
          "Quantity": 1,
          "TaxCode": null,
          "TaxAmount": null,
          "UoM": null,
          "Bukrs": null,
          "GLAcc": null,
          "WBSElem": null,
          "ProfitCen": null,
        });
        this.getOwnerComponent().getModel("appmodel").setProperty("/NonPoDocxLines", aNonPoDocxLines);
      }

    },

    onDeleteSelectedRows: function () {
      // //debugger;     

      if (this.appmodel.getProperty("/props/POMode")) {
        var oTable = this.getView().byId("idInvLineItemTable");

        console.log(oTable.getSelectedContexts()); // [{path: "/DocxLines/0"}]
        var selectedContexts = oTable.getSelectedContexts();

        var aBindingContext = oTable.getItems().map(function (oItem) {
          return oItem.getBindingContext("appmodel");
        }); // [sap.m.ColunListItem]

        console.log(aBindingContext);

        let a = new Set(aBindingContext);
        let b = new Set(selectedContexts);
        let diff = new Set([...a].filter(x => !b.has(x)));

        var aDiff = [...diff];
        console.log(aDiff);

        var values = aDiff.map(function (ctx) {
          return ctx.getObject();
        });

        if (values.length <= 0) {
          MessageToast.show("Select rows for deletion!")
        }
        else {
          this.getOwnerComponent().getModel("appmodel").setProperty("/DocxLines", values);
          oTable.removeSelections(true);
          this.calcTotals();
        }
      }
      else {
        var oTable = this.getView().byId("idNPOInvLineTable");

        console.log(oTable.getSelectedContexts());
        var selectedContexts = oTable.getSelectedContexts();

        var aBindingContext = oTable.getItems().map(function (oItem) {
          return oItem.getBindingContext("appmodel");
        }); // [sap.m.ColunListItem]

        console.log(aBindingContext);

        let a = new Set(aBindingContext);
        let b = new Set(selectedContexts);
        let diff = new Set([...a].filter(x => !b.has(x)));

        var aDiff = [...diff];
        console.log(aDiff);

        var values = aDiff.map(function (ctx) {
          return ctx.getObject();
        });

        if (values.length <= 0) {
          MessageToast.show("Select rows for deletion!")
        }
        else {
          this.getOwnerComponent().getModel("appmodel").setProperty("/NonPoDocxLines", values);
          oTable.removeSelections(true);
          this.calcTotals();
        }

      }
    },



    handleAboutPress: function () {
      var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(3);
      this.oRouter.navTo("page2", { layout: oNextUIState.layout });
    },

    handleFullScreen: function () {
      var oModel = this.getOwnerComponent().getModel();
      oModel.setProperty("/layout", 'MidColumnFullScreen');

      this.bFocusFullScreenButton = true;

      var oModel = this.getOwnerComponent().getModel();
      var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
      oModel.setData(oUIState);
      // MidColumnFullScreen
      // var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
      // this.oRouter.navTo("detailDetail", { layout: sNextLayout, packageId: this._packageId });
    },

    handleExitFullScreen: function () {
      var oModel = this.getOwnerComponent().getModel();
      oModel.setProperty("/layout", 'TwoColumnsMidExpanded');

      this.bFocusFullScreenButton = true;

      var oModel = this.getOwnerComponent().getModel();
      var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
      oModel.setData(oUIState);
      // var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
      // this.oRouter.navTo("detailDetail", { layout: sNextLayout, packageId: this._packageId });
    },

    handleClose: function () {
      var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
      this.oRouter.navTo("detail", { layout: sNextLayout, product: this._product });
    },

    getDoxData: function (oData) {
      var oURL = {
        job: "/api/dox/document/jobs/" + oData.JobId + "?clientId=" + oData.ClientId + ""
      };

      return new Promise(function (resolve, reject) {
        $.ajax({
          url: oURL.job,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "cache": false,
          },
          dataType: "json",
          async: true,
          success: function (data) {
            resolve(data);
          },
          error: function (error) {
            reject(error);
          }
        });
      });
    },

    fetchData: function (packageId) {
      if (!packageId) {
        console.log("packageId not passed");
        return null;
      }
      this.I_PACKAGEID = packageId;
      var aURL = "/api/dashboard?PackageId=" + packageId + "";

      return new Promise(function (resolve, reject) {

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
          success: function (data) {

            // set necessary state
            var record = data.pop();

            var type = record.DocCategory;
            this.I_JOBID = record.JobId;

            if (type && (type === 'Non-PO Invoice' || type === 'Non-PO Credit Memo')) {
              this.appmodel.setProperty("/props/POMode", false)
            } else {
              this.appmodel.setProperty("/props/POMode", true)
            }

            if (record.IsMain === 0)
              record.IsMain = false
            else
              record.IsMain = true
            resolve(record);
          }.bind(this),
          error: function (error) {
            reject(error);
          }.bind(this)
        });

      }.bind(this));
    },

    loadHeaderFromDB: function (packageId) {
      if (!packageId) {
        console.log("packageId not passed");
        return null;
      }
      var aURL = "/api/dashboard?PackageId=" + packageId + "";

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
          var data = oData.pop()
          var appModel = this.getOwnerComponent().getModel("appmodel");
          appModel.setProperty("/detail/header", data);
        }.bind(this),
        error: function (error) {
          console.log(error);
        }
      });

    },


    /* Helpers */

    convertToPattern: function (sValue) {

      if (sValue) {

        sValue = sValue.substring(0, 19);
        sValue = sValue.trim();

        var aStrings = sValue.split(" ");
        sValue = aStrings.join("*");
        sValue = "*" + sValue + "*";

        return sValue;
      }
      return null;
    },

    /* Value Helps Block */
    /* Currency */
    fetchCurrency: function (code) {
      var aURL = "/api/dashboard/currency";
      if (code) {
        aURL = aURL + "?code=" + code + "";
      }

      return new Promise(function (resolve, reject) {

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
          success: function (data) {
            resolve(data.results);
          },
          error: function (error) {
            reject(error);
          }
        });

      });
    },
    onInvDocTypeVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      var type;
      if (this.appmodel.getProperty("/props/POMode")) {
        type = "PO";

      } else {
        type = "NONPO";

      }

      //create dialog
      if (!this.getView().byId("invdoctypDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.InvDocTyp",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);
          oDialog.open();

          var oBinding = oDialog.getBinding("items");
          // build filter array
          var aFilter = [];
          aFilter.push(new Filter("Paramtype", FilterOperator.EQ, "AP_APP"));
          aFilter.push(new Filter("Subtype", FilterOperator.EQ, "VH"));
          aFilter.push(new Filter("Key2", FilterOperator.EQ, type));
          oBinding.filter(aFilter);

        });
      } else {
        this.getView().byId("invdoctypDialog").open();

        var oBinding = this.getView().byId("invdoctypDialog").getBinding("items");
        // build filter array
        var aFilter = [];
        aFilter.push(new Filter("Paramtype", FilterOperator.EQ, "AP_APP"));
        aFilter.push(new Filter("Subtype", FilterOperator.EQ, "VH"));
        aFilter.push(new Filter("Key2", FilterOperator.EQ, type));
        oBinding.filter(aFilter);
      }
    },

    onConfirmDocTyp: function (oEvent) {
      var sValue = oEvent.getParameter("selectedItem").getTitle();
      this.oInput.setValue(sValue);
    },

    onVHCurrency: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      //create dialog
      if (!this.getView().byId("currencyDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.Currency",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.getView().byId("currencyDialog").open();
      }
    },

    onSearchCurrency: function (oEvent) {
      var sTerm = oEvent.getParameter('value');

      // build filter array
      var aFilter = [];
      if (sTerm) {
        aFilter.push(new Filter("code", FilterOperator.Contains, sTerm));
      }

      // filter binding
      var oList = this.getView().byId("currencyDialog");
      var oBinding = oList.getBinding("items");
      oBinding.filter(aFilter);

    },

    onConfirmCurrency: function (oEvent) {
      var sCurr = oEvent.getParameter("selectedItem").getTitle();
      //this.getView().getModel("appmodel").setProperty("/detailDetail/header/currencyCode/value", sCurr);
      this.appmodel.setProperty("/detailDetail/header/currencyCode/value", sCurr);
      this.oInput.setValue(sCurr);

    },

    onCancelCurrency: function (oEvent) {
      // filter binding
      var oList = this.getView().byId("currencyDialog");
      var oBinding = oList.getBinding("items");
      oBinding.filter([]);
      this.oInput.setValue("");
    },

    /* Vendor */
    onVendorVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      var sTerm = oView.byId("idSenderName").getValue();

      //sTerm = this.convertToPattern(sTerm);

      var oModel = this.getOwnerComponent().getModel("APModel");

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/vendorSet",
          // filters: new Filter("Name1", FilterOperator.EQ, sTerm),
          template: new sap.m.StandardListItem({
            title: "{Lifnr}",
            description: "{Name1}"
          })
        });

        oView.getModel("APModel").refresh();
      }
      //create dialog
      if (!this.getView().byId("vendorDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.Vendor",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          bindList(oDialog, oModel, oView);
          if (sTerm) {
            oDialog.getBinding("items").filter(new Filter("Name1", FilterOperator.EQ, sTerm));

          }
          oDialog.open();
        });
      } else {
        var oDialog = this.getView().byId("vendorDialog");
        bindList(oDialog, oModel, oView);
        if (sTerm) {
          oDialog.getBinding("items").filter(new Filter("Name1", FilterOperator.EQ, sTerm));

        }
        oDialog.open();

      }
    },

    onVendorChange: function (oEvent) {
      var sLifnr = oEvent.getParameter('value');
      //var sTerm = this.convertToPattern(sLifnr);
      var sTerm = sLifnr;
      var oModel = this.getOwnerComponent().getModel("APModel")
      oModel.refresh();

      oModel.read("/vendorSet", {
        filters: [new Filter("Name1", FilterOperator.EQ, sTerm)],
        success: function (oData) {
          this.getView().byId("idSenderName").setValue(oData.results[0].Name1);
        }.bind(this),
        error: function (oErr) {
          console.log('vendor error', oErr);
        }
      });

      this.bindBankKey(this.getView(), oModel, null, sLifnr);

    },

    onSearchVendor: function (oEvent) {
      var oDialog = this.getView().byId("vendorDialog");
      var sTerm = oEvent.getParameter('value');

      //sTerm = this.convertToPattern(sTerm);

      // build filter array
      var aFilter = [];
      if (sTerm) {
        aFilter.push(new Filter("Name1", FilterOperator.EQ, sTerm));
      }

      // filter binding
      var oBinding = oDialog.getBinding("items");
      oBinding.filter(aFilter);

    },

    onConfirmVendor: function (oEvent) {
      var sLifnr = oEvent.getParameter("selectedItem").getTitle();
      var sLifnrTxt = oEvent.getParameter("selectedItem").getDescription();
      this.oInput.setValue(sLifnr);
      this.appmodel.setProperty("/detailDetail/header/senderName/value", sLifnrTxt);
      var oModel = this.getOwnerComponent().getModel("APModel");

      this.bindBankKey(this.getView(), oModel, null, sLifnr);
      oModel.refresh();
    },

    onCancelVendor: function (oEvent) {
      // filter binding
      var oList = this.getView().byId("vendorDialog");
      var oBinding = oList.getBinding("items");
      oBinding.filter([]);
      this.oInput.setValue("");
    },

    /* Company Code */

    onCompCodeChange: function (oEvent) {
      if (this.flag && this.flag === 'item') {
        var sBukrs = oEvent.getParameter('value');
        // this.oInput.setValue(sBukrs);
        var oModel = this.getOwnerComponent().getModel("APModel")

        this.flag = null;
        oModel.refresh();

      } else {
        var sBukrs = oEvent.getParameter('value');
        // this.oInput.setValue(sBukrs);
        var oModel = this.getOwnerComponent().getModel("APModel")
        oModel.refresh();

        oModel.read("/companycodeSet", {
          filters: [new Filter("Name", FilterOperator.EQ, sBukrs)],
          success: function (oData) {
            this.getView().byId("idReceiverName").setValue(oData.results[0].Name);
          }.bind(this),
          error: function (oErr) {
            console.log('companycode error', oErr);
          }
        });

        this.bindTaxCode(this.getView(), oModel, null, sBukrs);

        // set this comp-code to all line items
        var oNonPOLines = this.appmodel.getProperty("/NonPoDocxLines");

        // Non PO Based
        oNonPOLines = oNonPOLines.map(function (obj) {
          obj.Bukrs = sBukrs;

          return obj;
        });
        this.appmodel.setProperty("/NonPoDocxLines", oNonPOLines);

      }
    },

    onCompCodeVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      var sTerm = oView.byId("idReceiverName").getValue();
      var aFilter = [];

      if (sTerm.trim().length === 0) {
        // Dont send the Name filter
        aFilter = [];
      } else {
        //sTerm = this.convertToPattern(sTerm);
        aFilter.push(new Filter("Name", FilterOperator.EQ, sTerm))
      }

      var oModel = this.getOwnerComponent().getModel("APModel");

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/companycodeSet",
          filters: aFilter,
          template: new sap.m.StandardListItem({
            title: "{Bukrs}",
            description: "{Name}"
          })
        });

        oView.getModel("APModel").refresh();
      }
      //create dialog
      if (!this.getView().byId("compcodeDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.CompCode",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          bindList(oDialog, oModel, oView);

          oDialog.open();
        });
      } else {
        var oDialog = this.getView().byId("compcodeDialog");
        bindList(oDialog, oModel, oView);

        oDialog.open();

      }
    },

    onCompCodeVH2: function (oEvent, flag) {
      this.flag = flag;
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      var oModel = this.getOwnerComponent().getModel("APModel");

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/companycodeSet",
          template: new sap.m.StandardListItem({
            title: "{Bukrs}",
            description: "{Name}"
          })
        });

        oView.getModel("APModel").refresh();
      }
      //create dialog
      if (!this.getView().byId("compcodeDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.CompCode",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          bindList(oDialog, oModel, oView);

          oDialog.open();
        });
      } else {
        var oDialog = this.getView().byId("compcodeDialog");
        bindList(oDialog, oModel, oView);

        oDialog.open();

      }
    },

    onSearchCompCode: function (oEvent) {
      var oView = this.getView();
      var oModel = oView.getModel("APModel")
      var oDialog = oView.byId("compcodeDialog");
      var sTerm = oEvent.getParameter('value');

      //sTerm = this.convertToPattern(sTerm);

      // build filter array
      var aFilter = [];
      if (sTerm) {
        aFilter.push(new Filter("Name", FilterOperator.EQ, sTerm));
      }

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/companycodeSet",
          template: new sap.m.StandardListItem({
            title: "{Bukrs}",
            description: "{Name}"
          }),
          filters: aFilter
        });

        oView.getModel("APModel").refresh();
      }

      bindList(oDialog, oModel, oView);

      // filter binding
      // var oBinding = oDialog.getBinding("items");
      // oBinding.filter(aFilter);

    },

    onConfirmCompCode: function (oEvent) {

      if (this.flag && this.flag === 'item') {
        var sBukrs = oEvent.getParameter("selectedItem").getTitle();
        this.oInput.setValue(sBukrs);
        var oModel = this.getOwnerComponent().getModel("APModel")

        this.flag = null;
        oModel.refresh();

      } else {

        var sBukrs = oEvent.getParameter("selectedItem").getTitle();
        var sBukrsTxt = oEvent.getParameter("selectedItem").getDescription();
        this.oInput.setValue(sBukrs);
        this.appmodel.setProperty("/detailDetail/header/receiverName/value", sBukrsTxt);
        var oModel = this.getOwnerComponent().getModel("APModel")
        oModel.refresh();

        this.bindTaxCode(this.getView(), oModel, null, sBukrs);

        // set this comp-code to all line items
        var oNonPOLines = this.appmodel.getProperty("/NonPoDocxLines");

        // Non PO Based
        oNonPOLines = oNonPOLines.map(function (obj) {
          obj.Bukrs = sBukrs;

          return obj;
        });
        this.appmodel.setProperty("/NonPoDocxLines", oNonPOLines);

      }
    },

    onCancelCompCode: function (oEvent) {
      // filter binding
      var oList = this.getView().byId("compcodeDialog");
      var oBinding = oList.getBinding("items");
      oBinding.filter([]);
      this.oInput.setValue("");
    },

    /* Purchase Order */

    onPurchOrderVH: function (oEvent) {
      var oView = this.getView();

      var oModel = this.getOwnerComponent().getModel("APModel");
      var Ebeln = this.appmodel.getProperty("/detailDetail/header/purchaseOrderNumber/value");
      this._sPathPOValue = oEvent.getSource().getBindingContext("appmodel").getPath();

      function bindList(oDialog) {
        oDialog.setModel(oModel);
        var oBinding = oView.byId("idVHPOLines").getBinding("items");
        oBinding.filter([new Filter("Ebeln", FilterOperator.EQ, Ebeln)])

        // Bind Header Attributes
        oView.byId("poHeaderBox0").bindElement("/poheaderSet(Ebeln='" + Ebeln + "')");
      }


      //create dialog
      if (!this.oDialog) {
        this.oDialog = Fragment.load({
          id: oView.getId("idPOLines_VH"),
          name: "touchlessui.view.fragments.POLines_VH",
          controller: this
        }).then(function (oDialog) {
          // connect dialog to the root view of this component (models, lifecycle)
          oView.addDependent(oDialog);
          oDialog.open();

          bindList(oDialog);

        }.bind(this));
      } else {
        var oDialog = this.getView().byId("idPOLines_VH");
        oDialog.open();
        bindList(oDialog);

      }
    },

    onPOLinesDialogClose: function (oEvent) {
      this.getView().byId("idPOLines_VH").close();
    },

    onPressPOLineItem: function (oEvent) {
      var obj = oEvent.getSource().getBindingContext().getObject();

      this.appmodel.setProperty(this._sPathPOValue + "/PONumber", obj.Ebeln);
      this.appmodel.setProperty(this._sPathPOValue + "/POLineItem", obj.Ebelp);
      this.appmodel.setProperty(this._sPathPOValue + "/UoM", obj.Meins);
      this.getView().byId("idPOLines_VH").close();
    },

    onPOSearch: function (oEvent) {
      // //debugger;
      var oView = this.getView();
      var sPO = oEvent.getParameter("query");
      // var oDialog = this.getView().byId("idPOLines_VH");

      function bindList(sEbeln) {
        // oDialog.setModel(oModel);
        var oBinding = oView.byId("idVHPOLines").getBinding("items");
        oBinding.filter([new Filter("Ebeln", FilterOperator.EQ, sEbeln)])

        // Bind Header Attributes
        oView.byId("poHeaderBox0").bindElement("/poheaderSet(Ebeln='" + sEbeln + "')");
      }

      bindList(sPO);

    },

    /* Non PO Value Helps */
    /* GL Account */

    onGLAcctVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      var sBukrs = oEvent.getSource().getBindingContext("appmodel").getObject("Bukrs");

      if (!sBukrs || sBukrs.length <= 0) {
        MessageToast.show("Select a company code.");
        return;
      }
      var oModel = this.getOwnerComponent().getModel("APModel");

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/glaccountSet",
          // filters: new Filter("Bukrs", FilterOperator.EQ, sBukrs),
          template: new sap.m.StandardListItem({
            title: "{Saknr}"
            // description: "{Bukrs}"
          })
        });
        // oView.getModel("APModel").refresh();
      }
      //create dialog
      if (!this.getView().byId("glacctDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.GLAccount",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          bindList(oDialog, oModel, oView);
          if (sBukrs) {
            oDialog.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
          }

          oDialog.open();
        });
      } else {
        var oDialog = this.getView().byId("glacctDialog");
        bindList(oDialog, oModel, oView);
        if (sBukrs) {
          oDialog.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
        }

        oDialog.open();

      }
    },

    onSearchGLAcct: function (oEvent) {
      var oDialog = this.getView().byId("glacctDialog");
      var sTerm = oEvent.getParameter('value');

      sTerm = this.convertToPattern(sTerm);

      var oBinding = oDialog.getBinding("items");
      // build filter array
      var aFilter = [];
      // get existing Bukrs filter
      aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oBinding.aFilters[0].oValue1));

      if (sTerm) {
        aFilter.push(new Filter("Saknr", FilterOperator.EQ, sTerm));
      }

      // filter binding
      oBinding.filter(aFilter);
      // oEvent.getSource().getBinding("items").filter(aFilter);

    },

    onConfirmGLAcct: function (oEvent) {
      var sSaknr = oEvent.getParameter("selectedItem").getTitle();
      this.oInput.setValue(sSaknr);
    },

    onCancelGLAcct: function (oEvent) {
      // this.getView().byId("glacctDialog").close();
    },

    onSearchGLAcct2: function (oEvent) {
      ////debugger;
      var oDialog = this.getView().byId("idGLAcc2_VH");
      var sTerm = oEvent.getParameter('query');

      sTerm = this.convertToPattern(sTerm);

      var List2 = oDialog.getContent()[1];
      var oBinding = List2.getBinding("items");
      // build filter array
      var aFilter = [];

      aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oBinding.aFilters[0].oValue1));

      if (sTerm) {
        aFilter.push(new Filter("Saknr", FilterOperator.EQ, sTerm));
      }

      // filter binding
      oBinding.filter(aFilter);

    },

    onCancelGLAcct2: function () {
      this.getView().byId("idGLAcc2_VH").close();
    },

    onConfirmGLAcct2: function (oEvent) {
      ////debugger;
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sSaknr = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).value;
      this.oInput.setValue(sSaknr);
      this.getView().byId("idGLAccount_VH").removeSelections(true);
      this.getView().byId("idGLAcc2_VH").close();
    },
    onConfirmGLAcct2Odata: function (oEvent) {
     // //debugger;
      var sSaknr = oEvent.getParameter("listItem").getBindingContext().getObject('Saknr');
      this.oInput.setValue(sSaknr);
      this.getView().byId("idGLAcc2_VH").close();
    },

    onGLAcctVH2: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();

      var sBukrs = oEvent.getSource().getBindingContext("appmodel").getObject("Bukrs");

      if (!sBukrs || sBukrs.length <= 0) {
        MessageToast.show("Select a company code.");
        return;
      }

      var oPayload = {
        sBukrs: sBukrs,
        sMwskz: oEvent.getSource().getBindingContext("appmodel").getObject("TaxCode"),
        sWrbtr: oEvent.getSource().getBindingContext("appmodel").getObject("Amount")
      }

      var oModel = this.getOwnerComponent().getModel("APModel");
      this.appmodel.setProperty("/valuehelps/HKONTData", []);

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/glaccountSet",
          template: new sap.m.StandardListItem({
            title: "{Saknr}"
          })
        });
        // oView.getModel("APModel").refresh();
      }


      //create dialog
      if (!this.getView().byId("idGLAcc2_VH")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.GLAccount2",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          var List1 = oDialog.getContent()[0];
          var List2 = oDialog.getContent()[1];

          bindList(List2, oModel, oView);
          if (sBukrs) {
            List2.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
          }

          this.bindIORList_GL(List1, oPayload, oView);
          this.bindDARList_GL(List1, oPayload, oView);

          oDialog.open();
        }.bind(this));

      } else {
        var oDialog = this.getView().byId("idGLAcc2_VH");
        var List1 = oDialog.getContent()[0];
        var List2 = oDialog.getContent()[1];

        bindList(List2, oModel, oView);
        if (sBukrs) {
          List2.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
        }

        this.bindIORList_GL(List1, oPayload, oView);
        this.bindDARList_GL(List1, oPayload, oView);

        oDialog.open();

      }
    },

    bindIORList_GL: function (oDialog, oParams, oView) {
      //var URL = '/ior/inference';
      var URL = '/api/inference'; // Using inference service created in mtastandalone-backend app
      var BUDAT = oView.byId("idDocDate").getDateValue();

      console.log("Params:", oParams);
      var oPayload = [
        {
          UID: 1,
          BUKRS: oParams.sBukrs,
          KOART: 'K',
          MWSKZ: oParams.sMwskz,
          WRBTR: oParams.sWrbtr,
          LIFNR: oView.byId("idVendorNumber").getValue(),
          _BKPF_BLART: oView.byId("idInvDocType").getValue(),
          _BKPF_BUDAT: moment(BUDAT).format('MM-DD-YYYY'),
          _BKPF_WAERS: oView.byId("idCurrency").getValue()
        }
      ];

      console.log("Payload type", typeof (oPayload));

      this.ajax("POST", URL, oPayload)
        .then(function (data) {
          console.log("Payload for IOR", data);
          // if(data.HKONT) {
          //   for(var i=0; i< data.HKONT.length ; i++) {
          //     data.HKONT[i].Conf = Math.round(parseFloat(data.HKONT[i].Conf) * 100)
          //   }
          // }
          
          this.appmodel.setProperty("/valuehelps/HKONTData", data.HKONT);
        }.bind(this))
        .catch(function (err) {
          console.log("Errored:", err);
          this.appmodel.refresh();
          MessageToast.show("Error in loading recommended G/L Account")
        }.bind(this))
    },
    bindDARList_GL: function (oDialog, oParams, oView) {
      // var URL = '/ior/inference';
      //var URL = "/dar/models/model_test2Schema_1678955861028/versions/1";
      var oDARdetails=this.appmodel.getData().darDetails;
      var oModelName = oDARdetails.ModelName
      var URL = "/dar/models/"+oModelName+"/versions/1";
      var featuresArray=[];
      for(var i=0;i<oDARdetails.DataSetSchemaPayload.features.length;i++){
        var data={          
            "name": oDARdetails.DataSetSchemaPayload.features[i].label,
            "value": ""
        }
        featuresArray.push(data);
      }
      var oPayload = {
        "topN": 3,
        "objects": [
          {
            "objectId": "44521",
            "features": featuresArray
          }  
        ]
      }

      console.log("Payload", oPayload);

      this.ajax("POST", URL, oPayload)
        .then(function (data) {
          console.log("Payload for DAR Inference", data);
          for(var i=0;i<data.predictions[0].labels.length;i++){
            if(data.predictions[0].labels[i].name == "HKONT"){
              this.appmodel.setProperty("/valuehelps/HKONT", data.predictions[0].labels[i].results);
            } else if(data.predictions[0].labels[i].name == "KOSTL"){
                this.appmodel.setProperty("/valuehelps/KOSTL", data.predictions[0].labels[i].results);
              }else if(data.predictions[0].labels[i].name == "WBSelement"){
                this.appmodel.setProperty("/valuehelps/WBSelement", data.predictions[0].labels[i].results);
              }else if(data.predictions[0].labels[i].name == "Profitcenters"){
                this.appmodel.setProperty("/valuehelps/Profitcenters", data.predictions[0].labels[i].results);
              }else if(data.predictions[0].labels[i].name == "Paymentterms"){
                this.appmodel.setProperty("/valuehelps/Paymentterms", data.predictions[0].labels[i].results);
              }else if(data.predictions[0].labels[i].name == "Partnerbanktype"){
                this.appmodel.setProperty("/valuehelps/Partnerbanktype", data.predictions[0].labels[i].results);
              }else if(data.predictions[0].labels[i].name == "Taxcode"){
                this.appmodel.setProperty("/valuehelps/Taxcode", data.predictions[0].labels[i].results);
              }
          }
          
        }.bind(this))
        .catch(function (err) {
          console.log("Errored:", err);
          MessageToast.show("Error in loading recommended G/L Account")
          this.appmodel.refresh();
        }.bind(this))
    },


    onSwitchGL: function (oEvent) {
      var bBool = oEvent.getParameter('state');

      this.appmodel.setProperty("/props/ior_hkont", bBool);
    },

    /* Cost Center */

    onCostCenterVH: function (oEvent) {
      // //debugger;
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      var sBukrs = oEvent.getSource().getBindingContext("appmodel").getObject("Bukrs");

      if (!sBukrs || sBukrs.length <= 0) {
        MessageToast.show("Select a company code.");
        return;
      }

      var oModel = this.getOwnerComponent().getModel("APModel");

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/costcenterSet",
          // filters: new Filter("Bukrs", FilterOperator.EQ, sBukrs),
          template: new sap.m.StandardListItem({
            title: "{Kostl}"
            // description: "{Bukrs}"
          })
        });
        // oView.getModel("APModel").refresh();
      }
      //create dialog
      if (!this.getView().byId("costcenterDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.CostCenter",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          bindList(oDialog, oModel, oView);
          if (sBukrs) {
            oDialog.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
          }

          oDialog.open();
        });
      } else {
        var oDialog = this.getView().byId("costcenterDialog");
        bindList(oDialog, oModel, oView);
        if (sBukrs) {
          oDialog.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
        }

        oDialog.open();

      }
    },

    onSearchCostCenter: function (oEvent) {
      var oDialog = this.getView().byId("costcenterDialog");
      var sTerm = oEvent.getParameter('value');

      var oBinding = oDialog.getBinding("items");

      sTerm = this.convertToPattern(sTerm);
      var aFilter = [];

      aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oBinding.aFilters[0].oValue1));

      // build filter array
      if (sTerm) {
        aFilter.push(new Filter("Kostl", FilterOperator.EQ, sTerm));
      }

      // filter binding
      oBinding.filter(aFilter);

    },

    onConfirmCostCenter: function (oEvent) {
      var sKostl = oEvent.getParameter("selectedItem").getTitle();
      this.oInput.setValue(sKostl);
    },

    onCancelCostCenter: function (oEvent) {
      // this.getView().byId("costcenterDialog").close();
    },

    onSearchCostCenter2: function (oEvent) {
      var oDialog = this.getView().byId("idCostCenter2_VH");
      var sTerm = oEvent.getParameter('query');

      sTerm = this.convertToPattern(sTerm);

      var List2 = oDialog.getContent()[1];
      var oBinding = List2.getBinding("items");

      // build filter array
      var aFilter = [];
      aFilter.push(new Filter("Bukrs", FilterOperator.EQ, oBinding.aFilters[0].oValue1));

      if (sTerm) {
        aFilter.push(new Filter("Kostl", FilterOperator.EQ, sTerm));
      }

      // filter binding
      oBinding.filter(aFilter);

    },


    onCancelCostCenter2: function () {
      this.getView().byId("idCostCenter2_VH").close();
    },

    onConfirmCostCenter2: function (oEvent) {
      //debugger;
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sKostl = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).value;
      this.oInput.setValue(sKostl);
      this.getView().byId("idCostCenter_VH").removeSelections(true);
      this.getView().byId("idCostCenter2_VH").close();
    },

    onConfirmCostCenter2Odata: function (oEvent) {
      //debugger;
      var sKostl = oEvent.getParameter("listItem").getBindingContext().getObject('Kostl');
      this.oInput.setValue(sKostl);
      this.getView().byId("idCostCenter2_VH").close();
    },

    onCostCenterVH2: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();

      var sBukrs = oEvent.getSource().getBindingContext("appmodel").getObject("Bukrs");

      var oPayload = {
        sBukrs: sBukrs,
        sMwskz: oEvent.getSource().getBindingContext("appmodel").getObject("TaxCode"),
        sWrbtr: oEvent.getSource().getBindingContext("appmodel").getObject("Amount")
      }

      var oModel = this.getOwnerComponent().getModel("APModel");

      function bindList(oDialog, oModel, oView) {
        oDialog.setModel(oModel);
        oDialog.bindAggregation("items", {
          path: "/costcenterSet",
          template: new sap.m.StandardListItem({
            title: "{Kostl}"
          })
        });
        // oView.getModel("APModel").refresh();
      }


      //create dialog
      if (!this.getView().byId("idCostCenter2_VH")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.CostCenter2",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          var List1 = oDialog.getContent()[0];
          var List2 = oDialog.getContent()[1];

          bindList(List2, oModel, oView);
          if (sBukrs) {
            List2.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
          }

          //this.bindIORList_CC(List1, oPayload, oView);
          //this.bindDARList_CC(List1, oPayload, oView);

          oDialog.open();
        }.bind(this));

      } else {
        var oDialog = this.getView().byId("idCostCenter2_VH");
        var List1 = oDialog.getContent()[0];
        var List2 = oDialog.getContent()[1];

        bindList(List2, oModel, oView);
        if (sBukrs) {
          List2.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
        }

        //this.bindIORList_CC(List1, oPayload, oView);
        //this.bindDARList_CC(List1, oPayload, oView);

        oDialog.open();

      }
    },

    bindIORList_CC: function (oDialog, oParams, oView) {
      // var URL = '/ior/inference';
      var URL = '/api/inference'; // Using inference service created in mtastandalone-backend app
      var BUDAT = oView.byId("idDocDate").getDateValue();

      console.log("Params:", oParams);
      var oPayload = [
        {
          UID: 1,
          BUKRS: oParams.sBukrs,
          KOART: 'K',
          MWSKZ: oParams.sMwskz,
          WRBTR: oParams.sWrbtr,
          LIFNR: oView.byId("idVendorNumber").getValue(),
          _BKPF_BLART: oView.byId("idInvDocType").getValue(),
          _BKPF_BUDAT: moment(BUDAT).format('MM-DD-YYYY'),
          _BKPF_WAERS: oView.byId("idCurrency").getValue()
        }
      ];

      console.log("Payload", oPayload);

      this.ajax("POST", URL, oPayload)
        .then(function (data) {
          console.log("Payload for IOR", data);
          this.appmodel.setProperty("/valuehelps/KOSTLData", data.KOSTL);
        }.bind(this))
        .catch(function (err) {
          console.log("Errored:", err);
          MessageToast.show("Error in loading recommended Cost Center")
          this.appmodel.refresh();
        }.bind(this))
    },
    bindDARList_CC: function (oDialog, oParams, oView) {
      // var URL = '/ior/inference';
      //var URL = "/dar/models/model_test2Schema_1678955861028/versions/1";
      var oDARdetails=this.appmodel.getData().darDetails;
      var oModelName = oDARdetails.ModelName
      var URL = "/dar/models/"+oModelName+"/versions/1";
      var featuresArray=[];
      for(var i=0;i<oDARdetails.DataSetSchemaPayload.features.length;i++){
        var data={          
            "name": oDARdetails.DataSetSchemaPayload.features[i].label,
            "value": ""
        }
        featuresArray.push(data);
      }
      var oPayload = {
        "topN": 4,
        "objects": [
          {
            "objectId": "44521",
            "features": featuresArray
          }  
        ]
      }

      console.log("Payload", oPayload);

      this.ajax("POST", URL, oPayload)
        .then(function (data) {
          console.log("Payload for DAR Inference", data);
          // for(var i=0;i<data.predictions[0].labels.length;i++){
          //   if(data.predictions[0].labels[i].name == "KOSTL"){
          //     this.appmodel.setProperty("/valuehelps/KOSTL", data.predictions[0].labels[i].results);
          //   }else if(data.predictions[0].labels[i].name == "WBSelement"){
          //     this.appmodel.setProperty("/valuehelps/WBSelement", data.predictions[0].labels[i].results);
          //   }else if(data.predictions[0].labels[i].name == "Profitcenters"){
          //     this.appmodel.setProperty("/valuehelps/Profitcenters", data.predictions[0].labels[i].results);
          //   }
          // }
          
        }.bind(this))
        .catch(function (err) {
          console.log("Errored:", err);
          MessageToast.show("Error in loading recommended Cost Center")
          this.appmodel.refresh();
        }.bind(this))
    },

    onSwitchKOSTL: function (oEvent) {
      var bBool = oEvent.getParameter('state');

      this.appmodel.setProperty("/props/ior_kostl", bBool);
    },



    /* Profit Center */

    // onProfitCenterVH: function (oEvent) {
    //   this.oInput = oEvent.getSource();
    //   var oView = this.getView();
    //   var obj = oEvent.getSource().getBindingContext("appmodel").getObject();
    //   // var oFilterBukrs = new Filter("Bukrs", FilterOperator.EQ, obj.Bukrs);
    //   // var oFilterKostl = new Filter("Kostl", FilterOperator.EQ, obj.Kostl);

    //   var filters = [
    //     new Filter("Bukrs", FilterOperator.EQ, obj.Bukrs),
    //     new Filter("Kostl", FilterOperator.EQ, obj.CostCen)
    //   ];
      


    //   var oModel = this.getOwnerComponent().getModel("APModel");
      

    //   function bindList(oDialog, oModel, oView) {
    //     oDialog.setModel(oModel);
    //     oDialog.bindAggregation("items", {
    //       path: "/profitcenterSet",
          
    //       //filters: filters,
    //       template: new sap.m.StandardListItem({
    //         title: "{Prctr}"
    //          //infoState:"{path: 'probability',formatter: '.formatter.formatConfState'}"
    //       })
    //     });
    //     // oView.getModel("APModel").refresh();
    //   }
    //   //create dialog
    //   if (!this.getView().byId("profitcenterDialog")) {
    //     //load asynchronous fragment (XML)
    //     Fragment.load({
    //       id: oView.getId(),
    //       name: "touchlessui.view.fragments.ProfitCenter",
    //       controller: this
    //     }).then(function (oDialog) {
    //       //connect Menu to rootview of this component (models, lifecycle)
    //       oView.addDependent(oDialog);

    //       bindList(oDialog, oModel, oView);
    //       if (obj.Bukrs && obj.Kostl) {
    //         // oDialog.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
    //         oDialog.getBinding("items").filter(filters);
    //       }

    //       oDialog.open();
    //     });
    //   } else {
    //     var oDialog = this.getView().byId("profitcenterDialog");
    //     bindList(oDialog, oModel, oView);
    //     if (obj.Bukrs && obj.Kostl) {
    //       // oDialog.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
    //       oDialog.getBinding("items").filter(filters);
    //     }
    //     oDialog.open();

    //   }
    // },
    onProfitCenterVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();

      //create dialog
      if (!this.getView().byId("profitcenterDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.ProfitCenter",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.getView().byId("profitcenterDialog").open();
      }
    },
    //Payment Terms
    onPayTermsVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();

      //create dialog
      if (!this.getView().byId("idPayDialog_VH")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.PayTermsVH",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.getView().byId("idPayDialog_VH").open();
      }
    },
    onConfirmPayTerms: function (oEvent) {
      //debugger;
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sKostl = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).value;
      this.oInput.setValue(sKostl);
      this.getView().byId("idPayTermsVH").removeSelections(true);
      this.getView().byId("idPayDialog_VH").close();
    },
    onConfirmPayTerms2: function (oEvent) {
      //debugger;
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sKostl = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).Paymentterms;
      this.oInput.setValue(sKostl);
      this.getView().byId("idPayDialog_VH").close();
    },
    onCancelPaymentTermsVH: function () {
      this.getView().byId("idPayDialog_VH").close();
    },
    //Partner Bank Type
    onPartnerBankVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();

      //create dialog
      if (!this.getView().byId("idPartnerBankDialog_VH")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.PartnerBank",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.getView().byId("idPartnerBankDialog_VH").open();
      }
    },
    onConfirmPartnerBank: function (oEvent) {
      //debugger;
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sKostl = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).value;
      this.oInput.setValue(sKostl);
      this.getView().byId("idPertnerBank_VH").removeSelections(true);
      this.getView().byId("idPartnerBankDialog_VH").close();
    },
    onCancelPartnerBankVH: function () {
      this.getView().byId("idPartnerBankDialog_VH").close();
    },

    //Tax Code VH
    // onTaxCodeVH: function (oEvent) {
    //   this.oInput = oEvent.getSource();
    //   var oView = this.getView();

    //   //create dialog
    //   if (!this.getView().byId("idTaxDialog_VH")) {
    //     //load asynchronous fragment (XML)
    //     Fragment.load({
    //       id: oView.getId(),
    //       name: "touchlessui.view.fragments.TaxCode_VH",
    //       controller: this
    //     }).then(function (oDialog) {
    //       //connect Menu to rootview of this component (models, lifecycle)
    //       oView.addDependent(oDialog);
    //       oDialog.open();
    //     });
    //   } else {
    //     this.getView().byId("idTaxDialog_VH").open();
    //   }
    // },
    onConfirmTaxCodeVH: function (oEvent) {
      //debugger;
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sKostl = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).value;
      this.oInput.setValue(sKostl);
      this.getView().byId("iTaxCod_VH").removeSelections(true);
      this.getView().byId("taxcodeDialog").close();
    },
    
    onCanceltaxCodeVH: function () {
      this.getView().byId("taxcodeDialog").close();
    },
    


    onSearchProfitCenter: function (oEvent) {
      var oDialog = this.getView().byId("profitcenterDialog");
      var sTerm = oEvent.getParameter('value');

      sTerm = this.convertToPattern(sTerm);

      // build filter array
      var aFilter = [];
      if (sTerm) {
        aFilter.push(new Filter("Prctr", FilterOperator.EQ, sTerm));
      }

      // filter binding
      var oBinding = oDialog.getBinding("items");
      oBinding.filter(aFilter);

    },

    onConfirmProfitCenter: function (oEvent) {
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sSaknr = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).value;
      this.oInput.setValue(sSaknr);
      this.getView().byId("idProfitCenterVH").removeSelections(true);
      this.getView().byId("profitcenterDialog").close();
    },

    onCancelProfitCenter: function (oEvent) {
       this.getView().byId("profitcenterDialog").close();
    },

    /* Tax Code */

    onTaxCodeVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();
      var oModel = this.getOwnerComponent().getModel("APModel");

      if (this.appmodel.getProperty("/props/POMode")) {
        // var sEbeln = oEvent.getSource().getBindingContext("appmodel").getObject("PONumber");
        var sEbeln;

        if (!sEbeln) {
          sEbeln = this.getView().byId("idPurchaseOrder").getValue();
        }

        oModel.read("/taxcodeSet", {
          filters: [new Filter("Ebeln", FilterOperator.EQ, sEbeln)],
          success: function (oData) {

            this.appmodel.setProperty("/valuehelps/taxcode2", oData.results);

          }.bind(this),
          error: function (oErr) {
            console.log('taxcode2 error', oErr);
          }
        });

      } else {
        var sBukrs = oEvent.getSource().getBindingContext("appmodel").getObject("Bukrs");

        if (!sBukrs) {
          sBukrs = this.getView().byId("idCompanyCode").getValue();
        }

        oModel.read("/taxcodeSet", {
          filters: [new Filter("Bukrs", FilterOperator.EQ, sBukrs)],
          success: function (oData) {

            this.appmodel.setProperty("/valuehelps/taxcode2", oData.results);

          }.bind(this),
          error: function (oErr) {
            console.log('taxcode2 error', oErr);
          }
        });

      }

      //create dialog
      if (!this.getView().byId("taxcodeDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.TaxCode_VH",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);

          // bindList(oDialog, oModel, oView);
          oDialog.open();
        });
      } else {
        var oDialog = this.getView().byId("taxcodeDialog");
        if (sBukrs) {
          //oDialog.getBinding("items").filter(new Filter("Bukrs", FilterOperator.EQ, sBukrs));
        }
        // bindList(oDialog, oModel, oView);

        oDialog.open();

      }
    },

    onSearchTaxCode: function (oEvent) {
      var oDialog = this.getView().byId("taxcodeDialog");
      var sTerm = oEvent.getParameter('value');

      // build filter array
      var aFilter = [];

      if (sTerm) {
        var filters = new Filter([
          new Filter("Taxcode", FilterOperator.Contains, sTerm),
          new Filter("Text", FilterOperator.Contains, sTerm)],
          false);
        aFilter.push(filters);
      }

      // filter binding
      var oBinding = oDialog.getBinding("items");
      oBinding.filter(aFilter);

    },

    onConfirmTaxCode: function (oEvent) {
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sKostl = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).Taxcode;
      this.oInput.setValue(sKostl);
      this.getView().byId("iTaxCod_VH").removeSelections(true);
      this.getView().byId("taxcodeDialog").close();
    },

    onCancelTaxCode: function (oEvent) {
      // Mysterious code
    },

    /* WBS Element */

    onWBSElementVH: function (oEvent) {
      this.oInput = oEvent.getSource();
      var oView = this.getView();

      //create dialog
      if (!this.getView().byId("wbselementDialog")) {
        //load asynchronous fragment (XML)
        Fragment.load({
          id: oView.getId(),
          name: "touchlessui.view.fragments.WBSElement",
          controller: this
        }).then(function (oDialog) {
          //connect Menu to rootview of this component (models, lifecycle)
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.getView().byId("wbselementDialog").open();
      }
    },

    onSearchWBSElem: function (oEvent) {
      // //debugger;
      var oDialog = this.getView().byId("wbselementDialog");
      var sTerm = oEvent.getParameter('value');

      sTerm = this.convertToPattern(sTerm);

      // build filter array
      var aFilter = [];
      if (sTerm) {
        aFilter.push(new Filter("Pspid", FilterOperator.EQ, sTerm));
      }

      // filter binding
      var oBinding = oDialog.getBinding("items");
      oBinding.filter(aFilter);

    },

    onConfirmWBSElem: function (oEvent) {
      var oPath=oEvent.getParameter("listItem").getBindingContext("appmodel").sPath;
      var sSaknr = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject(oPath).value;
      this.oInput.setValue(sSaknr);
      this.getView().byId("idWBSElement_VH").removeSelections(true);
      this.getView().byId("wbselementDialog").close();
    },

    onCancelWBSElem: function (oEvent) {
       this.getView().byId("wbselementDialog").close();
    },

    /* Value Helps End */


    _assignCssConfidence: function (sId, nConf) {
      var oView = this.getView();

      nConf = parseFloat(nConf);

      if (nConf <= 0.50) {
        oView.byId(sId).addStyleClass('cfl50');

      } else if (nConf > 0.50 && nConf < 0.80) {
        oView.byId(sId).addStyleClass('cfl80');

      } else if (nConf >= 0.80 && nConf <= 1) {
        oView.byId(sId).addStyleClass('cfl100');

      }
    },

    _removeCssConfidence: function (sId) {
      var oView = this.getView();

      oView.byId(sId).removeStyleClass('cfl50');
      oView.byId(sId).removeStyleClass('cfl80');
      oView.byId(sId).removeStyleClass('cfl100');

    },

    setPONumberForAllLines: function (PONum) {
      var oModel = this.getOwnerComponent().getModel("APModel");
      if (PONum.length === 10) {

        // call odata to get PO details
        oModel.read("/polineitemSet", {
          filters: [new Filter("Ebeln", FilterOperator.EQ, PONum)],
          success: function (oData) {

            if (oData.results.length > 0) {

              var DocxLines = deepExtend([], this.appmodel.getProperty("/DocxLines"));

              for (let i = 0; i < DocxLines.length; i++) {

                if (DocxLines[i] && oData.results[i]) {
                  DocxLines[i].UoM = oData.results[i].Meins
                  DocxLines[i].PONumber = PONum
                  DocxLines[i].POLineItem = oData.results[i].Ebelp

                }

              }
              this.appmodel.setProperty("/DocxLines", DocxLines);
            }

          }.bind(this),
          error: function (oErr) {
            console.log('auto po update error', oErr);
          }.bind(this)
        });

        // call odata to get PO Header => CompanyCode
        oModel.read("/poheaderSet(Ebeln='" + PONum + "')", {
          success: function (oData) {
            this.getView().byId("idCompanyCodeTxt").setText(oData.Bukrs);
            console.log("POHeaderInitLoad", oData);

          }.bind(this),
          error: function (oErr) {
            console.log('auto po-header update error', oErr);
          }.bind(this)
        });

      } else {
        return;
      }
    },

    readSavedData: function () {
      // this.I_JOBID 
      // var hMap = deepExtend({}, this.appmodel.getProperty("/ui/header"));


      if (!this.I_JOBID) {
        console.log("JobID not passed");
        return null;
      }
      var aURL = "/api/dashboard/metadata?jobId=" + this.I_JOBID + "&$top=1";

      return new Promise(function (resolve, reject) {

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
          success: function (data) {

            // resolve with data
            var record = data.pop();
            resolve(record);

          }.bind(this),
          error: function (error) {
            reject(error);
          }.bind(this)
        });

        //DAR dataset get details
        $.ajax({
          
          //url:"/darbackend/uploadData/getDataSetSchema",
          url:"/darbackend/darDataSetDetails",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "cache": false,
          },
          dataType: "json",
          async: true,
          success: function (data) {
            this.appmodel.setProperty("/darDetails", data.data.result);
            console.log(data);
            this.bindDARList_GL();

          }.bind(this),
          error: function (error) {
            reject(error);
          }.bind(this)
        });

      }.bind(this));


      

    },
    //Set DAR predictions

    restoreSavedData: function (data) {

      var oView = this.getView();
      var oModel = this.getOwnerComponent().getModel("APModel");

      if (!data) {
        return;
      }
      var ui_data = data.Metadata.dox;
      var header = ui_data.header;
      var lines = ui_data.lines;

      // General Info
      oView.byId("idPurchaseOrder").setValue(header.Ebeln);
      if (header.Ebeln) {
        this.setPOMode(header.Ebeln);
        // Do not set lines as it is assumed that PO has already been selected before save.
        // this.setPONumberForAllLines(header.Ebeln);
        this.appmodel.setProperty("/props/POMode", true)

        if (Array.isArray(lines)) {
          this.appmodel.setProperty("/DocxLines", lines);
        }
      } else {
        this.appmodel.setProperty("/props/POMode", false)

        this.bindTaxCode(oView, oModel, null, header.Bukrs);
        this.bindBankKey(oView, oModel, null, header.VendorNumber);

        if (Array.isArray(lines)) {
          this.appmodel.setProperty("/NonPoDocxLines", lines);
        }
      }

      oView.byId("idDocDate").setValue(moment(header.DocDt).format('YYYY-MM-DD'));
      oView.byId("idVendorInvoice").setValue(header.InvNum);
      oView.byId("idCompanyCodeTxt").setText(header.dBukrs);
      oView.byId("idCompanyCode").setValue(header.Bukrs);
      oView.byId("idSenderName").setValue(header.SenderName);
      oView.byId("idReceiverName").setValue(header.ReceiverName);
      oView.byId("idVendorNumber").setValue(header.VendorNumber);
      oView.byId("idDueDate").setValue(moment(header.DueDt).format('YYYY-MM-DD'));
      oView.byId("idCurrency").setValue(header.Curr);
      oView.byId("idFreeTxt").setValue(header.FreeTxt);
      oView.byId("idInvInd").setSelected(header.InvInd);
      // Amount
      oView.byId("idGrossAmt").setValue(header.GrossAmt);
      oView.byId("idDiscountAmt").setValue(header.DiscAmt);
      oView.byId("idNetAmt").setValue(header.NetAmt);
      oView.byId("idBankKey").setSelectedKey(header.PartBank);
      oView.byId("idPaymentTerms").setSelectedKey(header.PaymentTerms);
      this.appmodel.setProperty("/detailDetail/header/Bankn", header.Bankn);
      this.appmodel.setProperty("/detailDetail/header/Bankl", header.Bankl);
      this.appmodel.setProperty("/detailDetail/header/IBAN", header.IBAN);
      oView.byId("idInvDocType").setValue(header.InvDocTyp);
      // Tax
      // //debugger;
      oView.byId("idTaxExemptAmt").setValue(header.TaxExemptAmt);
      oView.byId("idHTaxAmt").setValue(header.TaxAmt);
      oView.byId("idTaxCode").setSelectedKey(header.TaxCode);
      oView.byId("idCalcTaxInd").setSelected(header.CalcTaxInd);
      // Unplanned Freight
      oView.byId("idShippingAmount").setValue(header.DelivAmt);

    },

    _computeFieldsMapper: function (field) {
      var hMap = deepExtend({}, this.appmodel.getProperty("/ui/header"));
      // //debugger;
      if (hMap[field.name]) { // hMap['purchaseOrderNumber']
        // //debugger;
        var sContext = "/detailDetail/header/" + field.name;
        this.appmodel.setProperty(sContext, field);
        this._assignCssConfidence(hMap[field.name].id, field.confidence)

        if (field.name === 'purchaseOrderNumber') {
          this.setPOMode(field.value);
          this.setPONumberForAllLines(field.value);

          // this.getView().byId("idPurchaseOrder").setTooltip(this.formatter.genTooltip(field));
          // var toolCtl = this.getView().byId("idPurchaseOrder").getTooltip();
          // //debugger;
          // toolCtl.setOpenDelay(2);
          // this.getView().byId("idPurchaseOrder").setTooltip(toolCtl);
        }
      }
    },

    _computeFields: function (data) {

      return new Promise(function (resolve, reject) {
        console.log("dox", data);

        var aLineItems = [];
        var aLineItems2 = [];

        // compute line items for PO based
        data.extraction.lineItems.forEach(function (line, idx) {
          var obj = {
            "InvoiceLineItem": idx + 1,
            "Description": null,
            "Amount": null,
            "Currency": null,
            "Quantity": 1,
            "UoM": null,
            "PONumber": null,
            "POLineItem": null,
            "TaxCode": null,
            "TaxName": null,
          }
          // //debugger;
          for (let i = 0; i < line.length; i++) {
            // //debugger;
            //  map description
            if (line[i].name === 'description') {
              obj.Description = line[i].value;
            }

            //  map netAmount
            if (line[i].name === 'netAmount') {
              obj.Amount = line[i].value;
            }

            //  map quantity
            if (line[i].name === 'quantity') {
              obj.Quantity = line[i].value;
            }

            //  map quantity
            if (line[i].name === 'quantity') {
              obj.Quantity = line[i].value;
            }

          }

          aLineItems.push(obj);

        }.bind(this));

        // compute line items for Non-PO based
        data.extraction.lineItems.forEach(function (line, idx) {
          var DocCategory = this.appmodel.getProperty("/detail/header/DocCategory");
          var type = "false";

          // find type;
          if (DocCategory === "Non-PO Invoice") {
            type = "false"
          } else if (DocCategory === "PO Invoice") {
            type = "false";
          } else if (DocCategory === "Non-PO Credit Memo") {
            type = "true";
          } else if (DocCategory === "PO Credit Memo") {
            type = "true";
          }

          var obj = {
            "InvoiceLineItem": idx + 1,
            "Description": null,
            "CDInd": type,
            "CompanyCode": null,
            "Amount": null,
            "Currency": null,
            "Quantity": 1,
            "TaxCode": null,
            "TaxAmount": null,
            "UoM": null,
            "Bukrs": null,
            "GLAcc": null,
            "WBSElem": null,
            "ProfitCen": null,
          }
          // //debugger;
          for (let i = 0; i < line.length; i++) {
            // //debugger;
            //  map description
            if (line[i].name === 'description') {
              obj.Description = line[i].value;
            }

            //  map netAmount
            if (line[i].name === 'netAmount') {
              obj.Amount = line[i].value;
            }

            //  map quantity
            if (line[i].name === 'quantity') {
              obj.Quantity = line[i].value;
            }

            //  map quantity
            if (line[i].name === 'quantity') {
              obj.Quantity = line[i].value;
            }

          }

          aLineItems2.push(obj);

        }.bind(this));

        this.appmodel.setProperty("/DocxLines", aLineItems);
        this.appmodel.setProperty("/NonPoDocxLines", aLineItems2);

        // compute document header fields
        data.extraction.headerFields
          .map(this._computeFieldsMapper.bind(this));

        resolve(1);

        // setTimeout(function (){
        //   resolve(1)
        // }, 1000);

      }.bind(this));

    },

    setInitialValueHelps: function () {

    },

    onCredMemoToggle: function (oEvent) {
      var isSelected = oEvent.getParameter("selected");

      var oNonPOLines = this.appmodel.getProperty("/NonPoDocxLines");

      if (isSelected) {
        oNonPOLines = oNonPOLines.map(function (obj) {
          obj.CDInd = "true";
          return obj;
        });

        this.appmodel.setProperty("/NonPoDocxLines", oNonPOLines);
      } else {
        // Non PO Based
        oNonPOLines = oNonPOLines.map(function (obj) {
          obj.CDInd = "false";
          return obj;
        });

        this.appmodel.setProperty("/NonPoDocxLines", oNonPOLines);
      }

      setTimeout(function () {
        this.calcTotals()
      }.bind(this), 3000);

    },

    onCalcTax: function (oEvent) {
      var isSelected = oEvent.getParameter("selected");

      var oPOLines = this.appmodel.getProperty("/DocxLines");
      var oNonPOLines = this.appmodel.getProperty("/NonPoDocxLines");

      var sTaxCode = this.getView().byId("idTaxCode").getSelectedKey();

      if (isSelected) {
        // clear values om tax amt if checked
        this.getView().byId("idHTaxAmt").setEditable(false);
        this.getView().byId("idHTaxAmt").setValue(null);

        // PO Based
        oPOLines = oPOLines.map(function (obj) {
          obj.TaxCode = sTaxCode;

          return obj;
        });

        // Non PO Based
        oNonPOLines = oNonPOLines.map(function (obj) {
          obj.TaxCode = sTaxCode;

          return obj;
        });

        this.appmodel.setProperty("/DocxLines", oPOLines);
        this.appmodel.setProperty("/NonPoDocxLines", oNonPOLines);
      } else {
        this.getView().byId("idHTaxAmt").setEditable(true);
        // PO Based
        oPOLines = oPOLines.map(function (obj) {
          obj.TaxCode = null;

          return obj;
        });

        // Non PO Based
        oNonPOLines = oNonPOLines.map(function (obj) {
          obj.TaxCode = null;

          return obj;
        });

        this.appmodel.setProperty("/DocxLines", oPOLines);
        this.appmodel.setProperty("/NonPoDocxLines", oNonPOLines);
      }
    },

    calcTotals: function () {
      var total = 0;
      var doclines;

      function mapCalcTotalFn(Amount) {
        if (isNaN(Amount) === false) {
          total = total + Amount;
        }
      }
      function mapCalcTotalFn2(obj) {
        if (isNaN(obj.Amount) === false) {
          total = total + (obj.Amount * obj.Sign);
        }
      }

      if (this.appmodel.getProperty("/props/POMode")) {

        doclines = this.getView().byId("idInvLineItemTable").getItems();
        doclines = doclines.map(function (item) {

          if (item.getCells()[2].getMetadata()._sClassName === "sap.m.Input") {
            return parseFloat(item.getCells()[2].getValue());
          }
          if (item.getCells()[2].getMetadata()._sClassName === "sap.m.Text") {
            return parseFloat(item.getCells()[2].getText());
          }

        });

        doclines.map(mapCalcTotalFn);

      } else {

        doclines = this.getView().byId("idNPOInvLineTable").getItems();
        doclines = doclines.map(function (item) {
          if (item.getCells()[4].getMetadata()._sClassName === "sap.m.Input") {
            return {
              Amount: parseFloat(item.getCells()[4].getValue()),
              Sign: item.getCells()[1].getSelectedKey() === "false" ? -1 : 1
            };
          }
          if (item.getCells()[4].getMetadata()._sClassName === "sap.m.Text") {
            return {
              Amount: parseFloat(item.getCells()[4].getText()),
              Sign: item.getCells()[1].getText() === "Debit" ? -1 : 1
            };
          }
        });

        doclines.map(mapCalcTotalFn2);

      }
      // Get amounts
      var gross = parseFloat(this.byId("idGrossAmt").getValue()) ? parseFloat(this.byId("idGrossAmt").getValue()) : 0;
      var del_cost = parseFloat(this.byId("idShippingAmount").getValue()) ? parseFloat(this.byId("idShippingAmount").getValue()) : 0;
      var h_tax = parseFloat(this.byId("idHTaxAmt").getValue()) ? parseFloat(this.byId("idHTaxAmt").getValue()) : 0;

      // get positive value irrespective of debit/credit
      total = Math.abs(total);
      var balance = gross - (total + del_cost + h_tax);

      balance = balance.toFixed(2);
      this.appmodel.setProperty("/props/totalAmount", balance);
    },

    _onRouteMatched: function (oEvent) {
      // //debugger;
      this.resetUIState();
      this.getView().byId('DDPage').setBusy(true);
      this._packageId = oEvent.getParameter("arguments").packageId || this._packageId || "0";
      this.fetchData(this._packageId)
        .then(this.getDoxData)
        .then(this._computeFields.bind(this))
        // .then(this.setInitialValueHelps.bind(this))
        .then(this.readSavedData.bind(this))
        //.then(this.setInferSavedData.bind(this))
        .then(this.restoreSavedData.bind(this))
        .then(this.calcTotals.bind(this))
        .then(function () {
          this.getView().byId('DDPage').setBusy(false);
        }.bind(this))
        .catch(function (error) {
          console.log(error);
          this.getView().byId('DDPage').setBusy(false);
        }.bind(this));

      this.fetchCurrency()
        .then(function (oData) {
          this.appmodel.setProperty("/valuehelps/currency", oData)
        }.bind(this));


      this.fetchNotes(this._packageId)
        .catch(function (error) {
          console.log('Notes fetch error', error);
        });

      this.fetchFileList(this._packageId)
        .catch(function (error) {
          console.log('File List fetch error', error);
        });

      this.bindPaymentTerms();

      this.startAutoLockRefresh();
    },

    _fullReload: function () {
      // //debugger;
      this.resetUIState();
      this.getView().byId('DDPage').setBusy(true);
      // this._packageId = oEvent.getParameter("arguments").packageId || this._packageId || "0";
      this.fetchData(this._packageId)
        .then(this.getDoxData)
        .then(this._computeFields.bind(this))
        // .then(this.setInitialValueHelps.bind(this))
        .then(this.readSavedData.bind(this))
        //.then(this.setInferSavedData.bind(this))
        .then(this.restoreSavedData.bind(this))
        .then(this.calcTotals.bind(this))
        .then(function () {
          this.getView().byId('DDPage').setBusy(false);
        }.bind(this))
        .catch(function (error) {
          console.log(error);
          this.getView().byId('DDPage').setBusy(false);
        }.bind(this));

      this.fetchCurrency()
        .then(function (oData) {
          this.appmodel.setProperty("/valuehelps/currency", oData)
        }.bind(this));


      this.fetchNotes(this._packageId)
        .catch(function (error) {
          console.log('Notes fetch error', error);
        });

      this.fetchFileList(this._packageId)
        .catch(function (error) {
          console.log('File List fetch error', error);
        });

      this.startAutoLockRefresh();
    },

    startAutoLockRefresh: function () {

      this.keepGoing = this.keepGoing ? false : true;

      var that = this;

      function myLoop() {
        // ... Do something ...
        console.log("Auto Refresh started")
        that.getLockStatus(that._packageId);

        if (that.keepGoing) {
          setTimeout(myLoop, 60000);
        }
      }

      function startLoop() {
        that.keepGoing = true;
        myLoop();
      }

      function stopLoop() {
        that.keepGoing = false;
      }

      if (this.keepGoing) {
        startLoop();
        // sap.m.MessageToast.show("Auto-sync : Started");
      } else {
        stopLoop();
        // sap.m.MessageToast.show("Auto-sync : Stopped");
      }
    },

    getLockStatus: function (packageId) {
      if (!packageId) {
        console.log("packageId not passed");
        return null;
      }

      var aURL = "/api/process/lock?packageId=" + packageId + "";

      return new Promise(function (resolve, reject) {

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
          success: function (data) {
            // set necessary state
            console.log("Lock:", data);
            resolve(data);
            this.appmodel.setProperty("/lock", data);
          }.bind(this),
          error: function (error) {
            console.log("Lock:", error);
            reject(error);
          }.bind(this)
        });

      }.bind(this));

    },

    onPOInputChange: function (oEvent) {
      // //debugger;
      var sValue = oEvent.getParameter("value");
      var jobId = this.appmodel.getProperty("/detail/header/JobId");
      var c_mode = this.appmodel.getProperty("/detail/header/DocCategory");

      // Reverse mode to update mode
      if (c_mode === "Non-PO Invoice") {
        c_mode = "POINV"
      } else if (c_mode === "PO Invoice") {
        c_mode = "NONPOINV";
      } else if (c_mode === "Non-PO Credit Memo") {
        c_mode = "POCREDM";
      } else if (c_mode === "PO Credit Memo") {
        c_mode = "NONPOCREDM";
      }

      var url = "/api/dashboard/removeJob?mode=" + c_mode + "&packageId=" + this._packageId + "&jobId=" + jobId;

      // If removing PO number completely
      if (!sValue || sValue.trim().length <= 0) {
        var msg = "Are you sure you want to convert document to NON-PO invoice type?";

        if (this.appmodel.getProperty("/props/POMode")) {
          MessageBox.warning(msg, {
            actions: ["Switch Invoice Type", MessageBox.Action.CLOSE],
            emphasizedAction: "Switch Invoice Type",
            onClose: function (sAction) {

              if (sAction === "Switch Invoice Type") {

                this.ajax("POST", url, {
                })
                  .then(function (data) {

                    console.log("Switch Invoice Type: ", data);
                    MessageToast.show("Switching Invoice Type", data);
                    // this.fetchFileList(this._packageId);
                    this._fullReload();
                    var bus = this.getOwnerComponent().getEventBus();
                    bus.publish("reload");
                    this.handleCancelGEdit();

                  }.bind(this))
                  .catch(function (err) {

                    console.log("Switch Invoice Type Error: ", err);
                    MessageToast.show("Error switching", err);

                  }.bind(this));

              } else {
                // oEvent.getSource().setSelected(false);
              }

            }.bind(this)
          });

        }

      } else {

        var msg = "Are you sure you want to convert document to PO invoice type?";

        // either user is switching from NON PO to PO
        if (!this.appmodel.getProperty("/props/POMode")) {
          MessageBox.warning(msg, {
            actions: ["Switch Invoice Type", MessageBox.Action.CLOSE],
            emphasizedAction: "Switch Invoice Type",
            onClose: function (sAction) {

              if (sAction === "Switch Invoice Type") {
                this.setPOMode(sValue);
                this.setPONumberForAllLines(sValue);

                this.ajax("POST", url, {
                })
                  .then(function (data) {

                    console.log("Switch Invoice Type: ", data);
                    MessageToast.show("Switching Invoice Type", data);
                    this._fullReload();
                    var bus = this.getOwnerComponent().getEventBus();
                    bus.publish("reload");
                    this.handleCancelGEdit();

                  }.bind(this))
                  .catch(function (err) {

                    console.log("Switch Invoice Type Error: ", err);
                    MessageToast.show("Error switching", err);

                  }.bind(this));

              } else {
                // oEvent.getSource().setSelected(false);
              }

            }.bind(this)
          });
        } else if (sValue.length === 10) {
          // User is in PO mode, but is updating the PO number (10 chars)
          // then call below function to auto-fill companycode, line items (polineitem)
          this.setPONumberForAllLines(sValue);
          this.setPOMode(sValue);
        }
      }
    },

    onFileListEdit: function (oEvent) {
      var isPressed = oEvent.getParameter("pressed");

      if (isPressed) {
        this.appmodel.setProperty("/props/FileEditMode", true)
      } else {
        this.appmodel.setProperty("/props/FileEditMode", false)
      }
    },

    onFileListMainSelect: function (oEvent) {
      ////debugger;
      var jobId = oEvent.getSource().getParent().getBindingContext('appmodel').getObject('JobId');
      var packageId = oEvent.getSource().getParent().getBindingContext('appmodel').getObject('PackageId');
      var fileName = oEvent.getSource().getParent().getBindingContext('appmodel').getObject('FileName');
      

      if (oEvent.getParameter('selected')) {
        var msg = "You are currently editing the document! Are you sure you want to set attachment " + fileName + " as the Primary Document?\n" +
          "Please save your changes before you confirm.";
        if (!this.appmodel.getProperty('/props/gEditMode')) {
          msg = "Are you sure you want to set attachment " + fileName + " as the Primary Document?";
        }

        var url = "/api/dashboard/setMainJob?packageId=" + packageId + "&jobId=" + jobId;

        MessageBox.warning(msg, {
          actions: ["Switch Primary", MessageBox.Action.CLOSE],
          emphasizedAction: "Switch Primary",
          onClose: function (sAction) {

            if (sAction === "Switch Primary") {

              this.ajax("PUT", url, {})
                .then(function (data) {

                  console.log("Switch Main Job Response: ", data);
                  MessageToast.show("Switching Primary Document", data);
                  // this.fetchFileList(this._packageId);
                  this._fullReload();
                  var bus = this.getOwnerComponent().getEventBus();
                  bus.publish("reload");

                }.bind(this))
                .catch(function (err) {

                  console.log("Switch Main Job Error: ", err);
                  MessageToast.show("Error switching", err);
                  this.fetchFileList(this._packageId);

                }.bind(this));

            } else {
              // oEvent.getSource().setSelected(false);
              this.fetchFileList(this._packageId);
            }

          }.bind(this)
        });
      }
    },

    handleUploadPress: function (oEvent) {
      var oFileUploader = this.getView().byId("fileUploader");
      var table = this.getView().byId("idFileList");
      oFileUploader.checkFileReadable()
        .then(function () {
          table.setBusy(true);
          oFileUploader.upload();
        }, function (error) {
          table.setBusy(false);
          MessageToast.show("File upload error");
        }).then(function () {
          oFileUploader.clear();
        });
    },

    handleUploadComplete: function (oEvent) {
      // //debugger;
      this.getView().byId("idFileList").setBusy(false);
      var oParams = oEvent.getParameters();
      var sKey = JSON.parse(oParams.responseRaw).key;

      if (sKey) {
        var sMessage = oParams.status === 200 ? " Upload Success" + sKey : "Upload Error" + sKey;
        MessageToast.show(sMessage);
      }

      if (oParams.status === 200) {
        var aURL = "/api/dashboard/addDoc";


        var oPayload = [{
          packageId: this._packageId,
          jobId: uid(),
          fileName: sKey.split("/").pop(),
          objectStoreRef: sKey
        }]
        this.ajax("POST", aURL, oPayload)
          .then(function (data) {
            console.log("Payload for upload", data);
            MessageToast.show("Document posted", data);
            this.fetchFileList(this._packageId);
          }.bind(this))
          .catch(function (err) {
            console.log(err);
            MessageToast.show("Posting error", err);
            this.fetchFileList(this._packageId);
          }.bind(this))

      }
    },

    bindPaymentTerms: function () {

      var oModel = this.getOwnerComponent().getModel("APModel");
      oModel.read("/paymenttermsSet", {
        success: function (oData) {
          // add blank value in the beginning.
          oData.results.unshift({
            Paymentterms: ""
          });

          this.appmodel.setProperty("/valuehelps/paymentterms", oData.results);

        }.bind(this),
        error: function (oErr) {
          console.log('paymentterms error', oErr);
        }
      });
    },

    bindTaxCode: function (oView, oModel, sEbeln, sBukrs) {

      if (sEbeln) {

        oModel.read("/taxcodeSet", {
          filters: [new Filter("Ebeln", FilterOperator.EQ, sEbeln)],
          success: function (oData) {
            // add blank value in the beginning.
            oData.results.unshift({
              Taxcode: "",
              Text: ""
            });

            this.appmodel.setProperty("/valuehelps/taxcode", oData.results);

          }.bind(this),
          error: function (oErr) {
            console.log('taxcode error', oErr);
          }
        });


      } else if (sBukrs) {

        oModel.read("/taxcodeSet", {
          filters: [new Filter("Bukrs", FilterOperator.EQ, sBukrs)],
          success: function (oData) {
            // add blank value in the beginning.
            oData.results.unshift({
              Taxcode: "",
              Text: ""
            });

            this.appmodel.setProperty("/valuehelps/taxcode", oData.results);

          }.bind(this),
          error: function (oErr) {
            console.log('taxcode error', oErr);
          }
        });

      }
    },

    onHeaderTaxCodeSelect: function (oEvent) {
      this.getView().byId("idCalcTaxInd").setSelected(false);
    },

    bindBankKey: function (oView, oModel, sEbeln, sLifnr) {
      // clear all
      oView.byId("idBankKey").setSelectedKey(null);
      oView.byId("bankntxt").setText(null);
      oView.byId("routingtxt").setText(null);
      oView.byId("ibantxt").setText(null);

      if (sEbeln) {

        oModel.read("/bankkeySet", {
          filters: [new Filter("Ebeln", FilterOperator.EQ, sEbeln)],
          success: function (oData) {
            // If there is only one value in the response
            // if (oData.results.length === 1) {
            //   oView.byId("idBankKey").setSelectedKey(oData.results[0].Bvtyp);
            // }

            // add blank value in the beginning.
            oData.results.unshift({
              Bankl: "",
              Bvtyp: ""
            });

            this.appmodel.setProperty("/valuehelps/partbank", oData.results);

          }.bind(this),
          error: function (oErr) {
            console.log('partbank error', oErr);
          }
        });

      } else if (sLifnr) {

        oModel.read("/bankkeySet", {
          filters: [new Filter("Lifnr", FilterOperator.EQ, sLifnr)],
          success: function (oData) {
            // If there is only one value in the response
            // if (oData.results.length === 1) {
            //   oView.byId("idBankKey").setSelectedKey(oData.results[0].Bvtyp);
            // }
            // add blank value in the beginning.
            oData.results.unshift({
              Bankl: "",
              Bvtyp: ""
            });

            this.appmodel.setProperty("/valuehelps/partbank", oData.results);

          }.bind(this),
          error: function (oErr) {
            console.log('partbank error', oErr);
          }
        });

      }
    },

    onBankSelect: function (oEvent) {
      var sBankn = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject("Bankn");
      var sIBAN = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject("IBAN");
      var sBankl = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject("Bankl");
      var sBanktype = oEvent.getParameter("listItem").getBindingContext("appmodel").getObject("Bvtyp");
      this.appmodel.setProperty('/detailDetail/header/Bankn', sBankn);
      this.appmodel.setProperty('/detailDetail/header/IBAN', sIBAN);
      this.appmodel.setProperty('/detailDetail/header/Bankl', sBankl);
      this.oInput.setValue(sBanktype);
      this.getView().byId("idPartnerBankVH").removeSelections(true);
      this.getView().byId("idPartnerBankDialog_VH").close();
    },

    bindNonPOTable: function (oView, oModel, sEbeln) {
      oView.byId("idInvLineItemTable").setVisible(false);

      // var oItemListNonPO = new sap.m.Co
    },

    setPOMode: function (sEbeln) {

      var oView = this.getView();
      var oModel = this.getOwnerComponent().getModel("APModel");

      if (sEbeln) {

        this.bindTaxCode(oView, oModel, sEbeln);
        this.bindBankKey(oView, oModel, sEbeln);

        oView.getModel("APModel").refresh();

      }

      this.bindPaymentTerms();
    },

    validatePOModeHeader: function (aErr) {
      sap.ui.core.BusyIndicator.hide();
      var oV = this.getView();
      var msg = "";
      //Tax code
      var po_viewTaxCode = oV.byId("idTaxCode");
      var poTaxCode = po_viewTaxCode.getSelectedKey();
      if (poTaxCode.length <= 0) {
        msg = "Tax Code is required";
        po_viewTaxCode.setShowSecondaryValues(true)
        po_viewTaxCode.setValueState("Error");
        po_viewTaxCode.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        po_viewTaxCode.setValueState("None")
      }
      // PO Number
      var C_PONum = oV.byId("idPurchaseOrder");
      var V_PONum = C_PONum.getValue();

      if (V_PONum.trim().length <= 0) {
        msg = "PO number is required";
        C_PONum.setShowValueStateMessage(true);
        C_PONum.setValueState("Error");
        C_PONum.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_PONum.setValueState("None")
      }

      if (V_PONum.trim().length > 10 || V_PONum.trim().length < 10) {
        msg = "PO number should be of 10 characters";
        C_PONum.setShowValueStateMessage(true);
        C_PONum.setValueState("Error");
        C_PONum.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_PONum.setValueState("None")
      }

      // Doc Date
      var C_DocDt = oV.byId("idDocDate");
      var V_DocDt = C_DocDt.getDateValue();

      if (!V_DocDt) {
        msg = "Document Date is invalid";
        C_DocDt.setValueState("Error");
        C_DocDt.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_DocDt.setValueState("None")
      }

      // // Due Date
      // var C_DueDt = oV.byId("idDueDate");
      // var V_DueDt = C_DueDt.getDateValue();

      // if (!V_DueDt) {
      //   msg = "Due Date is invalid";
      //   C_DueDt.setValueState("Error");
      //   C_DueDt.setValueStateText(msg);
      //   aErr.push({
      //     msg: msg
      //   });
      // }

      // Invoice Number
      var C_InvNum = oV.byId("idVendorInvoice");
      var V_InvNum = C_InvNum.getValue();

      if (!V_InvNum || V_InvNum.trim().length <= 0) {
        msg = "Invoice Number is required";
        C_InvNum.setValueState("Error");
        C_InvNum.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_InvNum.setValueState("None");
      }

      // Currency
      var C_Curr = oV.byId("idCurrency");
      var V_Curr = C_Curr.getValue();

      if (V_Curr.trim().length <= 0) {
        msg = "Currency is required";
        C_Curr.setShowValueStateMessage(true);
        C_Curr.setValueState("Error");
        C_Curr.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_Curr.setValueState("None");
      }

      if (V_Curr.trim().length > 3 || V_Curr.trim().length < 3) {
        msg = "Currency should be of 3 characters";
        C_Curr.setShowValueStateMessage(true);
        C_Curr.setValueState("Error");
        C_Curr.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_Curr.setValueState("None");
      }

      // Gross Amount
      var C_GrossAmt = oV.byId("idGrossAmt");
      var V_GrossAmt = C_GrossAmt.getValue();

      if (!V_GrossAmt || V_GrossAmt.trim().length <= 0) {
        msg = "Gross Amount is required";
        C_GrossAmt.setValueState("Error");
        C_GrossAmt.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_GrossAmt.setValueState("None");
      }

      // Part Bank
      var C_PartBnk = oV.byId("idGrossAmt");
      var V_PartBnk = C_PartBnk.getSelectedKey();

      // if (!V_PartBnk || V_PartBnk.trim().length <= 0) {
      //   msg = "Partner Bank is required";
      //   C_PartBnk.setValueState("Error");
      //   C_PartBnk.setValueStateText(msg);
      //   aErr.push({
      //     msg: msg
      //   });
      // }

      return aErr;
    },

    validatePOModeLines: function (aErr) {
      var oV = this.getView();
      var isError = false;
      var msg = "";

      var lines = deepExtend([], this.appmodel.getProperty("/DocxLines"));

      // lines check
      if (!lines || lines.length <= 0) {
        isError = true;
        msg = "Invoice does not have any line items";
        aErr.push({
          msg: msg
        });
      }
      //tax code columnn check
      for(var i=0;i<lines.length;i++){
        if(lines[i].TaxCode==null){
          isError = true;
          msg = "Please Select Tax Code from Line items ";
          aErr.push({
            msg: msg
          });
        }
      }

      return aErr;
    },

    validateNON_POModeHeader: function (aErr) {
      sap.ui.core.BusyIndicator.hide()
      var oV = this.getView();
      var msg = "";

      // Vendor Number
      var C_VenNum = oV.byId("idVendorNumber");
      var V_VenNum = C_VenNum.getValue();

      if (!V_VenNum || V_VenNum.trim().length <= 0) {
        msg = "Vendor Number is required";
        C_VenNum.setValueState("Error");
        C_VenNum.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_VenNum.setValueState("None");
      }

      // Company Code Number
      var C_CCNum = oV.byId("idCompanyCode");
      var V_CCNum = C_CCNum.getValue();

      if (!V_CCNum || V_CCNum.trim().length <= 0) {
        msg = "Company Code is required";
        C_CCNum.setValueState("Error");
        C_CCNum.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_CCNum.setValueState("None");
      }

      // Part Bank
      var C_PartBnk = oV.byId("idBankKey");
      //var V_PartBnkList = C_PartBnk.getItems();
      var V_PartBnk = C_PartBnk.getValue();
      
      //To check if selected vendor have Partner Bank set up in SAP, if yes, this feild should be kept manadatory
      
        if (!V_PartBnk || V_PartBnk.trim().length <= 0) {
          msg = "Partner Bank is required";
          C_PartBnk.setValueState("Error");
          C_PartBnk.setValueStateText(msg);
          aErr.push({
            msg: msg
          });
        }
        else {
          C_PartBnk.setValueState("None");
        }
      

      // Doc Date
      var C_DocDt = oV.byId("idDocDate");
      var V_DocDt = C_DocDt.getDateValue();

      if (!V_DocDt) {
        msg = "Document Date is invalid";
        C_DocDt.setValueState("Error");
        C_DocDt.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_DocDt.setValueState("None")
      }

      // Invoice Number
      var C_InvNum = oV.byId("idVendorInvoice");
      var V_InvNum = C_InvNum.getValue();

      if (!V_InvNum || V_InvNum.trim().length <= 0) {
        msg = "Invoice Number is required";
        C_InvNum.setValueState("Error");
        C_InvNum.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_InvNum.setValueState("None");
      }

      // Currency
      var C_Curr = oV.byId("idCurrency");
      var V_Curr = C_Curr.getValue();

      if (V_Curr.trim().length <= 0) {
        msg = "Currency is required";
        C_Curr.setShowValueStateMessage(true);
        C_Curr.setValueState("Error");
        C_Curr.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_Curr.setValueState("None");
      }

      if (V_Curr.trim().length > 3 || V_Curr.trim().length < 3) {
        msg = "Currency should be of 3 characters";
        C_Curr.setShowValueStateMessage(true);
        C_Curr.setValueState("Error");
        C_Curr.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_Curr.setValueState("None");
      }

      // Gross Amount
      var C_GrossAmt = oV.byId("idGrossAmt");
      var V_GrossAmt = C_GrossAmt.getValue();

      if (!V_GrossAmt || V_GrossAmt.trim().length <= 0) {
        msg = "Gross Amount is required";
        C_GrossAmt.setValueState("Error");
        C_GrossAmt.setValueStateText(msg);
        aErr.push({
          msg: msg
        });
      } else {
        C_GrossAmt.setValueState("None");
      }

      return aErr;
    },

    _errorBuilder: function (aErr) {

      var errors = aErr.map(function (oErr) {
        var oMsg = {
          "message": oErr.msg,
          "type": "E",
          "system": "UI-APP",
          "number": null,
          "log_msg_no": null,
          "msg_id": "Client App Validation"
        }

        return oMsg;
      });

      return errors;

    },

    // asyncFileAttachToSAP
    asyncFileAttachToSAP: function (invoice) {
      var url = "/attach_sap/attach?invoice=" + invoice;
      var body = deepExtend([], this.appmodel.getProperty("/Filelist"));

      this.ajax('POST', url, body)
        .then(function (data) {
          console.log("ATTACH TO SAP TRIGGERED: ", data);
        })
        .catch(function (err) {
          console.log("ATTACH TO SAP ERROR", err);
        });

    },

    //Submitted status update on successfull posting
    asyncInvoiceStatusUpdate: function (invoice) {
      //var url = "/attach_sap/attach?invoice=" + invoice;
      var packageId = this.appmodel.getProperty("/detail/header/PackageId");
      var url = `/api/sap/saveInvoiceStatus?packageId=${packageId}&invoiceDoc=${invoice}&status=POSTED`;
      //var body = deepExtend([], this.appmodel.getProperty("/Filelist"));

      this.ajax('GET', url)
        .then(function (data) {
          console.log("Invoice Document submitted: ", data);
        })
        .catch(function (err) {
          console.log("Invoice Document submitted error: ", err);
        });

    },

    savePayloadBuilder: function (mode, oV) {
      var res;
      if (mode === "PO") {
        res = {
          header: {
            // General Info
            Ebeln: oV.byId("idPurchaseOrder").getValue(),
            dBukrs: oV.byId("idCompanyCodeTxt").getText(),
            DocDt: oV.byId("idDocDate").getDateValue(),
            InvNum: oV.byId("idVendorInvoice").getValue(),
            DueDt: oV.byId("idDueDate").getDateValue(),
            Curr: oV.byId("idCurrency").getValue(),
            FreeTxt: oV.byId("idFreeTxt").getValue(),
            InvInd: oV.byId("idInvInd").getSelected(),

            // Amounts
            GrossAmt: oV.byId("idGrossAmt").getValue(),
            DiscAmt: oV.byId("idDiscountAmt").getValue(),
            NetAmt: oV.byId("idNetAmt").getValue(),
            InvDocTyp: oV.byId("idInvDocType").getValue(),
            PaymentTerms: oV.byId("idPaymentTerms").getSelectedKey(),

            // Bank
            PartBank: oV.byId("idBankKey").getSelectedKey(),
            Bankn: oV.byId("bankntxt").getText(),
            Bankl: oV.byId("routingtxt").getText(),
            IBAN: oV.byId("ibantxt").getText(),

            // Tax
            TaxAmt: oV.byId("idHTaxAmt").getValue(),
            TaxCode: oV.byId("idTaxCode").getSelectedKey(),
            CalcTaxInd: oV.byId("idCalcTaxInd").getSelected(),

            // Unplanned Freight
            DelivAmt: oV.byId("idShippingAmount").getValue(),
            TaxExemptAmt: oV.byId("idTaxExemptAmt").getValue(),

          },
          lines: []
        }
      } else if (mode === "NONPO") {
        res = {
          header: {
            // General Info
            DocDt: oV.byId("idDocDate").getDateValue(),
            VendorNumber: oV.byId("idVendorNumber").getValue(),
            Bukrs: oV.byId("idCompanyCode").getValue(),
            SenderName: oV.byId("idSenderName").getValue(),
            ReceiverName: oV.byId("idReceiverName").getValue(),
            InvNum: oV.byId("idVendorInvoice").getValue(),
            DueDt: oV.byId("idDueDate").getDateValue(),
            Curr: oV.byId("idCurrency").getValue(),
            FreeTxt: oV.byId("idFreeTxt").getValue(),
            InvInd: oV.byId("idInvInd").getSelected(),

            // Amounts
            GrossAmt: oV.byId("idGrossAmt").getValue(),
            DiscAmt: oV.byId("idDiscountAmt").getValue(),
            NetAmt: oV.byId("idNetAmt").getValue(),
            InvDocTyp: oV.byId("idInvDocType").getValue(),
            PaymentTerms: oV.byId("idPaymentTerms").getSelectedKey(),

            // Bank
            PartBank: oV.byId("idBankKey").getSelectedKey(),
            Bankn: oV.byId("bankntxt").getText(),
            Bankl: oV.byId("routingtxt").getText(),
            IBAN: oV.byId("ibantxt").getText(),

            // Tax
            TaxAmt: oV.byId("idHTaxAmt").getValue(),
            TaxCode: oV.byId("idTaxCode").getSelectedKey(),
            CalcTaxInd: oV.byId("idCalcTaxInd").getSelected(),

            // Unplanned Freight
            DelivAmt: oV.byId("idShippingAmount").getValue(),
            TaxExemptAmt: oV.byId("idTaxExemptAmt").getValue(),

          },
          lines: []
        }
      }

      return res;
    },

    // Save Press Handler
    onSavePress: function (oEvent) {

      var oV = this.getView();
      this.getOwnerComponent().getModel('msg').setProperty("/aMsg", []);

      if (this.appmodel.getProperty("/props/POMode")) {
        // If user is saving a PO based invoice

        // build the JSON to send to API
        var obj = this.savePayloadBuilder("PO", oV);

        var lines = deepExtend([], this.appmodel.getProperty("/DocxLines"));
        obj.lines = lines.map((line) => {
          // line.InvoiceLineItem
          line.Description = line.Description ? (line.Description).replace(/'/g, "''") : "";
          line.Amount = line.Amount ? parseFloat(line.Amount) : 0;
          line.Quantity = line.Quantity ? parseFloat(line.Quantity) : 0;
          // line.UoM
          // line.PONumber
          // line.POLineItem
          // line.TaxCode
          // line.TaxName 
          return line
        });
        // obj.lines = lines;

        // call save API
        var jobId = this.appmodel.getProperty("/detail/header/JobId");
        var packageId = this.appmodel.getProperty("/detail/header/PackageId");
        var url = `/api/sap/save?packageId=${packageId}&jobId=${jobId}&mode=PO`;

        this.ajax('POST', url, {
          dox: obj
        })
          .then(function (data) {
            // //debugger;
            console.log(data);
            // if save press
            MessageBox.success("Sucessfully saved record", {
              title: "Success",
              details: data,
              styleClass: sResponsivePaddingClasses
            });

            // fire cancel press so that lock is released
            this.handleCancelGEdit();

          }.bind(this))
          .catch(function (err) {
            // //debugger;
            console.log(err);

            MessageBox.error("An unexpected error occurred in the backend system.\nPlease try again later.", {
              title: "Error",
              details: err,
              styleClass: sResponsivePaddingClasses
            });

            // fire cancel press so that lock is released
            this.handleCancelGEdit();

          }.bind(this));

        return;

      } else {
        // If user is saving a NON-PO based invoice
        // build the JSON to send to API
        var obj = this.savePayloadBuilder("NONPO", oV);

        var lines = deepExtend([], this.appmodel.getProperty("/NonPoDocxLines"));
        obj.lines = lines.map((line) => {
          // make necessary transform
          return line
        });
        // obj.lines = lines;

        // call save API
        var jobId = this.appmodel.getProperty("/detail/header/JobId");
        var packageId = this.appmodel.getProperty("/detail/header/PackageId");
        var url = `/api/sap/save?packageId=${packageId}&jobId=${jobId}&mode=NONPO`;

        this.ajax('POST', url, {
          dox: obj,
        })
          .then(function (data) {
            // if save press
            MessageBox.success("Sucessfully saved record", {
              title: "Success",
              details: data,
              styleClass: sResponsivePaddingClasses
            });

            // fire cancel press so that lock is released
            this.handleCancelGEdit();

          }.bind(this))
          .catch(function (err) {

            MessageBox.error("An unexpected error occurred in the backend system.\nPlease try again later.", {
              title: "Error",
              details: err,
              styleClass: sResponsivePaddingClasses
            });

            // fire cancel press so that lock is released
            this.handleCancelGEdit();

          }.bind(this));

        return;

      }
    },

    // Submit Press Handler
    onSubmitPress: function (oEvent) {
      sap.ui.core.BusyIndicator.show();
      this.getOwnerComponent().getModel('msg').setProperty("/aMsg", []);

      function calcAmountCD(bCMemo, sCDInd, nAmt) {

        if (bCMemo) {

          if (sCDInd === "true") { // Credit
            return (parseFloat(nAmt) * (-1));
          } else if (sCDInd === "false") { // Debit
            return parseFloat(nAmt);
          }

        } else {

          if (sCDInd === "true") { // Credit
            return (parseFloat(nAmt) * (-1));
          } else if (sCDInd === "false") { // Debit
            return parseFloat(nAmt);
          }
        }

        return 0;
      }

      var oV = this.getView();
      var aErr = [];

      if (this.appmodel.getProperty("/props/POMode")) {
        // If user is saving a PO based invoice

        // validate the form
        // -- header --
        aErr = this.validatePOModeHeader(aErr);
        aErr = this.validatePOModeLines(aErr);

        // //debugger;
        // if error then show errors.
        if (aErr.length > 0) {
          var aMsg = this._errorBuilder(aErr);
          // MessageBox.error("Please fix errors before submitting.");
          this.getOwnerComponent().getModel('msg').setProperty("/aMsg", aMsg);

          var oButton = this.getView().byId("messagePopoverBtn");
          console.log('Trigger Openby Msg')
          setTimeout(function () {
            this.oMP.openBy(oButton);
          }.bind(this), 100);

          return;
        }

        this.getOwnerComponent().getModel('msg').setProperty("/aMsg", []);
        // build the JSON to send to API
        var obj = this.savePayloadBuilder("PO", oV);

        var lines = deepExtend([], this.appmodel.getProperty("/DocxLines"));
        obj.lines = lines.map((line) => {
          // line.InvoiceLineItem
          line.Description = line.Description ? (line.Description).replace(/'/g, "''") : "";
          line.Amount = line.Amount ? parseFloat(line.Amount) : 0;
          line.Quantity = line.Quantity ? parseFloat(line.Quantity) : 0;
          // line.Amount
          // line.Currency
          // line.Quantity
          // line.UoM
          // line.PONumber
          // line.POLineItem
          // line.TaxCode
          // line.TaxName 
          return line
        });
        // obj.lines = lines;

        // Create SAP WS Payload

        // Invoice Date (When invoice was recieved electronically)
        var STRING_INV_DATE = this.appmodel.getProperty("/detail/header/CreatedAt");
        var INV_DATE = moment(new Date(STRING_INV_DATE)).format('YYYY-MM-DD');
        var fileName = [];
        var fileDesc = [];
        var objectStoreRefVal = [];
        var hdrToAttachPO = [];
        
        
        var fileAttachlen = this.getOwnerComponent().getModel('appmodel').getData().Filelist;
        for(var i=0;i<fileAttachlen.length;i++){
          // fileName.push(fileAttachlen[i].FileName) ;
          // fileDesc.push(fileAttachlen[i].DocCategory);
          // objectStoreRefVal.push(fileAttachlen[i].ObjectStoreRef);
          var fileAttach = {
            "InvType": "PO",
            "FileName":"",
            "FileDesc":"",
            "ObjectStoreRefVal" : "",
            "Base64Str": ""
          };
          fileAttach.FileName = fileAttachlen[i].FileName;
          fileAttach.FileDesc = fileAttachlen[i].DocCategory;
          fileAttach.ObjectStoreRefVal = fileAttachlen[i].ObjectStoreRef;
          hdrToAttachPO.push(fileAttach);
        }

        var sap_obj = {
          "InvType": "PO",
          "InvoiceInd": obj.header.InvInd ? null : "X", // Credit Memo CHAR1
          "DocType": obj.header.InvDocTyp ? obj.header.InvDocTyp : "", // CHAR2
          //"DocDate": moment(obj.header.DocDt).format('YYYY-MM-DD'), // DocDt CHAR8
          "DocDate": INV_DATE,
          "PstngDate": moment(new Date()).format('YYYY-MM-DD'),
          "RefDocNo": obj.header.InvNum, // InvNum
          "CompCode": obj.header.dBukrs,
          // Manually added for testing
          //"CompCode": null, // CHAR3
          "Currency": obj.header.Curr,
          "GrossAmount": parseFloat(obj.header.GrossAmt) ? (parseFloat(obj.header.GrossAmt)).toFixed(2) : null, // GrossAmt DEC23,4          
          //"GrossAmount": parseFloat(obj.header.GrossAmt) ? (parseFloat(obj.header.GrossAmt)).toFixed(2) : null, // GrossAmt DEC23,4
          "PoHdrToItem": [],
          "PoHdrToNote": [{
            "InvType": "PO",
            "Tdformat": "St",
            "Tdline": "String 472"
          },
          {
            "InvType": "PO",
            "Tdformat": "St",
            "Tdline": "String 474"
          }],
          "PoHdrToRet": [],
          "PoHdrToAttach": hdrToAttachPO,          
        };

        var HDR_RET = []
        var HDR_RET1 = {
          "InvType": "PO"
        }
        HDR_RET.push(HDR_RET1);
        
        function calcItemAmt(ItmAmt, TaxAmt) {
          if (!ItmAmt) {
            ItmAmt = 0;
          }
          if (!TaxAmt) {
            TaxAmt = 0;
          }
          return (parseFloat(ItmAmt) + parseFloat(TaxAmt));
        }


        sap_obj.PoHdrToItem = obj.lines.map((item, idx) => {
          var sap_item_obj = {
            "InvType": "PO",
            "InvoiceDocItem": (parseInt(item.InvoiceLineItem) + idx).toString(), // CHAR10
            "PoNumber": item.PONumber, // CHAR10
            "PoItem": item.POLineItem, // CHAR5
            "TaxCode": item.TaxCode, // CHAR2
            "ItemAmount": parseFloat(item.Amount) ? (parseFloat(item.Amount)).toFixed(2) : 0, // DEC 23,4
            "Quantity": parseFloat(item.Quantity) ? (parseFloat(item.Quantity)).toFixed(2) : 0, // QUAN 13,3
          };
          return sap_item_obj;
        });

        sap_obj.PoHdrToRet = HDR_RET;

        if (obj.header.TaxExemptAmt) {
          var withtaxdata = {
            "WI_TAX_BASE": (parseFloat(obj.header.GrossAmt) - parseFloat(obj.header.TaxExemptAmt)) ? (parseFloat(obj.header.GrossAmt) - parseFloat(obj.header.TaxExemptAmt)).toFixed(2) : null// DEC 23,4
          }
          sap_obj.WITHTAXDATA.item.push(withtaxdata);
        }

        // call save API
        var jobId = this.appmodel.getProperty("/detail/header/JobId");
        var packageId = this.appmodel.getProperty("/detail/header/PackageId");
        var url = `/api/sap/submit?jobId=${jobId}&packageId=${this._packageId}&mode=PO`;
        var that = this;
        console.log("sap_obj: " + sap_obj);
        sap.ui.core.BusyIndicator.show();
        this.ajax('POST', url, {
          dox: obj,
          userdata: sap_obj
        })
          .then(function (data) {
            console.log("SAP CALL");

            //old odata & set - ZTAP_INV_POST_SRV/HEADERDATASet
            jQuery.ajax("/sap/opu/odata/sap/Z_SB_INVOICE_POSTING/ZC_INV_HEADER", {
              type: "GET",
              contentType: 'application/json',
              beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
              },
              success: function (responseToken, textStatus, XMLHttpRequest) {
                var token = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
                console.log("token = " + token);
                jQuery.ajax("/sap/opu/odata/sap/ZTAP_INV_POST_SRV/HEADERDATASet", {
                  type: "POST",
                  data: JSON.stringify(data.ws),
                  contentType: 'application/json',
                  // dataType: 'json',
                  beforeSend: function (xhr) {
                    xhr.setRequestHeader("X-CSRF-Token", token);
                    xhr.setRequestHeader("Accept", "application/json");
                  },
                  success: function (response) {
                    sap.ui.core.BusyIndicator.hide();
                    // will be called once the xsjs file sends a response
                    var resHdr2Ret = response.d.PoHdrToRet.results;
                    // Safety check if ws_response exists.
                    //if (resHdr2Ret[0].Type === "S" || resHdr2Ret[0].Type === "") {
                    var aMsg = [];
                    var soap_res = resHdr2Ret;
                    var bCreated = resHdr2Ret[0].Type === "S" ? true : false;
                    if (resHdr2Ret[0].Type === "S") {
                      MessageBox.success("Successfully Created Incoive Document no "
                      +resHdr2Ret[0].Invoicedocnumber +" For Fiscal year: " + resHdr2Ret[0].Fiscalyear, {
                        title: "Success",
                        details: soap_res,
                        styleClass: sResponsivePaddingClasses
                      });                      
                      that.asyncInvoiceStatusUpdate(resHdr2Ret[0].Invoicedocnumber);
                    } else if (resHdr2Ret[0].Type === "") {
                      MessageBox.success("Successfully Created Incoive Document no: "
                      +resHdr2Ret[0].Invoicedocnumber +" for Fiscal year: " + resHdr2Ret[0].Fiscalyear, {
                        title: "Success",
                        details: soap_res,
                        styleClass: sResponsivePaddingClasses
                      });                      
                      that.asyncInvoiceStatusUpdate(resHdr2Ret[0].Invoicedocnumber);
                    } else {
                      MessageBox.error(resHdr2Ret[0].Message, {
                        title: "Error",
                        details: soap_res,
                        styleClass: sResponsivePaddingClasses
                      });
                    }

                    var oMsg = {
                      "message": resHdr2Ret[0].Message,
                      "type": resHdr2Ret[0].Type,
                      "system": null,
                      "number": null,
                      "log_msg_no": null,
                      "msg_id": null,
                    }

                    aMsg.push(oMsg);
                    that.getOwnerComponent().getModel('msg').setProperty('/aMsg', aMsg);

                    if (resHdr2Ret[0].Type === "S") {
                      var invoice = soap_res[0].Invoicedocnumber;
                      // async file attach to SAP
                      that.asyncFileAttachToSAP(invoice);                      
                    }

                    //}

                    // fire cancel press so that lock is released
                    that.handleCancelGEdit();

                    if (invoice) {
                      that.loadHeaderFromDB(this._packageId);
                    }
                  }
                    .bind(this),
                  error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    // will be called in case of any errors:
                    var errMsg = e.responseJSON.error.message.value;
                    MessageBox.error(errMsg, {
                      title: "Error",
                      styleClass: sResponsivePaddingClasses
                    });
                    console.log(e);
                  }
                });
              },
              error: function (e) {
                sap.ui.core.BusyIndicator.hide();
                // will be called in case of any errors:
                var errMsg = e.responseJSON.error.message.value;
                MessageBox.error(errMsg, {
                  title: "Error",
                  styleClass: sResponsivePaddingClasses
                });
              }
            });

          }.bind(this))
          .catch(function (err) {
            sap.ui.core.BusyIndicator.hide();
            console.log(err);
            var aMsg = [];

            var soap_res = err.responseJSON.ws;

            // means errors are present


            if (err.status === 400) {

              aMsg = soap_res.return.map((item) => {
                var oMsg = {
                  "message": item.message,
                  "type": item.type,
                  "system": item.system,
                  "number": item.number,
                  "log_msg_no": item.log_msg_no,
                  "msg_id": item.id
                }

                return oMsg;
              });

              this.getOwnerComponent().getModel('msg').setProperty("/aMsg", aMsg);

              var oButton = this.getView().byId("messagePopoverBtn");
              console.log('Trigger Openby Msg')
              setTimeout(function () {
                this.oMP.openBy(oButton);
              }.bind(this), 100);

            } else if (err.status === 500) {
              MessageBox.error("SAP Odata failure", {
                title: "Error",
                details: soap_res,
                styleClass: sResponsivePaddingClasses
              });
            } else {
              MessageBox.error("Error creating Invoice Document in SAP", {
                title: "Error",
                details: soap_res,
                styleClass: sResponsivePaddingClasses
              });
            }

            // fire cancel press so that lock is released
            this.handleCancelGEdit();

          }.bind(this));

        return;

      } else {
        // If user is saving a NON-PO based invoice

        // validate the form
        aErr = this.validateNON_POModeHeader(aErr);

        // if error then show errors.
        if (aErr.length > 0) {
          var aMsg = this._errorBuilder(aErr);
          // MessageBox.error("Please fix errors before submitting.");
          this.getOwnerComponent().getModel('msg').setProperty("/aMsg", aMsg);

          var oButton = this.getView().byId("messagePopoverBtn");
          console.log('Trigger Openby Msg')
          setTimeout(function () {
            this.oMP.openBy(oButton);
          }.bind(this), 100);

          return;
        }

        this.getOwnerComponent().getModel('msg').setProperty("/aMsg", []);

        // build the JSON to send to API
        var obj = this.savePayloadBuilder("NONPO", oV);

        var lines = deepExtend([], this.appmodel.getProperty("/NonPoDocxLines"));
        obj.lines = lines.map((line) => {
          // make necessary transform
          return line
        });
        // obj.lines = lines;

        // build the JSON to send to API
        // Create SAP WS Payload
        var dateNow = new Date();
        var STRING_INV_DATE = this.appmodel.getProperty("/detail/header/CreatedAt");
        var INV_DATE = moment(new Date(STRING_INV_DATE)).format('YYYY-MM-DD');
        var fileName = [];
        var fileDesc = [];
        var objectStoreRefVal = [];
        var hdrToAttachNPO = [];
        
        var fileAttachlen = this.getOwnerComponent().getModel('appmodel').getData().Filelist;
        for(var i=0;i<fileAttachlen.length;i++){
          var fileAttach = {
            "InvType": "NPO",
            "FileName":"",
            "FileDesc":"",
            "ObjectStoreRefVal" : "",
            "Base64Str": ""
          };
          // fileName.push(fileAttachlen[i].FileName) ;
          // fileDesc.push(fileAttachlen[i].DocCategory);
          // objectStoreRefVal.push(fileAttachlen[i].ObjectStoreRef);
          fileAttach.FileName = fileAttachlen[i].FileName;
          fileAttach.FileDesc = fileAttachlen[i].DocCategory;
          fileAttach.ObjectStoreRefVal = fileAttachlen[i].ObjectStoreRef;
          hdrToAttachNPO.push(fileAttach);
        }
        var sap_obj = {
          "InvType": "NPO",
          "CompCode": obj.header.Bukrs,
          "HeaderTxt": obj.header.FreeTxt ? obj.header.FreeTxt.substring(0, 25) : "", // TODO: 25 Char
          "DocType": obj.header.InvDocTyp,
          //"NEG_POSTNG": obj.header.InvInd ? "X" : null,
          //"BILL_CATEGORY": obj.header.CalcTaxInd ? "X" : null,
          //"DocDate": moment(obj.header.DocDt).format('YYYY-MM-DD'), // DocDt,
          "DocDate" : INV_DATE,
          "RefDocNo": obj.header.InvNum,
          //"FISC_YEAR": dateNow.getFullYear().toString(),
          //"REF_DOC_NO_LONG": "",
          "Username": "ARIKAR",//"ARIKAR" this._sLoggedInUser,// We need to send logged in user id
          "PstngDate": moment(new Date()).format('YYYY-MM-DD'),//"2022-11-21",          
          "HdrToAccgl": [],
          "HdrToAccpbl": [],
          "HdrToCurramt": [],
          "HdrToNote": [],
          "HdrToRet": [],
          "HdrToAttach": hdrToAttachNPO,
        };

        var CURRENCYAMOUNT = []
        var ACCOUNTPAYABLE = []
        var ACCOUNTGL = []
        var ACCOUNTTAX = []
        var LT_NOTE = []
        var HDR_RET = []
        var HDR_RET1 = {
          "InvType": "NPO"
        }
        HDR_RET.push(HDR_RET1);

        // var LTNOTE_item_1 = {
        //   "InvType": "NPO",
        //   "Tdformat": "St",
        //   "Tdline": "String 472"
        // }
        // var LTNOTE_item_2 = {
        //   "InvType": "NPO",
        //   "Tdformat": "St",
        //   "Tdline": "String 474"
        // }

        // LT_NOTE.push(LTNOTE_item_1);
        // LT_NOTE.push(LTNOTE_item_2);
        // ACCOUNTPAYABLE
        var ACCOUNTPAYABLE_item = {
          "InvType": "NPO",
          "ItemnoAcc": "1", // CHAR10
          "VendorNo": obj.header.VendorNumber, // CHAR10
          //"PARTNER_BK": obj.header.PartBank, // CHAR4
          //"BlineDate": moment(obj.header.DocDt).format('YYYY-MM-DD'), // CHAR8
          "BlineDate":INV_DATE,
          "Pmnttrms": obj.header.PaymentTerms, // CHAR4
          "ItemText": obj.header.FreeTxt ? obj.header.FreeTxt.substring(0, 50) : "", // CHAR50
          "CompCode": obj.header.Bukrs,
          "TaxCode": obj.header.TaxCode,
          "Taxjurcode": "7700000000"
        }
        ACCOUNTPAYABLE.push(ACCOUNTPAYABLE_item);

        // CURRENCYAMOUNT
        var sParsedGrsAmt = obj.header.GrossAmt === '' ? "0" : (parseFloat(obj.header.GrossAmt )).toFixed(2);
        var CURRENCYAMOUNT_item = {
          "InvType": "NPO",
          "ItemnoAcc": "1",
          //"CURRENCY_ISO": obj.header.Curr,
          "AmtDoccur": obj.header.InvInd ? sParsedGrsAmt  : (((-1)*sParsedGrsAmt).toString()), //DEC 23,4
          //"DiscBase": 0, // DEC24,4
          //"DiscAmt": 0, // DEC24,4
          //"TaxAmt": 0, // DEC24,4
          "Currency": obj.header.Curr
        }
        CURRENCYAMOUNT.push(CURRENCYAMOUNT_item);

        obj.lines.map((line, idx) => {
          ////debugger;
          // CURRENCYAMOUNT
          var CURRENCYAMOUNT_item = {
            "InvType": "NPO",
            "ItemnoAcc": (parseInt(idx) + 2).toString(), // CHAR10
            "Currency": obj.header.Curr, // CHAR3
            // "AMT_DOCCUR": obj.header.InvInd ? (parseFloat(line.Amount) * (-1)) : parseFloat(line.Amount),
            "AmtDoccur": calcAmountCD(obj.header.InvInd, line.CDInd, line.Amount).toFixed(2),
            //"DiscBase": 0,
            //"DiscAmt": 0,
            //"TaxAmt": parseFloat(line.TaxAmount) ? (parseFloat(line.TaxAmount)).toFixed(2) : 0,  // DEC 23,4
          }
          CURRENCYAMOUNT.push(CURRENCYAMOUNT_item);

          // ACCOUNTGL
          var ACCOUNTGL_item = {
            "ItemnoAcc": (parseInt(idx) + 2).toString(), // CHAR10
            "InvType": "NPO",
            //"FISC_YEAR": dateNow.getFullYear().toString(), // CHAR4
            //"COMP_CODE": line.Bukrs, // CHAR4
            //"COSTCENTER": line.CostCen, // CHAR10
            "GlAccount": line.GLAcc, // CHAR10
            "PstngDate": moment(new Date()).format('YYYY-MM-DD'),
            //"PROFIT_CTR": line.ProfitCen, // CHAR10
            //"WBS_ELEMENT": line.WBSElem, // CHAR24
            "TaxCode": line.TaxCode, // CHAR2
            // ITEM TEXT IS MAPPED TO HEADER TEXT AS PER SIT DEFECT.
            //"ITEM_TEXT": obj.header.FreeTxt ? obj.header.FreeTxt.substring(0, 50) : "", // CHAR50,
            "VendorNo": obj.header.VendorNumber,
            "Taxjurcode": null, //"7700000000",
            "ItmNumber": "000001",
            "ItemnoTax": "000001"
          }
          ACCOUNTGL.push(ACCOUNTGL_item);

          // ACCOUNTTAX 
          var ACCOUNTTAX_item = {
            "ITEMNO_ACC": (parseInt(idx) + 2).toString(), // CHAR10
            "COND_KEY": "PA00", // CHAR4
            "TAX_CODE": line.TaxCode, // CHAR2
          }
          ACCOUNTTAX.push(ACCOUNTTAX_item);

        });

        sap_obj.HdrToCurramt = CURRENCYAMOUNT;
        sap_obj.HdrToAccpbl = ACCOUNTPAYABLE;
        sap_obj.HdrToAccgl = ACCOUNTGL;
        sap_obj.HdrToNote = LT_NOTE;
        sap_obj.HdrToRet = HDR_RET;

        if (obj.header.TaxExemptAmt) {
          var withtaxdata = {
            "BAS_AMT_TC": (parseFloat(obj.header.GrossAmt) - parseFloat(obj.header.TaxExemptAmt)).toFixed(2), // DEC 23,4
            "BAS_AMT_IND": "X" //CHAR1
          }
          //sap_obj.ACCOUNTWT.item.push(withtaxdata);

        }

        // call save API
        var jobId = this.appmodel.getProperty("/detail/header/JobId");
        var packageId = this.appmodel.getProperty("/detail/header/PackageId");
        var url = `/api/sap/submit?jobId=${jobId}&packageId=${this._packageId}&mode=NONPO`;
        var that = this;
        console.log("sap_obj: " + sap_obj);
        this.ajax('POST', url, {
          dox: obj,
          userdata: sap_obj
        })
          .then(function (data) {

            jQuery.ajax("/sap/opu/odata/sap/ZTAP_INV_POST_SRV/DOCUMENTHEADERSet", {
              type: "GET",
              contentType: 'application/json',
              beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRF-Token", "Fetch");
              },
              success: function (responseToken, textStatus, XMLHttpRequest) {
                var token = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
                console.log("token = " + token);
                jQuery.ajax("/sap/opu/odata/sap/ZTAP_INV_POST_SRV/DOCUMENTHEADERSet", {
                  type: "POST",
                  data: JSON.stringify(data.ws),
                  contentType: 'application/json',
                  // dataType: 'json',
                  beforeSend: function (xhr) {
                    xhr.setRequestHeader("X-CSRF-Token", token);
                    xhr.setRequestHeader("Accept", "application/json");
                  },
                  success: function (response) {
                    sap.ui.core.BusyIndicator.hide();
                    // will be called once the xsjs file sends a response  
                    var resHdr2Ret = response.d.HdrToRet.results;
                    // Safety check if ws_response exists.
                    //if (resHdr2Ret[0].Type === "S" || resHdr2Ret[0].Type === "") {
                    var aMsg = [];
                    var soap_res = resHdr2Ret;
                    var bCreated = resHdr2Ret[0].Type === "S" ? true : false;
                    if (resHdr2Ret[0].Type === "S") {
                      MessageBox.success(resHdr2Ret[0].Message, {
                        title: "Success",
                        details: soap_res,
                        styleClass: sResponsivePaddingClasses
                      });
                    } else if (resHdr2Ret[0].Type === "") {
                      MessageBox.warning(resHdr2Ret[0].Message, {
                        title: "Success",
                        details: soap_res,
                        styleClass: sResponsivePaddingClasses
                      });
                    } else {
                      MessageBox.error(resHdr2Ret[0].Message, {
                        title: "Error",
                        details: soap_res,
                        styleClass: sResponsivePaddingClasses
                      });
                    }

                    var oMsg = {
                      "message": resHdr2Ret[0].Message,
                      "type": resHdr2Ret[0].Type,
                      "system": null,
                      "number": null,
                      "log_msg_no": null,
                      "msg_id": null,
                    }

                    aMsg.push(oMsg);
                    that.getOwnerComponent().getModel('msg').setProperty('/aMsg', aMsg);

                    if (resHdr2Ret[0].Type === "S") {
                      var invoice = soap_res[0].Invoicedocnumber;
                      // async file attach to SAP
                      that.asyncFileAttachToSAP(invoice);
                      that.asyncInvoiceStatusUpdate(invoice);
                    }

                    //}

                    // fire cancel press so that lock is released
                    that.handleCancelGEdit();

                    if (invoice) {
                      that.loadHeaderFromDB(this._packageId);
                    }
                  }.bind(this),
                  error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    // will be called in case of any errors:
                    var errMsg = e.responseJSON.error.message.value;
                    MessageBox.error(errMsg, {
                      title: "Error",
                      styleClass: sResponsivePaddingClasses
                    });
                    console.log(e);
                  }
                });
              },
              error: function (e) {
                sap.ui.core.BusyIndicator.hide();
                // will be called in case of any errors:
                var errMsg = e.responseJSON.error.message.value
                MessageBox.error(errMsg, {
                  title: "Error",
                  styleClass: sResponsivePaddingClasses
                });
                console.log(e);
              }
            });
          }.bind(this))
          .catch(function (err) {
            sap.ui.core.BusyIndicator.hide();
            var aMsg = [];
            var soap_res = err.responseJSON.ws;

            // means errors are present


            if (err.status === 400) {

              aMsg = soap_res.return.map((item) => {
                var oMsg = {
                  "message": item.message,
                  "type": item.type,
                  "system": item.system,
                  "number": item.number,
                  "log_msg_no": item.log_msg_no,
                  "msg_id": item.id
                }

                return oMsg;
              });

              this.getOwnerComponent().getModel('msg').setProperty("/aMsg", aMsg);
              var oButton = this.getView().byId("messagePopoverBtn");
              console.log('Trigger Openby Msg')
              setTimeout(function () {
                this.oMP.openBy(oButton);
              }.bind(this), 100);
            } else if (err.status === 500) {
              MessageBox.error("SAP Odata failure", {
                title: "Error",
                details: soap_res,
                styleClass: sResponsivePaddingClasses
              });
            } else {
              MessageBox.error("Error creating Invoice Document in SAP", {
                title: "Error",
                details: soap_res,
                styleClass: sResponsivePaddingClasses
              });
            }

            // fire cancel press so that lock is released
            this.handleCancelGEdit();

          }.bind(this));

        return;

      }
    },
  });
});
