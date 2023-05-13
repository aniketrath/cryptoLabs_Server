const express = require("express");
var cors = require('cors');
const app = express();
const port = 5000;
app.use(cors());
//Basic Coin Stats function
async function getPriceStats(coin_id) {
    const resp = await fetch(
        `https://api.coinpaprika.com/v1/coins/${coin_id}/ohlcv/today`
    );
    const primary_data = await resp.json();
    const open = primary_data[0]?.open;
    const high = primary_data[0]?.high;
    const low = primary_data[0]?.low;
    const close = primary_data[0]?.close;
    const volume = primary_data[0]?.volume;
    const market_cap = primary_data[0]?.market_cap;
    const json_data = {
        open,
        high,
        low,
        close,
        volume,
        market_cap,
    };
    return json_data;
}
async function getCoinStats(coin_id) {
    const resp = await fetch(`https://api.coinpaprika.com/v1/coins/${coin_id}`);
    const primary_data = await resp.json();
    const price = await getPriceStats(coin_id);
    const id = primary_data.id;
    const name = primary_data.name;
    const symbol = primary_data.symbol;
    const rank = primary_data.rank;
    const logo = primary_data.logo;
    const json_data = {
        id,
        name,
        symbol,
        logo,
        rank,
        price_: price,
    };
    return json_data;
}
// Ticket Data function
async function getTickerData(coin_id) {
    const time = new Date();
    let month = time.getMonth();
    if (month) {
        month += 1;
        if (month < 10) {
            month = `0${month}`
        }
    }
    let date = time.getDate();
    if (date < 10) {
        date = `0${date}`
    }
    let year = time.getFullYear();
    const hist_date = `${year}-${month}-${date}`;
    const resp = await fetch(`https://api.coinpaprika.com/v1/tickers/${coin_id}/historical?start=${hist_date}&interval=1h`);
    const price_data = await resp.json();
    //console.log(price_data);
    return await price_data
}
//Exchanges function
async function getExchanges() {
    const link = `https://api.coinpaprika.com/v1/exchanges`;
    const resp = await fetch(link);
    const exchange_data = await resp.json();
    let exchange_list = exchange_data.map((ele) => {
        return {
            name: ele.name,
            currencies: ele.currencies,
            markets: ele.markets,
            rank: ele.adjusted_rank,
            pages: ele.links
        }
    });
    return exchange_list.slice(1, 100);
}
//Coins List Function
async function getCoins() {
    const link = 'https://api.coinpaprika.com/v1/coins';
    const resp = await fetch(link);
    const data = await resp.json();
    let coin_list = data.map((ele) => {
        return {
            id: ele.id,
            name: ele.name,
            symbol: ele.symbol,
            rank: ele.rank
        }
    })
    return coin_list;
}

async function getGlobal() {
    const link = ' https://api.coinpaprika.com/v1/global';
    const resp = await fetch(link);
    const data = await resp.json();
    /* console.log(data); */
    let cryptos = data.cryptocurrencies_number;
    let btc_dominance = data.bitcoin_dominance_percentage;
    let volume_24Hr = data.volume_24h_ath_value;
    let volume_24Hr_change = data.volume_24h_change_24h;
    let marketCap_24Hr = data.market_cap_ath_date;
    let marketCap_24Hr_change = data.market_cap_change_24h;
    const json_data = {
        cryptos,
        btc_dominance,
        volume_24Hr,
        volume_24Hr_change,
        marketCap_24Hr,
        marketCap_24Hr_change
    }
    return json_data;
}

//CurrentCoin Route resp, request
app.get("/currentcoin/:id", async (req, res) => {
    let coin_id = req.params.id;
    const coin_stats = await getCoinStats(coin_id);
    const price_stats = await getPriceStats(coin_id)
    const ticker_prices = await getTickerData(coin_id);
    const coin_list = await getCoins();
    coin_list.slice(110, 150);
    const json_ = {
        coin_stats,
        ticker_prices,
        coin_list,
        price_stats
    }
    res.send(json_);
});
//Exchanges Route resp, request
app.get("/Exchanges", async (req, res) => {
    const exchange_listings = await getExchanges();
    const global_data = await getGlobal();
    const json_ = {
        exchange_listings,
        global_data
    }
    res.send(json_);
});
//Cryptocurrencies Route resp , request
app.get('/Home', async (req, res) => {
    const coin_list_org = await getCoins();
    const global_data = await getGlobal();
    coin_list = coin_list_org.slice(1, 100);
    const json_ = {
        coin_list,
        global_data
    }
    res.send(json_);
})
app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});