import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://okunay:oracle@cluster0.tgwry.mongodb.net/?appName=Cluster0";


const mongocon = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectBd() {
  await mongocon.connect();
  console.log("MongoDB connected!");
  return mongocon;
}

connectBd();

export default mongocon;