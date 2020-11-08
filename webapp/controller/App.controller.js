sap.ui.define([
  "com/cadaxo/cmds/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/m/Text",
  "sap/m/Button"
], function(Controller, JSONModel, Filter, Text, Button) {
  "use strict";
  
  var oController;

  return Controller.extend("com.cadaxo.cmds.controller.App", {

    onInit: function() {
            
      oController = this;

      var oFilterModel = new JSONModel({enabled: false, field: ""});
      this.getView().setModel(oFilterModel, "filterModel");

      this.getView().attachAfterRendering(function() {

          const fnSuccessGraphData = function(oData, oResponse) {
              
              const fnSuccessLinksData = function(aNodes, oResponse) {

                  var links;
                  if ((window.location.href).includes('mockServer')) {
                    var allLinks = this.getModel('toAllLinks');
                    links = allLinks.getData().d.results
                  } else {
                    links = oResponse.results
                  }

                   const oJson = new JSONModel({new: 'test'});
                   oJson.setSizeLimit(Number.MAX_SAFE_INTEGER);
                   oJson.setData({
                       nodes: aNodes,
                       links: links
                   });
                   this.setModel(oJson,'graphModel');
              }
              this.getModel().read("/Datasources('"+oData.results[0].DsId+"')/toAllLinks",{
                  success: fnSuccessLinksData.bind(this, oData.results)
              })
          }

          // var mock = {};
          // if (!(window.location.href).includes('mockServer')) {
          //     mock.urlParameters = {"search" : jQuery.sap.getUriParameters().get("mainNode")}
          // }

          this.getModel().read("/Datasources", {
              //...mock,
              urlParameters: {"search" : jQuery.sap.getUriParameters().get("cadaxoMainNode")},
              success: fnSuccessGraphData.bind(this)
          });
          
          
      })
      
      
      this._graph = this.getView().byId("graph");
      
      this._graph.attachEvent("graphReady", this.hideAllNodes);

      this.setCustomToolbar(this._graph);


      var oTreeModel = new JSONModel({
        data: []
      });
      
      this.getView().setModel(oTreeModel,"treemodel");


      var oTabContainer = this.getView().byId("tabs");
      oTabContainer.addEventDelegate({
      onAfterRendering: function() {
          var oTabStrip = this.getAggregation("_tabStrip");
          var oItems = oTabStrip.getItems();
          for (var i = 0; i < oItems.length; i++) {
          var oCloseButton = oItems[i].getAggregation("_closeButton");
          oCloseButton.setVisible(false);
          }
      }}, oTabContainer);
      
    },

    hideAllNodes: function() {

      var bFilterEnabled = oController.getView().getModel("filterModel").getProperty("/enabled")

      if (!bFilterEnabled) {
      var oGraph = oController._graph;
      if (oGraph) {
        var oMainNode = oGraph.getNodes()[0];
        if (oMainNode) {
          oMainNode.setHidden(false);
          oGraph.getNodes().forEach(function (oNode) { 
            if (oNode.getKey() != oMainNode.getKey()) {
              oNode.setHidden(true);
            }
          })

          oMainNode.getChildNodes().forEach(function (oNode) {
            oNode.setHidden(false);
          })

          oMainNode.getParentNodes().forEach(function (oNode) {
            oNode.setHidden(false);
          })

          oGraph.scrollToElement(oMainNode);
        }	
      }
    }

    },

    leftExpandPressed: function(oEvent) {

      function hasHiddenParent(oNode) {
          return oNode.getParentNodes().some(function (n) {
              return n.isHidden();
          });
      }

      var oNode = oEvent.getSource().getParent();
      var bExpand = hasHiddenParent(oNode);
      oNode.getParentNodes().forEach(function (oChild) {
        oChild.setHidden(!bExpand);
      });
    },

    rightExpandPressed: function(oEvent) {

      function hasHiddenChild(oNode) {
        return oNode.getChildNodes().some(function (n) {
            return n.isHidden();
        });
    }	
    
      var oNode = oEvent.getSource().getParent();
      var bExpand = hasHiddenChild(oNode);
      oNode.getChildNodes().forEach(function (oChild) {
        oChild.setHidden(!bExpand);
      });
    },

    setCustomToolbar: function(oGraph) {
        var oToolbar = oGraph.getToolbar();

        oToolbar.insertContent(new Text("text-filter-bar",{
          text: "Filter: Where Used - {filterModel>/field}",
          visible: "{filterModel>/enabled}"
          //press: 
        }), 0);

        oToolbar.insertContent(new Button("btn-filter-bar-reset",{
          type: "Transparent",
          tooltip: "Reset Filter",
          icon: "sap-icon://reset",
          visible: "{filterModel>/enabled}",
          press: oController.onResetFilterPressed
        }), 1);
        
        oToolbar.insertContent(new Button("btn-new-main-node",{
          type: "Transparent",
          tooltip: "Select New Main Node",
          icon: "sap-icon://table-view",
          enabled: false
          //press: 
        }), 3);      

        //hide search input field
        oToolbar.getContent()[4].setVisible(false);
    },

    onNodePressed: function(oEvent) {
      var oElement = oEvent.getSource();

      var oPanel = oController.getView().byId("sideBar-panel");
      oPanel.setVisible(true);
      oController._graph.setWidth("65%");

      oPanel.bindElement({
          path: "/Datasources('"+oEvent.getSource().getKey()+"')",
          parameters: {
              expand: "toAnnotations,toFields/toAnnotations"
          },
          events: {
              dataReceived: function(response) {
                 
                  //Prepare fields + field annotations
                  var aFields = [];
                  response.getParameters().data.toFields.forEach((field) => {
                    
                    var aAnnotations = [];
                    field.toAnnotations.forEach((annotation) => {
                      aAnnotations.push({"text": annotation.AnnotationName, "value": annotation.Value});
                    })
                    aFields.push({"text": field.FieldName, "annotations": aAnnotations})
                  })

                   //Prepare header annotations
                  var aHeaderAnnotations = [];
                  response.getParameters().data.toAnnotations.forEach((headerAnnotation) => {
                    aHeaderAnnotations.push({"text": headerAnnotation.AnnotationName, "value": headerAnnotation.Value})
                  })

                  var oNodeDetailModel = new sap.ui.model.json.JSONModel({"fields": aFields, "headerAnnotations": aHeaderAnnotations});
                  oController.getView().setModel(oNodeDetailModel,"nodeDetail");
                  
              },
              change: function(oEvent) {

                //Prepare fields + field annotations
                var sPath = oEvent.getSource().getPath();
                var aPathFields = oEvent.getSource().getModel().getProperty(sPath+"/toFields");
                if (aPathFields !== undefined) {
                  var aFields = [];
                  aPathFields.forEach((field) => {
                    var oFieldValues = oEvent.getSource().getModel().getProperty("/"+field);
                    var aAnnotations = [];
                    oFieldValues.toAnnotations.__list.forEach((annotation) => {
                      var oAnnotationValues = oEvent.getSource().getModel().getProperty("/"+annotation);
                      aAnnotations.push({"text": oAnnotationValues.AnnotationName, "value": oAnnotationValues.Value});
                    })
                    aFields.push({"text": oFieldValues.FieldName, "annotations": aAnnotations});
                  })
                 
                  //Prepare header annotations
                  var aPathAnnotations = oEvent.getSource().getModel().getProperty(sPath+"/toAnnotations");
                  var aHeaderAnnotations = [];
                  aPathAnnotations.forEach((annotation) => {
                    var oAnnotationValues = oEvent.getSource().getModel().getProperty("/"+annotation);
                    aHeaderAnnotations.push({"text": oAnnotationValues.AnnotationName, "value": oAnnotationValues.Value})
                  })

                  var oNodeDetailModel = new sap.ui.model.json.JSONModel({"fields": aFields, "headerAnnotations": aHeaderAnnotations});
                  oController.getView().setModel(oNodeDetailModel,"nodeDetail");
                }
              }
            }
          })
      
    },

    onResetFilterPressed: function(oEvent) {

      oController.getView().getModel("filterModel").setProperty("/enabled", false);
      
      var oGraphModel = oController.getView().getModel("graphModel");
      oGraphModel.getData().nodes.forEach(function(node, index){
        oController.getView().getModel("graphModel").setProperty('/nodes/'+index+'/ObjectState', 100);
      })
    },

    fieldPressed: function(oEvent) {
        oController.getView().byId("btn-show-where-used").setEnabled(true);
    },

    whereUsedPressed: function(oEvent) {
        var oTree = oController.getView().byId("tree-fields");
        var sSearchField = oTree.getSelectedItem().getCustomData()[0].getValue();
        var sMainNode = jQuery.sap.getUriParameters().get("cadaxoMainNode");

        var aFilters = [new Filter({path: "FieldSearch/SearchFieldName", operator: sap.ui.model.FilterOperator.EQ, value1: sSearchField})];


        const fnSuccessGraphData = function(oData, oResponse) {
              
          const fnSuccessLinksData = function(aNodes, oResponse) {

              var links;
              if ((window.location.href).includes('mockServer')) {
                var allLinks = this.getModel('toAllLinks');
                links = allLinks.getData().d.results
              } else {
                links = oResponse.results
              }

               const oJson = new JSONModel({new: 'test'});
               oJson.setSizeLimit(Number.MAX_SAFE_INTEGER);
               oJson.setData({
                   nodes: aNodes,
                   links: links
               });
               this.setModel(oJson,'graphModel');
          }
          this.getModel().read("/Datasources('"+oData.results[0].DsId+"')/toAllLinks",{
              success: fnSuccessLinksData.bind(this, oData.results)
          })
        }

        oController.getView().getModel().read("/Datasources", {
          filters: aFilters,
          urlParameters: {"search": sMainNode},
          success: fnSuccessGraphData.bind(this)
        });

        oController.getView().getModel("filterModel").setProperty("/enabled", true);
        oController.getView().getModel("filterModel").setProperty("/field", sSearchField);
      
    },
    viewInBrowserPressed: function (oEvent) {
      window.open(oEvent.getSource().getCustomData()[0].getValue());
  },
  
  viewInAdtPressed: function (oEvent) {
      window.open(oEvent.getSource().getCustomData()[0].getValue());
  },

  });
});
