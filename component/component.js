/*!!!!!!!!!!!Do not change anything between here (the DRIVERNAME placeholder will be automatically replaced at buildtime)!!!!!!!!!!!*/
// https://github.com/rancher/ui/blob/master/lib/shared/addon/mixins/cluster-driver.js
import ClusterDriver from 'shared/mixins/cluster-driver';

// those are dev-only dependencies, they are replaced with packages in `vendor` by gulp
import oms from '@opentelekomcloud/oms'; //=exclude
import isCidr from 'is-cidr'; //=exclude
import isIp from 'is-ip'; //=exclude

// do not remove LAYOUT, it is replaced at build time with a base64 representation of the template of the hbs template
// we do this to avoid converting template to a js file that returns a string and the cors issues that would come along
// with that
const LAYOUT;
/*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/


/*!!!!!!!!!!!GLOBAL CONST START!!!!!!!!!!!*/
// EMBER API Access - if you need access to any of the Ember API's add them here in the same manner rather then import
// them via modules, since the dependencies exist in rancher we dont want to expor the modules in the amd def
const computed = Ember.computed;
const observer = Ember.observer;
const get = Ember.get;
const set = Ember.set;
const alias = Ember.computed.alias;
const service = Ember.inject.service;
const all = Ember.RSVP.all;
const resolve = Ember.RSVP.resolve;
const reject = Ember.RSVP.reject;

const equal = Ember.computed.equal;
const next = Ember.run.next;
const setProperties = Ember.setProperties;

/*!!!!!!!!!!!GLOBAL CONST END!!!!!!!!!!!*/
const domains = '*.otc.t-systems.com'
const clusterFlavors = [
  'cce.s1.small',
  'cce.s1.medium',
  'cce.s2.small',
  'cce.s2.medium',
  'cce.s2.large',
  'cce.s2.xlarge',
]
const defaultClusterFlavor = 'cce.s1.medium'
const defaultNodeFlavor = 's2.large.2'
const os = ['EulerOS 2.5', 'CentOS 7.7', 'EulerOS 2.9', 'Ubuntu 22.04']
const defaultOS = os[0]
const clusterFlavorDetails = `Cluster flavor, which cannot be changed after the cluster is created.

    cce.s1.small: small-scale, single-master VM cluster (≤ 50 nodes)
    cce.s1.medium: medium-scale, single-master VM cluster (≤ 200 nodes)
    cce.s2.small: small-scale, high availability VM cluster (≤ 50 nodes)
    cce.s2.medium: medium-scale, high availability VM cluster (≤ 200 nodes)
    cce.s2.large: large-scale, high availability VM cluster (≤ 1,000 nodes)
    cce.s2.xlarge: ultra-large-scale, high availability cluster (<= 2,000 nodes)
`
const instanceFlavorReference = 'https://docs.otc.t-systems.com/en-us/usermanual/ecs/en-us_topic_0177512565.html'
const typeVM = 'VirtualMachine'
const clusterTypes = [
  {
    label: 'Hybrid',
    value: typeVM
  },
]
const regions = ['eu-de', 'eu-nl', 'eu-ch2']
const diskTypes = ['SATA', 'SAS', 'SSD']
const availabilityZonesDE = [
  'eu-de-01',
  'eu-de-02',
  'eu-de-03',
]
const availabilityZonesNL = [
  'eu-nl-01',
  'eu-nl-02',
  'eu-nl-03',
]
const availabilityZonesCH = [
  'eu-ch2a',
  'eu-ch2b',
]
const lbProtocols = [
  'TCP',
  'HTTP',
  'HTTPS',
]
const k8sVersions = {
  'latest': '',
  'v1.25':  'v1.25',
  'v1.23':  'v1.23',
}
const defaultBandwidth = 100
const defaultFloatingIPType = '5_bgp'
const defaultShareType = 'PER'
const defaultClusterCIDR = "172.16.0.0/16"
const authModes = {
  RBAC: 'rbac',
  x509: 'x509',
}
const any = '*'

function networkMode(name, id, available) {
  if (!available) {
    available = any
  }
  return { label: name, value: id, available: available }
}

