export function splitGolfSportsvanPhotos(db){
  if(db.prepare("SELECT 1 FROM app_migrations WHERE name='golf_sportsvan_photos_split_v1'").get())return false;
  let changed=false;
  db.exec('BEGIN IMMEDIATE');
  try{
    const golf=db.prepare("SELECT * FROM vehicles WHERE brand='Volkswagen' AND name='Golf 7 · i bardhë' ORDER BY id LIMIT 1").get();
    if(golf){
      const photos=db.prepare("SELECT id,alt FROM vehicle_images WHERE vehicle_id=? AND (alt LIKE '%foto 3' OR alt LIKE '%foto 4') ORDER BY id").all(golf.id);
      if(photos.length===2){
        let sportsvan=db.prepare("SELECT id FROM vehicles WHERE brand='Volkswagen' AND name='Golf Sportsvan · i bardhë' ORDER BY id LIMIT 1").get();
        if(!sportsvan){
          const row=db.prepare('INSERT INTO vehicles(name,brand,description,price_per_day,year,transmission,fuel,passengers,category,available,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run('Golf Sportsvan · i bardhë','Volkswagen','Volkswagen Golf Sportsvan i bardhë, me trup më të lartë dhe hapësirë praktike. Fotot paraqesin veturën dhe kabinën e saj. Viti i prodhimit dhe karburanti konfirmohen nga CIPI para rezervimit.',golf.price_per_day,0,'Automatic','Unknown',5,'Familjare',golf.available,0);
          sportsvan={id:Number(row.lastInsertRowid)};
        }
        const move=db.prepare('UPDATE vehicle_images SET vehicle_id=?,alt=? WHERE id=?');
        move.run(sportsvan.id,'Volkswagen Golf Sportsvan · i bardhë · foto 1',photos[0].id);
        move.run(sportsvan.id,'Volkswagen Golf Sportsvan · i bardhë · foto 2',photos[1].id);
        changed=true;
      }
    }
    db.prepare("INSERT INTO app_migrations(name) VALUES ('golf_sportsvan_photos_split_v1')").run();
    db.exec('COMMIT');
  }catch(error){try{db.exec('ROLLBACK')}catch{}throw error;}
  return changed;
}
