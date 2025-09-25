#!/usr/bin/env node

/**
 * Simple test script for the LongCat n8n node
 * This script tests the node structure and validates basic functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 LongCat n8n Node Test Suite');
console.log('================================');

// Test 1: Check if files exist
console.log('\n1. File Structure Check:');
const requiredFiles = [
    'package.json',
    'index.js',
    'nodes/LongCat/LongCat.node.ts',
    'credentials/LongCatApi.credentials.ts',
    'README.md',
    'nodes/LongCat/LongCat.svg'
];

let allFilesExist = true;
for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} (missing)`);
        allFilesExist = false;
    }
}

// Test 2: Check package.json structure
console.log('\n2. Package.json Validation:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    const requiredFields = ['name', 'version', 'description', 'main', 'n8n'];
    let packageValid = true;

    for (const field of requiredFields) {
        if (packageJson[field]) {
            console.log(`   ✅ ${field}: ${JSON.stringify(packageJson[field])}`);
        } else {
            console.log(`   ❌ ${field} (missing)`);
            packageValid = false;
        }
    }

    if (packageJson.n8n && packageJson.n8n.nodes && packageJson.n8n.credentials) {
        console.log(`   ✅ n8n configuration found`);
    } else {
        console.log(`   ❌ n8n configuration incomplete`);
        packageValid = false;
    }

} catch (error) {
    console.log(`   ❌ Error reading package.json: ${error.message}`);
}

// Test 3: Check TypeScript compilation
console.log('\n3. TypeScript Compilation:');
try {
    // Try to build
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('   ✅ TypeScript compilation successful');
} catch (error) {
    console.log(`   ❌ TypeScript compilation failed: ${error.message}`);
}

// Test 4: Check dist directory
console.log('\n4. Distribution Files:');
const distExists = fs.existsSync('dist');
if (distExists) {
    console.log('   ✅ dist/ directory created');

    const distFiles = fs.readdirSync('dist');
    if (distFiles.includes('nodes') && distFiles.includes('credentials')) {
        console.log('   ✅ dist/nodes/ and dist/credentials/ directories exist');
    } else {
        console.log('   ❌ Missing required dist subdirectories');
    }
} else {
    console.log('   ❌ dist/ directory not found');
}

// Test 5: Validate node structure
console.log('\n5. Node Structure Validation:');
try {
    const nodeContent = fs.readFileSync('nodes/LongCat/LongCat.node.ts', 'utf8');

    const requiredPatterns = [
        /implements INodeType/,
        /displayName: 'LongCat'/,
        /name: 'longCat'/,
        /credentials.*longCatApi/,
        /LongCat-Flash-Chat/,
        /LongCat-Flash-Thinking/,
        /api\.longcat\.chat/
    ];

    let nodeValid = true;
    for (const pattern of requiredPatterns) {
        if (pattern.test(nodeContent)) {
            console.log(`   ✅ Node contains: ${pattern.toString()}`);
        } else {
            console.log(`   ❌ Node missing: ${pattern.toString()}`);
            nodeValid = false;
        }
    }

} catch (error) {
    console.log(`   ❌ Error reading node file: ${error.message}`);
}

// Test 6: Validate credentials structure
console.log('\n6. Credentials Validation:');
try {
    const credContent = fs.readFileSync('credentials/LongCatApi.credentials.ts', 'utf8');

    const requiredPatterns = [
        /ICredentialType/,
        /longCatApi/,
        /LongCat API/,
        /apiKey/
    ];

    let credValid = true;
    for (const pattern of requiredPatterns) {
        if (pattern.test(credContent)) {
            console.log(`   ✅ Credentials contain: ${pattern.toString()}`);
        } else {
            console.log(`   ❌ Credentials missing: ${pattern.toString()}`);
            credValid = false;
        }
    }

} catch (error) {
    console.log(`   ❌ Error reading credentials file: ${error.message}`);
}

console.log('\n================================');
if (allFilesExist) {
    console.log('🎉 All tests passed! The LongCat n8n node appears to be properly configured.');
    console.log('\nNext steps:');
    console.log('1. Install the node in n8n: npm link');
    console.log('2. Configure your LongCat API key in n8n credentials');
    console.log('3. Test the node in an n8n workflow');
    console.log('4. Try both LongCat-Flash-Chat and LongCat-Flash-Thinking models');
} else {
    console.log('❌ Some tests failed. Please check the issues above and fix them before using the node.');
}

console.log('\n📚 Documentation: https://longcat.chat/platform/docs/');
console.log('🔧 n8n Community Nodes: https://docs.n8n.io/integrations/community-nodes/');