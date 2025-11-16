const http = require('http');
const app = require('./server');

// Simple test script for CI/CD validation
async function runTests() {
    console.log('🧪 Running basic tests...');
    
    const tests = [
        // Test 1: Health check
        async () => {
            console.log('Test 1: Health check...');
            const response = await makeRequest('GET', '/');
            if (response.statusCode === 200) {
                console.log('✅ Frontend serving');
                return true;
            }
            console.log('❌ Frontend not serving');
            return false;
        },
        
        // Test 2: API available
        async () => {
            console.log('Test 2: API availability...');
            const response = await makeRequest('GET', '/api/categories');
            if (response.statusCode === 200) {
                console.log('✅ API responding');
                return true;
            }
            console.log('❌ API not responding');
            return false;
        },
        
        // Test 3: Menu items endpoint
        async () => {
            console.log('Test 3: Menu items endpoint...');
            const response = await makeRequest('GET', '/api/menu-items');
            if (response.statusCode === 200) {
                console.log('✅ Menu items endpoint working');
                return true;
            }
            console.log('❌ Menu items endpoint failing');
            return false;
        }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        try {
            const result = await test();
            if (result) passed++;
        } catch (error) {
            console.error('Test failed with error:', error.message);
        }
    }
    
    console.log(`\n📊 Test Results: ${passed}/${tests.length} tests passed`);
    
    if (passed === tests.length) {
        console.log('🎉 All tests passed! Ready for deployment.');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed. Please fix issues before deployment.');
        process.exit(1);
    }
}

function makeRequest(method, path) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            timeout: 2000
        };
        
        const req = http.request(options, (res) => {
            resolve(res);
        });
        
        req.on('error', () => {
            resolve({ statusCode: 500 });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({ statusCode: 408 });
        });
        
        req.end();
    });
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
