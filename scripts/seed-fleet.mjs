try { process.loadEnvFile?.(); } catch {}
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedInitialFleet } from '../lib/fleet-seed.mjs';
import { splitGolfSportsvanPhotos } from '../lib/fleet-migrations.mjs';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const dbPath=resolve(root,process.env.DATABASE_PATH||'.data/cipi.sqlite');
const uploadDir=resolve(root,process.env.UPLOAD_DIR||'uploads');
const db=new DatabaseSync(dbPath);db.exec('PRAGMA foreign_keys=ON');
try{const count=await seedInitialFleet(db,root,uploadDir);const split=splitGolfSportsvanPhotos(db);console.log(count?`${count} vetura u shtuan.`:split?'Fotot e Golf Sportsvan u ndanë nga galeria e Golf 7.':'Flota ekzistuese u ruajt pa ndryshime.');}catch(e){console.error(e.message);process.exitCode=1;}finally{db.close();}
