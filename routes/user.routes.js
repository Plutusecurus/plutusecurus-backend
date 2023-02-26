const express = require('express');
const multer = require('multer');
const { ethers, providers } = require('ethers');
var Web3 = require("web3");
const fs = require('fs');
const User = require('../models/user.model');
const contractAbi = require('../contract_abi.json');
const contractAddress = String(process.env.CONTRACT_ADDRESS);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({ storage: storage });

var zeeve_api_key = String(process.env.ZEEVE_API_KEY);

var rpc_provider = `https://goerli.infura.io/v3/4a7302b6499a467dbd30df6be95a6df3`;
var web3Provider = new Web3.providers.HttpProvider(rpc_provider);
var web3 = new Web3(web3Provider);

const userRouter = express.Router();

userRouter.post(
    '/register',
    upload.single('profilePic'),
    async (req, res) => {
        try {
            if (!req.file) res.status(400).json({ code: 400, success: false, message: "Please upload your profile picture" });

            var image = fs.readFileSync(req.file.path);
            var encodedImg = image.toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${encodedImg}`
            const { name, account } = req.body;

            const existingUser = await User.findOne({ account: account });

            if (existingUser) return res.status(400).json({ code: 400, message: "This User already exists" });

            const newUser = await User.create({
                profilePic: imageUrl,
                name: name,
                account: account,
            })

            await newUser.save();

            return res.status(201).json({ code: 201, success: true, user: newUser, message: "User created successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ code: 500, success: false, message: "Internal Server Error" });
        }
    }
);

userRouter.post(
    '/add-expense',
    async (req, res) => {
        try {
            const { address, category, amount } = req.body;

            const existingUser = await User.findOne({ account: address });

            if (!existingUser) return res.status(404).json({ code: 404, success: false, message: "User not found" });

            existingUser.spending[category] = existingUser.spending[category] + Number(amount);

            await existingUser.save();

            return res.status(200).json({ code: 200, success: true, message: "Expense added successfully" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ code: 500, success: false, message: "Internal Server Error" });
        }
    }
);

userRouter.post(
    '/add-income',
    async (req, res) => {
        try {
            const { address, amount } = req.body;

            const existingUser = await User.findOne({ account: address });

            if (!existingUser) return res.status(404).json({ code: 404, success: false, message: "User not found" });

            existingUser.earning = existingUser.earning + Number(amount);

            await existingUser.save();

            return res.status(200).json({ code: 200, success: true, message: "Income added successfully" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ code: 500, success: false, message: "Internal Server Error" });
        }
    }
);

userRouter.post(
    '/deposit',
    (req, res) => {
        const { sender, privateKey, recipient, amount } = req.body;

        const provider = new ethers.providers.JsonRpcProvider(rpc_provider);
        const wallet = new ethers.Wallet(privateKey, provider);
        // const signer = wallet.provider.getSigner(wallet.address);
        const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

        // const amount = ethers.utils.parseEther('0.1');
        const amt = ethers.utils.parseEther(amount);
        console.log("amt", amt);

        // const options = { value: amount };
        contract.depositETH({ value: amt }).then(transaction => {
            console.log('Transaction Hash: ', transaction.hash)
            return res.status(200).json({ code: 200, success: true, message: "Deposited Successfully" });
        }).catch(error => {
            console.log('Error: ', error);
            return res.status(500).json({ code: 500, success: false, message: "Something Went Wrong" });
        });

        // console.log(result);
    }
);

userRouter.post(
    '/transfer',
    async (req, res) => {

        const { sender, privateKey, recipient, amount } = req.body;

        const provider = new ethers.providers.JsonRpcProvider(rpc_provider);
        const wallet = new ethers.Wallet(privateKey, provider);
        // const signer = wallet.provider.getSigner(wallet.address);
        const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

        const amt = ethers.utils.parseEther(amount);
        const overrides = {
            gasLimit: 300000
        }
        // const options = { value: amount };
        contract.transferETH(recipient, amount, overrides).then(transaction => {
            console.log('Transaction Hash: ', transaction.hash)
            return res.status(200).json({ code: 200, success: true, message: "Transaction Successful" });
        }).catch(error => {
            console.log('Error: ', error);
            return res.status(500).json({ code: 500, success: false, message: "Something Went Wrong" });
        });

        // console.log(result);
    }
);

userRouter.get('/:address', async (req, res) => {
    const address = req.params.address;

    const user = await User.findOne({ "account": address });

    if (!user) return res.status(404).json({ code: 404, success: false, message: "User not found" });

    return res.status(200).json({ code: 200, success: true, user: user, message: "Data fetched successfully" });
});

userRouter.post('/deposits', async (req, res) => {
    const { account } = req.body;

    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    const balance = await contract.methods.getAllDepositsFrom(account);

    if (!balance) return res.status(400).json({ code: 400, message: "Contract is fucked" });

    console.log(balance);

    return res.status(200).json({ code: 200, message: "Contract is running" });
});

module.exports = userRouter;