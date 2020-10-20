# ui-cluster-driver-otc

OpenTelekomCloud CCE driver for Rancher

## Installation

1. Go to the `Cluster Drivers` management screen in Rancher and click `Add Cluster Driver`.
2. Enter Download URL:
    1) Using exact version: `https://github.com/opentelekomcloud/kontainer-engine-driver-otc/releases/download/VERSION/kontainer-engine-driver-otc-VERSION-linux-amd64.tgz`
    2) Using latest version: `https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/driver/latest/kontainer-engine-driver-otccce_linux_amd64.tar.gz`
3. Enter the Custom UI URL: `https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/ui/latest/component.js`.
4. Add Whitelist Domains with value `*.otc.t-systems.com`.
5. Click `Create`, and wait for driver status to be `Active`.
6. Cluster driver for OpenTelekomCloud CCE service will be available to use on the `Add Cluster` screen.

## Usage

Select `Open Telekom Cloud CCE` on cluster creation page, this will start cluster configuration process.

You can create VPC, subnet and floating IP during the cluster configuration.

After cluster is created, you can resize it.

**Note:** this is the first stable version and it contain now yet known problems and miss some required features. It this case, please report the issue to https://github.com/opentelekomcloud/ui-cluster-driver-otc/issues.

## License

Copyright 2020 T-Systems GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

