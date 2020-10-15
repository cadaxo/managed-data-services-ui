sap.ui.define([
  "sap/ui/test/Opa5",
  "com/cadaxo/cmds/mdsui/test/integration/arrangements/Startup",
  "com/cadaxo/cmds/mdsui/test/integration/BasicJourney"
], function(Opa5, Startup) {
  "use strict";

  Opa5.extendConfig({
    arrangements: new Startup(),
    pollingInterval: 1
  });

});
