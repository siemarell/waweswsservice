import * as WebSocket from 'ws';
import * as express from 'express'
import {Subscription} from "rxjs/internal/Subscription";
import * as url from "url";
import {WSClientHandler} from "./wsClientHandler";
import {async} from "rxjs/internal/scheduler/async";

//const app = express();

const wss = new WebSocket.Server({port: 40510});

wss.on('connection', async (ws: WebSocket, req) =>{
    const { query: { token } } = url.parse(req.url, true);
    const client = new WSClientHandler(ws, token.toString());
    await client.init();
    console.log(`${token} init complete`)
    ws.on('close', () => client.destroy());
});

//app.listen(3000, () => console.log('Example app listening on port 3000!'));