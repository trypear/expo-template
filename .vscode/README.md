# VSCode Configuration for Expo Test Project

This directory contains VSCode configuration files to make development easier.

## Launch Configurations (Run and Debug)

The `launch.json` file contains predefined configurations that can be run directly from VSCode's Run and Debug panel. These provide one-click buttons to start development servers for each package.

### How to Use Launch Configurations

1. Click on the Run and Debug icon in the Activity Bar (or press `Ctrl+Shift+D` / `Cmd+Shift+D`)
2. Select a configuration from the dropdown at the top of the Run and Debug panel
3. Click the green play button or press `F5` to start the selected configuration
4. To stop all running servers, click the red stop button - this will close all terminals at once!

### Available Launch Configurations

Each configuration runs in its own terminal:

#### App Development

- 📱 **Mobile App: Dev** - Run Expo dev server
- 🌐 **Next.js: Dev** - Run NextJS dev server

#### Infrastructure

- ☁️ **Cloudflare Tunnel** - Run Cloudflare tunnel for external access

#### Package Development (Watch Mode)

- 🔌 **API: Watch** - Run API in watch mode (tsc --watch)
- 📊 **DB: Watch** - Run DB in watch mode (tsc --watch)
- 🔐 **Auth: Watch** - Run Auth in watch mode (tsc --watch)
- 🛠️ **Utils: Watch** - Run Utils in watch mode (tsc --watch)
- ✅ **Validators: Watch** - Run Validators in watch mode (tsc --watch)

#### Database Operations

- 📊 **DB: Studio** - Open Drizzle Studio
- 📊 **DB: Push** - Push DB schema changes

#### Compound Launch Configuration

- 🚀 **Start All Dev Servers** - Start all package dev servers at once, each in its own terminal
  - This configuration will first close any existing terminals
  - Starts the Cloudflare tunnel for external access
  - When stopped (using the red stop button), it will close all terminals at once

## Tasks

The `tasks.json` file contains predefined tasks that can be run directly from VSCode. These tasks provide quick access to common development commands without having to remember or type them in the terminal.

### How to Use Tasks

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the Command Palette
2. Type "Tasks: Run Task" and select it
3. Choose from the list of available tasks

Alternatively, you can:

- Configure keyboard shortcuts for specific tasks in VSCode settings
- Use the "Terminal > Run Task..." menu

### Available Tasks

All tasks run in their own terminals:

#### Infrastructure Tasks

- ☁️ **Cloudflare Tunnel** - Run Cloudflare tunnel for external access

#### Mobile App Tasks

- 📱 **Mobile: Dev** - Run Expo dev server
- 📱 **Mobile: Android** - Run on Android
- 📱 **Mobile: iOS** - Run on iOS
- 📱 **Mobile: Web** - Run on Web

#### NextJS App Tasks

- 🌐 **NextJS: Dev** - Run NextJS dev server
- 🌐 **NextJS: Build** - Build NextJS app
- 🌐 **NextJS: Start** - Start NextJS production server

#### API Package Tasks

- 🔌 **API: Watch** - Run API in watch mode (tsc --watch)
- 🔌 **API: Typecheck** - Run API typechecking

#### DB Package Tasks

- 📊 **DB: Watch** - Run DB in watch mode (tsc --watch)
- 📊 **DB: Push** - Push DB schema changes
- 📊 **DB: Generate** - Generate Drizzle migrations
- 📊 **DB: Migrate** - Run Drizzle migrations
- 📊 **DB: Studio** - Open Drizzle Studio

#### Auth Package Tasks

- 🔐 **Auth: Watch** - Run Auth in watch mode (tsc --watch)
- 🔐 **Auth: Typecheck** - Run Auth typechecking

#### Utils Package Tasks

- 🛠️ **Utils: Watch** - Run Utils in watch mode (tsc --watch)
- 🛠️ **Utils: Typecheck** - Run Utils typechecking

#### Validators Package Tasks

- ✅ **Validators: Watch** - Run Validators in watch mode (tsc --watch)
- ✅ **Validators: Typecheck** - Run Validators typechecking

#### Utility Tasks

- ✨ **Format Fix** - Fix formatting issues
- 🧹 **Lint Fix** - Fix linting issues
- 🔎 **Typecheck All** - Run typechecking for all packages
- **close-all-terminals** - Closes all open terminal instances (used internally)

#### Compound Task

- 🚀 **Start All Dev Servers** - Start all package dev servers at once, each in its own terminal
  - This task will first close any existing terminals before starting new ones
  - Includes starting the Cloudflare tunnel for external access

## Tips

- **Launch Configurations vs Tasks**:

  - Use **Launch Configurations** when you want clickable buttons in the Run and Debug panel
  - Use **Tasks** when you need more complex commands or want to run them from the Command Palette

- Each task and launch configuration runs in its own terminal for better visibility and control
- Tasks are grouped by functionality, making it easier to find related commands
- The compound configurations let you start all dev servers with a single click
- All TypeScript packages now run in watch mode, so they'll automatically recompile when files change
- The stop button in the Run and Debug panel will close all terminals at once when using the compound configuration
- The Cloudflare tunnel provides external access to your local development environment
