import { copyFile, unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';

export const initialFleet=[
  {name:'Golf 7 · i bardhë',brand:'Volkswagen',description:'Volkswagen Golf 7 i bardhë. Hatchback praktik për qytet dhe udhëtime. Galeria përfshin veturën dhe kabinën e saj. Viti i prodhimit dhe karburanti konfirmohen nga CIPI para rezervimit.',year:0,transmission:'Automatic',fuel:'Unknown',passengers:5,category:'Ekonomike',featured:true,photos:['white-01','white-02']},
  {name:'Golf Sportsvan · i bardhë',brand:'Volkswagen',description:'Volkswagen Golf Sportsvan i bardhë, me trup më të lartë dhe hapësirë praktike. Fotot paraqesin veturën dhe kabinën e saj. Viti i prodhimit dhe karburanti konfirmohen nga CIPI para rezervimit.',year:0,transmission:'Automatic',fuel:'Unknown',passengers:5,category:'Familjare',featured:false,photos:['white-03','white-04']},
  {name:'A-Class · i bardhë',brand:'Mercedes-Benz',description:'Mercedes-Benz A-Class i bardhë. Hatchback kompakt me pamje elegante. Fotot tregojnë pamjen e jashtme nga disa kënde dhe kabinën. Viti, motorizimi dhe pajisjet specifike konfirmohen nga CIPI para rezervimit.',year:0,transmission:'Unknown',fuel:'Unknown',passengers:5,category:'Kompakte premium',featured:true,photos:['mercedes-01','mercedes-02','white-05']},
  {name:'Golf · gri',brand:'Volkswagen',description:'Volkswagen Golf me ngjyrë gri, me pesë dyer. Fotot përfshijnë pamjen e jashtme dhe kabinën. Viti, kambioja dhe motorizimi nuk dallohen në fotografi; CIPI i konfirmon para rezervimit.',year:0,transmission:'Unknown',fuel:'Unknown',passengers:5,category:'Ekonomike',featured:false,photos:['grey-golf-01','grey-golf-02']},
  {name:'Golf · blu',brand:'Volkswagen',description:'Volkswagen Golf me ngjyrë blu të errët. Fotografia paraqet disa kënde të jashtme. Viti, kambioja dhe motorizimi nuk dallohen në fotografi; CIPI i konfirmon para rezervimit.',year:0,transmission:'Unknown',fuel:'Unknown',passengers:5,category:'Ekonomike',featured:false,photos:['blue-golf-01']}
];

export async function seedInitialFleet(db,root,uploadDir){
  if(db.prepare("SELECT 1 FROM app_migrations WHERE name='initial_fleet_seeded_v1'").get())return 0;
  if(db.prepare('SELECT count(*) n FROM vehicles').get().n){db.prepare("INSERT INTO app_migrations(name) VALUES ('initial_fleet_seeded_v1')").run();return 0;}
  const copied=[];
  try{
    db.exec('BEGIN IMMEDIATE');
    for(const vehicle of initialFleet){
      const row=db.prepare('INSERT INTO vehicles(name,brand,description,price_per_day,year,transmission,fuel,passengers,category,available,featured) VALUES (?,?,?,?,?,?,?,?,?,1,?)').run(vehicle.name,vehicle.brand,vehicle.description,0,vehicle.year,vehicle.transmission,vehicle.fuel,vehicle.passengers,vehicle.category,+vehicle.featured);
      const id=Number(row.lastInsertRowid);
      for(let i=0;i<vehicle.photos.length;i++){
        const filename=randomBytes(16).toString('hex')+'.jpg';
        await copyFile(resolve(root,'seed-assets',vehicle.photos[i]+'.jpg'),resolve(uploadDir,filename));copied.push(resolve(uploadDir,filename));
        db.prepare('INSERT INTO vehicle_images(vehicle_id,filename,alt) VALUES (?,?,?)').run(id,filename,`${vehicle.brand} ${vehicle.name} · foto ${i+1}`);
      }
    }
    db.prepare("INSERT INTO app_migrations(name) VALUES ('initial_fleet_seeded_v1')").run();db.exec('COMMIT');return initialFleet.length;
  }catch(error){try{db.exec('ROLLBACK')}catch{}for(const file of copied)await unlink(file).catch(()=>{});throw error;}
}
