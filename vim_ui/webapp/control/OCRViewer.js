// Provides control zzz.yyy.OCRViewer.
sap.ui.define([
  "sap/m/library",
  "sap/ui/core/Core",
  "sap/ui/core/Control",
  "sap/ui/Device",
  "sap/ui/core/ResizeHandler",
  "sap/ui/core/library",
  "sap/base/Log",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Image",
  "sap/m/OverflowToolbar",
  "sap/m/ToolbarSpacer",
  "sap/m/Title",
  "sap/m/Button",
  "sap/m/ScrollContainer",
  "./OCRViewerRenderer"
], function (
  library,
  Core,
  Control,
  Device,
  ResizeHandler,
  coreLibrary,
  Log,
  VerticalLayout,
  Image,
  OverflowToolbar,
  ToolbarSpacer,
  Title,
  Button,
  ScrollContainer,
  OCRViewerRenderer
) {
  "use strict";

  // TODO: shortcut for sap.ui.core.BusyIndicatorSize
  // var BusyIndicatorSize = coreLibrary.BusyIndicatorSize;

  // TODO: shortcut for sap.m.ImageHelper
  //   var ImageHelper = library.ImageHelper;
  //   var ImageMode = library.ImageMode;

  /**
   * Constructor for a OCRViewer.
   *
   * @param {string} [sId] ID for the new control, generated automatically if no ID is given
   * @param {object} [mSettings] Initial settings for the new control
   *
   * @class
   * The OCRViewer allows the user to browse through a pages and view OCR fields.
   * <h3>Overview</h3>
   * TODO: add meaningful desciption later
   * @extends sap.ui.core.Control
   *
   * @author dracovoldy
   * @version ${version}
   *
   * @constructor
   * @public
   * @alias com.capgemini.zbusdocpro.OCRViewer
   */
  var OCRViewer = Control.extend("vim_ui.control.OCRViewer", {
    renderer: OCRViewerRenderer,
    // the control API:
    metadata: {
      properties: {
        /* Business Object properties */
        totalPages: { type: "int", defaultValue: 0 },
        currentPage: { type: "int", defaultValue: 0 },
        imageUrl: { type: "sap.ui.core.URI" },  // usually you would use "sap.ui.core.URI" for type
        doxObject: { type: "object", defaultValue: null },

        /* other (configuration) properties */
        width: { type: "sap.ui.core.CSSSize", defaultValue: "100%" },
        height: { type: "sap.ui.core.CSSSize", defaultValue: "100%" },

      },
      aggregations: {
        /**
         * The toolbar to navigate & scale pages.
         */
        _toolbar: { type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden" },
        /**
         * The content which the OCRViewer displays.
         */
        _content: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" },
        _button: { type: "sap.m.Button", multiple: false, visibility: "hidden" }
      },
      events: {
        onPageChange: {
          parameters: {
            page: { type: "int" }
          }
        }
      }
    },

    /* control refs */
    _oImageViewer: null,
    _oImageLayout: null,

    /* props */
    _oToolbarProps: null,
    _oImageProps: {}
  });

  OCRViewer.prototype.init = function () {
    var oControl = this, oContainer, oButton;

    this._oToolbarProps = {
      iZoomLevel: 5
    };

    this.setAggregation("_toolbar", new OverflowToolbar({
      asyncMode: true,
      design: "Transparent",
      content: [
        new Button({
          icon: "sap-icon://sys-first-page",
          press: this.onPressFirstPage.bind(this)
        }),
        new Button({
          icon: "sap-icon://sys-prev-page",
          press: this.onPressPrevPage.bind(this)
        }),
        new Title(oControl.getId() + "-pageCounter", {
          text: null
        }),
        new Button({
          icon: "sap-icon://sys-next-page",
          press: this.onPressNextPage.bind(this)
        }),
        new Button({
          icon: "sap-icon://sys-last-page",
          press: this.onPressLastPage.bind(this)
        }),
        new ToolbarSpacer(),
        new Button({
          icon: "sap-icon://zoom-in",
          press: oControl._zoomIn.bind(this)
        }),
        new Button({
          icon: "sap-icon://zoom-out",
          press: oControl._zoomOut.bind(this)
        }),
        new Button({
          text: "Fit width",
          press: oControl._fitWidth.bind(this)
        })
      ]
    }));

    // create and initialize the img, but we don't have a src yet
    this._oImageViewer = new Image(this.getId() + "-ocrImage", {
      decorative: true,
      width: oControl.getWidth(),
      height: oControl.getHeight(),
    });

    this._oImageLayout = new VerticalLayout(this.getId() + "-imageLayout", {
      content: this._oImageViewer
    });

    oContainer = new ScrollContainer(this.getId() + "-pagesContainer", {
      content: this._oImageLayout
    });

    this._sResizeListenerId = ResizeHandler.register(this._oImageViewer, this._handleScreenResize.bind(this));

    this.setAggregation("_content", oContainer);
    this.setAggregation("_button", oButton);

  };

  OCRViewer.prototype.onBeforeRendering = function () {

  };

  OCRViewer.prototype.onAfterRendering = function () {
    console.log("onafterrendering " + new Date());
    this.handleInitialModeSelection();
  };

  OCRViewer.prototype.exit = function () {  /* TODO: implement exit */

  };

  // Pagination - Next
  OCRViewer.prototype.onPressNextPage = function () {
    var page = this.getCurrentPage();
    if (page < this.getTotalPages()) {
      page++;
      this.setCurrentPage(page);
    } else {
      page = null;
    }
    this._updatePageCount();
    this.fireOnPageChange({ page: page });
    this.renderGuideBox(this.getDoxObject());

  };
  // Pagination - Prev
  OCRViewer.prototype.onPressPrevPage = function () {
    var page = this.getCurrentPage();
    if (page > 1) {
      page--;
      this.setCurrentPage(page);
    } else {
      page = null;
    }
    this._updatePageCount();
    this.fireOnPageChange({ page: page });
    this.renderGuideBox(this.getDoxObject());

  };
  // Pagination - First
  OCRViewer.prototype.onPressFirstPage = function () {
    var page = 1;

    this.setCurrentPage(page);
    this._updatePageCount();
    this.fireOnPageChange({ page: page });
    this.renderGuideBox(this.getDoxObject());
  };
  // Pagination - Last
  OCRViewer.prototype.onPressLastPage = function () {
    var page = this.getTotalPages();

    this.setCurrentPage(page);
    this._updatePageCount();
    this.fireOnPageChange({ page: page });

    this.renderGuideBox(this.getDoxObject());
  };

  OCRViewer.prototype.handleInitialModeSelection = function () {
    //called after instance has been rendered (it's in the DOM)
    this._updatePageCount();

    var imgRef = this._oImageViewer.getDomRef();
    imgRef.addEventListener("load", function () {
      // Handler for .load() called.
      this._oImageProps.width = imgRef.clientWidth;
      this._oImageProps.height = imgRef.clientHeight;

    }.bind(this));
    this.renderGuideBox(this.getDoxObject());
  };

  OCRViewer.prototype._handleScreenResize = function (oEvent) {
    // trigger re-rendering of annotations
    console.log("resized", oEvent)
    this.renderGuideBox(this.getDoxObject());
    return this;
  };

  //overwrite 'imageUrl' setter
  OCRViewer.prototype.setImageUrl = function (sVal) {
    if (sVal) {
      this.setProperty("imageUrl", sVal, /*suppressInvalidate*/ true);     //do not re-render
      this._oImageViewer.setSrc(sVal);
    }
  };

  //overwrite 'width' setter
  OCRViewer.prototype.setWidth = function (sVal) {
    if (sVal) {
      this.setProperty("width", sVal, false);
      this._oImageViewer.setWidth(sVal);
    }
  };

  //overwrite 'doxObject' setter
  OCRViewer.prototype.setDoxObject = function (obj) {
    if (obj) {
      this.setProperty("doxObject", obj, false);
      this.renderGuideBox(obj);
    }
  };

  OCRViewer.prototype._fitWidth = function () {
    var sVal = "100%";
    this.setProperty("width", sVal, false);
    this._oImageViewer.setWidth(sVal);

  };

  OCRViewer.prototype._zoomIn = function () {
    var sVal = parseInt(this._oImageViewer.getWidth());

    if (this._oToolbarProps.iZoomLevel >= 0 && this._oToolbarProps.iZoomLevel < 5) {
      sVal = (sVal + 10) + "%";
      this.setProperty("width", sVal, false);
      this._oToolbarProps.iZoomLevel++;
    } else if (this._oToolbarProps.iZoomLevel >= 5 && this._oToolbarProps.iZoomLevel < 10) {
      sVal = (sVal + 20) + "%";
      this.setProperty("width", sVal, false);
      this._oToolbarProps.iZoomLevel++;
    } else if (this._oToolbarProps.iZoomLevel >= 10 && this._oToolbarProps.iZoomLevel < 15) {
      sVal = (sVal + 40) + "%";
      this.setProperty("width", sVal, false);
      this._oToolbarProps.iZoomLevel++;
    }
    this._oImageViewer.setWidth(sVal);
  };

  OCRViewer.prototype._zoomOut = function () {
    var sVal = parseInt(this._oImageViewer.getWidth());

    if (this._oToolbarProps.iZoomLevel > 0 && this._oToolbarProps.iZoomLevel <= 5) {
      sVal = (sVal - 10) + "%";
      this.setProperty("width", sVal, false);
      this._oToolbarProps.iZoomLevel--;
    } else if (this._oToolbarProps.iZoomLevel > 5 && this._oToolbarProps.iZoomLevel <= 10) {
      sVal = (sVal - 20) + "%";
      this.setProperty("width", sVal, false);
      this._oToolbarProps.iZoomLevel--;
    } else if (this._oToolbarProps.iZoomLevel > 10 && this._oToolbarProps.iZoomLevel <= 15) {
      sVal = (sVal - 40) + "%";
      this.setProperty("width", sVal, false);
      this._oToolbarProps.iZoomLevel--;
    }
    this._oImageViewer.setWidth(sVal);
  };

  OCRViewer.prototype._updatePageCount = function () {
    var $pageCounter = this.$().find("#" + this.getId() + "-pageCounter");
    $pageCounter.text(this.getCurrentPage() + " / " + this.getTotalPages());

  };

  OCRViewer.prototype.renderGuideBox = function (data) {
    console.log("render dox", data);
    if (!data) {
      // do not render if dox data null
      return;
    }
    var hFields = data.extraction.headerFields;
    var page = this.getCurrentPage();

    var canvasId = this.getId() + "-imageLayout";

    var canvas = this._oImageLayout.getDomRef();
    var img = this._oImageViewer.getDomRef();

    // Remove existing divs
    $(canvas).children().not(':first').remove();

    console.log("canvas", canvas);
    const canvasW = img.getBoundingClientRect().width;
    const canvasH = img.getBoundingClientRect().height;
    console.log("canvas bounds", {
      height: canvasH,
      width: canvasW
    })

    function calcCoord(coord, scale) {
      var scale = scale ? scale : 1;
      var res = {};
      var weights = {
        x: canvasW * scale,
        y: canvasH * scale,
        w: canvasW * scale,
        h: canvasH * scale
      };

      res.x = Math.floor(coord.x * weights.x);
      res.y = Math.floor(coord.y * weights.y);
      res.w = Math.floor(coord.w * weights.w);
      res.h = Math.floor(coord.h * weights.h);

      return res;
    }

    hFields.forEach(function (elm) {
      var c = elm.coordinates;

      if (elm.page == page && elm.confidence > 0) {
        if (c.x != 0.0 && c.y != 0.0 && c.w != 0.0 && c.h != 0.0) {
          // check for non-zero coordinates
          var uuid = $.sap.uid();
          var sValue = elm.value;
          var sLabel = elm.name + ":";
          var res = calcCoord(c);
          var x = res.x, y = res.y, w = res.w, h = res.h;

          var sStyle = "style='height: " + h + "px ; width: " + w + "px ; top: " + y + "px ; left: " + x + "px'";
          var divHTML = "<div id=" + uuid + " class='annotation header' " + sStyle + "></div>";
          // $(".x-custom-ap").append(divHTML);
          $("#" + canvasId).append(divHTML);

          var spanHTM1 = "<span class='value' style='max-width: " + "max-content" +
            "px ; min-width: " + w + "px'>" + sValue + "</span>";
          $("#" + uuid).append(spanHTM1);

          var spanHTML2 = "<span class='label' style='right: " + (w + 7) + "px'>" + sLabel + "</span>";
          $("#" + uuid).append(spanHTML2);

          $("#" + uuid).hover(
            function () {
              $("#" + uuid + "> .value").css({ "visibility": "visible" });
              $("#" + uuid + "> .label").css({ "visibility": "visible" });
            }, function () {
              $("#" + uuid + "> .value").css({ "visibility": "hidden" });
              $("#" + uuid + "> .label").css({ "visibility": "hidden" });
            }
          );
        }

      }

    }.bind(this));

    var lineItems = data.extraction.lineItems;

    lineItems.forEach(function (line) {

      line.forEach(function (elm) {

        var c = elm.coordinates;

        if (elm.page == page && elm.confidence > 0) {
          if (c.x != 0.0 && c.y != 0.0 && c.w != 0.0 && c.h != 0.0) {
            // check for non-zero coordinates
            var uuid = $.sap.uid();
            var sValue = elm.value;
            var sLabel = elm.name + ":";
            var res = calcCoord(c);
            var x = res.x, y = res.y, w = res.w, h = res.h;

            var sStyle = "style='height: " + h + "px ; width: " + w + "px ; top: " + y + "px ; left: " + x + "px'";
            var divHTML = "<div id=" + uuid + " class='annotationitem header' " + sStyle + "></div>";
            // $(".x-custom-ap").append(divHTML);
            $("#" + canvasId).append(divHTML);

            var spanHTM1 = "<span class='value' style='max-width: " + "max-content" +
              "px ; min-width: " + w + "px'>" + sValue + "</span>";
            $("#" + uuid).append(spanHTM1);

            var spanHTML2 = "<span class='label' style='right: " + (w + 7) + "px'>" + sLabel + "</span>";
            $("#" + uuid).append(spanHTML2);

            $("#" + uuid).hover(
              function () {
                $("#" + uuid + "> .value").css({ "visibility": "visible" });
                $("#" + uuid + "> .label").css({ "visibility": "visible" });
              }, function () {
                $("#" + uuid + "> .value").css({ "visibility": "hidden" });
                $("#" + uuid + "> .label").css({ "visibility": "hidden" });
              }
            );
          }

        }
      }.bind(this));

    }.bind(this));


  };

  return OCRViewer;
});