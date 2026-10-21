const key='patitas-theme';

function preferredTheme(){
  const cookie=document.cookie.split('; ').find(value=>value.startsWith('patitas_theme='))?.split('=')[1];
  if(cookie==='light'||cookie==='dark')return cookie;
  try{
    const saved=localStorage.getItem(key);
    if(saved==='light'||saved==='dark')return saved;
  }catch{}
  return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
}

function applyTheme(theme,button){
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  const dark=theme==='dark';
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=dark?'#101a18':'#eaf1ed';
  if(button){
    button.innerHTML=`<span aria-hidden="true">${dark?'☀':'☾'}</span><b>${dark?'Claro':'Oscuro'}</b>`;
    button.setAttribute('aria-label',dark?'Cambiar a modo claro':'Cambiar a modo oscuro');
    button.setAttribute('aria-pressed',String(dark));
    button.title=dark?'Cambiar a modo claro':'Cambiar a modo oscuro';
  }
  document.dispatchEvent(new CustomEvent('patitas-theme-change',{detail:{theme}}));
}

export function setupTheme(){
  if(document.getElementById('theme-toggle'))return;
  const button=document.createElement('button');
  button.id='theme-toggle';button.className='theme-toggle';button.type='button';
  const header=document.querySelector('header');
  const actions=header?.querySelector('.header-right');
  if(actions)actions.prepend(button);
  else header?.insertBefore(button,header.lastElementChild);
  applyTheme(preferredTheme(),button);
  button.addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem(key,next);}catch{}
    document.cookie=`patitas_theme=${next}; Max-Age=31536000; Path=/; SameSite=Lax`;
    applyTheme(next,button);
  });
}
