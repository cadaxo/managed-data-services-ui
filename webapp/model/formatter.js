sap.ui.define([], function () {
	"use strict";
	return {
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
		},
			// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {


			return 'Success';
		},

		// Display the number of messages with the highest severity
		highestSeverityMessages: function () {
			//var sHighestSeverityIconType = this.buttonTypeFormatter();
			// var sHighestSeverityIconType = "Neutral";
			// var sHighestSeverityMessageType ;

			// switch (sHighestSeverityIconType) {
			// 	case "Negative":
			// 		sHighestSeverityMessageType = "Error";
			// 		break;
			// 	case "Critical":
			// 		sHighestSeverityMessageType = "Warning";
			// 		break;
			// 	case "Success":
			// 		sHighestSeverityMessageType = "Success";
			// 		break;
			// 	default:
			// 		sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
			// 		break;
			// }

			// return this.getView().getModel('messagePopoverModel').oData.reduce(function(iNumberOfMessages, oMessageItem) {
			// 	return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
			// }, 0);
			return 3;
		},

		// Set the button icon according to the message with the highest severity
		buttonIconFormatter: function () {
			// var sIcon;
			// debugger;
			// var aMessages = this.getView().getModel('messagePopoverModel').oData;

			// aMessages.forEach(function (sMessage) {
			// 	switch (sMessage.type) {
			// 		case "Error":
			// 			sIcon = "sap-icon://message-error";
			// 			break;
			// 		case "Warning":
			// 			sIcon = sIcon !== "sap-icon://message-error" ? "sap-icon://message-warning" : sIcon;
			// 			break;
			// 		case "Success":
			// 			sIcon = "sap-icon://message-error" && sIcon !== "sap-icon://message-warning" ? "sap-icon://message-success" : sIcon;
			// 			break;
			// 		default:
			// 			sIcon = !sIcon ? "sap-icon://message-information" : sIcon;
			// 			break;
			// 	}
			// });

			// return sIcon;

			return 'sap-icon://message-information';
		}

	};
});
