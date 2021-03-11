sap.ui.define([], function () {
	"use strict";
	return {
		setRootNodeName: function(sObjectType) {
			switch (sObjectType) {
				case "TABL":
					return "Database Tables";
				case "YDLS":
						return "CDS View Extensions";	
				case "YABL":
						return "SQL Views";	
                // case "DDLX":
                //     return "sap-icon://address-book";
                // case "COMPOSITE":
                //         return "sap-icon://table-view";
                // case "CONSUMPTION":
                //         return "sap-icon://table-view";
				// default:
				// 	return "sap-icon://table-view";
			}
		},
		setNodeIcon: function (sObjectType) {
			switch (sObjectType) {
				case "DDLS":
					return "sap-icon://table-view";
				case "TABL":
					return "sap-icon://database";
				case "YDLS":
						return "sap-icon://add-coursebook";	
				case "YABL":
						return "sap-icon://show";	
                case "DDLX":
                    return "sap-icon://address-book";
                case "COMPOSITE":
                        return "sap-icon://table-view";
                case "CONSUMPTION":
                        return "sap-icon://table-view";
				default:
					return "sap-icon://table-view";
			}
		},
		lineStatus: function (sStatus) {
			switch (sStatus) {
				case "ASSOCIATION":
					return "Success";
				case "BASE":
                    return "Warning";
				case "ISUSED":
					return "Error";
				default:
					return "Standard";
			}
		},
		setNodeStatus: function (sType, iStatus) {
			if (iStatus >= 200 && iStatus <= 299) {
				return `XXFILTERED_${sType}`;
			} else {
				return sType;
			}
		},

		setLineStatus: function (sType) {
			return sType;
		}
	};
});
