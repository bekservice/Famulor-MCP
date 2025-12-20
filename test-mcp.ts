#!/usr/bin/env node

/**
 * Test Script für MCP Server
 * 
 * Testet den Famulor MCP Server mit einem MCP Client
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🧪 Teste Famulor MCP Server...\n');

  // Starte den MCP Server als Child Process
  const serverPath = join(__dirname, 'dist', 'index.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      FAMULOR_API_KEY: process.env.FAMULOR_API_KEY || '',
    },
  });

  // Erstelle MCP Client
  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath],
    env: {
      ...process.env,
      FAMULOR_API_KEY: process.env.FAMULOR_API_KEY || '',
    },
  });

  const client = new Client(
    {
      name: 'mcp-test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    // Verbinde zum Server
    console.log('📡 Verbinde zum MCP Server...');
    await client.connect(transport);
    console.log('✅ Verbunden!\n');

    // Test 1: Liste verfügbare Tools
    console.log('1️⃣ Teste: Liste verfügbare Tools');
    try {
      const tools = await client.listTools();
      console.log(`✅ ${tools.tools.length} Tools gefunden:`);
      tools.tools.forEach((tool) => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    } catch (error) {
      console.error('❌ Fehler:', error instanceof Error ? error.message : error);
    }

    console.log('\n');

    // Test 2: Teste get_assistants (benötigt API Key)
    if (process.env.FAMULOR_API_KEY) {
      console.log('2️⃣ Teste: get_assistants');
      try {
        const result = await client.callTool({
          name: 'get_assistants',
          arguments: {},
        });
        console.log('✅ Ergebnis:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('❌ Fehler:', error instanceof Error ? error.message : error);
      }
    } else {
      console.log('2️⃣ Überspringe: get_assistants (kein API Key gesetzt)');
      console.log('   💡 Setze FAMULOR_API_KEY um diesen Test auszuführen');
    }

    console.log('\n');

    // Test 3: Teste list_calls (benötigt API Key)
    if (process.env.FAMULOR_API_KEY) {
      console.log('3️⃣ Teste: list_calls');
      try {
        const result = await client.callTool({
          name: 'list_calls',
          arguments: { limit: 5 },
        });
        console.log('✅ Ergebnis:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('❌ Fehler:', error instanceof Error ? error.message : error);
      }
    } else {
      console.log('3️⃣ Überspringe: list_calls (kein API Key gesetzt)');
    }

    console.log('\n');

    // Test 4: Teste Fehlerbehandlung (ungültiges Tool)
    console.log('4️⃣ Teste: Fehlerbehandlung (ungültiges Tool)');
    try {
      await client.callTool({
        name: 'invalid_tool',
        arguments: {},
      });
      console.error('❌ Sollte einen Fehler werfen!');
    } catch (error) {
      console.log('✅ Fehler korrekt abgefangen:', error instanceof Error ? error.message : error);
    }

    console.log('\n');

    // Test 5: Teste Tool-Validierung (fehlende Parameter)
    console.log('5️⃣ Teste: Tool-Validierung (fehlende Parameter)');
    try {
      await client.callTool({
        name: 'make_call',
        arguments: {}, // Fehlende required Parameter
      });
      console.error('❌ Sollte einen Fehler werfen!');
    } catch (error) {
      console.log('✅ Validierung funktioniert:', error instanceof Error ? error.message : error);
    }

    console.log('\n✅ Alle Tests abgeschlossen!');

  } catch (error) {
    console.error('❌ Fataler Fehler:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    // Trenne Verbindung
    await client.close();
    serverProcess.kill();
  }
}

// Prüfe ob API Key gesetzt ist
if (!process.env.FAMULOR_API_KEY) {
  console.log('⚠️  Warnung: FAMULOR_API_KEY ist nicht gesetzt');
  console.log('   Einige Tests werden übersprungen.\n');
}

testMCPServer().catch((error) => {
  console.error('❌ Unerwarteter Fehler:', error);
  process.exit(1);
});

