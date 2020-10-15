sap.ui.define([], function () {
	"use strict";
	return {
		nodeStatus: function (sStatus) {
			switch (sStatus) {
				case "DDLS":
					return "cdsview"
				case "TABL":
                    return "table"
                case "DDLX":
                    return "Warning"
                case "COMPOSITE":
                        return "Information"              
                case "CONSUMPTION":
                        return "Standard"                                
				default:
					return "Success";
			}
		},
		lineStatus: function (sStatus) {
			switch (sStatus) {
				case "ASSOCIATION":
					return "Success"
				case "BASE":
                    return "Warning"
				case "ISUSED":
					return "Error"
				default:
					return "Standard";
			}
		}	
	};
});
