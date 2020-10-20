# ui-cluster-driver-otc

OpenTelekomCloud CCE driver for Rancher

## Installation

1. Go to `Cluster Drivers`
2. Click `Add cluster driver`
3. Set download URL: https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/driver/latest/kontainer-engine-driver-otccce_linux_amd64.tar.gz
4. Set custom UI URL: https://otc-rancher.obs.eu-de.otc.t-systems.com/cluster/ui/latest/component.js
5. Add `*.otc.t-systems.com` to whitelist domains
6. Click "Create"

After that, driver should be shown as "Otc" and be in `Active` state.

## Usage

Select `Open Telekom Cloud` on cluster creation page, this will start cluster configuration process.

You can create VPC, subnet, floating IP, and load balancer during the cluster configuration.

After cluster is created, you can resize it.

**Note:** this is the first stable version and it contain now yet known problems and miss some required features. It this case, please report the issue to https://github.com/opentelekomcloud/ui-cluster-driver-otc/issues.
