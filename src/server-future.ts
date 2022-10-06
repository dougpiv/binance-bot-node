require("dotenv").config();

import axios from "axios";
import crypto from "crypto";
import WebSocket from "ws";

const ws = new WebSocket(process.env.STREAM_URL_FUTURE + "btcusdt@markPrice@1s");

let isOpened = false;

ws.onmessage = async (event) => {
    const obj = JSON.parse(event.data.toString());
    console.log("Symbol: " + obj.s);
    console.log("MArk Price: " + obj.p);

    const price = parseFloat(obj.p);
    if (price < 20300 && !isOpened) {
        console.log("COMPRAR");
        // newOrder("BTCUSDT", "0.001", "BUY");
        isOpened = true;
    }
    if (price > 20800 && isOpened) {
        console.log("VENDER");
        // newOrder("BTCUSDT", "0.001", "SELL");
        isOpened = false;
    }
};

async function newOrder(symbol: string, quantity: string, side: string) {
    var data: any = { symbol, quantity, side, type: "MARKET", timestamp: Date.now().toString() };
    const signature = crypto
        .createHmac("sha256", process.env.SECRET_KEY_FUTURE || "")
        .update(new URLSearchParams(data).toString())
        .digest("hex");
    data.signature = signature;
    try {
        const result = await axios({
            method: "POST",
            url: `${process.env.API_URL_FUTURE}/v1/order`,
            params: {
                ...data,
            },
            headers: {
                "X-MBX-APIKEY": process.env.API_KEY_FUTURE,
            },
        });
        console.log(result.data);
    } catch (error) {
        console.error(error);
    }
}
