$dtname = "test-delete-adt"

$factorymodelid = "dtmi:com:microsoft:iot:e2e:digital_factory:chocolate_factory;1"
$floormodelid = "dtmi:com:microsoft:iot:e2e:digital_factory:floor;1"
$prodlinemodelid = "dtmi:com:microsoft:iot:e2e:digital_factory:production_line;1"
$gridingstepmodelid = "dtmi:com:microsoft:iot:e2e:digital_factory:production_step_grinding;1"
$roastingstepmodelid = "dtmi:com:microsoft:iot:e2e:digital_factory:production_step_fanning;2"
$mouldingstepmodelid = "dtmi:com:microsoft:iot:e2e:digital_factory:production_step_moulding;1"

az dt twin create -n $dtname --dtmi $factorymodelid --twin-id 'ChocolateFactory'
az dt twin create -n $dtname --dtmi $floormodelid --twin-id 'FactoryFloor'
az dt twin create -n $dtname --dtmi $prodlinemodelid --twin-id 'ProductionLine'
az dt twin create -n $dtname --dtmi $gridingstepmodelid --twin-id 'Grinding'
az dt twin create -n $dtname --dtmi $roastingstepmodelid --twin-id 'Roasting'
az dt twin create -n $dtname --dtmi $mouldingstepmodelid --twin-id 'Moulding'


#Create relationship
$relname='rel_has_floors'
az dt twin relationship create -n $dtname --relationship $relname --twin-id 'ChocolateFactory' --target 'FactoryFloor' --relationship-id 'Factory has floors'
$relname='rel_runs_lines'
az dt twin relationship create -n $dtname --relationship $relname --twin-id 'FactoryFloor' --target 'ProductionLine' --relationship-id 'Floor run production lines'
$relname='rel_runs_steps'
az dt twin relationship create -n $dtname --relationship $relname --twin-id 'ProductionLine' --target 'Grinding' --relationship-id 'Grinding step'
$relname='rel_runs_steps'
az dt twin relationship create -n $dtname --relationship $relname --twin-id 'ProductionLine' --target 'Roasting' --relationship-id 'Roasting step'
$relname='rel_runs_steps'
az dt twin relationship create -n $dtname --relationship $relname --twin-id 'ProductionLine' --target 'Moulding' --relationship-id 'Moulding step'