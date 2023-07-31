sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "touchlessui/utils/formatter",
    "sap/m/UploadCollectionParameter"
], function (BaseController, JSONModel, Filter, FilterOperator, Sorter, MessageBox, MessageToast, Fragment, formatter,UploadCollectionParameter) {
    "use strict";

    return BaseController.extend("touchlessui.controller.Master", {
        formatter: formatter,
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("master").attachPatternMatched(this._onRouteMatched, this);
            this._bDescendingSort = false;
        },

        onAfterRendering: function () {
            // this.loadDashboard();
        },

        _onRouteMatched: function () {
            // this.loadDashboard();
            this.onGoPress();
            this.resetState();
        },

        onTLAPOdataSubmit: function (oEvent) {

            var oPayload = {
                // "to_attach_oc": true,
                // "to_item_oc": true,
                // "to_note_oc": true,
                // "to_return_oc": true,
                // "invoice_typ": "PO",
                // "invoice_ind": "X",
                // "doc_type": "RE",
                // "doc_date": "2023-06-07",
                // "pstng_date": "2023-06-07",
                // "ref_doc_no": "52965=TEST1",
                // "comp_code": "2000",
                // "currency": "USD",
                // "gross_amount": "1000.0000",
                "Id": "bea95f71-c242-1ede-82b4-1c6e33565faf",
                "InvType": "PO",
                "InvoiceInd": "X",
                "DocType": "RE",
                "DocDate": "2023-07-11T12:00",
                "PstngDate": "2023-07-11T12:00",
                "RefDocNo": "52965=TEST1",
                "CompCode": "2000",
                "Currency": "USD",
                "GrossAmount": "10.00",
                // "to_attach": {
                //     "InvoiceType": "PO"
                // },
                "to_item": [{
                    // "Id": "bea95f71-c242-1ede-82b4-1c6e33565faf",
                    // "IId": "bea95f71-c242-1ede-82b4-1c6e33565fag",
                    // "Delete_mc": "false",
                    // "Update_mc": "false",
                    "PoItem": "00010",
                    "InvType": "PO",
                    "TaxCode": "I0",
                    "PoNumber": "4500003829",
                    "Quantity": "1.00",
                    "ItemAmount": "10.00",
                    "InvoiceDocItem": "1"
                }],
                "to_note": [{
                    "InvType": "PO",
                    "Tdformat": null,
                    "Tdline": "note 1"
                }],
                "to_attach": [{
                    "FileName": "Test",
                    "Base64Str": "aGVsbG8gYWxsbGxsIGhhcHB5ICBoYXBweSA="
                }]
                // "to_return": [{
                    
                //     }]
                // "InvType": "NPO",
                // "Username": "ARIKAR",
                // "HeaderTxt": "HEADER_211122",
                // "CompCode": "2000",
                // "DocDate": "2022-08-15",
                // "PstngDate": "2023-01-02",
                // "DocType": "RE",
                // "RefDocNo": "52965=TEST1",			//Change in each pass

                // "HdrToAccgl": [{
                //     "InvType": "NPO",
                //     "ItemnoAcc": "1",
                //     "GlAccount": "54070000",
                //     "PstngDate": "2023-01-02",		//Current Date
                //     "VendorNo": "173",
                //     "TaxCode": "I1",
                //     "Taxjurcode": "7700000000",
                //     "ItmNumber": "000001",
                //     "ItemnoTax": "000001"
                // }],

                // "HdrToAccpbl": [{
                //     "InvType": "NPO",
                //     "ItemnoAcc": "2",
                //     "VendorNo": "201",
                //     "CompCode": "2000",
                //     "Pmnttrms": "0001",
                //     "BlineDate": "2022-11-21",
                //     "TaxCode": "I1",
                //     "Taxjurcode": "7700000000"
                // }],

                // "HdrToCurramt": [{
                //     "InvType": "NPO",
                //     "ItemnoAcc": "2",
                //     "Currency": "USD",
                //     "AmtDoccur": "100-"
                // },
                // {
                //     "InvType": "NPO",
                //     "ItemnoAcc": "1",
                //     "Currency": "USD",
                //     "AmtDoccur": "100"
                // }],

                // "HdrToNote": [{
                //     "InvType": "NPO",
                //     "Tdformat": "St",
                //     "Tdline": "String 472"
                // },
                // {
                //     "InvType": "NPO",
                //     "Tdformat": "St",
                //     "Tdline": "String 474"
                // }],

                // "HdrToRet": [{
                //     "InvType": "NPO"
                // }]
            }

            //         $.ajax({
            //             url: "/sap/opu/odata/sap/ZTAP_INV_POST_SRV/DOCUMENTHEADERSet",
            //             method: "GET",
            //             context : this,
            //             headers: {
            //               "X-CSRF-Token": "fetch",
            //               'X-Requested-With': 'X'
            //             }
            //           }).done(function(data, textStatus, jqXHR) {
            //             var csrfToken = jqXHR.getResponseHeader("x-csrf-token");

            //             this.getView().getModel("InvPostModel").create("/DOCUMENTHEADERSet", oPayload, {              
            //    headers: {
            //         "X-CSRF-Token": csrfToken,
            //         'X-Requested-With': 'X'
            //       },
            //     success: function (oData, response) {                                        
            //           console.log("SAP Response: " + oData);
            //     }.bind(this),
            //     error: function (oError) {                    
            //     }.bind(this)
            // });
            //             // Perform POST request
            //             // $.ajax({
            //             //   url: "/sap/opu/odata/sap/ZTAP_INV_POST_SRV/DOCUMENTHEADERSet",
            //             //   method: "POST",
            //             //   headers: {
            //             //     "X-CSRF-Token": csrfToken
            //             //   },
            //             //   data: {
            //             //     oPayload
            //             //   }
            //             // }).done(function(data, textStatus, jqXHR) {
            //             //     console.log("SAP Response: " + oData);
            //             // }).fail(function(jqXHR, textStatus, errorThrown) {
            //             //     console.log("Error in post call: " + errorThrown);
            //             // });
            //           }).fail(function(jqXHR, textStatus, errorThrown) {
            //             console.log("Error in csrf token fetch call: " + errorThrown);
            //           });


            var oPayload2 = {                
                "InvoiceType": "PO"
            }
            var oDataModel = this.getView().getModel("InvPostModel");
            var oHeaders = {
                'X-Requested-With': 'X',
                'Accept': 'application/json',
            };

            oDataModel.setDeferredGroups("idPOInvoice");

            oDataModel.create("/ZC_INV_HEADER", oPayload, {
                headers: oHeaders,
                groupId: "idPOInvoice",
                success: function (oData, response) {
                    console.log("SAP Response: " + oData);
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            });

            // oDataModel.create("/ZC_INV_ATTACH", oPayload2, {
            //     headers: oHeaders,
            //     groupId: "idPOInvoice",
            //     success: function (oData, response) {
            //         console.log("SAP Response: " + oData);
            //     }.bind(this),
            //     error: function (oError) {
            //     }.bind(this)
            // });

            // oDataModel.create("/ZC_INV_ITEM", oPayload2, {
            //     headers: oHeaders,
            //     groupId: "idPOInvoice",
            //     success: function (oData, response) {
            //         console.log("SAP Response: " + oData);
            //     }.bind(this),
            //     error: function (oError) {
            //     }.bind(this)
            // });

            oDataModel.submitChanges({
                groupId: "idPOInvoice",
                success: function (oData, response) {
                    console.log("SAP Response: " + oData);
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            });

            // jQuery.ajax("/sap/opu/odata/sap/ZTAP_INV_POST_SRV/DOCUMENTHEADERSet",{
            //     type: "GET",
            //     contentType: 'application/json',
            //     dataType: 'json',

            //     beforeSend: function(xhr){
            //       xhr.setRequestHeader('X-CSRF-Token', 'fetch');
            //     },
            //     complete : function(response) {
            //       jQuery.ajaxSetup({
            //         beforeSend: function(xhr) {
            //           xhr.setRequestHeader("X-CSRF-Token",response.getResponseHeader('X-CSRF-Token'));
            //         }
            //       });
            //     }
            //   });

            //     jQuery.ajax("/sap/opu/odata/sap/ZTAP_INV_POST_SRV/DOCUMENTHEADERSet", {                
            //         type: "GET",
            //         contentType: 'application/json',
            //         beforeSend: function(xhr) {
            //             xhr.setRequestHeader("X-CSRF-Token", "Fetch");
            //         },
            //         success: function(responseToken, textStatus, XMLHttpRequest) {
            //             var token = XMLHttpRequest.getResponseHeader('X-CSRF-Token');         
            //             console.log("token = " +token);
            //             jQuery.ajax("/sap/opu/odata/sap/ZTAP_INV_POST_SRV/DOCUMENTHEADERSet", {                        
            //                 type: "POST",
            //                 data: JSON.stringify(oPayload),
            //                 contentType: 'application/json',
            //                 // dataType: 'json',
            //                 beforeSend: function(xhr) {
            //                     xhr.setRequestHeader("X-CSRF-Token", token);
            //                     xhr.setRequestHeader("Accept", "application/json");
            //                 },
            //                 success : function(response) {
            //                      // will be called once the xsjs file sends a response                                 
            //                      console.log(response);    
            //                  },
            //                  error : function(e) {
            //                      // will be called in case of any errors:
            //                      var errMsg = e.responseText
            //                      console.log(e);    
            //                  }
            //             });
            //         },
            //         error : function(e) {
            //             // will be called in case of any errors:
            //             var errMsg = e.responseText
            //             console.log(e);
            //         }
            //    });

        },

        onOldOdata2Submit: function (oEvent) {

            var oPayload = {
                "ProdOrd": "1001760",
                "SalesOrd": "2629",
                "CoCd": "4000",
                "Quantity": "1.000",
                "CStorageLoc": "400A",
                "CBatch": "0000001412",
                "PStorageLoc": "400A",
                "PBatch": "0000001412",
                "AssetCls": "2000",
                "CostCtr": "40001801",
                "InvSer": [{
                    "SalesOrd": "2629",
                    "Material": "M1000",
                    "SerialNumber": "10011685"
                },
                {
                    "SalesOrd": "2629",
                    "Material": "M1000L",
                    "SerialNumber": "10011686"
                }],
                "InvMsg": [{}],
                "InvLanes": [{}]
            };

            //    var oHeaders = {
            //        'X-Requested-With': 'X',
            //        'Accept' : 'application/json',
            //        };
            var oFileUpload = this.getView().byId("idfileUploader");
            var domRef = oFileUpload.getFocusDomRef();
            var file = domRef.files[0];
            var that = this;

            //This code is used for uploading image or document file


            this.fileType = file.type;

            var reader = new FileReader();
            reader.onload = function (e) {
                var vContent = e.currentTarget.result
                vContent = vContent.replace('data:application/pdf;base64,','');
                // const textToBinary = (str = '') => {
                //     let res = '';
                //     res = str.split('').map(char => {
                //         return char.charCodeAt(0).toString(2);
                //     }).join(' ');
                //     return res;
                // };
                // const textToBinaryOutput = textToBinary(vContent)

                that.updateFile(that.fileName, that.fileType, vContent);
            }
            reader.readAsDataURL(file);
            
        },
        updateFile:function(fileName, fileType, vContent){
            var oFileUpload = this.getView().byId("idfileUploader");
            var oHeaders = {
                'slug': oFileUpload.getValue().replaceAll(/['"]+/g,''),
                'BusinessObjectTypeName': 'BUS2081',
                'LinkedSAPObjectKey': '51056010202023',
                'Accept': 'application/json',
                //"content-type":"application/pdf",
                'X-CSRF-Token': 'fetch'
            }
            var oPayloadAttach = {
                //  "DocumentInfoRecordDocType": fileType,
                //  "Content":vContent
                "Content-Disposition": "form-data",
                "name":"myFileUpload[]",
                "filename":oFileUpload.getValue().replaceAll(/['"]+/g,''),
                "Content-Type": "multipart/form-data"
                
            }

            //this.getView().getModel("MoveInv").create("/MoveInventorySet", oPayload, {   
            this.getView().getModel("AttachAPISet").create("/AttachmentContentSet", oPayloadAttach, {
                headers: oHeaders,
                success: function (oData, response) {
                    console.log("SAP Response: " + oData);
                }.bind(this),
                error: function (oError) {
                }.bind(this)
            });
        },
        onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
            this.csrfToken = this.getView().getModel("AttachAPISet").getSecurityToken();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: this.csrfToken
			});
			oUploadCollection.addHeaderParameters(oCustomerHeaderToken);
			MessageToast.show("Event change triggered");
		},

		

		onStartUpload: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			var oTextArea = this.byId("TextArea");
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)";

			if (cFiles > 0) {
				oUploadCollection.upload();

				// if (oTextArea.getValue().length === 0) {
				// 	uploadInfo = uploadInfo + " without notes";
				// } else {
				// 	uploadInfo = uploadInfo + " with notes";
				// }

				// MessageToast.show("Method Upload is called (" + uploadInfo + ")");
				// MessageBox.information("Uploaded " + uploadInfo);
				// oTextArea.setValue("");
			}
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            var oheaderBusObjTyp = new UploadCollectionParameter({
				name: "BusinessObjectTypeName",
				value: "BUS2081"
			});
			oEvent.getParameters().addHeaderParameter(oheaderBusObjTyp);
            var oheaderLinkSAPObjKey = new UploadCollectionParameter({
				name: "LinkedSAPObjectKey",
				value: "51056010202023"
			});
			oEvent.getParameters().addHeaderParameter(oheaderLinkSAPObjKey);
			setTimeout(function() {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},


		onSelectChange: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		},
        uploadFile: function(oEvent) {
            var oFileUploader = this.getView().byId("idfileUploader");
            this.csrfToken = this.getView().getModel("AttachAPISet").getSecurityToken();
            oFileUploader.setSendXHR(true);
            var headerParma = new sap.ui.unified.FileUploaderParameter();
            headerParma.setName('x-csrf-token');
            headerParma.setValue(this.csrfToken);
            oFileUploader.addHeaderParameter(headerParma);
            var headerParma2 = new sap.ui.unified.FileUploaderParameter();
            headerParma2.setName('slug');
            headerParma2.setValue(oFileUploader.getValue());
            //headerParma2.setValue(['Non-PO vendor invoice-31-01-2023.pdf','PO Vendor Invoice 31-01-2023.pdf']);
            oFileUploader.addHeaderParameter(headerParma2);
            var headerParma3 = new sap.ui.unified.FileUploaderParameter();
            headerParma3.setName('BusinessObjectTypeName');
            headerParma3.setValue('BUS2081');
            oFileUploader.addHeaderParameter(headerParma3);
            var headerParma4 = new sap.ui.unified.FileUploaderParameter();
            headerParma4.setName('Accept');
            headerParma4.setValue('application/json');
            oFileUploader.addHeaderParameter(headerParma4);
            var headerParma5 = new sap.ui.unified.FileUploaderParameter();
            headerParma5.setName('LinkedSAPObjectKey');
            headerParma5.setValue('51056010202023');
            oFileUploader.addHeaderParameter(headerParma5);
            var headerParma6 = new sap.ui.unified.FileUploaderParameter();
            headerParma6.setName('content-type');
            headerParma6.setValue('application/pdf');
            oFileUploader.addHeaderParameter(headerParma6);
            oFileUploader.checkFileReadable().then(function() {
            oFileUploader.upload();
            oFileUploader.destroyHeaderParameters();
            }, function(error) {
            sap.m.MessageToast.show("The file cannot be read. It may have changed.");
            }).then(function() {
            oFileUploader.clear();
            });
            },


        onGoPress: function (oEvent) {
            var sValue;
            // var oHeaders = this.getOwnerComponent().getModel("prmodel").getProperty("/filterHeaders");

            //get the filter bar from the event
            // var oFilterBar = oEvent.getSource();
            // var aFilterItems = oFilterBar.getFilterItems();
            // var aFilters = aFilterItems.map(function (oFilterItem) {
            //     var sFilterName = oFilterItem.getName();
            //     var oControl = oFilterBar.determineControlByFilterItem(oFilterItem);
            //     if (oControl.getMetadata().getName() === "sap.m.Select") {
            //         sValue = oControl.getSelectedKey();
            //     } else if (oControl.getMetadata().getName() === "sap.m.DateRangeSelection") {
            //         var sDateValue = oControl.getDateValue();
            //         var sSecondDateValue = oControl.getSecondDateValue();
            //     } else {
            //         sValue = oControl.getValue();
            //     }


            //     aFilters.push(oFilter);
            //     return aFilters;
            // });
            var oView = this.getView();
            var sFileName = oView.byId("idFilenameInp").getValue();
            var sDocStatus = oView.byId("idSelectDocStatus").getSelectedKeys();
            var sDoxStatus = oView.byId("idSelectExtractionStatus").getSelectedKey();
            var sAssignedTo = oView.byId("idAssignedToInp").getValue();
            var sDocCategory = oView.byId("idSelectDocumentCategory").getSelectedKey();
            var sCreatedBy = oView.byId("idSentByInp").getValue();
            var sCreatedDateFrom = oView.byId("idSentOn").getDateValue();
            var sCreatedDateTo = oView.byId("idSentOn").getSecondDateValue();

            var url = "/api/dashboard?";
            var aParams = [];
            if (sFileName) {
                aParams.push("FileName=" + sFileName);
            }
            if (sDocStatus.length) {
                aParams.push("DocStatus=" + sDocStatus);
            }
            if (sDoxStatus) {
                aParams.push("DoxStatus=" + sDoxStatus);
            }
            if (sAssignedTo) {
                aParams.push("AssignedTo=" + sAssignedTo);
            }
            if (sDocCategory) {
                aParams.push("DocCategory=" + sDocCategory);
            }
            if (sCreatedBy) {
                aParams.push("CreatedBy=" + sCreatedBy);
            }
            if (sCreatedDateFrom || sCreatedDateTo) {
                aParams.push("CreatedAt=" + sCreatedDateFrom.toJSON() + "," + sCreatedDateTo.toJSON());
            }

            var sParams = aParams.join("&");
            url = url + sParams;
            console.log(url);

            sap.ui.core.BusyIndicator.show()
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
                success: function (oData) {
                    console.log("Filtered data:", oData);
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

        onClearFilterBar: function (oEvent) {
            var oView = this.getView();

            oView.byId("idFilenameInp").setValue(null);
            oView.byId("idSelectDocStatus").setSelectedKeys(null);
            oView.byId("idSelectExtractionStatus").setSelectedKey(null);
            oView.byId("idAssignedToInp").setValue(null);
            oView.byId("idSelectDocumentCategory").setSelectedKey(null);
            oView.byId("idSentByInp").setValue(null);
            oView.byId("idSentOn").setDateValue(null);
            oView.byId("idSentOn").setSecondDateValue(null);
        },

        onListItemPress: function (oEvent) {
            // var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
            var packageId = oEvent.getSource().getBindingContext("appmodel").getObject().PackageId;

            this.oRouter.navTo("detailDetail", { layout: sap.f.LayoutType.TwoColumnsMidExpanded, packageId: packageId });
            // this.oRouter.navTo("detail", { layout: oNextUIState.layout, product: product });
        },

        onUnlock: function (oEvent) {

            var URL = "/api/process/lock";
            debugger;
            // var STATUS = this.appmodel.getProperty(this.oCtx + "/DocStatus");
            var PACKAGE_ID = this.getOwnerComponent().getModel("appmodel").getProperty(this.oCtx + "/PackageId");

            if (!PACKAGE_ID) {
                MessageToast.show("ERROR - Document cannot be unlocked");
                return;
            }

            this.ajax("DELETE", URL, {
                packageId: PACKAGE_ID
            }).then(function (data) {
                // if success means lock was removed
                MessageToast.show("Document has been unlocked");

            }.bind(this)).catch(function (err) {
                console.log("FAILED TO REMOVE LOCK", err);
                MessageToast.show("Unable to unlock Document");
            });

        },

        onQuickEditPress: function (oEvent) {
            var oControl = oEvent.getSource(),
                oView = this.getView();

            this.oCtx = oEvent.getSource().getBindingContext('appmodel');

            if (!this._oMenuFragment) {
                this._oMenuFragment = Fragment.load({
                    id: oView.getId(),
                    name: "touchlessui.view.fragments.MasterMenu",
                    controller: this
                }).then(function (oMenu) {
                    oView.addDependent(oMenu);
                    oMenu.openBy(oControl);
                    this._oMenuFragment = oMenu;
                    return this._oMenuFragment;
                }.bind(this));
            } else {
                this._oMenuFragment.openBy(oControl);
            }


        },

        // onSearch: function (oEvent) {
        //     var oTableSearchState = [],
        //         sQuery = oEvent.getParameter("query");

        //     if (sQuery && sQuery.length > 0) {
        //         oTableSearchState = [new Filter("Name", FilterOperator.Contains, sQuery)];
        //     }

        //     this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
        // },

        onAdd: function (oEvent) {
            MessageBox.show("This functionality is not ready yet.", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Aw, Snap!",
                actions: [MessageBox.Action.OK]
            });
        },

        onSort: function (oEvent) {
            this._bDescendingSort = !this._bDescendingSort;
            var oView = this.getView(),
                oTable = oView.byId("productsTable"),
                oBinding = oTable.getBinding("items"),
                oSorter = new Sorter("Name", this._bDescendingSort);

            oBinding.sort(oSorter);
        },

        onConfirm: function (oEvent) {
            // debugger;
            var selectedItem = oEvent.getParameters().selectedItems;
            var assignedTo = selectedItem[0].getTitle();

            var oTable = this.getView().byId("masterTable");


        }

    });
});
