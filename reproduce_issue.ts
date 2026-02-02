import { HttpClient } from './src/utils/http-client';
import express from 'express';

const app = express();
let attempts = 0;

app.get('/ping', (req, res) => {
    attempts++;
    console.log('Server received request attempt: ' + attempts);
    if (attempts < 3) {
        res.status(503).send('Busy');
    } else {
        res.send('Pong');
    }
});

const server = app.listen(9999, async () => {
    try {
        console.log("Client starting...");
        const res = await HttpClient.get('http://localhost:9999/ping');
        console.log("Response status:", res.status);
        console.log("Response data value:", JSON.stringify(res.data));
        
        if (String(res.data).trim() === 'Pong') {
            console.log("SUCCESS");
        } else {
            console.log("FAIL");
        }
    } catch (e) {
        console.error("Client Error:", e.message);
    } finally {
        server.close();
    }
});
