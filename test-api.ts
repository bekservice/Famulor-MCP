#!/usr/bin/env node

/**
 * Test Script for Famulor API
 * 
 * Tests the Famulor API client with a real API key
 */

import { FamulorClient } from './src/auth/famulor.js';

const API_KEY = process.env.FAMULOR_API_KEY || 'your-api-key-here';

async function testFamulorAPI() {
  console.log('🧪 Testing Famulor API...\n');

  try {
    const client = new FamulorClient(API_KEY);

    // Test 1: Get user info
    console.log('1️⃣ Testing: GET /api/user/me');
    try {
      const userInfo = await client.get('/api/user/me');
      console.log('✅ User Info:', JSON.stringify(userInfo, null, 2));
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
    }

    console.log('\n');

    // Test 2: Get assistants
    console.log('2️⃣ Testing: GET /api/user/assistants');
    try {
      const assistants = await client.get('/api/user/assistants');
      console.log('✅ Assistants:', JSON.stringify(assistants, null, 2));
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
    }

    console.log('\n');

    // Test 3: List calls
    console.log('3️⃣ Testing: GET /api/user/calls?limit=5');
    try {
      const calls = await client.get('/api/user/calls?limit=5');
      console.log('✅ Calls:', JSON.stringify(calls, null, 2));
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testFamulorAPI();

