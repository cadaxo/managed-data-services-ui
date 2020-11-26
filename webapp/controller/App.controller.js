sap.ui.define([
  "com/cadaxo/cmds/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/m/Text",
  "sap/m/Button",
  "sap/m/Popover",
  "sap/m/MessageBox",
  "sap/ui/core/Item"
], function(Controller, JSONModel, Filter, Text, Button, Popover, MessageBox, Item) {
  "use strict";
  
  var oController;
  var STATUS_ICON = "sap-icon://sys-cancel";
  var LEFT_ARROW = "sap-icon://navigation-left-arrow";
  var RIGHT_ARROW = "sap-icon://navigation-right-arrow";

  return Controller.extend("com.cadaxo.cmds.controller.App", {

    onInit: function() {
            
      oController = this;

      var oWhereUsedFilterModel = new JSONModel({enabled: false, field: ""});
      this.getView().setModel(oWhereUsedFilterModel, "whereUsedFilterModel");

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
                  success: fnSuccessLinksData.bind(this, oData.results),
                  error: oController.fnErrorHandler.bind(this)
              })
          }

          // var mock = {};
          // if (!(window.location.href).includes('mockServer')) {
          //     mock.urlParameters = {"search" : jQuery.sap.getUriParameters().get("mainNode")}
          // }

          this.getModel().read("/Datasources", {
              //...mock,
              urlParameters: {"search" : jQuery.sap.getUriParameters().get("cadaxoMainNode")},
              success: fnSuccessGraphData.bind(this),
              error: oController.fnErrorHandler.bind(this)
          });
          
          
      })
      
      
      this._graph = this.getView().byId("graph");
      this._mainNode = jQuery.sap.getUriParameters().get("cadaxoMainNode").split("|",1)[0];
      //this._graph.attachEvent("graphReady", this.hideAllNodes);
      this._graph.attachEvent("graphReady", this.graphReady);

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

    graphReady: function() {
      var oGraph = oController._graph;
      if (oGraph) {
        var oMainNode = oGraph.getNodes()[0];
        if (oMainNode) {
          oGraph.scrollToElement(oMainNode);
        }
      }
      oController.hideAllNodes();

      this.getModel().read("/LegendCusts", {
        success: oController.fnSuccessLegendCusts.bind(this),
        error: oController.fnErrorHandler.bind(this)
      }); 
    },

    fnErrorHandler: function(oError) {
      var sTitle = "";
      var sDetail = "";
      if (oError.message) {
        sTitle = oError.message
      }

      if (JSON.parse(oError.responseText).error.message.value) {
        sDetail = JSON.parse(oError.responseText).error.message.value
      }

      MessageBox.error(sTitle + "\n\n" + sDetail);
    },

    fnSuccessLegendCusts: function(oData, oResponse) {
      if (this.getModel("graphModel")) {
        this.getModel("graphModel").setProperty("/statuses", oData.results);
      }


      
      var aStatuses = [];
      oController._graph.getNodes().forEach(function(node) {
        aStatuses.push(node.getProperty("status"));
      })

      aStatuses = aStatuses.filter(function(item, index){
        return aStatuses.indexOf(item) === index;
      })
      
      if (aStatuses.length) {
        var aFilterItems = [];
        aStatuses.forEach(function(status){
          oController.getView().getModel("graphModel").getProperty("/statuses").forEach(function(modelStatus){
            if (modelStatus.StatusKey === status) {
              aFilterItems.push({"key": status, "name":modelStatus.Description})
            }
          })
        })
  
        if (oController._multicombobox === undefined) {
          var oNodesFilterModel = new JSONModel({"items": aFilterItems});
          var oToolbar = oController._graph.getToolbar();
  
          var oMultiComboBox = new sap.m.MultiComboBox("multi-graph-filter",{
            width: "20%",
            placeholder: "Show in graph...",
            items : {  
              path : "/items",  
              template : new Item({  
                key : "{key}",  
                text : "{name}"  
              })
            },
            selectionFinish: oController.filterSelectionFinished,
          });
  
          oMultiComboBox.setModel(oNodesFilterModel);
          oMultiComboBox.setSelectedKeys(aStatuses);

          oToolbar.insertContent(new Text("text-filter-nodes-bar",{
            text: "Show:"
          }), 3);

          oToolbar.insertContent(oMultiComboBox, 4);
          oController._multicombobox = oMultiComboBox;
        }
  
      }

    },

    filterSelectionFinished: function(oEvent) {
      oController.hideAllNodes();
    },

    hasHiddenParent: function(oNode) {
      return oNode.getParentNodes().some(function (n) {
        if (oController._multicombobox) {

          if (oController._multicombobox.getSelectedKeys().some(function(key){
            return key.endsWith(n.getStatus());
          })) {
            return n.isHidden();
          }
          // if (oController._multicombobox.getSelectedKeys().indexOf(n.getStatus()) > -1) {
          //   return n.isHidden();
          // }
        } 
      });
    },
  
    hasHiddenChild: function(oNode) {
      return oNode.getChildNodes().some(function (n) {
        if (oController._multicombobox) {
          if (oController._multicombobox.getSelectedKeys().some(function(key){
            return key.endsWith(n.getStatus());
          })) {
            return n.isHidden();
          }
          // if (oController._multicombobox.getSelectedKeys().indexOf(n.getStatus()) > -1) {
          //   return n.isHidden();
          // }
        }
      });
    },

    hideAllNodes: function() {

      //var bFilterEnabled = oController.getView().getModel("whereUsedFilterModel").getProperty("/enabled");

     //if (!bFilterEnabled) {
      var oGraph = oController._graph;
      if (oGraph) {
        var oMainNode = oGraph.getNodes()[0];
        if (oMainNode) {
          
          if (oController._multicombobox) {
            if (oController._multicombobox.getSelectedKeys().length) {
              oMainNode.setHidden(false);
            } else {
              oMainNode.setHidden(true);
            }
          }
          
          oGraph.getNodes().forEach(function (oNode) { 
            if (oNode.getKey() != oMainNode.getKey()) {
              oNode.setHidden(true);
            }
          })

          oMainNode.getChildNodes().forEach(function (oNode) {
            
            if (oController._multicombobox) {

              if (oController._multicombobox.getSelectedKeys().some(function(key){
                return oNode.getStatus().endsWith(key);
              })) {
                oNode.setHidden(false);
              }

              // if (oController._multicombobox.getSelectedKeys().indexOf(oNode.getStatus()) > -1) {
              //   oNode.setHidden(false);
              // }
            } 
            
            if ( oController.hasHiddenChild(oNode) || oController.hasHiddenParent(oNode) ) {
              oNode.setStatusIcon(STATUS_ICON);
            }
          })

          oMainNode.getParentNodes().forEach(function (oNode) {
            if (oController._multicombobox) {

              if (oController._multicombobox.getSelectedKeys().some(function(key){
                return oNode.getStatus().endsWith(key);
              })) {
                oNode.setHidden(false);
              }

              // if (oController._multicombobox.getSelectedKeys().indexOf(oNode.getStatus()) > -1) {
              //   oNode.setHidden(false);
              // }
            } 
            if ( oController.hasHiddenChild(oNode) || oController.hasHiddenParent(oNode) ) {
              oNode.setStatusIcon(STATUS_ICON);
            }
          })

          oGraph.scrollToElement(oMainNode);
        }	
      }
    //}

    },

    leftExpandPressed: function(oEvent) {

      var oNode = oEvent.getSource().getParent();
      var bExpand = oController.hasHiddenParent(oNode);
      oNode.getParentNodes().forEach(function (oChild) {

        if (oController._multicombobox) {

          if (oController._multicombobox.getSelectedKeys().some(function(key){
            return oChild.getStatus().endsWith(key);
          })) {
            oChild.setHidden(!bExpand);
          }

          // if (oController._multicombobox.getSelectedKeys().indexOf(oChild.getStatus()) > -1) {
          //   oChild.setHidden(!bExpand);
          // }
        } 

        
        if ( oController.hasHiddenChild(oChild) || oController.hasHiddenParent(oChild) ) {
          oChild.setStatusIcon(STATUS_ICON);
        }
      });

      oController.fixNodeState(oNode);
    },

    rightExpandPressed: function(oEvent) {
    
      var oNode = oEvent.getSource().getParent();
      var bExpand = oController.hasHiddenChild(oNode);
      oNode.getChildNodes().forEach(function (oChild) {

        if (oController._multicombobox) {

          if (oController._multicombobox.getSelectedKeys().some(function(key){
            return oChild.getStatus().endsWith(key);
          })) {
            oChild.setHidden(!bExpand);
          }

          // if (oController._multicombobox.getSelectedKeys().indexOf(oChild.getStatus()) > -1) {
          //   oChild.setHidden(!bExpand);
          // }
        } 

        if ( oController.hasHiddenChild(oChild) || oController.hasHiddenParent(oChild) ) {
          oChild.setStatusIcon(STATUS_ICON);
        }
      });

      oController.fixNodeState(oNode);
    },

    setCustomToolbar: function(oGraph) {
        var oToolbar = oGraph.getToolbar();

        oToolbar.insertContent(new Text("text-filter-bar",{
          text: "Filter: Where Used - {whereUsedFilterModel>/field}",
          visible: "{whereUsedFilterModel>/enabled}"
          //press: 
        }), 0);

        oToolbar.insertContent(new Button("btn-filter-bar-reset",{
          type: "Transparent",
          tooltip: "Reset Filter",
          icon: "sap-icon://reset",
          visible: "{whereUsedFilterModel>/enabled}",
          press: oController.onResetFilterPressed
        }), 1);

        //Set Placeholder for Search Input Field
        oToolbar.getContent()[3].setPlaceholder("Search in graph");

        // oToolbar.insertContent(new Button("btn-new-main-node",{
        //   type: "Transparent",
        //   tooltip: "Select New Main Node",
        //   icon: "sap-icon://table-view",
        //   enabled: false
        //   //press: 
        // }), 5);  
    },

    fixNodeState: function(oNode) {
      if (oNode.isHidden()) {
        return;
      }
      var bHasHiddenSiblings = false;
      var oButton = oNode.getActionButtons()[0];
      if (oNode.getParentNodes().length === 0) {
        oButton.setEnabled(false);
      } else {
        if (oController.hasHiddenParent(oNode)) {
          bHasHiddenSiblings = true;
          oButton.setIcon(LEFT_ARROW);
          oButton.setTitle("Expand");
        } else {
          oButton.setIcon(RIGHT_ARROW);
          oButton.setTitle("Collapse");
        }
      }
      oButton = oNode.getActionButtons()[1];
      if (oNode.getChildNodes().length === 0) {
        oButton.setEnabled(false);
      } else {
        if (oController.hasHiddenChild(oNode)) {
          bHasHiddenSiblings = true;
          oButton.setIcon(RIGHT_ARROW);
          oButton.setTitle("Expand");
        } else {
          oButton.setIcon(LEFT_ARROW);
          oButton.setTitle("Collapse");
        }
      }
      oNode.setStatusIcon(bHasHiddenSiblings ? STATUS_ICON : undefined);
    },
  

    onNodePressed: function(oEvent) {

      oController.fixNodeState(oEvent.getSource());

      var oPanel = oController.getView().byId("sideBar-panel");
      oPanel.setVisible(true);
      oController._graph.setWidth("60%");
      
      oController.getView().byId("btn-show-where-used").setEnabled(false);

      oController.getView().byId("fields-header").addStyleClass("sapMTableTH");
      oController.getView().byId("fields-header-column1").addStyleClass("sapColumnCustomHeaderFirst");
      oController.getView().byId("fields-header-column1").addStyleClass("cadaxoCustomColumnHeaderFirst");
      oController.getView().byId("fields-header-column2").addStyleClass("sapColumnCustomHeader");
      oController.getView().byId("fields-header-column3").addStyleClass("sapColumnCustomHeader");
      oController.getView().byId("fields-header-column4").addStyleClass("sapColumnCustomHeader");

      oPanel.bindElement({
          path: "/Datasources('"+oEvent.getSource().getKey()+"')",
          parameters: {
              expand: "toAnnotations,toFields/toAnnotations,toParameters"
          },
          events: {
              dataReceived: function(response) {
                  if (oEvent.getParameter("error")) {
                    fnErrorHandler(oEvent.getParameter("error"));
                    return;
                  }
                  //Prepare fields + field annotations
                  var aFields = [];
                  var sObjectType  = response.getParameters().data.ObjectType;

                  response.getParameters().data.toFields.forEach((field) => {
                    
                    var aAnnotations = [];
                    field.toAnnotations.forEach((annotation) => {
                      aAnnotations.push({"text": annotation.AnnotationName, "value": annotation.Value, "isField": false});
                    })

                    var sText = sObjectType === 'TABL' ? field.FieldName : field.FieldAlias;
                    aFields.push({

                    "text": sText,
                    "dataelement": field.DataElement,
                    "datatype": field.Datatype + '(' + parseInt(field.Length,10) + ')', 
                    "description": field.Description,
                    //"length": parseInt(field.Length,10),
                    //"alias": field.FieldAlias,
                    "isField": true,
                    "iskey": field.IsKey,
                    "annotations": aAnnotations})
                  })

                   //Prepare header annotations
                  var aHeaderAnnotations = [];
                  response.getParameters().data.toAnnotations.forEach((headerAnnotation) => {
                    aHeaderAnnotations.push({"text": headerAnnotation.AnnotationName, "value": headerAnnotation.Value})
                  })

                  //Prepare parameters
                  var aParameters = [];
                  response.getParameters().data.toParameters.forEach((parameter) => {
                    aParameters.push({
                      "Description": parameter.Description,
                      "DataElement": parameter.DataElement,
                      "Datatype": parameter.Datatype + '(' + parseInt(parameter.Length, 10) + ')'
                    })
                  })

                  var oNodeDetailModel = new sap.ui.model.json.JSONModel({"fields": aFields, "headerAnnotations": aHeaderAnnotations, "parameters": aParameters});
                  oController.getView().setModel(oNodeDetailModel,"nodeDetail");
                  
              },
              change: function(oEvent) {

                //Prepare fields + field annotations
                var sPath = oEvent.getSource().getPath();
                var aPathFields = oEvent.getSource().getModel().getProperty(sPath+"/toFields");
                if (aPathFields !== undefined) {

                  var sObjectType  = oEvent.getSource().getModel().getProperty(sPath).ObjectType;

                  var aFields = [];
                  aPathFields.forEach((field) => {
                    var oFieldValues = oEvent.getSource().getModel().getProperty("/"+field);
                    var aAnnotations = [];
                    oFieldValues.toAnnotations.__list.forEach((annotation) => {
                      var oAnnotationValues = oEvent.getSource().getModel().getProperty("/"+annotation);
                      aAnnotations.push({"text": oAnnotationValues.AnnotationName, "value": oAnnotationValues.Value, "isField": false,});
                    })
                    var sText = sObjectType === 'TABL' ? oFieldValues.FieldName : oFieldValues.FieldAlias;
                    aFields.push({
                      "text": sText,
                      "dataelement": oFieldValues.DataElement,
                      "datatype": oFieldValues.Datatype + '(' + parseInt(oFieldValues.Length,10) + ')', 
                      "description": oFieldValues.Description,
                      "isField": true,
                      "isKey": oFieldValues.IsKey,
                      "alias": oFieldValues.FieldAlias,
                      "annotations": aAnnotations
                    });
                  })
                 
                  //Prepare header annotations
                  var aPathAnnotations = oEvent.getSource().getModel().getProperty(sPath+"/toAnnotations");
                  var aHeaderAnnotations = [];
                  aPathAnnotations.forEach((annotation) => {
                    var oAnnotationValues = oEvent.getSource().getModel().getProperty("/"+annotation);
                    aHeaderAnnotations.push({"text": oAnnotationValues.AnnotationName, "value": oAnnotationValues.Value})
                  })

                  //Prepare parameters
                  var aPathParameters = oEvent.getSource().getModel().getProperty(sPath+"/toParameters");
                  var aParameters = [];
                  aPathParameters.forEach((parameter) => {
                    var oParameterValues = oEvent.getSource().getModel().getProperty("/"+parameter);
                    aParameters.push({
                      "Description": oParameterValues.Description,
                      "DataElement": oParameterValues.DataElement,
                      "Datatype": oParameterValues.Datatype + '(' + parseInt(oParameterValues.Length, 10) + ')'
                    })
                  })

                  var oNodeDetailModel = new sap.ui.model.json.JSONModel({"fields": aFields, "headerAnnotations": aHeaderAnnotations, "parameters": aParameters});
                  oController.getView().setModel(oNodeDetailModel,"nodeDetail");
                }
              }
            }
          })
      
    },

    onResetFilterPressed: function(oEvent) {

      oController.getView().getModel("whereUsedFilterModel").setProperty("/enabled", false);
      
      var oGraphModel = oController.getView().getModel("graphModel");
      oGraphModel.getData().nodes.forEach(function(node, index){
        oController.getView().getModel("graphModel").setProperty('/nodes/'+index+'/ObjectState', 100);
      })
    },

    fieldPressed: function(oEvent) {
        var sSelectedObjectName = oController.getView().byId("sideBar-panel").getModel().getProperty(oController.getView().byId("sideBar-panel").getBindingContext().getPath()).ObjectName;
        
        if (sSelectedObjectName === oController._mainNode) {
          oController.getView().byId("btn-show-where-used").setEnabled(true);
        }
        
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
              success: fnSuccessLinksData.bind(this, oData.results),
              error: oController.fnErrorHandler.bind(this)
          })
        }

        oController.getView().getModel().read("/Datasources", {
          filters: aFilters,
          urlParameters: {"search": sMainNode},
          success: fnSuccessGraphData.bind(this),
          error: oController.fnErrorHandler.bind(this)
        });

        oController.getView().getModel("whereUsedFilterModel").setProperty("/enabled", true);
        oController.getView().getModel("whereUsedFilterModel").setProperty("/field", sSearchField);
      
    },
    viewInBrowserPressed: function (oEvent) {
      window.open(oEvent.getSource().getCustomData()[0].getValue());
  },
  
  viewInAdtPressed: function (oEvent) {
      window.open(oEvent.getSource().getCustomData()[0].getValue());
  },

  linePressed: function (oEvent) {
    var oFlexBoxTitle = new sap.m.FlexBox({
      justifyContent: "Center",
      renderType: "Bare",
      items: [
        new sap.m.Text({text: oEvent.getSource()._oFrom.mProperties.title, width:"50%"}),
        new sap.ui.core.Icon({src: "sap-icon://arrow-right"}),
        new sap.m.Text({text: oEvent.getSource()._oTo.mProperties.title, width:"50%", textAlign:"End"}),
      ]
    });

    var oFlexBox = new sap.m.FlexBox({
      direction: "Column",
      justifyContent: "Start",
      renderType: "Bare",
      items: [
        new sap.m.Text({text: "Type: " + oEvent.getSource().getProperty("status")}),
        new sap.m.Text({text: "Description: " + oEvent.getSource().getTitle()})
      ]
    });

    oFlexBoxTitle.addStyleClass("sapSuiteUiCommonsNetworkLineTooltipFromTo");
    oFlexBox.addStyleClass("sapUiSmallMargin");

    this._oPopoverForLine = new sap.m.Popover({
      showHeader: false,
      contentWidth: "350px",
      content: [oFlexBoxTitle, oFlexBox]
    });
  
    // Prevents render a default tooltip
    oEvent.preventDefault();
    this._oPopoverForLine.openBy(oEvent.getParameter("opener"));
  },

  tabChanged: function(oEvent) {
    oController.getView().byId("btn-show-where-used").setEnabled(false);
  }

  });
});
