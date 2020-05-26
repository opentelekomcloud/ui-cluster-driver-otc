/*!!!!!!!!!!!Do not change anything between here (the DRIVERNAME placeholder will be automatically replaced at buildtime)!!!!!!!!!!!*/
// https://github.com/rancher/ui/blob/master/lib/shared/addon/mixins/cluster-driver.js
import ClusterDriver from 'shared/mixins/cluster-driver';

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
const reject = Ember.RSVP.reject;

const equal = Ember.computed.equal;
const next = Ember.run.next;
const setProperties = Ember.setProperties;

/*!!!!!!!!!!!GLOBAL CONST END!!!!!!!!!!!*/
const domains = '*.otc.t-systems.com'
const clusterFlavors = [
  'cce.s1.small',
  'cce.s1.medium',
  'cce.s1.large',
  'cce.s2.small',
  'cce.s2.medium',
  'cce.s2.large',
  'cce.t1.small',
  'cce.t1.small',
  'cce.t1.medium',
  'cce.t1.large',
  'cce.t2.small',
  'cce.t2.medium',
  'cce.t2.large',
]
const defaultClusterFlavor = 'cce.s1.medium'
const clusterFlavorDetails = `Cluster flavor, which cannot be changed after the cluster is created.

    cce.s1.small: small-scale, single-master VM cluster (≤ 50 nodes)
    cce.s1.medium: medium-scale, single-master VM cluster (≤ 200 nodes)
    cce.s1.large: large-scale, single-master VM cluster (≤ 1,000 nodes)
    cce.t1.small: small-scale, single-master BMS cluster (≤ 10 nodes)
    cce.t1.medium: medium-scale, single-master BMS cluster (≤ 100 nodes)
    cce.t1.large: large-scale, single-master BMS cluster (≤ 500 nodes)
    cce.s2.small: small-scale, high availability VM cluster (≤ 50 nodes)
    cce.s2.medium: medium-scale, high availability VM cluster (≤ 200 nodes)
    cce.s2.large: large-scale, high availability VM cluster (≤ 1,000 nodes)
    cce.t2.small: small-scale, high availability BMS cluster (≤ 10 nodes)
    cce.t2.medium: medium-scale, high availability BMS cluster (≤ 100 nodes)
    cce.t2.large: large-scale, high availability BMS cluster (≤ 500 nodes)
`
const instanceFlavorReference = 'https://docs.otc.t-systems.com/en-us/usermanual/ecs/en-us_topic_0177512565.html'
const clusterTypes = [ // only VM is implemented for now
  {
    label: 'Virtual Machine',
    value: 'VirtualMachine'
  },
  {
    label: 'Bare Metal',
    value: 'BareMetal'
  },
]
const os = "EulerOS 2.5"
const diskTypes = ['SATA', 'SAS', 'SSD']
const availabilityZones = [
  'eu-de-01',
  'eu-de-02',
  'eu-de-03',
]
const k8sVersions = {
  'latest': '',
  'v1.13':  'v1.13.10-r0',
  'v1.11':  'v1.11.7-r2',
}
const defaultBandwidth = 100
const defaultFloatingIPType = '5_bgp'
const defaultShareType = 'PER'
const defaultCIDR = "192.168.0.0/16"
const authModes = {
  RBAC: 'rbac',
  x509: 'x509',
}
const networkModes = {
  'Overlay L2':      'overlay_l2',
  'Underlay IPVLAN': 'underlay_ipvlan',
  'VPC Router':      'vpc-router,',
}
const defaultNetworkMode = 'overlay_l2'
const authURL = 'https://iam.eu-de.otc.t-systems.com/v3/auth/tokens'

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

function field(label, placeholder = '', detail = '') {
  return {
    label:       label,
    placeholder: placeholder,
    detail:      detail,
  }
}

function chapter(title, detail = '', next) {
  return {
    title:  title,
    next:   next,
    detail: detail,
  }
}

/**
 * Convert external URL to rancher meta proxy's URL
 * @param {string} url
 * @returns {string}
 */
function viaProxy(url) {
  url = url.replace('://', ':/')
  return `/meta/proxy/${url}`
}


/**
 * Select endpoint for current region for service
 * @param service - object representing endpoint in token
 * @param {string} region
 */
