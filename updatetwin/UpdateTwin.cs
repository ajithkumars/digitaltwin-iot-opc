// Default URL for triggering event grid function in the local environment.
// http://localhost:7071/runtime/webhooks/EventGrid?functionName={functionname}
using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Extensions.Logging;
using Azure.DigitalTwins.Core;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace UpdateTwin
{
    // This class processes telemetry events from IoT Hub related to chocolate factory demo server
    public static class UpdateTwin
    {
        [FunctionName("UpdateTwin")]
        public static async Task Run([EventGridTrigger] EventGridEvent eventGridEvent, ILogger log,ExecutionContext context)
        {
            log.LogInformation("Message from IotHub received via EventGrid");

            DigitalTwinsClient client = Utilities.getAzureDigitalTwinClient(log);

            try {
                if (client!= null && eventGridEvent != null && eventGridEvent.Data != null)
                {
                    String iotHubMessage = eventGridEvent.Data.ToString();
                    log.LogDebug($"Telemetry full message received : {iotHubMessage}");

                    List<Tuple<string, string, string>> valueUpdateTuple = new List<Tuple<string, string, string>>();

                    JArray telemetryJsonArray = Utilities.ExtractTelemetryArray(iotHubMessage, log);
                    log.LogDebug($"Print final {telemetryJsonArray}");

                    foreach (JObject obj in telemetryJsonArray)
                    {
                        try {
                            valueUpdateTuple.Add(Utilities.ExtractTwinUpdate(obj,log));
                        } 
                        catch (Exception e) {
                            log.LogError($"Error while parsing node : {e.Message}");
                            continue;
                        }
                    }
                
                    foreach (Tuple<string, string, string> obj in valueUpdateTuple) {
                        log.LogDebug($"Updating Twin : DeviceId(dtId) --> ValueType --> Value : <{obj.Item1},{obj.Item2},{obj.Item3}>");
                        Utilities.UpdateDigitalTwin(obj.Item1,obj.Item2,obj.Item3, client, log);
                    }
                } else {
                    log.LogWarning($"Unable to process IoTHubMessage.");
                }
            }
            catch (Exception e) {
                log.LogError($"Error while updating twin : {e.Message}");
                log.LogError($" {e}");
            }
        }
    }
}