const networkModes = [
  networkMode('Overlay L2', 'overlay_l2'),
  networkMode('Underlay IPVLAN', 'underlay_ipvlan', 'BareMetal'),
  networkMode('VPC Router', 'vpc-router'),
]
const defaultNetworkMode = 'overlay_l2'


const groupInfoRe = /([\w-]+\d+)\((\w+)\)/
const normal = 'normal'

const tokenAuth = 'token'
const akskAuth = 'aksk'
const r = 'region'

/**
 * flavorInAZ returns function for checking if flavor is available in given AZ
 * @param az
 * @return {function(any): boolean}
 */
function flavorInAZ(az) {
  return function (flavor) {
    const props = flavor.os_extra_specs
    if (!props) {
      console.log(`Can't check properties of ${flavor.id}`)
      return false
    }
    const azs = props['cond:operation:az'] // list in form ['eu-de-01(normal)', 'eu-de-02(normal)']
    if (!azs) {
      return false
    }
    const found = azs.split(',').find(a => {
      const items = a.match(groupInfoRe)  // regex is slow but it's regex
      return (items[1] === az) && (items[2] === normal)
    })
    return !!found;
  }
}


/**
 * Convert string array to field array
 * @param src {string[]}
 * @returns {{label, value}[]}
 */
function a2f(src) {
  return src.map((v) => ({ label: v, value: v }))
}

/**
 * Convert mapping to field array
 * @param src
 * @returns {{label, value}[]}
 */
function m2f(src) {
  return Object.entries(src).map((e) => ({ label: e[0], value: e[1] }))
}

/**
 * Return proper availability zones based on region
 * @param region {string}
 * @returns {string[]}
 */
function azs(region) {
  let availabilityZones
  if (region === 'eu-de'){
    availabilityZones = availabilityZonesDE
  }
  if (region === 'eu-nl'){
    availabilityZones = availabilityZonesNL
  }
  if (region === 'eu-ch2'){
    availabilityZones = availabilityZonesCH
  }
  return availabilityZones
}

/**
 * Return proper supporte os based on cluster version
 * @param clusterVersion {string}
 * @returns {string[]}
 */
function osList(clusterVersion) {
  let result
  if (clusterVersion === 'v1.23'){
    result = os.filter(item => item !== 'Ubuntu 22.04')
  } else {
    result = os
  }
  return result
}

function field(label, placeholder = '', detail = '') {
  return {
    label:       label,
    placeholder: placeholder,
    detail:      detail,
  }
}

function chapter(title, detail, next) {
  return {
    title:  title,
    next:   next,
    detail: detail,
  }
}

function proxifyConfig(config) {
  config.url = viaProxy(config.url)
  return config
}

