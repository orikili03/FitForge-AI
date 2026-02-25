import express from 'express';
import fs from 'fs';
const app = express();

// Use a mock req/res for the router
import { Router } from 'express';
const router = Router();

let results = '';

router.get('{/*path}', (req, res) => res.send('caught'));

// We can't easily "run" the express app in a script to test matches without supertest
// but we can check the compiled regexp if we are brave, 
// OR just trust the "success" log means it compiled the route.

// However, let's use a regex object. It's unambiguous and supported.
// app.get(/^(?!\/api).*$/, ...)
// This regex matches any string that does NOT start with /api.

results += "Compiling route with regex: /^(?!\\/api|\\/health).*$/\n";
try {
    app.get(/^(?!\/api|\/health).*$/, (req, res) => res.send('ok'));
    results += "✅ Regex compilation success\n";
} catch (e) {
    results += `❌ Regex failed: ${e.message}\n`;
}

fs.writeFileSync('test-results.txt', results);
process.exit(0);
