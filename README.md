# API Testing Interface

A modern API testing tool similar to Postman, built with Next.js, TypeScript, and other modern web technologies.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with IndexedDB support

### Installation & Running Locally

1. **Clone and install dependencies:**
   ```bash
   cd api-testing-app
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
npm run build
npm start
```

## Features Implemented

### ✅ Core Features

- **Workspace Management**
  - Create, rename, and switch between workspaces
  - Workspace validation with real-time error feedback
  - Persistent storage using IndexedDB

- **Request Management**
  - Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
  - Tab system with 15 tab limit
  - Auto-save request data

- **Import & Export**
  - Import from cURL commands
  - Copy as cURL with full request details

- **Request Configuration**
  - URL input with method selection
  - Query parameters editor with bulk edit mode
  - Headers editor with bulk edit mode
  - Request body support (Raw JSON/Text)
  - JSON beautification
  - Authentication panel (Not implemented yet)

- **Bulk Edit Features**
  - Toggle between key-value UI and text editor
  - Format: `key:value // description` syntax
  - Disabled rows with `//` prefix
  - Real-time sync between modes

- **Response Handling**
  - Status code and response time display
  - Response headers viewer
  - Raw response text view
  - Error handling for network failures

- **User Experience**
  - Keyboard navigation support
  - Loading states and error feedback
  - Professional Postman-like interface


## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **State Management:** Redux Toolkit
- **Storage:** IndexedDB (Dexie.js)
- **HTTP Client:** Axios
- **Code Editor:** Monaco Editor (for JSON/text editing)

## Architecture

- **Protocol-based architecture** for future expansion (REST, GraphQL, WebSocket)
- **Modular component structure** with clear separation of concerns
- **Database separation** per protocol for optimal performance
- **Workspace-centric design** for organization

## Development Notes

### Assumptions Made

- Modern browser environment with ES6+ support
- IndexedDB available for local storage
- Default SSE endpoint: `https://binary-seven.vercel.app/api/proxy/sse`

### Key Design Decisions

- **Epoch timestamps** used throughout for Redux serialization
- **Protocol-specific databases** for scalability
- **Tab limit of 15** to prevent performance issues
- **Real-time state sync** between components via Redux
- **Accessibility-first approach** with keyboard navigation

## API Endpoints

The application uses Next.js API routes for request proxying:

- `/api/proxy/sse` - Server-sent events proxy