const languages = {
  'en-us': {
    cluster: {
      auth:                    chapter(
        'Account Configuration',
        'OTC credentials',
        'Next: Configure Cluster',
      ),
      region:                  field('Region', 'eu-de', 'Your region'),
      'aksk':                  field('Use AK/SK auth'),
      // ak/sk auth:
      accessKey:               field('Access Key ID'),
      secretKey:               field('Secret Access key'),
      // token-based auth:
      token:                   field('Use token-based auth'),
      domainName:              field('Domain Name', 'OTC00000000000000000XXX'),
      username:                field('Username'),
      password:                field('Password'),
      projectName:             field('Project Name', 'eu-de'),
      // cluster config
      cluster:                 chapter(
        'Cluster Configuration',
        'General cluster configuration',
        'Next: Network configuration',
      ),
      clusterType:             field(
        'Cluster Type'
      ),
      clusterVersion:          field(
        'Kubernetes Version',
        'Version of kubernetes installed on cluster'
      ),
      clusterFlavor:           field(
        'Cluster Flavor',
        '',
        clusterFlavorDetails,
      ),
      clusterLabels:           field('Cluster Labels'),
      nodeCount:               field('Node Count'),
      // network info
      network:                 chapter(
        'Network configuration',
        'Networking configuration',
        'Next: Cluster Floating IP',
      ),
      vpcName:                 field(
        'Virtual Private Cloud',
        'vpc-01',
        'Name of VPC (existing or new)',
      ),
      subnetName:              field(
        'Subnet',
        'subnet-01',
        'Name of Subnet (existing or new)',
      ),
      containerNetworkMode:    field('Container Network Mode'),
      containerNetworkCidr:    field('Container Network CIDR'),
      // Cluster eip options
      masterFloatingIp:        chapter(
        'Cluster Floating IP',
        'Floating IP configuration for master node',
        'Next: Node Configuration'
      ),
      newMasterEip:            field('Create New Floating IP'),
      oldMasterEip:            field('Use Existing Floating IP'),
      clusterFloatingIp:       field(
        'Existing floating IP',
        '0.0.0.0',
      ),
      clusterEipBandwidthSize: field(
        'Bandwidth Size',
      ),
      // node config
      node:                    chapter(
        'Node Configuration',
        'Configure instances used as cluster nodes',
        'Next: Nodes disk configuration',
      ),
      nodeFlavor:              field(
        'Node Flavor',
        '',
        `See ${instanceFlavorReference} for available flavors`,
      ),
      nodeOs:                  field('Node OS'),
      availabilityZone:        field('Availability Zone'),
      useExistingKeyPair:      field('Use existing key pair'),
      keyPair:                 field('SSH Key Pair'),
      publicKey:               field('Nodes public key'),
      // disk config
      disk:                    chapter(
        'Disks Configuration',
        'Configure the disks attached to node instances',
        'Finish & Create Cluster',
      ),
      rootVolumeSize:          field(
        'Root Disk Size, GB',
        '40',
        'Minimum 40 GB'
      ),
      rootVolumeType:          field('Root Disk Type'),
      dataVolumeSize:          field(
        'Data Disk Size, GB',
        '100',
        'Minimum 100 GB'
      ),
      dataVolumeType:          field('Data Disk Type'),
      loadingNext:             'Loading Next...',
      newVPC:                  'Create New VPC',
      newSubnet:               'Create New Subnet',
    }
  }
};
// cluster configuration steps
const Steps = Object.freeze({
  auth:       10,
  cluster:    20,
  network:    30,
  clusterEip: 40,
  node:       50,
  disk:       60,
})
const lastStep = Math.max(...Object.values(Steps))

//=require ../vendor/*.js

/**
 * Convert external URL to rancher meta proxy's URL
 * @param {string} url
 * @returns {string}
 */
function viaProxy(url) {
  const serverURL = window.location
  const uri = new URL(url)
  return `${serverURL.protocol}//${serverURL.host}/meta/proxy/${uri.host}${uri.pathname}${uri.search}`
}

