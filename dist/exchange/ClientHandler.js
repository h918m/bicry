"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClientHandler {
    id;
    ws;
    subscriptions;
    clientConnectionManager;
    ExchangeConnectionManager;
    connectionType;
    connectionState = 'CLOSED';
    constructor(id, clientConnectionManager, ExchangeConnectionManager, connectionType) {
        this.id = id;
        this.subscriptions = {
            watchOHLCV: new Set(),
            watchOrderBook: new Set(),
            watchTicker: new Set(),
            watchTrades: new Set(),
        };
        this.clientConnectionManager = clientConnectionManager;
        this.ExchangeConnectionManager = ExchangeConnectionManager;
        this.connectionType = connectionType;
    }
    initialize(ws) {
        if (!ws) {
            return;
        }
        this.ws = ws;
        this.connectionState = 'OPEN'; // Set the state to OPEN here
    }
    handleClientMessage(message) {
        const messageStr = Buffer.from(message).toString();
        const { method, params } = JSON.parse(messageStr);
        if (this.connectionType === 'trade') {
            if (!params) {
                return;
            }
            const { symbol, type, interval, limit, param } = params;
            // Validate the type
            const validTypes = [
                'watchOHLCV',
                'watchOrderBook',
                'watchTicker',
                'watchTrades',
            ];
            if (!validTypes.includes(type)) {
                console.error(`Invalid type: ${type}`);
                return;
            }
            if (method === 'SUBSCRIBE') {
                this.subscriptions[type].add(symbol);
                this.ExchangeConnectionManager.watchData(symbol, type, interval, limit, param)
                    .then((data) => {
                    this.sendToClient({ status: 'subscribed', data: data });
                })
                    .catch((err) => {
                    this.sendToClient({ status: 'error', message: err.message });
                });
            }
            else if (method === 'UNSUBSCRIBE') {
                if (type === 'watchOHLCV') {
                    // Remove the specific timeframe from this client's watchOHLCV subscription.
                    const timeframeIdentifier = `${symbol}-${interval}`;
                    this.subscriptions[type].delete(timeframeIdentifier);
                }
                else {
                    this.subscriptions[type].delete(symbol);
                }
                if (!this.clientConnectionManager.isSymbolSubscribedByOtherClients(this.id, symbol, type)) {
                    this.ExchangeConnectionManager.removeSubscription(symbol, type);
                    this.sendToClient({ status: 'unsubscribed', symbol, type });
                }
            }
        }
        else if (this.connectionType === 'tickers') {
            if (method === 'SUBSCRIBE') {
                this.clientConnectionManager.addClientOfType('tickers', this);
                this.sendToClient({ status: 'subscribed', type: 'tickers' });
            }
            else if (method === 'UNSUBSCRIBE') {
                this.clientConnectionManager.removeClientOfType('tickers', this);
                this.sendToClient({ status: 'unsubscribed', type: 'tickers' });
            }
        }
    }
    // Handle a disconnection from the client
    handleClientDisconnection() {
        // For each symbol in the subscriptions set, unsubscribe from data if necessary
        for (const type in this.subscriptions) {
            for (const symbol of this.subscriptions[type]) {
                if (!this.clientConnectionManager.isSymbolSubscribedByOtherClients(this.id, symbol, type)) {
                    this.ExchangeConnectionManager.removeSubscription(symbol, type);
                }
            }
        }
        // Remove this client from the ClientConnectionManager
        this.clientConnectionManager.removeClient(this.id.toString());
        this.connectionState = 'CLOSED';
    }
    sendToClient(data) {
        try {
            if (this.ws && this.connectionState === 'OPEN') {
                this.ws.send(JSON.stringify(data));
            }
            else {
                this.clientConnectionManager.removeClient(this.id.toString());
            }
        }
        catch (error) {
            // Handle error
        }
    }
    // Close the client connection
    close() {
        try {
            if (this.ws && this.ws.readyState === this.ws.OPEN) {
                this.ws.close();
            }
        }
        catch (error) { }
        // Clear the subscriptions set
        this.subscriptions = {
            watchOHLCV: new Set(),
            watchOrderBook: new Set(),
            watchTicker: new Set(),
            watchTrades: new Set(),
        };
    }
}
exports.default = ClientHandler;
