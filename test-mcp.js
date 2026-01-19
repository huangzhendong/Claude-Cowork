#!/usr/bin/env node

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testMCPIntegration() {
  console.log('Testing MCP integration with DesktopCommander...');

  // First test if we can spawn the MCP server directly
  const { spawn } = await import('child_process');
  const { existsSync } = await import('fs');

  const serverPath = '/Users/luke/code/I_Work/DesktopCommanderMCP/dist/index.js';
  console.log(`Checking server path: ${serverPath}`);
  console.log(`File exists: ${existsSync(serverPath)}`);
  console.log(`File executable: ${existsSync(serverPath) ? 'Yes' : 'N/A'}`);

  try {
    // Test spawning the server directly
    console.log('\nTesting direct server spawn...');
    const serverProcess = spawn('node', [serverPath, '--no-onboarding'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'production' }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server stdout: ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.log(`Server stderr: ${data.toString().trim()}`);
    });

    serverProcess.on('error', (error) => {
      console.error(`Server process error: ${error.message}`);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Wait a bit then kill
    setTimeout(() => {
      console.log('Killing server process...');
      serverProcess.kill('SIGTERM');
    }, 3000);

    // Now test the MCP manager
    console.log('\n\nTesting MCP manager...');
    const { getMCPManager, cleanupMCPManager } = await import('./dist-electron/libs/mcp-manager.js');

    const mcpManager = getMCPManager();

    console.log('Initializing MCP manager...');
    const success = await mcpManager.initialize();

    if (!success) {
      console.error('MCP initialization failed');
      return;
    }

    console.log('MCP initialization successful');

    // List available tools
    const tools = mcpManager.getTools();
    console.log(`\nAvailable MCP tools (${tools.length}):`);
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}: ${tool.description}`);
    });

  } catch (error) {
    console.error('Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    console.log('\nTest completed.');
  }
}

// Run test
testMCPIntegration().catch(console.error);