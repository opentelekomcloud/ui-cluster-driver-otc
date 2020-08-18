# ui-cluster-driver-otc

OpenTelekomCloud CCE driver for Rancher

## Installation

1. Go to `Cluster Drivers`
2. Click `Add cluster driver`
3. Set download URL: https://csm-assets.obs.eu-de.otc.t-systems.com/kontainer-engine-driver-otc-0.2.1-linux-amd64.tgz
4. Set custom UI URL: https://csm-assets.obs.eu-de.otc.t-systems.com/ui/component.js
5. Add `*.otc.t-systems.com` to whitelist domains
6. Click "Create"

After that, driver should be shown as "Otc" and be in `Active` state.

## Usage

Select `Open Telekom Cloud` on cluster creation page, this will start cluster configuration process.

You can create VPC, subnet, floating IP, and load balancer during the cluster configuration.

After cluster is created, you can resize it.

**Note:** this is the first stable version and it contain now yet known problems and miss some required features. It this case, please report the issue to https://github.com/opentelekomcloud/ui-cluster-driver-otc/issues.
