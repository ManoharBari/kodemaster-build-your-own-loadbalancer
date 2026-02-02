import { HttpClient } from './src/utils/http-client';

async function run() {
    try {
        const start = Date.now();
        // This should fail initially but succeed on 3rd try
        const res = await HttpClient.get('http://localhost:9999/ping');
        
        if (String(res.data).trim() === 'Pong') {
            const timeTaken = Date.now() - start;
            // Retries should take at least 200 + 400 = 600ms delay
            if (timeTaken < 500) {
                console.error("Success but too fast! Did it actually retry?");
                process.exit(1);
            }
            console.log("Success!");
        } else {
             console.error("FAIL: Unexpected data");
             console.error("Received:", typeof res.data, JSON.stringify(res.data));
             process.exit(1);
        }
    } catch (e) {
        console.error("FAIL: Client gave up too early or errored");
        console.error(e);
        process.exit(1);
    }
}
run();
