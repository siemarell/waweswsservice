import * as WebSocket from 'ws';
import * as express from 'express'
import {Subscription} from "rxjs/internal/Subscription";
import * as url from "url";
import {WSClientHandler} from "./wsClientHandler";
import {async} from "rxjs/internal/scheduler/async";
import {NodeProxy} from './nodeProxy';
import {config} from "./config";
import {NodeApi} from './nodeApi'

//const app = express();

const wss = new WebSocket.Server({port: config.appPort});
const nodeApi = new NodeApi(config.nodeUrl);
const nodeProxy = new NodeProxy(nodeApi, config.pollInterval);

wss.on('connection', async (ws: WebSocket, req) =>{
    const { query: { sessionId }, pathname } = url.parse(req.url, true);
    if (!(pathname === '/api')){
        ws.send(`Invalid path: ${pathname}`);
        ws.close();
        return;
    }else{
        const handler = new WSClientHandler(ws, nodeProxy, <string>sessionId);
        await handler.init();
        console.log(`Client connected. SessionId: ${handler.id}`);
        ws.on('close', () => handler.destroy());
    }
});

//app.listen(3000, () => console.log('Example app listening on port 3000!'));