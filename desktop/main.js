const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let services = {};

// Create window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false
    }
  });

  const startUrl = 'http://localhost:3000';
  mainWindow.loadURL(startUrl);

  // Hide dev tools in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers for service management
ipcMain.handle('start-service', async (event, serviceType) => {
  return startService(serviceType);
});

ipcMain.handle('stop-service', async (event, serviceType) => {
  return stopService(serviceType);
});

ipcMain.handle('check-service-status', async (event, serviceType) => {
  return checkServiceStatus(serviceType);
});

ipcMain.handle('open-browser', async (event, url) => {
  require('electron').shell.openExternal(url);
  return true;
});

// Service management functions
function startService(serviceType) {
  return new Promise((resolve) => {
    if (services[serviceType]) {
      resolve({ success: false, message: 'Service already running' });
      return;
    }

    const projectRoot = 'C:\\Users\\user\\OneDrive\\Desktop\\mini-capstone\\tabulation-systemv2';
    let command, args;

    switch (serviceType) {
      case 'redis':
        command = 'cmd.exe';
        args = ['/c', `cd /d ${projectRoot}\\server\\redis && redis-server`];
        break;
      case 'laravel':
        command = 'cmd.exe';
        args = ['/c', `cd /d ${projectRoot}\\backend && php artisan serve`];
        break;
      case 'echo':
        command = 'cmd.exe';
        args = ['/c', `cd /d ${projectRoot}\\backend && laravel-echo-server start`];
        break;
      case 'frontend':
        command = 'cmd.exe';
        args = ['/c', `cd /d ${projectRoot}\\frontend && npm run dev`];
        break;
      default:
        resolve({ success: false, message: 'Unknown service' });
        return;
    }

    const process = spawn(command, args, { detached: true, stdio: 'ignore' });
    services[serviceType] = process;
    process.unref();

    resolve({ success: true, message: `${serviceType} started` });
  });
}

function stopService(serviceType) {
  return new Promise((resolve) => {
    if (!services[serviceType]) {
      resolve({ success: false, message: 'Service not running' });
      return;
    }

    try {
      const process = services[serviceType];
      process.kill();
      delete services[serviceType];
      resolve({ success: true, message: `${serviceType} stopped` });
    } catch (error) {
      resolve({ success: false, message: error.message });
    }
  });
}

function checkServiceStatus(serviceType) {
  return new Promise((resolve) => {
    const isRunning = services[serviceType] !== undefined;
    resolve({ running: isRunning });
  });
}

// Create menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          if (mainWindow) mainWindow.reload();
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => {
          if (mainWindow) mainWindow.webContents.toggleDevTools();
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
