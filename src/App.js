import React, { Component } from "react";
import { hot } from "react-hot-loader";
import Web3 from 'web3';
import "./App.css";
import { tDai_ContractABI } from './abis.js';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            account: 0x0,
            ethBalance: "",
            network: "",
            tDaiBalance: "",
            tDai: {},
            token: "ETH",
            toAddress: "",
            transferAmount: 0
        };

        this.shoot = this.shoot.bind(this);
        this.optionChange = this.optionChange.bind(this);
        this.addressChange = this.addressChange.bind(this);
        this.amountChange = this.amountChange.bind(this);

        
    }

    async componentDidMount() {
        try {
            this.loadWeb3();
            this.loadData();
        } catch (error) {
            console.log(error);
        }
    }


    loadData = async () => {

        try {
            const web3 = window.web3;
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.setState({account: accounts[0]});

            const balance = await web3.eth.getBalance(accounts[0]);
            const formattedBalance = await web3.utils.fromWei(balance)
            this.setState({ethBalance: Math.round(formattedBalance * 1000) / 1000});

            const networkId = await web3.eth.net.getId()
            this.setState({network: networkId});

            const tDaiAddrs = '0x3509813bACa7A8Dd7029439A1Adf421672769E3c';
            const tDai = new web3.eth.Contract(tDai_ContractABI, tDaiAddrs);
            this.setState({ tDai });
            //const test = await tDai.methods.name().call();
            let tDaiBal = await tDai.methods.balanceOf(this.state.account).call();
            var tDailBalFormatted = await web3.utils.fromWei(tDaiBal);
            tDailBalFormatted = Math.round(tDailBalFormatted * 1000) / 1000;
            this.setState({tDaiBalance: tDailBalFormatted});


        } catch (error) {
            console.log(error);
        }
    }

    loadWeb3 = async () => {
        try {
            window.web3 = new Web3(window.ethereum);
        
        } catch (error) {
            if (error.code === 4001) {
                // User rejected request
                console.log("User rejected request!");
            }
            console.log(error);
        }
    }

    trasnferToken = async () => {
        try {
            const web3 = window.web3;
            const tDai = this.state.tDai;

            if (this.state.token=="ETH") {
                //console.log("ETH");
                const payload = {
                    to: this.state.toAddress,
                    from: this.state.account,
                    value: web3.utils.toWei(this.state.transferAmount,'ether')
                };

                web3.eth.sendTransaction(payload, (error, hash) => {
                    if(error) {
                        let err = "Error: " +error;
                        //console.log(err);
                        this.shoot(err);
                    } else {
                        let message = "Transfer Sucessfull: " +hash;
                        //console.log(message);
                        this.shoot(message);
                    }           
    
                });
            }
            if (this.state.token=="tDai") {
                //console.log("tDai")
                //const gas1 = await tDai.methods.approve(this.state.toAddress, this.state.transferAmount).estimateGas();
                const amount = web3.utils.toWei(this.state.transferAmount,'ether'); 
    
                tDai.methods.transfer(this.state.toAddress, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
                    let message = "Transfer Sucessfull: " +hash;
                    //console.log(message);
                    this.shoot(message);
                }).on('error', (error,receipt) => {
                    let err = "Error: " +error;
                    //console.log(err);
                    shoot(err);

                });

             // this.state.tDai.methods.approve(this.state.toAddress, this.state.transferAmount).send({ from: this.state.account, gas1 }).on('transactionHash', (hash) => {
             //     this.state.tDai.methods.transfer(this.state.toAddress, this.this.state.transferAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
             //         console.log("Transfer Sucessfull")
             //    })
             //});
            }
        
        } catch (error) {
            console.log(error);
        }
    }

    shoot(message) {
        //console.log(this.state.token);
        alert(message);
    }

    optionChange(event) {
        this.setState({token: event.target.value});
    }

    addressChange(event) {
        this.setState({toAddress: event.target.value});
    }

    amountChange(event) {
        this.setState({transferAmount: event.target.value});
    }
   
        
    render() {
        return (
            <div className="App">
                <h1> Basic Credit </h1>
            <div className="Connect">
                <button onClick={this.loadData}>Connect Wallet</button>
            </div>
            <div className="showData">
                <p className="show">Metamask Address: {this.state.account}</p>
                <p className="show">ETH Balance: {this.state.ethBalance}</p>
                <p className="show">Network ID: {this.state.network}</p>
                <p className="show">tDai Balance: {this.state.tDaiBalance}</p>
            </div>
            <div className="transaction">
                <form>
                <p className="send">Transfer:</p>
                <div className="send">
                    <label>Select Token: </label>
                    <select value={this.state.token} onChange={this.optionChange}>
                        <option value="ETH">ETH</option>
                        <option value="tDai">tDai</option>
                    </select>
                </div>
                <p className="send">Address:</p>
                <input
                    type='text'
                    onChange={this.addressChange}
                />
                <p className="send">Amount:</p>
                <input
                    type='number'
                    onChange={this.amountChange}
                />
                </form>
                <button onClick={this.trasnferToken}>Send</button>
            </div>
            </div>
        );
    }
}






export default hot(module)(App);
