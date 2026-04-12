const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const MIME_TO_EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp'
};

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

function buildPublicUrl(baseUrl, relativeStoragePath) {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/$/, '');
  const normalizedPath = relativeStoragePath.replace(/\\/g, '/');
  return `${normalizedBaseUrl}/uploads/${normalizedPath}`;
}

exports.saveTripCover = async ({ userId, fileBuffer, mimeType, baseUrl }) => {
  const extension = MIME_TO_EXTENSION[mimeType];
  if (!extension) {
    throw new Error('Type MIME non supporte');
  }

  const userFolder = `user-${userId}`;
  const fileName = `trip-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const relativeStoragePath = path.join('trip-covers', userFolder, fileName);
  const absoluteStoragePath = path.join(UPLOADS_DIR, relativeStoragePath);

  await fs.mkdir(path.dirname(absoluteStoragePath), { recursive: true });
  await fs.writeFile(absoluteStoragePath, fileBuffer);

  return {
    storagePath: relativeStoragePath.replace(/\\/g, '/'),
    publicUrl: buildPublicUrl(baseUrl, relativeStoragePath)
  };
};
