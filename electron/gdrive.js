const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

const FOLDER_NAME = 'ClothShop_ERP_Backups';

function checkInternet() {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!err);
    });
  });
}

function getOAuth2Client(credentials) {
  const { clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob' } = credentials;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function getOrCreateBackupFolder(drive) {
  const res = await drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folderMeta = {
    name: FOLDER_NAME,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    resource: folderMeta,
    fields: 'id',
  });

  return folder.data.id;
}

async function uploadBackupToDrive({ credentials, tokens, filePath }) {
  const isOnline = await checkInternet();
  if (!isOnline) {
    return { success: false, offline: true, error: 'No internet connection available.' };
  }

  try {
    const oAuth2Client = getOAuth2Client(credentials);
    oAuth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const folderId = await getOrCreateBackupFolder(drive);

    const fileName = path.basename(filePath);
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/zip',
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, createdTime, size',
    });

    return {
      success: true,
      fileId: file.data.id,
      fileName: file.data.name,
      createdTime: file.data.createdTime,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function listDriveBackups({ credentials, tokens }) {
  const isOnline = await checkInternet();
  if (!isOnline) {
    return { success: false, offline: true, files: [] };
  }

  try {
    const oAuth2Client = getOAuth2Client(credentials);
    oAuth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const folderId = await getOrCreateBackupFolder(drive);

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, size, createdTime)',
      orderBy: 'createdTime desc',
    });

    return {
      success: true,
      files: res.data.files.map((f) => ({
        id: f.id,
        fileName: f.name,
        size: parseInt(f.size || '0', 10),
        createdAt: f.createdTime,
        isEncrypted: f.name.endsWith('.enc.zip'),
      })),
    };
  } catch (err) {
    return { success: false, error: err.message, files: [] };
  }
}

async function downloadDriveBackup({ credentials, tokens, fileId, destPath }) {
  const isOnline = await checkInternet();
  if (!isOnline) {
    return { success: false, offline: true, error: 'No internet connection available.' };
  }

  try {
    const oAuth2Client = getOAuth2Client(credentials);
    oAuth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const dest = fs.createWriteStream(destPath);
    const res = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
      res.data
        .on('end', () => resolve({ success: true, destPath }))
        .on('error', (err) => reject({ success: false, error: err.message }))
        .pipe(dest);
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  checkInternet,
  uploadBackupToDrive,
  listDriveBackups,
  downloadDriveBackup,
};
