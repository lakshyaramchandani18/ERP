const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppDataPaths: () => ipcRenderer.invoke('get-app-data-paths'),
  createBackup: (options) => ipcRenderer.invoke('create-backup', options),
  listLocalBackups: () => ipcRenderer.invoke('list-local-backups'),
  restoreBackup: (options) => ipcRenderer.invoke('restore-backup', options),
  openBackupFolder: () => ipcRenderer.invoke('open-backup-folder'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  uploadToGDrive: (fileName) => ipcRenderer.invoke('upload-gdrive', fileName),
  listGDriveBackups: () => ipcRenderer.invoke('list-gdrive-backups'),
  restoreFromGDrive: (options) => ipcRenderer.invoke('restore-gdrive-backup', options),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  printDocument: (options) => ipcRenderer.invoke('print-document', options),
  saveInvoicePdf: (data) => ipcRenderer.invoke('save-invoice-pdf', data),
  uploadCustomTemplate: (data) => ipcRenderer.invoke('upload-custom-template', data),
  listCustomTemplates: () => ipcRenderer.invoke('list-custom-templates'),
  deleteCustomTemplate: (templateId) => ipcRenderer.invoke('delete-custom-template', templateId),
  processCustomTemplate: (data) => ipcRenderer.invoke('process-custom-template', data),
});
