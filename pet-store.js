const nativeApp=Boolean(window.Capacitor?.isNativePlatform?.());
const localApp=nativeApp||Boolean(window.indexedDB);
const databaseName='patitas-local-v1';
const storeName='pets';
const sample={
  id:'demo-punta-arenas',
  animal:'dog',
  breed:'Quiltro — prueba',
  mood:'yellow',
  note:'AVISO DE PRUEBA · No corresponde a un avistamiento real.\nAv. España con Pedro Aguirre Cerda, Punta Arenas.\nPerrito mestizo, tamaño mediano, pelaje beige y sin collar visible. Se muestra nervioso y se aleja cuando alguien se acerca. Aproximarse con calma, sin perseguirlo.',
  lat:-53.17671,
  lng:-70.93055,
  created:1791846902396,
  photoUrl:'https://upload.wikimedia.org/wikipedia/commons/5/5e/Mixed_breed_dog.jpg'
};

function requestResult(request){
  return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
}

function openDatabase(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(databaseName,1);
    request.onupgradeneeded=()=>request.result.createObjectStore(storeName,{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

async function nativePets(){
  const db=await openDatabase();
  let pets=await requestResult(db.transaction(storeName).objectStore(storeName).getAll());
  if(!pets.length){
    const transaction=db.transaction(storeName,'readwrite');
    transaction.objectStore(storeName).put(sample);
    await new Promise((resolve,reject)=>{transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);});
    pets=[sample];
  }
  db.close();
  return pets.sort((a,b)=>b.created-a.created);
}

export function photoSource(pet){
  return pet.photo||pet.photoUrl||'/api/photos/'+pet.id;
}

export async function listPets(){
  if(localApp)return nativePets();
  const response=await fetch('/api/pets');
  if(!response.ok)throw Error('No pudimos cargar los avisos.');
  return (await response.json()).pets;
}

export async function createPet(input){
  if(!localApp){
    const response=await fetch('/api/pets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
    const data=await response.json();
    if(!response.ok)throw Error(data.error||'No pudimos guardar el aviso.');
    return data.pet;
  }
  const id=crypto.randomUUID?.()||`pet-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const pet={...input,id,created:Date.now()};
  const db=await openDatabase();
  const transaction=db.transaction(storeName,'readwrite');
  transaction.objectStore(storeName).put(pet);
  await new Promise((resolve,reject)=>{transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);});
  db.close();
  return pet;
}

export const isNative=nativeApp;
export const isLocal=localApp;
