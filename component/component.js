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
const authModes = {
  RBAC: 'rbac',
  x509: 'x509',
}
const networkModes = {
  'Overlay L2':      'overlay_l2',
  'Underlay IPVLAN': 'underlay_ipvlan',
  'VPC Router':      'vpc-router,',
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

function field(label, placeholder = '', detail = '') {
  return {
    label:       label,
    placeholder: placeholder,
    detail:      detail,
  }
}

function chapter(title, next, detail = '') {
  return {
    title:  title,
    next:   next,
    detail: detail,
  }
}

const languages = {
  'en-us': {
    cluster: {
      auth:               chapter(
        'OTC Account Configuration',
        'Next: Configure Cluster',
      ),
      'ak/sk':            field('Use AK/SK auth'),
      // ak/sk auth:
      accessKey:          field('Access Key ID'),
      secretKey:          field('Secret Access key'),
      // token-based auth:
      token:              field('Token'),
      domainName:         field('Domain Name', 'OTC00000000000000000XXX'),
      username:           field('Username'),
      password:           field('Password'),
      projectName:        field('Project Name', 'eu-de'),
      // cluster config
      cluster:            chapter(
        'Cluster Configuration',
        'Next: Network configuration',
        'General cluster configuration'
      ),
      clusterType:        field(
        'Cluster Type'
      ),
      clusterVersion:     field(
        'Kubernetes Version',
        'Version of kubernetes installed on cluster'
      ),
      clusterFlavor:      field(
        'Cluster Flavor',
        '',
        clusterFlavorDetails,
      ),
      clusterLabels:      field('Cluster Labels'),
      nodeCount:          field('Node Count'),
      // network info
      network:            chapter(
        'Network configuration',
        'Next: Nodes basic configuration',
        'Networking configuration',
      ),
      vpcName:            field(
        'Virtual Private Cloud',
        'vpc-01',
        'Name of VPC (existing or new)',
      ),
      subnetName:         field(
        'Subnet',
        'subnet-01',
        'Name of Subnet (existing or new)',
      ),
      networkMode:        field('Network Mode'),
      networkCIDR:        field('Cluster Network CIDR', '192.168.0.0/20'),
      // node config
      node:               chapter(
        'Node Configuration',
        'Next: Nodes disk configuration',
        'Configure instances used as cluster nodes',
      ),
      nodeFlavor:         field(
        'Node Flavor',
        '',
        `See ${instanceFlavorReference} for available flavors`,
      ),
      availabilityZone:   field('Availability Zone'),
      useExistingKeyPair: field('Use existing key pair'),
      keyPair:            field('SSH Key Pair'),
      publicKey:          field('Nodes public key'),
      // disk config
      disk:               chapter(
        'Disks Configuration',
        'Finish',
        'Configure the disks attached to node instances',
      ),
      rootDiskSize:       field(
        'Root Disk Size, GB',
        '40',
        'Minimum 40 GB'
      ),
      rootDiskType:       field('Root Disk Type'),
      dataDiskSize:       field(
        'Data Disk Size, GB',
        '100',
        'Minimum 100 GB'
      ),
      dataDiskType:       field('Data Disk Type'),
    }
  }
};
// cluster configuration steps
const Steps = Object.freeze({ auth: 1, cluster: 2, network: 3, node: 4, disk: 5 })

/*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
export default Ember.Component.extend(ClusterDriver, {
  driverName:  '%%DRIVERNAME%%',
  configField: '%%DRIVERNAME%%EngineConfig', // 'googleKubernetesEngineConfig'
  app:         service(),
  router:      service(),
  /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/
  intl:        service(),
  config:      alias('cluster.%%DRIVERNAME%%EngineConfig'),

  isNew:                equal('mode', 'new'),
  editing:              equal('mode', 'edit'),
  lanChanged:           null,
  refresh:              false,
  step:                 Steps.auth,
  defaultClusterFlavor: 'cce.s1.medium',
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
        type:               configField,
        // authentication
        // ak/sk
        accessKey:          '',
        secretKey:          '',
        // token auth
        token:              '',
        username:           '',
        password:           '',
        domainName:         '',
        projectName:        '',
        region:             'eu-de',
        // cluster settings
        clusterName:        '',
        clusterVersion:     '',
        clusterType:        'VirtualMachine',
        clusterFlavor:      '',
        nodeCount:          2,
        clusterLabels:      [],
        // cluster networking
        vpcName:            '',
        subnetName:         '',
        networkMode:        '',
        networkCIDR:        '',
        // nodes auth
        authenticationMode: '',
        authProxyCA:        '',
        clusterFloatingIP:  '',
        // nodes config
        availabilityZone:   '',
        nodeFlavor:         '',
        nodeOS:             os,
        keyPair:            '',
        // node disks
        rootDiskSize:       40,
        dataDiskSize:       100,
        rootDiskType:       diskTypes[0],
        dataDiskType:       diskTypes[0],
        // LB bandwidth
        useLBFloatingIP:    true,
        lbFloatingIP:       '',
        bandwidthInMbps:    1000,
        floatingIPType:     'bgp_5',
        shareType:          'PER',
      });
      set(this, 'config', config);
    }
  },


  actions: {
    save(cb) {
      const step = get(this, 'step')
      switch (step) {
        case Steps.auth:
          return this.toClusterConfig(cb);
        case Steps.cluster:
          return this.toNetworkConfig(cb);
      }
      //set(this, 'isSavingCluster', true);
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
    var errors = get(this, 'errors') || [];
    if (!get(this, 'cluster.name')) {
      errors.push('Name is required');
    }

    // Add more specific errors

    if (parseInt(get(this, 'config.rootDiskSize'), 40) < 40) {
      errors.push('Root disk must me at least 40 GB')
    }

    if (parseInt(get(this, 'config.dataDiskSize')) < 100) {
      errors.push('Data disk must me at least 100 GB')
    }

    // Check something and add an error entry if it fails:
    // if ( parseInt(get(this, 'config.memorySize'), defaultRadix) < defaultBase ) {
    //   errors.push('Memory Size must be at least 1024 MB');
    // }

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
  defaultClusterType:    clusterTypes[0].label,
  diskTypeChoices:       a2f(diskTypes),
  networkModeChoices:    m2f(networkModes),

  fieldsMissing: computed('step', function () {
    const step = get(this, 'step')
    switch (step) {
      case Steps.auth:
        return get(this, 'authFieldsMissing')
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


  createLabel: computed('step', function () {
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
    }
  }),


  languageChanged:    observer('intl.locale', function () {
    const lang = get(this, 'intl.locale');
    if (lang) {
      this.loadLanguage(lang[0]);
    }
  }),
  clusterNameChanged: observer('cluster.name', function () {
    const clusterName = get(this, 'cluster.name');
    set(this, 'config.clusterName', clusterName);
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
        'errors':             null,
        'config.username':    get(this, 'config.username').trim(),
        'config.domainName':  get(this, 'config.domainName').trim(),
        'config.projectName': get(this, 'config.projectName').trim(),
      }
    );
    set(this, 'step', Steps.cluster)
    console.log('Move to cluster configuration')
    cb(true)
  },
  toNetworkConfig(cb) {
    setProperties(this, {
        'errors':               null,
        'config.clusterFlavor': get(this, 'config.clusterFlavor').trim(),
      }
    );
    set(this, 'step', Steps.network)
    console.log('Move to network configuration')
    cb(true)
  },

});