function withRegion(service, region) {
  const endpoint = service.endpoints.find(ep => ep.region === region)
  return endpoint.url
}

const languages = {
  'en-us': {
    cluster: {
      auth:                    chapter(
        'Account Configuration',
        'OTC credentials',
        'Next: Configure Cluster',
      ),
      'ak/sk':                 field('Use AK/SK auth'),
      // ak/sk auth:
      accessKey:               field('Access Key ID'),
      secretKey:               field('Secret Access key'),
      // token-based auth:
      token:                   field('Token'),
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
      containerNetworkCIDR:    field('Container Network CIDR'),
      // Cluster eip options
      masterFloatingIP:        chapter(
        'Cluster Floating IP',
        'Floating IP configuration for master node',
        'Next: Node Configuration'
      ),
      clusterFloatingIP:       field(
        'Existing floating IP',
        '0.0.0.0',
      ),
      clusterEIPBandwidthSize: field(
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
      availabilityZone:        field('Availability Zone'),
      useExistingKeyPair:      field('Use existing key pair'),
      keyPair:                 field('SSH Key Pair'),
      publicKey:               field('Nodes public key'),
      // disk config
      disk:                    chapter(
        'Disks Configuration',
        'Configure the disks attached to node instances',
        'Finish',
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
      // LB bandwidth config
      loadbalancer:            chapter(
        'Loadbalancer Bandwidth',
        'Configure LB bandwidth',
        'Finish & Create Cluster'
      ),
      createLoadBalancer:      field('Use load balancer for node access'),
      newEIP:                  field('Create New Floating IP'),
      oldEIP:                  field('Use Existing Floating IP'),
      lbFloatingIP:            field(
        'Existing Floating IP',
        '0.0.0.0',
      ),
      lbBandwidth:             field(
        'Bandwidth Size (MBit/s)',
      ),
    }
  }
};
// cluster configuration steps
const Steps = Object.freeze({
  auth:       1,
  cluster:    2,
  network:    3,
  clusterEIP: 4,
  node:       5,
  disk:       6,
  lbEIP:      7,
})

/*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
export default Ember.Component.extend(ClusterDriver, {
  driverName:  '%%DRIVERNAME%%',
  configField: '%%DRIVERNAME%%EngineConfig', // 'otcEngineConfig'
  config:      alias('cluster.%%DRIVERNAME%%EngineConfig'),
  app:         service(),
  router:      service(),
  /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/
  intl:        service(),

  isNew:      equal('mode', 'new'),
  editing:    equal('mode', 'edit'),
  lanChanged: null,
  refresh:    false,
  step:       Steps.auth,

  token:        {},
  vpcs:         [],
  subnets:      [],
  vpcEndpoint:  '',
  novaEndpoint: '',

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

    let config = get(this, 'config');
    let configField = get(this, 'configField');

    if (!config) {
      config = get(this, 'globalStore').createRecord({
        type:                    configField,
        // authentication
        // ak/sk
        accessKey:               '',
        secretKey:               '',
        // token auth
        token:                   '',
        username:                '',
        password:                '',
        domainName:              '',
        projectName:             '',
        region:                  'eu-de',
        // cluster settings
        clusterName:             '',
        displayName:             '',
        clusterVersion:          '',
        clusterType:             'VirtualMachine',
        clusterFlavor:           defaultClusterFlavor,
        nodeCount:               2,
        clusterLabels:           ['origin=rancher-otc'],
        // cluster networking
        vpcID:                   '',
        subnetID:                '',
        containerNetworkMode:    defaultNetworkMode,
        containerNetworkCIDR:    defaultCIDR,
        // master eip
        clusterFloatingIP:       '',
        clusterEIPBandwidthSize: defaultBandwidth,
        clusterEIPType:          defaultFloatingIPType,
        clusterEIPShareType:     defaultShareType,
        // nodes auth
        authenticationMode:      authModes.RBAC,
        authProxyCA:             '',
        // nodes config
        availabilityZone:        '',
        nodeFlavor:              '',
        nodeOS:                  os,
        keyPair:                 '',
        // node disks
        rootVolumeSize:          40,
        dataVolumeSize:          100,
        rootVolumeType:          diskTypes[0],
        dataVolumeType:          diskTypes[0],
        // LB config
        createLoadBalancer:      true,
        lbFloatingIP:            '',
        lbEIPBandwidthSize:      defaultBandwidth,
        lbEIPType:               defaultFloatingIPType,
        lbEIPShareType:          defaultShareType,
      });
      set(this, 'config', config);
      set(this, `cluster.${configField}`, config);
      set(this, 'cluster.driver', get(this, 'driverName'));
    }
  },


  actions: {
    save(cb) {
      const step = get(this, 'step')
      switch (step) {
        case Steps.auth:
          return this.toClusterConfig(cb)
        case Steps.cluster:
          return this.toNetworkConfig(cb)
        case Steps.network:
          return this.toNodeConfig(cb)
        default:
          console.log('Saving driver with config: \n' + JSON.stringify(get(this, 'cluster')))
          this.send('driverSave', cb);
      }
    },
    cancel() {
      // probably should not remove this as its what every other driver uses to get back
      get(this, 'router').transitionTo('global-admin.clusters.index');
    },
  },


  // Add custom validation beyond what can be done from the config API schema
  validate() {
    // Get generic API validation errors
    this._super();
    const errors = get(this, 'errors') || [];
    if (!get(this, 'cluster.name')) {
      errors.push('Name is required');
    }

    // Set the array of errors for display,
    // and return true if saving should continue.
    if (get(errors, 'length')) {
      set(this, 'errors', errors);
      return false;
    } else {
      set(this, 'errors', null);
      return true;
    }
  },

  // Any computed properties or custom logic can go here
  azChoices:             a2f(availabilityZones),
  clusterVersionChoices: m2f(k8sVersions),
  clusterFlavorChoices:  a2f(clusterFlavors),
  clusterTypeChoices:    clusterTypes,
  diskTypeChoices:       a2f(diskTypes),
  networkModeChoices:    m2f(networkModes),

  fieldsMissing: computed('step', function () {
    const step = get(this, 'step')
    switch (step) {
      case Steps.auth:
        return this.authFieldsMissing
      case Steps.cluster:
        return 'cluster.cluster.next'
      case Steps.network:
        return 'cluster.network.next'
      case Steps.node:
        return 'cluster.node.next'
      case Steps.disk:
        return 'cluster.disk.next'
    }
  }),

  authFieldsMissing: computed('config.password', 'config.username', 'config.projectName', 'config.domainName', function () {
    return !(get(this, 'config.password') && get(this, 'config.username') && get(this, 'config.projectName') && get(this, 'config.domainName'));
  }),


  createLabel:       computed('step', function () {
    const step = get(this, 'step')
    switch (step) {
      case Steps.auth:
        return 'cluster.auth.next'
      case Steps.cluster:
        return 'cluster.cluster.next'
      case Steps.network:
        return 'cluster.network.next'
      case Steps.node:
        return 'cluster.node.next'
      case Steps.disk:
        return 'cluster.disk.next'
      default:
        return 'UNKNOWN STEP'
    }
  }),
  needLB:            computed('config.createLoadBalancer', function () {
    return get(this, 'config.createLoadBalancer')
  }),
  newEIP:            true,
  needNewClusterEIP: computed('needLB', 'newEIP', function () {
    return get(this, 'needLB') && get(this, 'newEIP')
  }),

  clusterNameChanged: observer('cluster.name', function () {
    const name = get(this, 'cluster.name')
    console.log('Cluster name is ' + name + ' now')
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

  handleEIPFields(val) {
    set(this, 'newOrExistingEIP', val)
  },

  commonHeaders() {
    const token = get(this, 'token')
    console.log('Stored token: ' + token)
    return {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      'X-Auth-Token': token,
    }
  },

  authToken() {
    const data = {
      "auth": {
        "identity": {
          "methods":  [
            "password"
          ],
          "password": {
            "user": {
              "name":     get(this, 'config.username'),
              "password": get(this, 'config.password'),
              "domain":   {
                "name": get(this, 'config.domainName'),
              }
            }
          }
        },
        "scope":    {
          "project": {
            "name": get(this, 'config.projectName'),
          }
        }
      }
    }
    console.log('Authorizing client: ' + JSON.stringify(data))
    return get(this, 'globalStore').rawRequest({
      headers: { 'Content-Type': 'application/json' },
      url:     viaProxy(authURL),
      method:  'POST',
      data:    data,
    }).then((resp) => {
      const token = resp.body.token
      console.log('Received token', JSON.stringify(token))
      // fill endpoints
      token.catalog.forEach((srv) => {
        const region = get(this, 'config.region')
        switch (srv.name) {
          case 'nova':
            console.log('nova: ', JSON.stringify(srv))
            set(this, 'novaEndpoint', withRegion(srv, region))
            break
          case 'vpc':
            console.log('vpc: ', JSON.stringify(srv))
            set(this, 'vpcEndpoint', withRegion(srv, region))
            break
        }
      })
      const b64Token = resp.headers.map['x-subject-token']
      set(this, 'token', b64Token)
      return token
    }).catch((e) => {
      set(this, 'errors', [JSON.stringify(e)])
      return reject()
    })
  },

  vpcChoices: computed('token', function () {
    const endpoint = viaProxy(get(this, 'vpcEndpoint'))
    console.log('vpc endpoint: ' + endpoint)
    return get(this, 'globalStore').rawRequest({
      headers: this.commonHeaders(),
      url:     endpoint + '/vpcs',
      method:  'GET',
    }).then((resp) => {
      const vpcs = resp.body.vpcs
      return vpcs.map((vpc) => ({ label: `${vpc.name}(${vpc.id})`, value: vpc.id }))
    }).catch(() => {
      return reject()
    })
  }),


  subnetChoices: computed('config.vpcID', function () {
    const vpcID = get(this, 'config.vpcID')
    if (vpcID === '') {
      return []
    }
    const endpoint = viaProxy(get(this, 'vpcEndpoint'))
    return get(this, 'globalStore').rawRequest({
      headers: this.commonHeaders(),
      url:     `${endpoint}/subnets?vpc_id=${vpcID}`,
      method:  'GET',
    }).then((resp) => {
      let subnets = resp.body.subnets
      console.log('Subnets: ', subnets)
      subnets = subnets.map((sn) => ({ label: `${sn.name}(${sn.id})`, value: sn.id }))
      return subnets
    }).catch(() => {
      return []
    })
  }),

  nodeFlavorChoices: computed('token', function () {
    const endpoint = viaProxy(get(this, 'novaEndpoint'))
    return get(this, 'globalStore').rawRequest({
      method:  'GET',
      headers: this.commonHeaders(),
      url:     `${endpoint}/flavors`
    }).then((resp) => {
      let flavors = resp.body.flavors
      console.log('Flavors: ', flavors)
      return flavors.map((f) => ({ label: f.name, value: f.id }))
    }).catch(() => {
      console.log('Failed to load node flavors')
      return reject()
    })
  }),

  keyPairChoices: computed('token', function () {
    if (get(this, 'token') === '') {
      return []
    }
    const endpoint = viaProxy(get(this, 'novaEndpoint'))
    return get(this, 'globalStore').rawRequest({
      method:  'GET',
      headers: this.commonHeaders(),
      url:     `${endpoint}/os-keypairs`
    }).then((resp) => {
      let keypairs = resp.body.keypairs
      console.log('Received key pairs: ', keypairs)
      return keypairs.map((k) => {
        let name = k.keypair.name
        if (name.length > 20) {
          name = name.substring(0, 17) + '...'
        }
        return {
          label: `${name} (${k.keypair.fingerprint})`,
          value: k.keypair.name
        }
      })
    }).catch(() => {
      console.log('Failed to load key pairs')
      return reject()
    })
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
      }
    );
    return this.authToken().then(() => {
      console.log('Move to cluster configuration');
      set(this, 'step', Steps.cluster);
      cb(true)
    }).catch((e) => {
      console.log('Failed to authorize\n' + e)
      cb(false)
    })
  },
  toNetworkConfig(cb) {
    setProperties(this, {
        'errors':               [],
        'config.clusterFlavor': get(this, 'config.clusterFlavor').trim(),
      }
    );
    set(this, 'step', Steps.network)
    cb(true)
  },
  toNodeConfig(cb) {
    set(this, 'errors', [])
    set(this, 'step', Steps.node)
    cb(true)
  }

})
;
