/* * */

const { readFileSync } = require('fs');
const { createTunnel } = require('tunnel-ssh');
const { MongoClient, ObjectId } = require('mongodb');

/* * */

class REALTIMEDB {
  //

  sshTunnelConnection = false;

  constructor() {
    this.tunnelOptions = {
      autoClose: true,
    };
    this.serverOptions = {
      port: process.env.REALTIMEDB_TUNNEL_LOCAL_PORT,
    };
    this.sshOptions = {
      host: process.env.REALTIMEDB_SSH_HOST,
      port: process.env.REALTIMEDB_SSH_PORT,
      username: process.env.REALTIMEDB_SSH_USERNAME,
      privateKey: readFileSync(process.env.REALTIMEDB_SSH_KEY_PATH),
    };
    this.forwardOptions = {
      srcAddr: process.env.REALTIMEDB_TUNNEL_LOCAL_HOST,
      srcPort: process.env.REALTIMEDB_TUNNEL_LOCAL_PORT,
      dstAddr: process.env.REALTIMEDB_TUNNEL_REMOTE_HOST,
      dstPort: process.env.REALTIMEDB_TUNNEL_REMOTE_PORT,
    };
  }

  async setupSshTunnel() {
    return new Promise((resolve, reject) => {
      try {
        // Check if there is already an active SSH connection
        if (this.sshTunnelConnection || global._sshTunnelConnection) return resolve();
        // Setup the tunnel connection
        createTunnel(this.tunnelOptions, this.serverOptions, this.sshOptions, this.forwardOptions)
          .then((tunnel) => {
            if (process.env.NODE_ENV === 'development') global._sshTunnelConnection = tunnel;
            else this.sshTunnelConnection = tunnel;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        console.error('Error connecting to REALTIMEDB (SSH Tunnel):', error);
        reject(error);
      }
    });
  }

  async connect() {
    try {
      // Establish SSH tunnel
      await this.setupSshTunnel();
      // Setup MongoDB connection
      this.client = new MongoClient(process.env.REALTIMEDB_MONGODB_URI, {
        minPoolSize: 2,
        maxPoolSize: 200,
        directConnection: true,
        readPreference: 'nearest',
      });
      // Connect to MongoDB client
      await this.client.connect();
      // Setup databases
      this.CoreManagement = this.client.db('CoreManagement');
      this.FileManagement = this.client.db('FileManagement');
      this.SalesManagement = this.client.db('SalesManagement');
      this.ValidationsManagement = this.client.db('ValidationsManagement');
      this.LocationManagement = this.client.db('LocationManagement');
      // Setup collections
      this.VehicleEvents = this.CoreManagement.collection('VehicleEvents');
      this.TransactionEntity = this.FileManagement.collection('transactionEntity');
      this.SalesEntity = this.SalesManagement.collection('salesEntity');
      this.ValidationEntity = this.ValidationsManagement.collection('validationEntity');
      this.LocationEntity = this.LocationManagement.collection('locationEntity');
    } catch (error) {
      console.error('Error connecting to REALTIMEDB (MongoDB):', error);
    }
  }

  toObjectId(string) {
    return new ObjectId(string);
  }

  //
}

/* * */

module.exports = new REALTIMEDB();
