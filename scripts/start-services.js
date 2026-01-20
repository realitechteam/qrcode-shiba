#!/usr/bin/env node
/**
 * Start All Services Script
 * Starts all microservices in production mode
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const services = [
    { name: 'auth-service', port: 3001 },
    { name: 'qr-service', port: 3002 },
    { name: 'redirect-service', port: 3003 },
    { name: 'payment-service', port: 3004 }
];

console.log('🚀 Starting all microservices...\n');

const processes = services.map(service => {
    const cwd = path.join(ROOT, 'services', service.name);

    console.log(`▶️  Starting ${service.name} on port ${service.port}...`);

    const proc = spawn('node', ['dist/main.js'], {
        cwd,
        env: { ...process.env, PORT: service.port.toString() },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    proc.stdout.on('data', (data) => {
        console.log(`[${service.name}] ${data.toString().trim()}`);
    });

    proc.stderr.on('data', (data) => {
        console.error(`[${service.name}] ERROR: ${data.toString().trim()}`);
    });

    proc.on('close', (code) => {
        console.log(`[${service.name}] Process exited with code ${code}`);
    });

    return { name: service.name, proc };
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all services...');
    processes.forEach(({ name, proc }) => {
        console.log(`   Stopping ${name}...`);
        proc.kill('SIGTERM');
    });
    process.exit(0);
});

console.log('\n✅ All services started! Press Ctrl+C to stop.\n');
