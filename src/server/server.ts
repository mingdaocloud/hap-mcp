import { FastMCP } from "fastmcp";
import { registerResources } from "../core/resources.js";
import { registerTools } from "../core/tools.js";
import { registerPrompts } from "../core/prompts.js";

// Create and start the MCP server
async function startServer() {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['APPKEY', 'SIGN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    console.error('环境变量检查结果:', { 
      missingVars, 
      APPKEY: process.env.APPKEY ? '已设置' : '未设置',
      SIGN: process.env.SIGN ? '已设置' : '未设置',
      HOST: process.env.HOST
    });
    
    if (missingVars.length > 0) {
      console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      console.error('Please set the following environment variables:');
      console.error('- APPKEY: Your HAP application key');
      console.error('- SIGN: Your HAP signature');
      console.error('- HOST (optional): Custom host URL (e.g., https://your-domain.com)');
      process.exit(1);
    }

    // Create a new FastMCP server instance
    const server = new FastMCP({
      name: "HAP MCP Server",
      version: "1.4.0"
    });

    // Register all resources, tools, and prompts
    registerResources(server);
    registerTools(server);
    registerPrompts(server);

    // Log server information
    console.error(`MCP Server initialized`);
    console.error(`Using HAP API with AppKey: ${process.env.APPKEY?.substring(0, 8)}...`);
    if (process.env.HOST) {
      console.error(`Using custom host: ${process.env.HOST}`);
    }
    console.error("Server is ready to handle requests");

    return server;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

// Export the server creation function
export default startServer; 