/*global require,setInterval,console */
const chalk = require("chalk");
const opcua = require("node-opcua");

const {
  OPCUAServer,
  OPCUACertificateManager,
  SecurityPolicy,
  MessageSecurityMode,
  Variant,
  DataType,
  VariantArrayType,
  DataValue,
  standardUnits,
  makeApplicationUrn,
  nodesets,
  install_optional_cpu_and_memory_usage_node,
  build_address_space_for_conformance_testing,
  RegisterServerMethod,
  extractFullyQualifiedDomainName
} = require("node-opcua");

// Let's create an instance of OPCUAServer
const server = new OPCUAServer({
    port: 12000, // the port of the listening socket of the server
    resourcePath: "/EdgeVM/ChocFactory", // this path will be added to the endpoint resource name
    securityPolicies: [SecurityPolicy.None],
    //securityModes: [MessageSecurityMode.Sign],
    serverInfo : {
        productUri: "ChocoFactoryDemo-OPCUA"
    },
    buildInfo : {
        productName: "ChocoFactory-Regular",
        buildNumber: "1",
        buildDate: new Date(2021,4,09)
    }
});

/** Helper function for console logs */
function dumpObject(node) {
    function w(str, width) {
      const tmp = str + "                                        ";
      return tmp.substr(0, width);
    }
    return Object.entries(node).map((key, value) =>
      "      " + w(key, 30) + "  : " + ((value === null) ? null : value.toString())
    ).join("\n");
}

function getDate() {
    var date = Date().toString("yyyyMMddHHmmss").
      replace(/T/, ' ').
      replace(/\..+/, '')

  var tempDateObject=date.split("GM");
  var fullDateWithTime = tempDateObject[0]
  return fullDateWithTime;
}

