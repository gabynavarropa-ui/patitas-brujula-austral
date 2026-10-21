const $=id=>document.getElementById(id);
void import('./theme.js').then(({setupTheme})=>setupTheme());
const moods={green:'Amigable',yellow:'Nervioso o miedoso',red:'Agresivo'};
const paw='<svg aria-hidden="true"><use href="#paw"/></svg>';
const animals={dog:{label:'Perro',found:'Perro encontrado'},cat:{label:'Gato',found:'Gato encontrado'},other:{label:'Otro',found:'Otro animal encontrado'}};
const animalOf=p=>animals[p.animal]||animals.dog;
const storePromise=import('./pet-store.js');
const petPhoto=p=>p.photo||p.photoUrl||'/api/photos/'+p.id;
let older=[];

function showDetail(p){
  const animal=animalOf(p);
  $('history-detail-title').textContent=p.breed;
  $('history-detail-date').textContent=animal.found+' · '+new Date(p.created).toLocaleString('es-CL');
  $('history-detail-photo').src=petPhoto(p);
  $('history-detail-photo').alt='Mascota encontrada: '+p.breed;
  $('history-detail-mood').innerHTML=paw;
  $('history-detail-mood').append(document.createTextNode(moods[p.mood]));
  $('history-detail-mood').className=p.mood;
  $('history-detail-note').textContent=p.note||'Sin características adicionales.';
  $('history-detail').showModal();
}

function render(){
  $('older-count').textContent=older.length;
  $('older-list').replaceChildren();
  if(!older.length){
    const empty=document.createElement('div');
    empty.className='history-empty';
    empty.innerHTML=paw+'<h3>Todavía no hay encuentros anteriores.</h3><p>Cuando existan más de cinco avisos, aparecerán aquí automáticamente.</p><a class="primary" href="./">Volver al mapa</a>';
    $('older-list').append(empty);
    return;
  }
  for(const p of older){
    const animal=animalOf(p);
    const card=document.createElement('article');card.className='history-card';
    const img=document.createElement('img');img.src=petPhoto(p);img.alt=animal.found+': '+p.breed;
    const body=document.createElement('div'),date=document.createElement('small'),title=document.createElement('h3'),mood=document.createElement('p'),button=document.createElement('button');
    date.textContent=animal.label+' · '+new Date(p.created).toLocaleDateString('es-CL');
    title.textContent=p.breed;
    mood.className=p.mood;mood.innerHTML=paw;mood.append(document.createTextNode(moods[p.mood]));
    button.className='secondary';button.textContent='Ver detalles';button.onclick=()=>showDetail(p);
    body.append(date,title,mood,button);card.append(img,body);$('older-list').append(card);
  }
}

async function load(){
  try{
    older=(await (await storePromise).listPets()).slice(5);
    render();
  }catch{
    $('older-list').innerHTML='<p class="error">No pudimos cargar los encuentros anteriores. Vuelve a intentarlo.</p>';
  }
}

$('history-detail').querySelector('.close').onclick=()=>$('history-detail').close();
load();

