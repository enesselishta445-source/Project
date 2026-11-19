try { process.loadEnvFile?.(); } catch {}
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const dbPath = resolve(root, process.env.DATABASE_PATH || '.data/cipi.sqlite');
const outputPath = resolve(root, 'public/fleet-data.json');
const db = new DatabaseSync(dbPath, { readOnly: true });

try {
  const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY featured DESC,id DESC').all().map(vehicle => ({
    ...vehicle,
    available: Boolean(vehicle.available),
    featured: Boolean(vehicle.featured),
    images: db.prepare('SELECT id,filename,alt FROM vehicle_images WHERE vehicle_id=? ORDER BY id').all(vehicle.id)
      .map(image => ({ id: image.id, url: `/uploads/${image.filename}`, alt: image.alt }))
  }));
  const settings = Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map(row => [row.key, row.value]));
  await writeFile(outputPath, JSON.stringify({ vehicles, settings }, null, 2) + '\n', 'utf8');
  console.log(`Snapshot publik u përditësua: ${vehicles.length} vetura, ${vehicles.reduce((sum, vehicle) => sum + vehicle.images.length, 0)} fotografi.`);
} finally {
  db.close();
}
