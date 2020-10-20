sap.ui.define([
  "com/cadaxo/cmds/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
  "use strict";
  
  var oController;

  return Controller.extend("com.cadaxo.cmds.controller.App", {

    onInit: function() {
            
      oController = this;

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
                       //links: oResponse.toAllLinks.results
                       //links: oResponse.results
                       links: links
                   });
                   this.setModel(oJson,'graphModel');
              }
              //debugger;
              this.getModel().read("/Datasources('"+oData.results[0].DsId+"')/toAllLinks",{
                  //urlParameters: {$expand: "toAllLinks"},
                  success: fnSuccessLinksData.bind(this, oData.results)
              })
          }
          //debugger;

          var mock = {};
          if (!(window.location.href).includes('mockServer')) {
              mock.urlParameters = {"search" : jQuery.sap.getUriParameters().get("mainNode")}
          }

          this.getModel().read("/Datasources", {
              ...mock,
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
            debugger;
  oGraph.scrollToElement(oMainNode);
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

    //hide search input field
    oToolbar.getContent()[1].setVisible(false)
},

onNodePressed: function(oEvent) {
    var oElement = oEvent.getSource();

    var oPanel = oController.getView().byId("sideBar-panel");
    oPanel.bindElement({
        path: "/Datasources('"+oEvent.getSource().getKey()+"')",
        parameters: {
            expand: "toFields/toAnnotations"
        },
        events: {
            dataReceived: function(response) {
                debugger;
            }
        }
    });
},

fieldPressed: function(oEvent) {
    debugger
}

  });
});
