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

app.listen(9999);
