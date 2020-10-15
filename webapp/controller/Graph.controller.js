sap.ui.define([
    "com/cadaxo/cmds/controller/BaseController",
    "com/cadaxo/cmds/model/formatter"
  ], function(Controller, formatter) {
    "use strict";
    
    var oController;

    return Controller.extend("com.cadaxo.cmds.controller.Graph", {
        onInit: function() {
            
            oController = this;

            this.getView().attachAfterRendering(function() {

                const fnSuccessGraphData = function(oData, oResponse) {
                    
                    const fnSuccessLinksData = function(aNodes, oResponse) {
                         const oJson = new sap.ui.model.json.JSONModel({
                             nodes: aNodes,
                             links: oResponse.toAllLinks.results
                         });
                         this.setModel(oJson,'graphModel');
                    }

                    this.getModel().read("/Datasources('"+oData.results[0].DsId+"')",{
                        urlParameters: {$expand: "toAllLinks"},
                        success: fnSuccessLinksData.bind(this, oData.results)
                    })
                }

                this.getModel().read("/Datasources", {
                    urlParameters : {"search" : jQuery.sap.getUriParameters().get("mainNode")},
                    success: fnSuccessGraphData.bind(this)
                });
                
                
            })

            this._graph = this.getView().byId("graph");
            this._graph.attachEvent("graphReady", this.hideAllNodes);
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
        }
    })
  });
  