using System;
using System.Net.Http;
using System.Linq;
using Azure;
using Azure.Core.Pipeline;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace UpdateTwin
{
    static class Utilities {
        private static readonly HttpClient httpClient = new HttpClient();
        private static string adtServiceUrl = Environment.GetEnvironmentVariable("ADT_SERVICE_URL");
        /*
                Get Digital Twins Client 
        */
        public static DigitalTwinsClient getAzureDigitalTwinClient(ILogger log) {
            DigitalTwinsClient client = null;
            // Authenticate on ADT APIs
            try
            {
                var credentials = new DefaultAzureCredential();
                client = new DigitalTwinsClient(new Uri(adtServiceUrl), credentials, new DigitalTwinsClientOptions 
                    { Transport = new HttpClientTransport(httpClient) });
                log.LogInformation($"ADT service client connection created to {adtServiceUrl}");
            }
            catch (Exception e)
            {
                log.LogError($"ADT service client connection failed. {e} for url {adtServiceUrl}");
            }
            return client;
        }

        /*
            Update Twin Data
            Append replace for components that are initialized.
            If not initialized then add.
        */
        public async static void UpdateDigitalTwin(string deviceId, string component, string value, 
            DigitalTwinsClient client, ILogger log) {

            var updateTwinData = new JsonPatchDocument();
            try {
                updateTwinData.AppendReplace(component, Convert.ToDouble(value));
                Azure.Response response = await client.UpdateDigitalTwinAsync(deviceId, updateTwinData);
                log.LogInformation($"Response Append/Replace (204 -> Success) : {response.Status} for {deviceId} --> {component}");
            }
            catch (Exception e)
            {
                log.LogError($"Update twin error for {deviceId} --> {component} : {e.Message}");
                log.LogError($"Error {e}");
            }
        }

        public static JArray ExtractTelemetryArray(String fullMessage, ILogger log) {
            JArray telemetryJsonArray = new JArray();
            try {
                JObject rootObject = JObject.Parse(fullMessage);
                log.LogDebug($"Full IotHubMessage as JSON Object {rootObject}");

                string actualTelemetryBody = (string)rootObject["body"];

                // Decode message based on
                // https://stackoverflow.com/questions/61191033/how-to-deserialize-an-event-from-iot-hub-which-it-was-passed-to-an-event-hub
                var base64EncodedBytes = System.Convert.FromBase64String(actualTelemetryBody);
                var jsonInString = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
                telemetryJsonArray = JArray.Parse(jsonInString);
                log.LogDebug($"Opc Tags Array {telemetryJsonArray}");
            }
            catch (Exception e)
            {
                log.LogError($"Error in extracting Telemetry JSON Array : {e.Message}");
                log.LogError($"Error {e}");
            }

            return telemetryJsonArray;
        }

        public static Tuple<String,String,String> ExtractTwinUpdate(JObject obj, ILogger log) {
            string nodeId = (string) obj["NodeId"];
            var value = obj["Value"]["Value"];
            var sourceTimestamp = obj["Value"]["SourceTimestamp"];
            log.LogDebug($"NodeId = {nodeId}");
            log.LogDebug($"Value = {value}");
            log.LogDebug($"SourceTimestamp = {sourceTimestamp}");

            var splitWord = "s="; var tagDtIdIndex = 1;
            string[] splitList = nodeId.Split(splitWord,2);
            log.LogDebug($"Extracted dT Id part {splitList[tagDtIdIndex]}");

            var separator = ".";
            List<String> bufferList = new List<string>(splitList[tagDtIdIndex].Split(separator).Reverse());
            string component = bufferList[0]; //Last element

            string actualDeviceId = splitList[tagDtIdIndex].Replace(separator + component,"");
            log.LogInformation($"Device Id actual : {actualDeviceId} -- {component} -- {value}");
            
            // Adding component prefix ("/") for value type to be updated
            var componentPrefix = "/";
            return Tuple.Create(actualDeviceId,componentPrefix + component,(string) value);
        }
    }
}