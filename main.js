const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('Electron main.js is loading...');

let mainWindow;

function createWindow() {
  console.log('Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    show: false,
    titleBarStyle: 'default',
    icon: getIconPath()
  });

  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  
  if (isDev) {
    // Development mode - load from Angular dev server
    console.log('Loading from Angular dev server...');
    mainWindow.loadURL('http://localhost:4200')
      .then(() => {
        console.log('Successfully loaded dev server');
        mainWindow.webContents.openDevTools();
      })
      .catch(err => {
        console.error('Failed to load dev server:', err);
        loadErrorPage('Please start Angular dev server first: npm run start');
      });
  } else {
    // Production mode - load built Angular app
    loadProductionApp();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Window is ready and visible');
  });

  // Add debugging for page load
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });

  // Open dev tools to see any console errors
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

function loadProductionApp() {
  // Try different possible paths for the built Angular app
  const possiblePaths = [
    path.join(__dirname, 'dist/qurancenter/browser/index.html'),  // Angular 17+ with new build system
    path.join(__dirname, 'dist/qurancenter/index.html'),          // Angular 16 and below
    path.join(__dirname, 'dist/index.html')                       // Alternative path
  ];

  console.log('Looking for built Angular app...');
  
  for (const indexPath of possiblePaths) {
    console.log('Checking path:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      console.log('Found index.html at:', indexPath);
      mainWindow.loadFile(indexPath)
        .then(() => {
          console.log('Successfully loaded Angular app');
        })
        .catch(err => {
          console.error('Failed to load Angular app:', err);
          loadErrorPage('Failed to load the application');
        });
      return;
    }
  }

  // No built app found
  console.error('No built Angular app found');
  loadErrorPage('Angular app not built. Please run: npm run build');
}

function loadErrorPage(message) {
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quran Center</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
        }
        .container {
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        h1 { color: #fff; margin-bottom: 20px; }
        p { font-size: 16px; margin-bottom: 30px; }
        .steps {
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🕌 Quran Center</h1>
        <p>${message}</p>
        <div class="steps">
          <h3>To run your app:</h3>
          <p>1. Open terminal in your project folder</p>
          <p>2. Run: <code>npm run build</code></p>
          <p>3. Run: <code>npm run electron</code></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  mainWindow.loadURL('data:text/html,' + encodeURIComponent(errorHtml));
}

function getIconPath() {
  const iconPaths = [
    path.join(__dirname, 'src/assets/favicon.ico'),
    path.join(__dirname, 'src/favicon.ico'),
    path.join(__dirname, 'dist/qurancenter/favicon.ico'),
    path.join(__dirname, 'dist/qurancenter/browser/favicon.ico')
  ];
  
  for (const iconPath of iconPaths) {
    if (fs.existsSync(iconPath)) {
      console.log('Using icon:', iconPath);
      return iconPath;
    }
  }
  
  console.log('No icon found');
  return undefined;
}

app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    require('electron').shell.openExternal(url);
  });
});

console.log('main.js loaded successfully');