function post_initialize() {
    console.log("Post initialization process " + getDate());
    function construct_my_address_space(server) {
        console.log("Creating nodes and address space");
        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

		const floor = namespace.addObject({organizedBy: addressSpace.rootFolder.objects, browseName: "Floor"});

		namespace.addVariable({
          organizedBy: floor,
          browseName: "Temperature",
          nodeId: "s=Floor.ChasisTemperature",
          dataType: "Double",

          value: {
            refreshFunc: function(callback) {

              const temperature = 30 + 5 * Math.sin(Date.now() / 10000);
              const value = new Variant({ dataType: DataType.Double, value: temperature });
              const sourceTimestamp = new Date();

              // simulate a asynchronous behaviour
              setTimeout(function() {
                callback(null, new DataValue({ value: value, sourceTimestamp: sourceTimestamp }));
              }, 100);
            }
          }
        });

        const roasting = namespace.addObject({organizedBy: addressSpace.rootFolder.objects, browseName: "Roasting"});

        //Time is a writable attribute
        let writableVariableRoasting = 45;

        namespace.addVariable({
            componentOf: roasting,
            browseName: "Time.Writable",
            nodeId: "ns=1;s=Roasting.Time.Writable",
            dataType: "Int32",
            value: {
                get:  function () {
                    return new Variant({dataType: DataType.Int32, value: writableVariableRoasting });
                },
                set: function (variant) {
                    writableVariableRoasting = parseFloat(variant.value);
                    return opcua.StatusCodes.Good;
                }
            }
        });

        namespace.addVariable({
            organizedBy: roasting,
            browseName: "PowerUsage",
            nodeId: "ns=1;s=Roasting.PowerUsage",
            dataType: "Int32",
            value: {
            /**
             * returns the  current value as a Variant
             * @method get
             * @return {Variant}
             */
            get: function() {
              const power_usage = Math.abs(2000 + 250 * Math.sin(Date.now() / 1000));
              return new Variant({ dataType: DataType.Int32, value: power_usage });
            }
          }
        });

		namespace.addVariable({
            organizedBy: roasting,
            browseName: "FanSpeed",
            nodeId: "ns=1;s=Roasting.FanSpeed",
            dataType: "Int32",
            value: {
            get: function() {
              const fan_speed = Math.abs(3000 + 350 * Math.sin(Date.now() / 1000));
              return new Variant({ dataType: DataType.Int32, value: fan_speed });
            }
          }
        });

        namespace.addVariable({
          organizedBy: roasting,
          browseName: "ChasisTemperature",
          nodeId: "s=Roasting.ChasisTemperature",
          dataType: "Double",

          value: {
            refreshFunc: function(callback) {

              const temperature = 85 + 10 * Math.sin(Date.now() / 10000);
              const value = new Variant({ dataType: DataType.Double, value: temperature });
              const sourceTimestamp = new Date();

              // simulate a asynchronous behaviour
              setTimeout(function() {
                callback(null, new DataValue({ value: value, sourceTimestamp: sourceTimestamp }));
              }, 100);
            }
          }
        });

        const grinding = namespace.addObject({organizedBy: addressSpace.rootFolder.objects, browseName: "Grinding"});

        //Time is a writable attribute
        let writableVariableGrinding = 55;

        namespace.addVariable({
            componentOf: grinding,
            browseName: "Time.Writable",
            nodeId: "ns=1;s=Grinding.Time.Writable",
            dataType: "Int32",
            value: {
                get:  function () {
                    return new Variant({dataType: DataType.Int32, value: writableVariableGrinding });
                },
                set: function (variant) {
                    writableVariableGrinding = parseFloat(variant.value);
                    return opcua.StatusCodes.Good;
                }
            }
        });

        namespace.addVariable({
            organizedBy: grinding,
            browseName: "PowerUsage",
            nodeId: "ns=1;s=Grinding.PowerUsage",
            dataType: "Int32",
            value: {
            get: function() {
              const power_usage = Math.abs(2500 + 300 * Math.sin(Date.now() / 1000));
              return new Variant({ dataType: DataType.Int32, value: power_usage });
            }
          }
        });

        namespace.addVariable({
            organizedBy: grinding,
            browseName: "Force",
            nodeId: "ns=1;s=Grinding.Force",
            dataType: "Int32",
            value: {
            get: function() {
              const force = Math.abs(100 + 10 * Math.sin(Date.now() / 1000));
              return new Variant({ dataType: DataType.Int32, value: force });
            }
          }
        });

        namespace.addVariable({
          organizedBy: grinding,
          browseName: "ChasisTemperature",
          nodeId: "s=Grinding.ChasisTemperature",
          dataType: "Double",

          value: {
            refreshFunc: function(callback) {

              const temperature = 65 + 10 * Math.sin(Date.now() / 10000);
              const value = new Variant({ dataType: DataType.Double, value: temperature });
              const sourceTimestamp = new Date();

              // simulate a asynchronous behaviour
              setTimeout(function() {
                callback(null, new DataValue({ value: value, sourceTimestamp: sourceTimestamp }));
              }, 100);
            }
          }
        });

        const molding = namespace.addObject({organizedBy: addressSpace.rootFolder.objects, browseName: "Molding"});


        //Time is a writable attribute
        let writableVariableMolding = 65;

        namespace.addVariable({
            componentOf: molding,
            browseName: "Time.Writable",
            nodeId: "ns=1;s=Molding.Time.Writable",
            dataType: "Int32",
            value: {
                get:  function () {
                    return new Variant({dataType: DataType.Int32, value: writableVariableMolding });
                },
                set: function (variant) {
                    writableVariableMolding = parseFloat(variant.value);
                    return opcua.StatusCodes.Good;
                }
            }
        });

        namespace.addVariable({
            organizedBy: molding,
            browseName: "PowerUsage",
            nodeId: "ns=1;s=Molding.PowerUsage",
            dataType: "Int32",
            value: {
            /**
             * returns the  current value as a Variant
             * @method get
             * @return {Variant}
             */
            get: function() {
              const power_usage = Math.abs(1000 + 100 * Math.sin(Date.now() / 1000));
              return new Variant({ dataType: DataType.Int32, value: power_usage });
            }
          }
        });

        namespace.addVariable({
          organizedBy: molding,
          browseName: "ChasisTemperature",
          nodeId: "s=Molding.ChasisTemperature",
          dataType: "Double",

          value: {
            refreshFunc: function(callback) {

              const temperature = 85 + 10 * Math.sin(Date.now() / 10000);
              const value = new Variant({ dataType: DataType.Double, value: temperature });
              const sourceTimestamp = new Date();

              // simulate a asynchronous behaviour
              setTimeout(function() {
                callback(null, new DataValue({ value: value, sourceTimestamp: sourceTimestamp }));
              }, 100);
            }
          }
        });
    }
    construct_my_address_space(server);
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });

    console.log(chalk.yellow("\nregistering server to :") + server.discoveryServerEndpointUrl);
    const endpointUrl = server.getEndpointUrl();
    console.log(chalk.yellow("  server on port      :"), server.endpoints[0].port.toString());
    console.log(chalk.yellow("  endpointUrl         :"), endpointUrl);
    console.log(chalk.yellow("  serverInfo          :"));
    console.log(server.serverInfo);
    console.log(chalk.yellow("  buildInfo           :"));
    console.log(server.engine.buildInfo);

    server.on("create_session", function(session) {
        console.log(getDate()," SESSION CREATED");
        console.log(chalk.cyan("    client application URI: "), session.clientDescription.applicationUri);
        console.log(chalk.cyan("        client product URI: "), session.clientDescription.productUri);
        console.log(chalk.cyan("   client application name: "), session.clientDescription.applicationName.toString());
        console.log(chalk.cyan("   client application type: "), session.clientDescription.applicationType.toString());
        console.log(chalk.cyan("              session name: "), session.sessionName ? session.sessionName.toString() : "<null>");
        console.log(chalk.cyan("           session timeout: "), session.sessionTimeout);
        console.log(chalk.cyan("                session id: "), session.sessionId);
    });

    server.on("session_closed", function(session,reason) {
        console.log(getDate() + " SESSION CLOSED : ", reason);
        console.log(chalk.cyan("              session name: "), session.sessionName ? session.sessionName.toString() : "<null>");
    });

    server.on("serverRegistered", () => {
        console.log("server has been registered");
      });
      server.on("serverUnregistered", () => {
        console.log("server has been unregistered");
      });
      server.on("serverRegistrationRenewed", () => {
        console.log("server registration has been renewed");
      });
      server.on("serverRegistrationPending", () => {
        console.log("server registration is still pending (is Local Discovery Server up and running ?)");
      });
      server.on("newChannel", (channel) => {
        console.log(chalk.bgYellow(getDate()," Client connected with address = "), channel.remoteAddress, " port = ", channel.remotePort, "timeout=", channel.timeout);
      });
      server.on("closeChannel", (channel) => {
        console.log(chalk.bgCyan(getDate()," Client disconnected with address = "), channel.remoteAddress, " port = ", channel.remotePort);
        if (global.gc) {
          global.gc();
        }
      });
}
server.initialize(post_initialize);