/*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
export default Ember.Component.extend(ClusterDriver, {
  driverName:  '%%DRIVERNAME%%',
  configField: '%%DRIVERNAME%%EngineConfig', // 'otcEngineConfig'
  config:      alias('cluster.%%DRIVERNAME%%EngineConfig'),
  app:         service(),
  router:      service(),
  /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/
  intl: service(),

  isNew:      equal('mode', 'new'),
  editing:    equal('mode', 'edit'),
  lanChanged: null,
  refresh:    false,
  step:       Steps.auth,

  authenticated: false,

  vpcs:    [],
  subnets: [],
  flavors: [],
  client:  null,

  newVPC:    { create: false, name: '', cidr: '192.168.0.0/16' },
  newSubnet: { create: false, name: '', cidr: '192.168.0.0/24', gatewayIP: '192.168.0.1' },

  init() {
    /*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
    // This does on the fly template compiling, if you mess with this :cry:
    const decodedLayout = window.atob(LAYOUT);
    const template = Ember.HTMLBars.compile(decodedLayout, {
      moduleName: 'shared/components/cluster-driver/driver-%%DRIVERNAME%%/template'
    });
    set(this, 'layout', template);

    this._super(...arguments);
    /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/

    const lang = get(this, 'session.language') || 'en-us';
    get(this, 'intl.locale');
    this.loadLanguage(lang);

    let config = get(this, 'cluster.%%DRIVERNAME%%EngineConfig')
    let configField = get(this, 'configField')

    console.log('Config is ' + JSON.stringify(config))

    if (!this.editing) {
      config = get(this, 'globalStore').createRecord({
        type: configField,
        // authentication
        authUrl: 'https://iam.eu-de.otc.t-systems.com/v3',
        // ak/sk
        accessKey: '',
        secretKey: '',
        // token auth
        token:       '',
        username:    '',
        password:    '',
        domainName:  '',
        projectName: 'eu-de',
        region:      regions[0],
        // cluster settings
        clusterName:    '',
        displayName:    '',
        clusterVersion: '',
        clusterType:    typeVM,
        clusterFlavor:  defaultClusterFlavor,
        nodeCount:      2,
        clusterLabels:  ['origin=rancher-otc'],
        // cluster networking
        vpcId:                '',
        subnetId:             '',
        containerNetworkMode: defaultNetworkMode,
        containerNetworkCidr: defaultClusterCIDR,
        // master eip
        clusterFloatingIp:       '',
        clusterEipBandwidthSize: defaultBandwidth,
        clusterEipType:          defaultFloatingIPType,
        clusterEipShareType:     defaultShareType,
        // nodes auth
        authenticationMode: authModes.RBAC,
        authProxyCa:        '',
        // nodes config
        availabilityZone: 'eu-de-01',
        nodeFlavor:       defaultNodeFlavor,
        os:               defaultOS,
        keyPair:          '',
        // node disks
        rootVolumeSize: 40,
        dataVolumeSize: 100,
        rootVolumeType: diskTypes[0],
        dataVolumeType: diskTypes[0],
        // LB config
        createLoadBalancer: false,
      });
    }
    set(this, 'config', config);
    set(this, `cluster.${configField}`, config);
    set(this, 'cluster.driver', get(this, 'driverName'));

    if (this.editing) {
      set(this, 'newMasterIP', false)
    }
  },

  createVPC(cb) {
    const srv = get(this, 'client').getService(oms.VpcV1)
    const cidr = get(this, 'newVPC.cidr')
    if (!isCidr(cidr)) {
      set(this, 'errors', ['Invalid VPC CIDR'])
      return cb(false)
    }
    return srv.createVPC({
      name: get(this, 'newVPC.name'),
      cidr: cidr
    }).then(vpc => {
      set(this, 'config.vpcId', vpc.id)
      set(this, 'newVPC.create', false)
      set(this, 'newVPC.name', '')
      set(this, 'newVPC.cidr', '')
      set(this, 'errors', [])
      this.updateVPCs()
      cb(true)
    }).catch(er => {
      set(this, 'newVPC.name', '')
      set(this, 'errors', [JSON.stringify(er)])
      cb(false)
    })
  },
  createSubnet(cb) {
    const srv = get(this, 'client').getService(oms.VpcV1)
    const cidr = get(this, 'newSubnet.cidr')
    const gateway = get(this, 'newSubnet.gatewayIP')
    const errors = []
    if (!isCidr(cidr)) {
      errors.push('Invalid Subnet CIDR')
    }
    if (!isIp(gateway)) {
      errors.push('Invalid Gateway IP')
    }
    if (errors.length) {
      set(this, 'errors', errors)
      return cb(false)
    }
    return srv.createSubnet({
      vpc_id:     get(this, 'config.vpcId'),
      name:       get(this, 'newSubnet.name'),
      cidr:       cidr,
      gateway_ip: gateway,
      dnsList:    ['100.125.4.25', '8.8.8.8'],
    }).then(subnet => {
      set(this, 'config.subnetId', subnet.id)
      set(this, 'newSubnet.name', '')
      set(this, 'newSubnet.cidr', '')
      set(this, 'newSubnet.gatewayIP', '')
      set(this, 'newSubnet.create', false)
      set(this, 'errors', [])
      this.updateSubnets()
      cb(true)
    }).catch((er) => {
      set(this, 'newSubnet.name', '')
      set(this, 'errors', [JSON.stringify(er)])
      cb(false)
    })
  },

  actions: {
    save(cb) {
      if (get(this, 'editing')) {
        this.send('driverSave', cb);
        return cb(true)
      }
      if (!this.validate()) {
        return cb(false)
      }
      switch (get(this, 'step')) {
        case Steps.auth:
          return this.toClusterConfig(cb)
        case Steps.cluster:
          return this.toNetworkConfig(cb)
        case Steps.network:
          const newVPC = get(this, 'newVPC.create')
          const newSubnet = get(this, 'newSubnet.create')
          console.log('Need new VPC? ' + newVPC)
          console.log('Need new subnet? ' + newSubnet)
          if (newVPC) {
            return this.createVPC(cb)
          }
          if (newSubnet) {
            return this.createSubnet(cb)
          }
          return this.toClusterEip(cb)
        case Steps.clusterEip:
          return this.toNodeConfig(cb)
        case Steps.node:
          return this.toDiskConfig(cb)
        default:
          this.sanitizeCredentials()
          console.log('Saving driver with config: \n' + JSON.stringify(get(this, 'cluster')))
          this.send('driverSave', cb);
      }
    },
  },


  // Add custom validation beyond what can be done from the config API schema
  validate() {
    // Get generic API validation errors
    this._super();
    const errors = get(this, 'errors') || [];
    const step = get(this, 'step')
    const cidr = get(this, 'config.containerNetworkCidr')
    if (step >= Steps.cluster) {
      if (!isCidr(cidr)) {
        errors.push('Invalid cluster network CIDR')
      }
    }
    if (step >= Steps.clusterEip) {
      const createNew = get(this, 'newMasterIP')
      if (createNew) {
        const curr = get(this, 'config.clusterEipBandwidthSize')
        const min = get(this, 'minBandwidth')
        const max = get(this, 'maxBandwidth')
        if (curr < min || curr > max) {
          errors.push(`Cluster bandwidth is out of range ${min}-${max} (Mb)`)
        }
      } else {
        const eip = get(this, 'config.clusterFloatingIp')
        if (!isIp(eip)) {
          errors.push(`"${eip}" is not valid IP`)
        }
      }
    }
    if (step >= Steps.node) {
      const max = get(this, 'maxNodes')
      const min = get(this, 'minNodes')
      const curr = get(this, 'config.nodeCount')
      if (curr < min || curr > max) {
        errors.push(`Node count is out of range ${min}-${max} for selected cluster flavor`)
      }
    }
    if (step >= Steps.disk) {
      const rootDisk = get(this, 'config.rootVolumeSize')
      const dataDisk = get(this, 'config.dataVolumeSize')
      const [minRoot, maxRoot] = get(this, 'systemDiskLimit')
      const [minData, maxData] = get(this, 'dataDiskLimit')
      if (rootDisk < minRoot || rootDisk > maxRoot) {
        errors.push(`Root disk size is out of range ${minRoot}-${maxRoot}`)
      }
      if (dataDisk < minData || dataDisk > maxData) {
        errors.push(`Data disk size is out of range ${minData}-${maxData}`)
      }
    }
    if (step === lastStep) {
      if (!get(this, 'cluster.name')) {
        errors.push('Name is required');
      }
    }

    // Set the array of errors for display,
    // and return true if saving should continue.
    if (get(errors, 'length')) {
      set(this, 'errors', errors);
      return false;
    } else {
      set(this, 'errors', []);
      return true;
    }
  },
  // Any computed properties or custom logic can go here
  regionChoices:        a2f(regions),
  azChoices:            computed('config.region', function () {
    const r = String(get(this, 'config.region'))
    console.log(`Region changed to ${r}. Checking available az choices... `)
    return a2f(azs(r))
  }),
  osChoices:             computed('config.clusterVersion', function () {
    const version = String(get(this, 'config.clusterVersion'))
    console.log(`Cluster version changed to ${version}. Checking available os choices... `)
    return a2f(osList(version))
  }),
  clusterVersionChoices: m2f(k8sVersions),
  clusterTypeChoices:    clusterTypes,
  diskTypeChoices:       a2f(diskTypes),
  networkModeChoices:    computed('config.clusterType', function () {
    const type = String(get(this, 'config.clusterType'))
    console.log(`Cluster type changed to ${type}. Checking available mode choices... `)
    return networkModes.filter(e => {
      return e.available === type || e.available === any
    })
  }),
  lbProtocolChoices:     a2f(lbProtocols),
  authFieldsMissing:     true,
  onAuthFieldsChange:    observer(
    'authMethod',
    'config.username', 'config.password', 'config.domainName', 'config.projectName',
    'config.accessKey', 'config.secretKey', 'config.region',
    function () {
      const authMethod = get(this, 'authMethod')
      let missing
      switch (authMethod) {
        case tokenAuth:
          missing = !(
            get(this, 'config.username') &&
            get(this, 'config.password') &&
            get(this, 'config.domainName') &&
            get(this, 'config.projectName')
          )
          break
        case akskAuth:
          missing = !(
            get(this, 'config.accessKey') &&
            get(this, 'config.secretKey')
          )
          break
        case r:
          missing = !(
            get(this, 'config.region')
          )
          break
      }

      set(this, 'authFieldsMissing', missing)
    }),

  authMethod: tokenAuth,
  /**
   * Remove redundant credentials depending on the auth method selected
   */
  sanitizeCredentials() {
    const method = get(this, 'authMethod')
    switch (method) {
      case akskAuth:
        setProperties(this,
          {
            'config.username':   '',
            'config.password':   '',
            'config.domainName': '',
          })
        break
      case tokenAuth:
        setProperties(this, {
          'config.accessKey': '',
          'config.secretKey': '',
        })
    }
  },

  newVPCFieldsMissing:    false,
  onNewVPCInput:          observer('newVPC.create', 'newVPC.name', 'newVPC.cidr', function () {
    const missing = get(this, 'newVPC.create') &&
      !(get(this, 'newVPC.name') && get(this, 'newVPC.cidr'))
    set(this, 'newVPCFieldsMissing', missing)
  }),
  onNewVPCSelection:      observer('newVPC.create', function () {
    if (get(this, 'newVPC.create')) {
      set(this, 'config.vpcId', '')
    }
  }),
  newSubnetFieldsMissing: false,
  onNewSubnetInput:       observer('newSubnet.create', 'newSubnet.name', 'newSubnet.cidr', function () {
    const missing = get(this, 'newSubnet.create') &&
      !(get(this, 'newSubnet.name') && get(this, 'newSubnet.cidr') && get(this, 'newSubnet.gatewayIP'))
    console.log('Missing Subnet fields?', missing)
    set(this, 'newSubnetFieldsMissing', missing)
  }),
  networkFieldsMissing:   true,
  onNetworkFieldsChange:  observer('config.vpcId', 'config.subnetId', 'newVPC.create', 'newSubnet.create', 'newVPCFieldsMissing', 'newSubnetFieldsMissing', function () {
    if (get(this, 'newVPC.create')) {
      set(this, 'networkFieldsMissing', get(this, 'newVPCFieldsMissing'))
      return
    }
    if (get(this, 'newSubnet.create')) {
      set(this, 'networkFieldsMissing', get(this, 'newSubnetFieldsMissing'))
      return
    }
    set(this, 'networkFieldsMissing', !(get(this, 'config.vpcId') && get(this, 'config.subnetId')))

  }),
  authUrlChange:     observer('config.region', function () {
    const regionName = String(get(this, 'config.region'))
    let authURL = 'https://iam.' + regionName + '.otc.t-systems.com/v3'
    if (regionName === 'eu-ch2'){
      authURL = 'https://iam-pub.' + regionName + '.sc.otc.t-systems.com/v3'
    }
    set(this, 'config.authUrl', authURL)
  }),

  fieldsMissing: computed('step', 'authFieldsMissing', 'networkFieldsMissing', 'config.keyPair', function () {
    const step = get(this, 'step')
    if (get(this, 'editing')) {
      return false
    }
    switch (step) {
      case Steps.auth:
        return get(this, 'authFieldsMissing')
      case Steps.network:
        return get(this, 'networkFieldsMissing')
      case Steps.node:
        return !get(this, 'config.keyPair')
      default:
        return false
    }
  }),

  createLabel: computed('step', 'newVPC.create', 'newSubnet.create', function () {
    const step = get(this, 'step')
    switch (step) {
      case Steps.auth:
        return 'cluster.auth.next'
      case Steps.cluster:
        return 'cluster.cluster.next'
      case Steps.network:
        const newVPC = get(this, 'newVPC.create')
        const newSubnet = get(this, 'newSubnet.create')
        if (newVPC) {
          return 'cluster.newVPC'
        }
        if (newSubnet) {
          return 'cluster.newSubnet'
        }
        return 'cluster.network.next'
      case Steps.clusterEip:
        return 'cluster.masterFloatingIp.next'
      case Steps.node:
        return 'cluster.node.next'
      case Steps.disk:
        return 'cluster.disk.next'
      default:
        return 'Finish'
    }
  }),
  newMasterIP: true,  // just for initial value

  clusterNameChanged: observer('cluster.name', function () {
    const name = get(this, 'cluster.name')
    console.debug('Cluster name is ' + name + ' now')
    set(this, 'config.clusterName', name)
    set(this, 'config.name', name)
    set(this, 'config.displayName', name)
  }),

  languageChanged: observer('intl.locale', function () {
    const lang = get(this, 'intl.locale');
    if (lang) {
      this.loadLanguage(lang[0]);
    }
  }),

  getCloudConfig() {
    const regionName = String(get(this, 'config.region'))
    const authUrl = String(get(this, 'config.authUrl'))
    const cloudConfig = { auth: { auth_url:  authUrl}, region: regionName}
    const authMethod = get(this, 'authMethod')
    switch (authMethod) {
      case tokenAuth:
        cloudConfig.auth = {
          ...cloudConfig.auth,
          domain_name:  get(this, 'config.domainName'),
          username:     get(this, 'config.username'),
          password:     get(this, 'config.password'),
          project_name: get(this, 'config.projectName'),
        }
        break
      case akskAuth:
        cloudConfig.auth = {
          ...cloudConfig.auth,
          ak:           get(this, 'config.accessKey'),
          sk:           get(this, 'config.secretKey'),
          project_name: get(this, 'config.projectName'),
        }
        break
      default:
        throw `unknown auth method: ${authMethod}`
    }
    return cloudConfig
  },

  authClient() {
    const cloudConfig = this.getCloudConfig()
    const client = new oms.Client(cloudConfig)
    client.httpClient.beforeRequest.push(opts => {
      opts.headers.set('user-agent', navigator.userAgent)
      return opts
    })
    client.httpClient.beforeRequest.last = proxifyConfig
    client.akskAuthHeader = 'X-Api-Auth-Header'
    return client.authenticate().then(() => {
      set(this, 'client', client)
      set(this, 'authenticated', true)
      return resolve()
    }).catch((e) => {
      set(this, 'errors', [e])
      return reject()
    })
  },

  vpcChoices: computed('vpcs', function () {
    const vpcs = get(this, 'vpcs')
    if (!vpcs) {
      return []
    }
    return vpcs.map((vpc) => ({ label: `${vpc.name} (${vpc.id})`, value: vpc.id }))
  }),

  updateVPCs: observer('authenticated', function () {
    if (!get(this, 'authenticated')) {
      return
    }
    const srv = get(this, 'client').getService(oms.VpcV1)
    return srv.listVPCs().then(vpcs => {
      set(this, 'vpcs', vpcs)
    }).catch(() => {
      console.error('Failed to get VPCs')
      return reject()
    })
  }),

  subnetChoices: computed('subnets', function () {
    const subnets = get(this, 'subnets')
    if (!subnets) {
      return []
    }
    return subnets.map((sn) => ({ label: `${sn.name} (${sn.id})`, value: sn.id }))
  }),
  updateSubnets: function () {
    const vpcId = get(this, 'config.vpcId')
    if (!vpcId) {
      set(this, 'subnets', [])
      return resolve()
    }
    const srv = get(this, 'client').getService(oms.VpcV1)
    return srv.listSubnets(vpcId).then(subnets => {
      console.log('Subnets: ', subnets)
      set(this, 'subnets', subnets)
      return resolve()
    }).catch((e) => {
      console.error('Failed to get subnets: ', e)
      return reject()
    })
  },
  vpcUpdated:    observer('config.vpcId', function () {
    this.updateSubnets()
    set(this, 'config.subnetId', '')
  }),

  // flavor loading is tooo slow when triggered on AZ change,
  // so we preload it
  nodeFlavorsLoad: observer('authenticated', function () {
    if (!get(this, 'authenticated')) {
      return
    }
    const availabilityZones = azs(String(get(this, 'config.region')))
    const srv = get(this, 'client').getService(oms.ComputeV1)
    return srv.listFlavors().then(flavors => {
      const flavMap = {}
      availabilityZones.forEach(az => {
        flavMap[az] = flavors
          .filter(flavorInAZ(az))
          .map(a => ({ label: a.name, value: a.id }))
      })
      console.log(`Flavors: ${JSON.stringify(flavMap)}`)
      set(this, 'flavors', flavMap)
    })
  }),

  nodeFlavorChoices: computed('flavors', 'config.availabilityZone', function () {
    const az = get(this, 'config.availabilityZone')
    const flavorMap = get(this, 'flavors')
    return flavorMap[az]
  }),

  keyPairChoices: computed('authenticated', function () {
    if (!get(this, 'authenticated')) {
      return []
    }
    const srv = get(this, 'client').getService(oms.ComputeV2)
    return srv.listKeyPairs().then(keyPairs => {
      console.log('Received key pairs: ', keyPairs)
      return keyPairs.map(k => {
        let name = k.name
        if (name.length > 20) {
          name = name.substring(0, 17) + '...'
        }
        return {
          label: `${name} (${k.fingerprint})`,
          value: k.name
        }
      })
    }).catch(() => {
      console.log('Failed to load key pairs')
      return reject()
    })
  }),

  clusterFlavorChoices: computed('config.clusterType', function () {
    const typ = get(this, 'config.clusterType')
    console.log('Cluster type is ', typ)
    const prefix = typ === typeVM ? 'cce.s' : 'cce.t'
    const validFlavors = clusterFlavors.filter((v) => v.startsWith(prefix))
    console.log('Available cluster flavors: ', JSON.stringify(validFlavors))
    return a2f(validFlavors)
  }),

  maxNodes: computed('config.clusterFlavor', function () {
    const config = get(this, 'config.clusterFlavor')
    const [, , size] = config.split('.')
    switch (size) {
      case 'small':
        return 50
      case 'medium':
        return 200
      case 'large':
        return 1000
    }
  }),
  minNodes: 1,

  minBandwidth: 1,
  maxBandwidth: 1000,

  systemDiskLimit: [40, 1024],
  dataDiskLimit:   [100, 32768],

  networkCreationDisabled: computed('step', function () {
    const step = get(this, 'step')
    return step !== Steps.network
  }),

  nodeCountChange: observer('config.nodeCount', function () {
    const count = get(this, 'config.nodeCount')
    console.log(`Node count is set to ${count}`)
  }),

  loadLanguage(lang) {
    const translation = languages[lang];
    const intl = get(this, 'intl');

    intl.addTranslations(lang, translation);
    intl.translationsFor(lang);
    console.log('Added translation for ' + lang)
    set(this, 'refresh', false);
    next(() => {
      set(this, 'refresh', true);
      set(this, 'lanChanged', +new Date());
    });
  },

  toClusterConfig(cb) {
    setProperties(this, {
        'errors':             [],
        'config.username':    get(this, 'config.username').trim(),
        'config.domainName':  get(this, 'config.domainName').trim(),
        'config.projectName': get(this, 'config.projectName').trim(),
        'config.accessKey':   get(this, 'config.accessKey').trim(),
        'config.secretKey':   get(this, 'config.secretKey').trim(),
      }
    );
    return this.authClient().then(() => {
      console.log('Move to cluster configuration');
      set(this, 'step', Steps.cluster);
      cb(true)
    }).catch((e) => {
      console.log('Failed to authorize\n' + e)
      cb(false)
    })
  },
  toNetworkConfig(cb) {
    set(this, 'errors', [])
    set(this, 'step', Steps.network)
    cb(true)
  },
  toClusterEip(cb) {
    set(this, 'errors', [])
    set(this, 'step', Steps.clusterEip)
    cb(true)
  },
  toNodeConfig(cb) {
    set(this, 'errors', [])
    set(this, 'step', Steps.node)
    cb(true)
  },
  toDiskConfig(cb) {
    set(this, 'errors', [])
    set(this, 'step', Steps.disk)
    cb(true)
  },

  version: '%%DRIVERVERSION%%',
})
