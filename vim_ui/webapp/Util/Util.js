sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/m/MessageToast"
], function (JSONModel, Filter, FilterOperator, FilterBar, FilterGroupItem, MessageToast) {
    "use strict";
   return {
    componentPath: "",
         _getRuleServiceBaseURL: function () {
            
          return this.componentPath + "/bpmrulesruntime/rules-service/rest/v2";
         },

     // Fetching the Token of Business rules
         _fetchToken: function () {
             var eToken;
             $.ajax({
                url: this._getRuleServiceBaseURL() + "/xsrf-token",
                method: "GET",
                async: false,
                headers: {
                   "X-CSRF-Token": "Fetch"
                },
          success: function (t, a, i) {
            eToken = i.getResponseHeader("X-CSRF-Token")
          }
           }); 
            return eToken
        }
    };

})