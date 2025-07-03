# @mingdaocloud/hap-mcp

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)
![npm](https://img.shields.io/npm/v/@mingdaocloud/hap-mcp)

HAP (Hyper Application Platform) is an APaaS platform launched by Mingdao (https://www.mingdao.com) that helps you rapidly build enterprise-grade applications with no coding.
This is the MCP (Model Context Protocol) server by HAP for seamless AI integration.

## 🚀 Quick Start with MCP Client (e.g. cursor)

### 1. Configure cursor MCP Settings (Need Node.js 18+)

Add the following configuration to your cursor settings:

**Option A: Standard Configuration (SaaS Version)**
Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "hap-mcp": {
      "command": "npx",
      "args": ["-y", "@mingdaocloud/hap-mcp"],
      "env": {
        "APPKEY": "your_APPKEY_here",
        "SIGN": "your_signature_here"
      }
    }
  }
}
```

**Option B: Private Deployment Configuration**
For private deployment environments only. Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "hap-mcp": {
      "command": "npx",
      "args": ["-y", "@mingdaocloud/hap-mcp"],
      "env": {
        "APPKEY": "your_APPKEY_here",
        "SIGN": "your_signature_here",
        "HOST": "https://www.nocoly.com"
      }
    }
  }
}
```

**Note**: The `HOST` parameter is only required for private deployment environments. Replace `https://www.nocoly.com` with your actual private deployment server URL.

### 4. Start Using in cursor

After configuration, true on the `hap-mcp` tool and you'll have access to all HAP API tools directly in your AI conversations!

## 📋 Alternative Installation Methods

```bash
# Run directly with npx
npx @mingdaocloud/hap-mcp
```

## 🔭 What's Included

HAP provides:

- Production-ready MCP server with both stdio and HTTP transport options
- **Complete HAP API integration** - Full access to HAP Application APIs
- Pre-built tools for common AI integration tasks
- Extensible architecture for custom tools, resources, and prompts
- TypeScript support with full type safety
- Easy deployment and configuration

## ✨ Features

- **FastMCP Framework**: Built on the robust FastMCP framework
- **Dual Transport Support**: Run over stdio or HTTP for maximum flexibility
- **HAP API Tools**: Complete set of tools for HAP application operations
- **TypeScript**: Full TypeScript support for enterprise-grade development
- **Production Ready**: Optimized for production deployments
- **Extensible**: Easy to extend with custom functionality

## 🔧 HAP API Tools

`hap-mcp` includes a complete set of tools for interacting with the HAP application:

### Available Tools (28 Tools)

#### Core Worksheet Operations (9 Tools)
- **add_worksheet_record**: Add new records to worksheets
- **delete_worksheet_record**: Delete records from worksheets
- **update_worksheet_record**: Update existing records
- **get_worksheet_fields**: Get worksheet field information
- **list_worksheet_records**: List records with filtering and pagination
- **list_worksheets**: List all worksheets in application
- **get_worksheet_pivot_data**: Get pivot table data with aggregation
- **create_worksheet**: Create new worksheets with controls
- **get_worksheet_record_detail**: Get detailed information of specific records

#### Batch Operations (2 Tools)
- **add_worksheet_records_batch**: Bulk create multiple records
- **update_worksheet_records_batch**: Bulk update multiple records

#### Advanced Features (5 Tools)
- **get_app_info**: Get application information including groups, worksheets, and custom pages
- **get_related_worksheet_records**: Get records from linked worksheets
- **get_worksheet_record_share_link**: Generate sharing links for records
- **get_worksheet_record_count**: Get total record count in worksheets
- **get_worksheet_record_logs**: Get operation history for records

#### Role Management (7 Tools)
- **get_roles**: List application roles
- **create_role**: Create new roles with permissions
- **delete_role**: Delete roles
- **add_role_members**: Add users to roles
- **remove_role_members**: Remove users from roles
- **get_role_detail**: Get detailed role information
- **exit_app**: Kick someone off from application

#### Option Set Management (4 Tools)
- **create_option_set**: Create new option sets
- **get_option_set**: Get option set information
- **update_option_set**: Update existing option sets
- **delete_option_set**: Delete option sets

#### Utility Tools (1 Tools)
- **get_area_info**: Get geographical area information

### Quick Example
```json
{
  "tool": "list_worksheet_records",
  "parameters": {
    "worksheetId": "worksheet_id",
    "pageSize": 50
  }
}
```

## 🚀 Getting Started

After creating your project:

1. Install dependencies using your preferred package manager:
   ```bash
   # Using npm
   npm install
   
   # Using yarn
   yarn
   
   # Using pnpm
   pnpm install
   
   # Using bun
   bun install
   ```

2. Start the server:
   ```bash
   # Start the stdio server
   npm start
   
   # Or start the HTTP server
   npm run start:http
   ```

3. For development with auto-reload:
   ```bash
   # Development mode with stdio
   npm run dev
   
   # Development mode with HTTP
   npm run dev:http
   ```

> **Note**: The default scripts in package.json use Bun as the runtime (e.g., `bun run src/index.ts`). If you prefer to use a different package manager or runtime, you can modify these scripts in your package.json file to use Node.js or another runtime of your choice.

## 📖 Detailed Usage

### Transport Methods

The MCP server supports two transport methods:

1. **stdio Transport** (Command Line Mode):
   - Runs on your **local machine**
   - Managed automatically by MCP Client (e.g. cursor)
   - Communicates directly via `stdout`
   - Only accessible by you locally
   - Ideal for personal development and tools

