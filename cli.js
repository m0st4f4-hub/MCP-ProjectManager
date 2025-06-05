#!/usr/bin/env node

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(
    `Node.js 18 or higher is required. Current version: ${process.version}`
  );
  process.exit(1);
}

const API_BASE_URL =
  process.env.MCP_API_BASE_URL || 'http://localhost:8000/api';

async function listTools() {
  try {
    const res = await fetch(`${API_BASE_URL}/mcp-tools/list`);
    const data = await res.json();
    if (Array.isArray(data.tools)) {
      console.log('Available MCP tools:');
      for (const tool of data.tools) {
        console.log(`- ${tool.name}: ${tool.description}`);
      }
    } else {
      console.log('No tools found.');
    }
  } catch (err) {
    console.error('Failed to list tools:', err.message);
  }
}

async function runTool(name, argsJson = '{}') {
  if (!name) {
    console.error('Tool name required.');
    return;
  }
  let args = {};
  try {
    args = JSON.parse(argsJson);
  } catch {
    console.error('Invalid JSON for tool arguments.');
    return;
  }
  try {
    const infoRes = await fetch(`${API_BASE_URL}/mcp-tools/info/${name}`);
    const info = await infoRes.json();
    const path = info.path || `/mcp-tools/${name}`;
    const method = (info.method || 'POST').toUpperCase();
    const fetchOpts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (method !== 'GET') fetchOpts.body = JSON.stringify(args);
    const res = await fetch(`${API_BASE_URL}${path}`, fetchOpts);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to run tool:', err.message);
  }
}

const [, , command, arg1, arg2] = process.argv;

if (command === 'list-tools') {
  listTools();
} else if (command === 'run-tool') {
  runTool(arg1, arg2);
} else {
  require('./dev_launcher.js');
}
