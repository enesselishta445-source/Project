window.cipiBackendLive = false;
let cipiSnapshotPromise;
async function cipiReadFleetSnapshot(){
  if(!cipiSnapshotPromise)cipiSnapshotPromise=fetch('/fleet-data.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('Të dhënat e flotës nuk u gjetën.');return response.json()});
  return cipiSnapshotPromise;
}
async function cipiLoadVehicles(){
  try{
    const response=await fetch('/api/public/vehicles',{headers:{Accept:'application/json'}});
    if(response.ok){window.cipiBackendLive=true;return await response.json()}
  }catch{}
  window.cipiBackendLive=false;
  const snapshot=await cipiReadFleetSnapshot();
  return snapshot.vehicles;
}
async function cipiLoadSettings(){
  try{
    const response=await fetch('/api/public/settings',{headers:{Accept:'application/json'}});
    if(response.ok)return await response.json();
  }catch{}
  return (await cipiReadFleetSnapshot()).settings;
}
function cipiWhatsAppReservation(data,vehicle){
  const lines=[
    'Përshëndetje Rent a Car CIPI, dëshiroj të kërkoj këtë rezervim:',
    `Vetura: ${vehicle.brand} ${vehicle.name}`,
    `Data e marrjes: ${data.pickupDate}`,
    `Data e kthimit: ${data.returnDate}`,
    `Emri: ${data.name}`,
    `Telefoni: ${data.phone}`,
    data.email?`Email: ${data.email}`:'',
    data.notes?`Shënim: ${data.notes}`:''
  ].filter(Boolean);
  return 'https://wa.me/38344850815?text='+encodeURIComponent(lines.join('\n'));
}