2. **SSE Transport** (HTTP Web Mode):
   - Can run **locally or remotely**
   - Managed and run by you
   - Communicates **over the network**
   - Can be **shared** across machines
   - Ideal for team collaboration and shared tools

### Running the Server Locally

#### stdio Transport (CLI Mode)

Start the server in stdio mode for CLI tools:

```bash
# Start the stdio server
npm start
# or with other package managers
yarn start
pnpm start
bun start

# Start the server in development mode with auto-reload
npm run dev
# or
yarn dev
pnpm dev
bun dev
```

#### HTTP Transport (Web Mode)

Start the server in HTTP mode for web applications:

```bash
# Start the HTTP server
npm run start:http
# or
yarn start:http
pnpm start:http
bun start:http

# Start the HTTP server in development mode with auto-reload
npm run dev:http
# or
yarn dev:http
pnpm dev:http
bun dev:http
```

By default, the HTTP server runs on port 3001. You can change this by setting the PORT environment variable:

```bash
# Start the HTTP server on a custom port
PORT=8080 npm run start:http
```

### Connecting to the Server

#### Connecting from Cursor

To connect to your MCP server from Cursor:

1. Open Cursor and go to Settings (gear icon in the bottom left)
2. Click on "Features" in the left sidebar
3. Scroll down to "MCP Servers" section
4. Click "Add new MCP server"
5. Enter the following details:
   - Server name: `my-mcp-server` (or any name you prefer)
   - For stdio mode:
     - Type: `command`
     - Command: The path to your server executable, e.g., `npm start`
   - For SSE mode:
     - Type: `url`
     - URL: `http://localhost:3001/sse`
6. Click "Save"

#### Using mcp.json with Cursor

For a more portable configuration, create an `.cursor/mcp.json` file in your project's root directory:

**Standard Configuration (SaaS Version):**
```json
{
  "mcpServers": {
    "hap-mcp": {
      "command": "npx",
      "args": ["-y", "@mingdaocloud/hap-mcp"],
      "env": {
        "APPKEY": "your_APPKEY_here",
        "SIGN": "your_signature_here"
      }
    },
    "my-mcp-sse": {
      "url": "http://localhost:3001/sse"
    }
  }
}
```

**Private Deployment Configuration:**
```json
{
  "mcpServers": {
    "hap-mcp": {
      "command": "npx",
      "args": ["-y", "@mingdaocloud/hap-mcp"],
      "env": {
        "APPKEY": "your_APPKEY_here",
        "SIGN": "your_signature_here",
        "HOST": "https://www.nocoly.com"
      }
    },
    "my-mcp-sse": {
      "url": "http://localhost:3001/sse"
    }
  }
}
```

You can also create a global configuration at `~/.cursor/mcp.json` to make your MCP servers available in all your Cursor workspaces.

**Environment Variables:**
- `APPKEY` (required): Your Mingdao application key
- `SIGN` (required): Your Mingdao signature
- `HOST` (optional): Custom host URL for private deployment only (e.g., https://www.nocoly.com). If provided, API calls will use `host/api` instead of `https://api.mingdao.com`

Note:
- The `command` type entries run the server in stdio mode
- The `url` type entry connects to the HTTP server using SSE transport
- You can provide environment variables using the `env` field
- When connecting via SSE with FastMCP, use the full URL including the `/sse` path: `http://localhost:3001/sse`

### Testing Your Server with CLI Tools

FastMCP provides built-in tools for testing your server:

```bash
# Test with mcp-cli
npx fastmcp dev server.js

# Inspect with MCP Inspector
npx fastmcp inspect server.ts
```

### Using Environment Variables

You can customize the server using environment variables:

```bash
# Required Mingdao API credentials
export APPKEY="your_APPKEY_here"
export SIGN="your_signature_here"

# Optional custom host (for private deployment only)
export HOST="https://www.nocoly.com"

# Server configuration
# Change the HTTP port (default is 3001)
PORT=8080 npm run start:http

# Change the host binding (default is 0.0.0.0)
HOST=127.0.0.1 npm run start:http
```

## 🛠️ Adding Custom Tools and Resources

When adding custom tools, resources, or prompts to your FastMCP server:

### Tools

```typescript
server.addTool({
  name: "hello_world",
  description: "A simple hello world tool",
  parameters: z.object({
    name: z.string().describe("Name to greet")
  }),
  execute: async (params) => {
    return `Hello, ${params.name}!`;
  }
});
```

### Resources

```typescript
server.addResourceTemplate({
  uriTemplate: "example://{id}",
  name: "Example Resource",
  mimeType: "text/plain",
  arguments: [
    {
      name: "id",
      description: "Resource ID",
      required: true,
    },
  ],
  async load({ id }) {
    return {
      text: `This is an example resource with ID: ${id}`
    };
  }
});
```

### Prompts

```typescript
server.addPrompt({
  name: "greeting",
  description: "A simple greeting prompt",
  arguments: [
    {
      name: "name",
      description: "Name to greet",
      required: true,
    },
  ],
  load: async ({ name }) => {
    return `Hello, ${name}! How can I help you today?`;
  }
});
```

## 📚 Documentation

For more information about FastMCP, visit [FastMCP GitHub Repository](https://github.com/punkpeye/fastmcp).

For more information about the Model Context Protocol, visit the [MCP Documentation](https://modelcontextprotocol.io/introduction).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
