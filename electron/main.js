const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const backupEngine = require('./backup');
const gdriveEngine = require('./gdrive');

let mainWindow;

// 1. Base User Directory in Documents/ClothShop ERP
const userDocs = app.getPath('documents');
const DATA_DIR = path.join(userDocs, 'ClothShop ERP');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const LOGS_DIR = path.join(DATA_DIR, 'logs');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const DB_FILE = path.join(DATA_DIR, 'database.db');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

  // Ensure database file exists
  if (!fs.existsSync(DB_FILE)) {
    const seedDbPath = path.join(__dirname, '../database.db');
    if (fs.existsSync(seedDbPath)) {
      fs.copyFileSync(seedDbPath, DB_FILE);
    }
  }

  // Ensure default settings.json
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      shopName: 'Clothing ERP',
      gst: '',
      pan: '',
      currency: 'INR',
      autoBackupSchedule: 'OFF', // 'OFF' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
      lastAutoBackup: null,
      gdrive: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        tokens: null,
        autoUpload: false,
      },
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
}

function readSettings() {
  ensureDirectories();
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeSettings(newSettings) {
  ensureDirectories();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
}

function findFreePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findFreePort(startPort + 1));
    });
  });
}

// Auto Backup Scheduler
function checkAutoBackupSchedule() {
  const settings = readSettings();
  const schedule = settings.autoBackupSchedule;
  if (!schedule || schedule === 'OFF') return;

  const lastBackup = settings.lastAutoBackup ? new Date(settings.lastAutoBackup) : null;
  const now = new Date();

  let isDue = false;
  if (!lastBackup) {
    isDue = true;
  } else {
    const diffHours = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
    if (schedule === 'DAILY' && diffHours >= 24) isDue = true;
    if (schedule === 'WEEKLY' && diffHours >= 24 * 7) isDue = true;
    if (schedule === 'MONTHLY' && diffHours >= 24 * 30) isDue = true;
  }

  if (isDue) {
    try {
      const res = backupEngine.createBackupArchive({
        dataDir: DATA_DIR,
        backupDir: BACKUPS_DIR,
        encrypt: false,
        includeUploads: true,
      });

      settings.lastAutoBackup = now.toISOString();
      writeSettings(settings);

      // Auto upload to GDrive if configured
      if (settings.gdrive?.enabled && settings.gdrive?.autoUpload && settings.gdrive?.tokens) {
        gdriveEngine.uploadBackupToDrive({
          credentials: {
            clientId: settings.gdrive.clientId,
            clientSecret: settings.gdrive.clientSecret,
          },
          tokens: settings.gdrive.tokens,
          filePath: res.filePath,
        }).catch(err => console.error('Auto GDrive upload failed:', err));
      }
    } catch (err) {
      console.error('Auto backup failed:', err);
    }
  }
}

async function createWindow() {
  ensureDirectories();

  // Point Prisma/SQLite to Documents/ClothShop ERP/database.db
  process.env.DATABASE_URL = `file:${DB_FILE}`;

  const isDev = process.env.NODE_ENV === 'development';
  let port = 3000;

  if (isDev) {
    port = 3000;
  } else {
    port = await findFreePort(4000);
    process.env.PORT = String(port);

    try {
      require('../server.js');
    } catch (e) {
      console.error('Failed to load local Next server:', e);
    }
  }

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: 'ClothShop ERP Desktop',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Check auto-backup schedule every 30 minutes
  setInterval(checkAutoBackupSchedule, 30 * 60 * 1000);
  setTimeout(checkAutoBackupSchedule, 10 * 1000);
}

// IPC Handlers
ipcMain.handle('get-app-data-paths', () => {
  return {
    dataDir: DATA_DIR,
    uploadsDir: UPLOADS_DIR,
    backupsDir: BACKUPS_DIR,
    logsDir: LOGS_DIR,
    dbFile: DB_FILE,
  };
});

ipcMain.handle('get-settings', () => {
  return readSettings();
});

ipcMain.handle('save-settings', (event, newSettings) => {
  writeSettings(newSettings);
  return { success: true };
});

