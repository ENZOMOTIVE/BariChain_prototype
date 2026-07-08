const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const {Web3} = require('web3');
const fs = require('fs');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3001;

AWS.config.update({ region: 'eu-north-1' });
const s3 = new AWS.S3();
const bucketName = 'bari-chain';

const web3 = new Web3('https://rpc.ankr.com/bsc_testnet_chapel');
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "ph",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "temp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "turbidity",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "s3Url",
				"type": "string"
			}
		],
		"name": "storeMetadata",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "dataCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getMetadata",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "ph",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "temp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "turbidity",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "s3Url",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "metadataStore",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "ph",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "temp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "turbidity",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "s3Url",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Your contract ABI
const contractAddress = '0xd0ca8861053fec5a0d68b092c45ade91472cb5ec';
const contract = new web3.eth.Contract(contractABI, contractAddress);
const adminAddress = '0xe3F292F78B90127Ec3c90850c30388B13EfCFEbb';

app.use(bodyParser.json());
app.use(cors()); // Enable CORS

app.post('/admin/setCriteria', (req, res) => {
  const { ph, temp, turbidity } = req.body;
  const criteria = { ph, temp, turbidity };
  try {
    fs.writeFileSync('criteria.json', JSON.stringify(criteria));
    res.status(200).send({ message: 'Criteria set successfully' });
  } catch (error) {
    console.error('Error setting criteria:', error);
    res.status(500).send({ message: 'Error setting criteria', error });
  }
});

app.post('/user/submitData', async (req, res) => {
  const { ph, temp, turbidity } = req.body;
  let criteria;
  try {
    criteria = JSON.parse(fs.readFileSync('criteria.json'));
  } catch (error) {
    console.error('Error reading criteria file:', error);
    return res.status(500).send({ message: 'Error reading criteria file', error });
  }

  const result = {
    ph,
    temp,
    turbidity,
    quality: (ph > criteria.ph && temp > criteria.temp && turbidity > criteria.turbidity) ? 'Good' : 'Bad',
    timestamp: Date.now()
  };

  const resultJson = JSON.stringify(result);
  const s3Params = {
    Bucket: bucketName,
    Key: `results/${Date.now()}.json`,
    Body: resultJson,
    ContentType: 'application/json'
  };

  try {
    const s3Data = await s3.upload(s3Params).promise();
    const tx = await contract.methods.storeMetadata(ph, temp, turbidity, s3Data.Location).send({ from: adminAddress });
    res.status(200).send({
      message: 'Data submitted successfully',
      s3Url: s3Data.Location,
      result,
      txHash: tx.transactionHash
    });
  } catch (error) {
    console.error('Error uploading file to S3 or storing metadata on blockchain:', error);
    res.status(500).send({ message: 'Error uploading file to S3 or storing metadata on blockchain', error });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Bari Chain Prototype');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
