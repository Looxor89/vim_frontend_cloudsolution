sap.ui.define([
  
], function () {
  "use strict";

  return {
    moment: jQuery.sap.require("vim_ui.utils.moment"),

    allowActions: function (sStatus) {
      if(sStatus === "POSTED" || sStatus === "REJSAP" || sStatus === "REJRTV") {
        return false;
      }
      return true;
    },

    allowAddAttachment: function (sStatus) {
      if(sStatus === "POSTED") {
        return true;
      }
      return false;
    },

    formatSubmit: function (bEdit, sStatus) {
      return !bEdit && sStatus !== "POSTED";
    },

    detailDetailEdit: function (bEdit, sStatus, bAdmin) {
      if(bAdmin) {
        return !bEdit;
      }
      if(sStatus === "INITIAL" || sStatus === "POSTED" || sStatus === "REJSAP" || sStatus === "REJRTV") {
        return false;
      }
      return !bEdit;
    },

    detailDetailEditCancel: function (bEdit, sStatus, bAdmin) {
      if(bAdmin) {
        return bEdit;
      }
      if(sStatus === "INITIAL" || sStatus === "POSTED" || sStatus === "REJSAP" || sStatus === "REJRTV") {
        return false;
      }
      return bEdit;
    },

    limitFreeTxt: function (bMode) {
      if (bMode) {
        return 50;
      } else {
        return 50;
      }
      return 0;
    },

    parseCDInd: function (sBool) {
      if (sBool === "true") {
        return "Credit";
      }
      if (sBool === "false") {
        return "Debit";
      }
      return "Debit"
    },

    truncateText: function (sValue) {
      if (!sValue) {
        return "";
      }

      if (sValue.length <= 50) {
        return sValue;
      }
      var text = sValue.slice(0, 50);
      text = text + "...";
      return text;
    },

    formatDateString: function (sDate) {
      // "2020-05-11T14:00:00.000Z" -> May 11th 2020, 1:00PM
      if (sDate) {
        // calculate UTC offset
        var offset = new Date().getTimezoneOffset();
        offset = offset * (-1);
        // format moment
        return moment(sDate).utcOffset(offset).format('LLL');
      } else {
        return "";
      }
    },

    formatLockedByName: function (sLockedByName) {
      if (sLockedByName) {
        return "Locked by: " + sLockedByName;
      }
    },

    formatLock: function (lock) {
      if (lock) {
        return true;
      }
      return false;
    },

    inverseBool: function (bool) {
      return !bool;
    },

    statusText: function (sStatus) {
      switch (sStatus) {
        case "ASSIGN":
          return "Information";
        case "PROCESSING":
          return "Warning";
        case "ERROR":
          return "Error";
        case "POSTED":
          return "Success";
        default:
          return "None";
      }
    },

    isTaxCode: function (sPOMode, sBukrs) {
      if (sPOMode) {
        return true;

      } else if (sBukrs && sBukrs.length > 0) {
        return true;

      }
      return false;
    },

    isVendor: function (sPOMode, sLifnr) {
      if (sPOMode) {
        return true;

      } else if (sLifnr && sLifnr.length > 0) {
        return true;

      }
      return false;
    },

    formatLink: function (link) {
      var url = "/api/objstore/download?key=" + encodeURIComponent(link);
      return url;
    },

    genTooltip: function (ob) {
      if (ob) {
        var sTooltip = "Confidence: " + Math.round(parseFloat(ob.confidence) * 100) + "%";
        sTooltip += "\nPage: " + ob.page
        return sTooltip;

      }
      return null;
    },
    calcStatus: function (sAction, sActionBy, oData) {
      if (oData.DocStatus === "POSTED") {
        return "Document #: " + oData.InvoiceNumber
      }
      
      if (sAction === "FORWARD") {
        return "Forwarded to: " + sActionBy;
      }
      return "";
    },

    formatDocStatus: function (sStatus, AssignedTo, ActionBy, oData) {
      switch (sStatus) {
        case "INITIAL":
          return "UNASSIGNED";
        case "ASSIGN":
          return "ASSIGNED";
        case "FORWARD":

          if (AssignedTo === ActionBy && AssignedTo != null) {
            return "ASSIGNED"
          }
          return "FORWARDED";
        case "RELEASED":
          return "RELEASED FOR APPROVAL";
        case "REJSAP":
          return "REJECTED (Manual entry in SAP)";
        case "REJRTV":
          return "REJECTED (Returned to Vendor)";
        case "POSTED":
          return "SUBMITTED";
        case "PROCESSING":
          return "IN PROCESS";
        case "ERROR":
          return "IN ERROR";
        default:
          return "NONE";
      }
    },
    toMsgType: function (sCode) {

      var sMsgType = "None";

      switch (sCode) {
        case "E":
          sMsgType = "Error";
          break;
        case "S":
          sMsgType = "Success";
          break;
        case "I":
          sMsgType = "Information";
          break;
        case "W":
          sMsgType = "Warning";
          break;
        default:
          sMsgType = "None";
      }

      return sMsgType;
    },
    // Set the button icon according to the message with the highest severity - UNUSED
    buttonIconFormatter: function () {
      var sIcon;
      var aMessages = this.uiModel.getProperty("/errors");

      aMessages.forEach(function (sMessage) {
        switch (sMessage.Type) {
          case "E":
            sIcon = "sap-icon://message-error";
            break;
          case "W":
            sIcon = sIcon !== "sap-icon://message-error" ? "sap-icon://message-warning" : sIcon;
            break;
          case "S":
            sIcon = "sap-icon://message-error" && sIcon !== "sap-icon://message-warning" ? "sap-icon://message-success" : sIcon;
            break;
          default:
            sIcon = !sIcon ? "sap-icon://message-information" : sIcon;
            break;
        }
      });

      return sIcon;
    },
    // The priority of the message types are as follows: Error > Warning > Success > Info - UNUSED
    buttonTypeFormatter: function () {
      var sHighestSeverity;
      var aMessages = this.uiModel.getProperty("/errors");
      aMessages.forEach(function (sMessage) {
        switch (sMessage.type) {
          case "E":
            sHighestSeverity = "Negative";
            break;
          case "W":
            sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
            break;
          case "S":
            sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ? "Success" : sHighestSeverity;
            break;
          default:
            sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
            break;
        }
      });

      return sHighestSeverity;
    },

    formatConf: function (conf) {
      var perConf = conf * 100;
      perConf = perConf.toPrecision(4) + "%";
      return perConf;
    },

    formatConfState: function (conf) {
      if (conf <= 0.50) {
        return 'Error';
      } else if (conf > 0.50 && conf < 0.80) {
        return 'Warning';
      } else if (conf >= 0.80 && conf <= 1) {
        return 'Success';
      }
      return 'None';
    },

    allowGLAccountTable: function (bPOMode, bNONPOModeGLaccount) {
      return !bPOMode && bNONPOModeGLaccount;
    },

    allowAssetTable: function (bPOMode, bNONPOModeGLaccount) {
      return !bPOMode && !bNONPOModeGLaccount;
    },

    getI18nTextWithCount: function (sText, iCount) {
      return sText.replace("{0}", iCount);
    },

    showTo_SelectedPurchaseOrders_PurchaseOrder: function (sRefDocumentCategoryKey) {
      return sRefDocumentCategoryKey === 'keyRefDocCategory1';
    },

    showTo_SelectedDeliveryNotes_InboundDeliveryNote : function (sRefDocumentCategoryKey) {
      return sRefDocumentCategoryKey === 'keyRefDocCategory2';
    },

    showTo_SelectedServiceEntrySheets_ServiceEntrySheet : function (sRefDocumentCategoryKey) {
      return sRefDocumentCategoryKey === 'keyRefDocCategoryS';
    },

    fillTo_SelectedPurchaseOrders_PurchaseOrder: function (sRefDocumentCategoryKey, aValues) {
      return sRefDocumentCategoryKey === 'keyRefDocCategory1' && aValues.length > 0 ? aValues[0].PurchaseOrder : null;
    },

    fillTo_SelectedPurchaseOrders_PurchaseOrderItem: function (sRefDocumentCategoryKey, aValues) {
      return sRefDocumentCategoryKey === 'keyRefDocCategory1' && aValues.length > 0 ? aValues[0].PurchaseOrderItem : null;
    },

    fillTo_SelectedDeliveryNotes_InboundDeliveryNote : function (sRefDocumentCategoryKey, aValues) {
      return sRefDocumentCategoryKey === 'keyRefDocCategory2' && aValues.length > 0 ? aValues[0].InboundDeliveryNote : null;
    },

    fillTo_SelectedServiceEntrySheets_ServiceEntrySheet : function (sRefDocumentCategoryKey, aValues) {
      return sRefDocumentCategoryKey === 'keyRefDocCategoryS' && aValues.length > 0 ? aValues[0].ServiceEntrySheet : null;
    },

    fillTo_SelectedServiceEntrySheets_ServiceEntrySheetItem : function (sRefDocumentCategoryKey, aValues) {
      return sRefDocumentCategoryKey === 'keyRefDocCategoryS' && aValues.length > 0 ? aValues[0].ServiceEntrySheetItem : null;
    },

    setDatePicker : function (sDate) {
      if (sDate) {
        let aDate = sDate.split("-"),
        sYear = aDate[0], sMonth = aDate[1] - 1, sDay = aDate[2];
        return new Date(sYear, sMonth, sDay);
      }
      return null;
    },

    enableNextAttachmentButton: function (oCurrentAttachment, aInvoiceAttachments) {
      if (aInvoiceAttachments) {
        let aInvoiceAttachmentsLength = aInvoiceAttachments.length;
        if (oCurrentAttachment && aInvoiceAttachmentsLength > 1) {
          for (let i = 0; i<aInvoiceAttachmentsLength; i++) {
            if (aInvoiceAttachments[i].id === oCurrentAttachment.id && i < aInvoiceAttachmentsLength - 1 ) {
              return true;
            }
          }
        }
      }
      return false;
    },

    enablePreviousAttachmentButton: function (oCurrentAttachment, aInvoiceAttachments) {
      if (aInvoiceAttachments) {
        let aInvoiceAttachmentsLength = aInvoiceAttachments.length;
        if (oCurrentAttachment && aInvoiceAttachmentsLength > 1) {
          for (let i = 0; i<aInvoiceAttachmentsLength; i++) {
            if (aInvoiceAttachments[i].id === oCurrentAttachment.id && i > 0 ) {
              return true;
            }
          }
        }
      }
      return false;
    }
  };
});