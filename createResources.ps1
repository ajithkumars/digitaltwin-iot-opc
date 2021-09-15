
<#
.SYNOPSIS
#

.DESCRIPTION
Long description

.PARAMETER iothubName           
.PARAMETER resourceGroup        
.PARAMETER subscriptionName     
.PARAMETER digitalTwinName      --  Has to be unique otherwise can throw conflict
.PARAMETER functionName         --  Has to be unique otherwise can throw conflict
.PARAMETER functionsPlanName
.PARAMETER storageAccountName   --  Has to be unique otherwise can throw conflict
.PARAMETER location

.EXAMPLE
.\createResources.ps1 `
	-iothubName "free-iothub-del" `
	-resourceGroup "delete-iot-test" `
	-subscriptionName "del-subscription-name" `
	-digitalTwinName "test-delete-adt" `
	-functionName "delupdatetwin" `
	-functionsPlanName "delfunctionsPlan" `
	-storageAccountName "delazlager" `
	-location "westeurope"

.NOTES
General notes
#>
param(
    [Parameter(Mandatory = $true)] [string] $iothubName,
    [Parameter(Mandatory = $true)] [string] $resourceGroup,
    [Parameter(Mandatory = $true)] [string] $subscriptionName,
    [Parameter(Mandatory = $true)] [string] $digitalTwinName,
    [Parameter(Mandatory = $true)] [string] $functionName,
    [Parameter(Mandatory = $true)] [string] $functionsPlanName,
    [Parameter(Mandatory = $true)] [string] $storageAccountName,
    [Parameter(Mandatory = $true)] [string] $location
)

# Login and set correct subscription
az login
az account set --subscription $subscriptionName

# Add extension to use azure iot setup 
# Note!! that more exensions might be required
az extension add --name azure-iot

# 
az group create --location $location --name $resourceGroup

# Creates iothub in the free tier
az iot hub create --resource-group $resourceGroup --name $iothubName --sku F1 --partition-count 2

# Create digital twin
az dt create --dt-name $digitalTwinName `
             --resource-group $resourceGroup `
             --location $location

$assignee = (az account show | ConvertFrom-Json).user.name

az dt role-assignment create -n $digitalTwinName --assignee $assignee --role "Azure Digital Twins Data Owner"

# Create function to send data from iothub to Azure Digital Twin
az storage account create --name $storageAccountName --location $location --resource-group $resourceGroup --sku Standard_LRS

az functionapp create --resource-group $resourceGroup `
        --consumption-plan-location $location `
        --name $functionName `
        --runtime dotnet `
        --storage-account $storageAccountName `
        --assign-identity '[system]' `
        --os-type Windows
        
#Give some time for resource to be created  (if it does not work maybe run again?)   
Write-Host "Sleep for 15 seconds"

Start-Sleep -s 15

Write-Host "Done sleeping for 15 seconds"

#Create edge device
$testEdgeDevice = "test-edge-device"

az iot hub device-identity create --device-id $testEdgeDevice --edge-enabled --hub-name $iothubName
az iot hub device-identity connection-string show --device-id $testEdgeDevice --hub-name $iothubName

$functionAppId = (az functionapp identity show --name $functionName --resource-group $resourceGroup | ConvertFrom-Json).principalId        
az dt role-assignment create -n $digitalTwinName --assignee $functionAppId --role "Azure Digital Twins Data Owner"

# In case the above command fails, run it with actual values in powershell (reason for failure is unknown)

# Only iothub system topic is to be created along with subscription towards the azure function.
# For this first the function has to be uploaded

# Cleanup
#az group delete --name $resourceGroup