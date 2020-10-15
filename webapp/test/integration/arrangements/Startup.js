sap.ui.define([
  "sap/ui/test/Opa5"
], function(Opa5) {
  "use strict";

  return Opa5.extend("com.cadaxo.cmds.mdsui.test.integration.arrangements.Startup", {

    iStartMyApp: function () {
      this.iStartMyUIComponent({
        componentConfig: {
          name: "com.cadaxo.cmds.mdsui",
          async: true,
          manifest: true
        }
      });
    }

  });
});
