import { FastMCP } from "fastmcp";
import { registerResources } from "../core/resources.js";
import { registerTools } from "../core/tools.js";
import { registerPrompts } from "../core/prompts.js";

// Create and start the MCP server
async function startServer() {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['MINGDAO_APP_KEY', 'MINGDAO_SIGN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    console.error('环境变量检查结果:', { 
      missingVars, 
      MINGDAO_APP_KEY: process.env.MINGDAO_APP_KEY ? '已设置' : '未设置',
      MINGDAO_SIGN: process.env.MINGDAO_SIGN ? '已设置' : '未设置',
      MINGDAO_HOST: process.env.MINGDAO_HOST
    });
    
    if (missingVars.length > 0) {
      console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      console.error('Please set the following environment variables:');
      console.error('- MINGDAO_APP_KEY: Your Mingdao application key');
      console.error('- MINGDAO_SIGN: Your Mingdao signature');
      console.error('- MINGDAO_HOST (optional): Custom host URL (e.g., https://your-domain.com)');
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
    console.error(`Using Mingdao API with AppKey: ${process.env.MINGDAO_APP_KEY?.substring(0, 8)}...`);
    if (process.env.MINGDAO_HOST) {
      console.error(`Using custom host: ${process.env.MINGDAO_HOST}`);
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