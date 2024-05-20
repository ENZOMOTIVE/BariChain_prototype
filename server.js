//backend logic

const express = require('express');
const bodyParser = require('body-parser'); // we used this to handle JSON files   
const AWS = require('aws-sdk');  // to interact with AWS  this is a software toolkit
const fs = require('fs');  // file system module
const app = express();   // initialize a new express application

const Web3 = require('web3'); // this is a javasript library which will be used to interact with the Blockchain

app.use(bodyParser.json()); // config the express application to use bodyParser middleware to parse JSON-formatted request bodies.


//AWS S3 config
AWS.config.update({region: "Europe (Stockholm) eu-north-1"});
const s3 = new AWS.S3();
const bucketName = 'bari-chain';

//Blockchain Configuration
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))  // We have runned ganache locally
const contractABI = [];  // we put the contract ABI which we generated in Remix
const contractAddress = ''; // deployement address of the contract
const contract = new web3.eth.Contract(contractABI, contractAddress);
const adminAddress = ''; //Ethereum address of the admin


// Endpoint for the admin to define validation criteria
app.post('/admin/setCriteria', (req, res) => {
    const { ph, temp, turbidity } = req.body;
    const criteria = { ph, temp, turbidity };
    fs.writeFileSync('criteria.json', JSON.stringify(criteria));
    res.status(200).send({ message: 'Criteria set successfully'});
});

//Endpoint for the user to submit the data related to water quality
app.post('/user/submitData', async (req, res) => {
    const {ph, temp, turbidity} = req.body;
    const criteria = JSON.parse(fs.readFileSync('criteria.json'));

    const result = {
        ph,
        temp,
        turbidity,
        quality: (ph > criteria.ph && temp > criteria.temp && turbidity > criteria.turbidity) ? 'Good' : 'Bad',
        timestamp: DataTransfer.now()
    };

    const resultJson = JSON.stringify(result);
    const s3Params = {
        Bucket: bari-chain,
        Key: 'results/${Date.now()}.json',
        Body: resultJson,
        ContentType: 'application/json'
    };

    try {
        s3Data = await s3.upload(s3Params).promise();
        const tx = await contract.methods.storeMetadata(ph, temp,turbidity, s3Data.Location).send({from: adminAddress});
        res.status(200).send({
            message: 'Data submitted successfully',
            s3Url: s3Data.Location,
             result,
             txHash: tx.transactionHash
        });
    }
    catch (error) {
        res.status(500).send({message: 'Error uploading file to S3 or storing metadata on blockchain', error});

    }

}) ;

app.listen(3000, () =>{
    console.log('Server running on port 3000');
});


