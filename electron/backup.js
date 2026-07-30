const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AdmZip = require('adm-zip');

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

function encryptBuffer(buffer, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  // Format: [16 bytes salt][16 bytes IV][encrypted content]
  return Buffer.concat([salt, iv, encrypted]);
}

function decryptBuffer(encryptedBuffer, password) {
  const salt = encryptedBuffer.subarray(0, 16);
  const iv = encryptedBuffer.subarray(16, 32);
  const ciphertext = encryptedBuffer.subarray(32);
  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Creates a ZIP (or encrypted ZIP) backup of the user data directory
 */.
function createBackupArchive({ dataDir, backupDir, encrypt = false, password = '', includeUploads = true }) {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const zipFileName = `ClothShop_Backup_${timestamp}.zip`;
  const encFileName = `ClothShop_Backup_${timestamp}.enc.zip`;
  const finalFileName = encrypt ? encFileName : zipFileName;
  const finalPath = path.join(backupDir, finalFileName);

  const zip = new AdmZip();

  // 1. Add database.db
  const dbPath = path.join(dataDir, 'database.db');
  if (fs.existsSync(dbPath)) {
    zip.addLocalFile(dbPath, '', 'database.db');
  }

  // 2. Add settings.json
  const settingsPath = path.join(dataDir, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    zip.addLocalFile(settingsPath, '', 'settings.json');
  }

  // 3. Add uploads folder
  if (includeUploads) {
    const uploadsPath = path.join(dataDir, 'uploads');
    if (fs.existsSync(uploadsPath) && fs.statSync(uploadsPath).isDirectory()) {
      zip.addLocalFolder(uploadsPath, 'uploads');
    }
  }

  const zipBuffer = zip.toBuffer();

  if (encrypt && password) {
    const encryptedData = encryptBuffer(zipBuffer, password);
    fs.writeFileSync(finalPath, encryptedData);
  } else {
    fs.writeFileSync(finalPath, zipBuffer);
  }

  const stats = fs.statSync(finalPath);

  return {
    success: true,
    fileName: finalFileName,
    filePath: finalPath,
    size: stats.size,
    createdAt: new Date().toISOString(),
    isEncrypted: encrypt,
  };
}

/**
 * Lists all backups in the local backup directory
 */
function listLocalBackups(backupDir) {
  if (!fs.existsSync(backupDir)) return [];

  const files = fs.readdirSync(backupDir);
  const backups = [];

  for (const file of files) {
    if (file.endsWith('.zip')) {
      const fullPath = path.join(backupDir, file);
      const stats = fs.statSync(fullPath);
      backups.push({
        fileName: file,
        filePath: fullPath,
        size: stats.size,
        createdAt: stats.mtime.toISOString(),
        isEncrypted: file.endsWith('.enc.zip'),
      });
    }
  }

  return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Restores a backup ZIP file into dataDir
 */
function restoreBackupArchive({ backupFilePath, dataDir, password = '' }) {
  if (!fs.existsSync(backupFilePath)) {
    throw new Error('Backup file not found at ' + backupFilePath);
  }

  let zipBuffer = fs.readFileSync(backupFilePath);

  if (backupFilePath.endsWith('.enc.zip')) {
    if (!password) {
      throw new Error('Password required to decrypt encrypted backup.');
    }
    try {
      zipBuffer = decryptBuffer(zipBuffer, password);
    } catch (err) {
      throw new Error('Invalid password or corrupted backup file.');
    }
  }

  const zip = new AdmZip(zipBuffer);
  zip.extractAllTo(dataDir, true);

  return { success: true };
}

module.exports = {
  createBackupArchive,
  listLocalBackups,
  restoreBackupArchive,
};
