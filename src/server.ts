#!/usr/bin/env node

/**
 * MCP server entry point
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { Deggo } from "./core/deggo.js";
import { MCP_TOOLS, handleToolCall } from "./mcp/tools/index.js";

// Load environment variables
dotenv.config();

async function startMCPServer() {
  // Initialize Deggo
  const deggo = new Deggo();

  // Create MCP server
  const server = new Server(
    {
      name: "deggo-mcp",
      version: "1.0.0",
      description:
        "AI-Powered Payment Integration for Senegalese Mobile Money Services",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: MCP_TOOLS,
  }));

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return handleToolCall(deggo, request);
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("Deggo MCP server started successfully");
}

// Handle startup
async function main() {
  try {
    await startMCPServer();
  } catch (error) {
    console.error("Failed to start Deggo MCP server:", error);
    process.exit(1);
  }

  process.on("SIGINT", () => {
    console.log("Shutting down Deggo MCP server...");
    process.exit(0);
  });
}

// Always start the server when this module is executed directly
main();

export { startMCPServer };
