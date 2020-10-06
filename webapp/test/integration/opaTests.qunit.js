/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/cadaxo/cmds/manageddataservicesui/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
