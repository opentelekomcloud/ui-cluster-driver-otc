# ui-cluster-driver-otc

Frontend part of OpenTelekomCloud CCE driver for Rancher

Backend part:
 - https://github.com/opentelekomcloud/kontainer-engine-driver-otc

Depends-On:
 - https://github.com/opentelekomcloud/oms
   OMS - micro JS sdk to manage OTC resources such as `VPC`, `SUBNETS`, `FLAVORS`, `KEYPAIRS` and supports different types of authorizations like `token` and `ak/sk`.

## Adding/Updating driver
1. Open `Rancher`
2. Go to the `Cluster Drivers` management screen in Rancher.

   <img src="https://otc-rancher.obs.eu-de.otc.t-systems.com/helpers/cluster-mgmt.png" alt="image" style="width:150px;height:auto;">
3. Go to `Drivers` -> `Cluster Drivers` and search for `Open Telekom Cloud CCE` click three dotted menu and then `Edit`
   <img src="https://otc-rancher.obs.eu-de.otc.t-systems.com/helpers/cluster_drivers.png" alt="image" style="width:1000px;height:auto;">
4. or you can just click `Add Cluster Driver`.
5. Enter Download URL:
   1) Using exact version: `https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/driver/1.1.1/kontainer-engine-driver-otccce_linux_amd64.tar.gz`
   2) Using the latest version: `https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/driver/latest/kontainer-engine-driver-otccce_linux_amd64.tar.gz`
6. Enter the Custom UI URL:
   1) Using exact version: `https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/ui/v1.2.0/component.js`.
   2) Or latest: `https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/ui/latest/component.js`.
7. Add Whitelist Domains with value `*.otc.t-systems.com`.

   <img src="https://otc-rancher.obs.eu-de.otc.t-systems.com/helpers/edit_cluster_driver.png" alt="image" style="width:600px;height:auto;">

8. Click `Save` if you are in edit mode of existing driver or `Create` for new one, and wait for driver status to be `Active`.
9. Cluster driver for OpenTelekomCloud CCE service will be available to use on the `Cluster:Create` screen.
   <img src="https://otc-rancher.obs.eu-de.otc.t-systems.com/helpers/cluster_create.png" alt="image" style="width:1000px;height:auto;">

## Usage

Select `Open Telekom Cloud CCE` on cluster creation page, this will start cluster configuration process.

You can create VPC, subnet and floating IP during the cluster configuration.

After cluster is created, you can manipulate it.

**Note:** Please report the issues to https://github.com/opentelekomcloud/ui-cluster-driver-otc/issues.

## License

Copyright 2023 T-Systems GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

