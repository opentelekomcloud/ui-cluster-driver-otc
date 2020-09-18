const $ = Ember.$
const appjson = 'application/json;charset=utf-8'
const authURL = 'https://iam.eu-de.otc.t-systems.com/v3/auth/tokens'

const defaultDNS = ['100.125.4.25', '8.8.8.8']

const resolve = Ember.RSVP.resolve;
const Promise = Ember.RSVP.Promise;
const reject = Ember.RSVP.reject;

/**
 * Select endpoint for current region for service
 * @param service - object representing endpoint in token
 * @param {string} region
 */
function withRegion(service, region) {
  const endpoint = service.endpoints.find(ep => ep.region === region)
  return endpoint.url
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


function otcClient(region) {
  return {
    vpcEndpoint:  '',
    novaEndpoint: '',
    ecsEndpoint:  '',

    commonHeaders: {
      accepts:     appjson,
      contentType: appjson,
    },

    /**
     * Authenticate client setting 'X-Auth-Token' header
     * @param {string} username
     * @param {string} password
     * @param {string} domainName
     * @param {string} projectName
     */
    authenticate(username, password, domainName, projectName) {
      const json = JSON.stringify({
        "auth": {
          "identity": {
            "methods":  [
              "password"
            ],
            "password": {
              "user": {
                "name":     username,
                "password": password,
                "domain":   {
                  "name": domainName,
                }
              }
            }
          },
          "scope":    {
            "project": {
              "name": projectName,
            }
          }
        }
      })

      return $.post({
        url:         viaProxy(authURL),
        contentType: appjson,
        data:        json,
      }).then((response, _, jqXHR) => {
        const token = response.token
        console.log('Received token', JSON.stringify(token))
        // fill endpoints
        token.catalog.forEach((srv) => {
          switch (srv.name) {
            case 'nova':
              console.log('nova: ', JSON.stringify(srv))
              this.novaEndpoint = viaProxy(withRegion(srv, region))
              break
            case 'vpc':
              console.log('vpc: ', JSON.stringify(srv))
              this.vpcEndpoint = viaProxy(withRegion(srv, region))
              break
            case 'ecs':
              console.log('ecs: ', JSON.stringify(srv))
              this.ecsEndpoint = viaProxy(withRegion(srv, region))
              break
          }
        })
        const tokenID = jqXHR.getResponseHeader('x-subject-token')
        this.commonHeaders['X-Auth-Token'] = tokenID
        return resolve(tokenID)
      }).catch(e => {
        return reject(e.responseText)
      })
    },

    listNodeFlavors() {
      return $.get({
        headers: this.commonHeaders,
        url:     this.ecsEndpoint + '/cloudservers/flavors'
      }).then(body => {
        return resolve(body.flavors)
      }).catch(e => {
        return reject(e.responseText)
      })
    },

    /**
     * Find VPC for project
     * @return {Promise<Object[]>} list of VPC objects
     */
    listVPCs() {
      return $.get({
        headers: this.commonHeaders,
        url:     this.vpcEndpoint + '/vpcs',
      }).then(response => {
        return resolve(response.vpcs)
      }).catch(e => {
        return reject(e.responseText)
      })
    },

    /**
     * Find subnets for given VPC
     * @param {string} vpcID
     * @return {Promise<object[]>} list of subnet objects
     */
    listSubnets(vpcID) {
      return $.get({
        headers: this.commonHeaders,
        url:     `${this.vpcEndpoint}/subnets?vpc_id=${vpcID}`,
      }).then(response => {
        return resolve(response.subnets)
      }).catch(e => {
        return reject(e.responseText)
      })
    },

    /**
     * Wait until VPC is available
     * @param {string} vpcID
     * @param endTime
     * @return {Promise<void>}
     */
    waitForVPCUp(vpcID, endTime) {
      if (!endTime) {
        endTime = new Date().getTime() + 10 * 1000
      }
      if (new Date().getTime() > endTime) {
        return reject(new Error('Timeout reached'))
      }
      return $.get({
        headers: this.commonHeaders,
        url:     `${this.vpcEndpoint}/vpcs/${vpcID}`,
      }).then(data => {
        if (data.vpc.status === 'OK') {
          return resolve()
        }
        return new Promise(resolve => setTimeout(() => resolve(this.waitForVPCUp(vpcID, endTime)), 1000))
      }).catch(e => {
        return reject(e.responseText)
      })

    },

    /**
     * Create new VPC and wait until it's available
     * @param {string} name
     * @param {string} cidr
     * @return {Promise<string>} VPC ID
     */
    createVPC(name, cidr) {
      const data = {
        vpc: {
          name: name,
          cidr: cidr
        }
      }
      return $.post({
        headers: this.commonHeaders,
        url:     `${this.vpcEndpoint}/vpcs`,
        data:    JSON.stringify(data)
      }).then(data => {
        const vpcID = data.vpc.id
        return this.waitForVPCUp(vpcID).then(() => resolve(vpcID)).catch((e) => reject(e))
      }).catch(e => {
        return reject(e.responseText)
      })
    },

    /**
     * Wait until subnet in status ACTIVE
     * @param {string} subnetID
     * @param endTime
     * @return {Promise<void>}
     */
    waitForSubnetUp(subnetID, endTime) {
      if (!endTime) {
        endTime = new Date().getTime() + 10 * 1000
      }
      if (new Date().getTime() > endTime) {
        return reject(new Error('Timeout reached'))
      }
      return $.get({
        headers: this.commonHeaders,
        url:     `${this.vpcEndpoint}/subnets/${subnetID}`
      }).then(data => {
        if (data.subnet.status === 'ACTIVE') {
          console.log('Subnet is active')
          return
        }
        return new Promise(resolve => setTimeout(() => resolve(this.waitForSubnetUp(subnetID, endTime)), 1000))
      }).catch(e => {
        return reject(e.responseText)
      })
    },

    /**
     * Create new subnet instance
     * @param {string} vpcID
     * @param {string} name
     * @param {string} cidr
     * @param {string} gatewayIP
     * @return {Promise<string>} subnet ID
     */
    createSubnet(vpcID, name, cidr, gatewayIP) {
      const data = {
        subnet: {
          name:       name,
          cidr:       cidr,
          gateway_ip: gatewayIP,
          vpc_id:     vpcID,
          dnsList:    defaultDNS
        }
      }
      return $.post({
        headers: this.commonHeaders,
        url:     `${this.vpcEndpoint}/subnets`,
        data:    JSON.stringify(data)
      }).then(data => {
        const subnetID = data.subnet.id
        return this.waitForSubnetUp(subnetID).then(() => resolve(subnetID)).catch((e) => reject(e))
      }).catch(e => {
        return reject(e.responseText)
      })
    },

    /**
     * List existing key pairs
     * @return {Promise<Object[]>} key pairs
     */
    listKeyPairs() {
      return $.get({
        headers: this.commonHeaders,
        url:     `${this.novaEndpoint}/os-keypairs`,
      }).then(data => {
        return resolve(data.keypairs)
      }).catch(e => {
        return reject(e)
      })
    },

  }
}
