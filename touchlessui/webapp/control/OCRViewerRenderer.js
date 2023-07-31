sap.ui.define([], function () {
  "use strict";

  return {
    apiVersion: 2,
    render: function (oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.class("myOCRViewer");
      oRm.openEnd();
      oRm.renderControl(oControl.getAggregation("_toolbar"));
      oRm.renderControl(oControl.getAggregation("_content"));
      oRm.renderControl(oControl.getAggregation("_button"));
      oRm.close("div");
    },
  };

});