(()=>{
  if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
  const box=document.getElementById('pwa-message');
  const title=document.getElementById('pwa-title');
  const copy=document.getElementById('pwa-copy');
  const action=document.getElementById('pwa-action');
  const later=document.getElementById('pwa-later');
  let waitingWorker;

  const showUpdate=worker=>{
    waitingWorker=worker;
    title.textContent='Nueva versión disponible';
    copy.textContent='Puedes seguir usando Patitas y actualizar cuando estés listo.';
    action.textContent='Actualizar';
    box.hidden=false;
  };

  later?.addEventListener('click',()=>{box.hidden=true;});
  action?.addEventListener('click',()=>{
    if(!waitingWorker)return;
    box.classList.add('is-installing');
    action.textContent='Actualizando…';
    waitingWorker.postMessage({type:'SKIP_WAITING'});
  });

  let refreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing)return;
    refreshing=true;
    location.reload();
  });

  addEventListener('load',async()=>{
    try{
      const basePath=new URL('./',location.href).pathname;
      const registration=await navigator.serviceWorker.register(new URL('sw.js',location.href),{scope:basePath});
      if(registration.waiting&&navigator.serviceWorker.controller)showUpdate(registration.waiting);
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        worker?.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(worker);
        });
      });
      await registration.update();
      setInterval(()=>registration.update(),60*60*1000);
    }catch(error){console.warn('No pudimos preparar las actualizaciones automáticas.',error);}
  });
})();
