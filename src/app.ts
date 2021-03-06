import * as WebSocket from 'ws';
import * as url from "url";
import {WSClientHandler} from "./wsClientHandler";
import {NodeProxy} from './nodeProxy';
import {config} from "./config";
import {NodeApi} from './nodeApi'
import {logger} from './logger';

import {existsSync} from 'fs'

if (!existsSync('./storage.db')){
    logger.info('No storage found. Init empty storage');
    require('./storageInit').init()
}

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
        logger.info(`Client connected. SessionId: ${handler.id}`);
        ws.on('close', () => handler.destroy());
    }
});
