# Trade Sniper
A tool to assist with the rapid buying and selling of crypto on various exchanges. Trade Sniper currently supports Binance, Bittrex, and Yobit. This product is in the alpha stage of development and its successful use is not guaranteed. Use at your own risk.

## How it works
Trade Sniper is a console application that uses the api keys of the exchange of your choice in order to quickly place buy and sell orders without the need to use their website user interface. It starts by pre-loading all the current prices of each token available for trade on the exchange into local memory to allow for faster trading. It then asks for the bitcoin balance you would like to play with, the threshold percentage before aborting the buy (more on this below), the target percent you would like to gain, and the symbol of the token you would like to buy. Immediately after entering the symbol of the token, Trade Sniper places a limit buy order for your threshold percent above the preloaded price of the token. If the order doesn't immediately fill, it cancels the order at no cost to the user. If the order does fill, Trade Sniper immediately places a limit sell order for the target percent above the confirmed buy price for the total amount of the token that was purchased. It then outputs the current price of the token as the market value changes and immediately lets the user know once the sell order fills.

## Prerequisites
1. [NodeJS](https://nodejs.org/en/download/) version v10.16.0 or greater
2. [NPM](https://www.npmjs.com/get-npm) 
3. [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
4. Generate and obtain your api key and secret key from the exchange of your choice:
    - [Binance](https://www.binance.com/en/support/articles/360002502072)
    - [Bittrex](https://bittrex.zendesk.com/hc/en-us/articles/360031921872-How-to-create-an-API-key-)
    - [Yobit](https://helpdesk.bitsgap.com/support/solutions/articles/36000028876-how-can-i-create-an-api-key-for-yobit-net-)

## Installation
1. Clone the repository with `git clone https://github.com/lastrellik/trade-sniper.git && cd trade-sniper`
2. Install the dependencies with `npm install`
3. Verify the installation with `npm start -- -V`

## Quick start
1. From the project directory, run `npm start -- -k <your api key> -s <your secret key> -e <name of the exchange>`
    - For more information, run `npm start -- -h`
2. Follow the on-screen instructions to answer the following questions:
    1. Enter the BTC balance you would like to play with
    2. Enter the threshold percentage before aborting buy
        - 10, 15, etc
    3. Enter the target percent you would like to gain
        - 2, 5, etc
    4. Enter the symbol of the token to buy
        - lrc, pink, etc