ipcMain.handle('create-backup', async (event, options = {}) => {
  try {
    const res = backupEngine.createBackupArchive({
      dataDir: DATA_DIR,
      backupDir: BACKUPS_DIR,
      encrypt: options.encrypt || false,
      password: options.password || '',
      includeUploads: options.includeUploads !== false,
    });

    const settings = readSettings();
    if (settings.gdrive?.enabled && settings.gdrive?.autoUpload && settings.gdrive?.tokens) {
      gdriveEngine.uploadBackupToDrive({
        credentials: {
          clientId: settings.gdrive.clientId,
          clientSecret: settings.gdrive.clientSecret,
        },
        tokens: settings.gdrive.tokens,
        filePath: res.filePath,
      }).catch(err => console.error('Auto GDrive upload failed:', err));
    }

    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('list-local-backups', () => {
  return backupEngine.listLocalBackups(BACKUPS_DIR);
});

ipcMain.handle('restore-backup', async (event, options = {}) => {
  try {
    let filePath = options.filePath;

    if (!filePath) {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Select Backup File to Restore',
        filters: [{ name: 'Backup Archives', extensions: ['zip'] }],
        properties: ['openFile'],
      });
      if (!filePaths || filePaths.length === 0) {
        return { success: false, error: 'No backup file selected' };
      }
      filePath = filePaths[0];
    }

    backupEngine.restoreBackupArchive({
      backupFilePath: filePath,
      dataDir: DATA_DIR,
      password: options.password || '',
    });

    app.relaunch();
    app.exit(0);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('open-backup-folder', () => {
  shell.openPath(BACKUPS_DIR);
  return { success: true };
});

// Google Drive IPC Handlers
ipcMain.handle('upload-gdrive', async (event, fileName) => {
  const settings = readSettings();
  if (!settings.gdrive?.tokens) {
    return { success: false, error: 'Google Drive account is not connected.' };
  }

  const filePath = path.join(BACKUPS_DIR, fileName);
  return gdriveEngine.uploadBackupToDrive({
    credentials: {
      clientId: settings.gdrive.clientId,
      clientSecret: settings.gdrive.clientSecret,
    },
    tokens: settings.gdrive.tokens,
    filePath,
  });
});

ipcMain.handle('list-gdrive-backups', async () => {
  const settings = readSettings();
  if (!settings.gdrive?.tokens) {
    return { success: false, error: 'Google Drive account is not connected.', files: [] };
  }

  return gdriveEngine.listDriveBackups({
    credentials: {
      clientId: settings.gdrive.clientId,
      clientSecret: settings.gdrive.clientSecret,
    },
    tokens: settings.gdrive.tokens,
  });
});

ipcMain.handle('restore-gdrive-backup', async (event, options = {}) => {
  const settings = readSettings();
  if (!settings.gdrive?.tokens) {
    return { success: false, error: 'Google Drive account is not connected.' };
  }

  const tempDest = path.join(BACKUPS_DIR, `gdrive_download_${Date.now()}.zip`);

  const dlRes = await gdriveEngine.downloadDriveBackup({
    credentials: {
      clientId: settings.gdrive.clientId,
      clientSecret: settings.gdrive.clientSecret,
    },
    tokens: settings.gdrive.tokens,
    fileId: options.fileId,
    destPath: tempDest,
  });

  if (!dlRes.success) {
    return dlRes;
  }

  try {
    backupEngine.restoreBackupArchive({
      backupFilePath: tempDest,
      dataDir: DATA_DIR,
      password: options.password || '',
    });

    app.relaunch();
    app.exit(0);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('print-document', async (event, options) => {
  if (mainWindow) {
    mainWindow.webContents.print(options || {});
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('save-invoice-pdf', async (event, { invoiceNo, pdfBase64 }) => {
  try {
    const dateDir = new Date().toISOString().slice(0, 7); // YYYY-MM
    const invDir = path.join(DATA_DIR, 'invoices', dateDir);
    if (!fs.existsSync(invDir)) {
      fs.mkdirSync(invDir, { recursive: true });
    }
    const safeInvNo = (invoiceNo || 'INV').replace(/[/\\?%*:|"<>]/g, '-');
    const pdfPath = path.join(invDir, `${safeInvNo}.pdf`);

    if (pdfBase64) {
      const buffer = Buffer.from(pdfBase64, 'base64');
      fs.writeFileSync(pdfPath, buffer);
      return { success: true, pdfPath };
    }
    return { success: false, error: 'No PDF data provided' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

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
