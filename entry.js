const $=id=>document.getElementById(id);
const storageKey='meauzeek.stellachat.pages.endpoint.v1';
let defaultEndpoint='',deviceEndpoint='',edited=false;

// This portal accepts an origin only. All application authentication stays at that origin.
function endpoint(value){
  if(typeof value!=='string')return '';
  const raw=value.trim();
  if(!/^https:\/\//i.test(raw)||/[\s\\?#@]/.test(raw))return '';
  try{
    const url=new URL(raw);
    if(!url.hostname||url.username||url.password||url.pathname!=='/'||url.origin===location.origin)return '';
    return url.origin+'/';
  }catch{return ''}
}
function stored(){try{return endpoint(localStorage.getItem(storageKey))}catch{return ''}}
function show(active){
  $('destination').hidden=!active;$('editor').hidden=!!active;
  $('error').hidden=true;$('cancel').hidden=!(deviceEndpoint||defaultEndpoint);
  if(active){
    $('source').textContent=deviceEndpoint?'此设备的服务器':'站点默认服务器';
    $('address').textContent=active;$('enter').href=active;$('forget').hidden=!deviceEndpoint;
  }else{
    $('setup-status').textContent=defaultEndpoint||deviceEndpoint?'填写新地址后再进入聊天。':'此入口尚未设置默认服务器。';
    $('endpoint').value=deviceEndpoint||defaultEndpoint;
  }
}
deviceEndpoint=stored();
if(deviceEndpoint)show(deviceEndpoint);
$('endpoint').addEventListener('input',()=>{edited=true;$('error').hidden=true});
$('change').onclick=()=>{edited=true;show('');$('endpoint').focus();$('endpoint').select()};
$('cancel').onclick=()=>{edited=false;show(deviceEndpoint||defaultEndpoint)};
$('forget').onclick=()=>{
  try{localStorage.removeItem(storageKey)}catch{}
  deviceEndpoint='';show(defaultEndpoint);
};
$('editor').onsubmit=event=>{
  event.preventDefault();
  const value=endpoint($('endpoint').value);
  if(!value){
    $('error').textContent='请输入完整的 HTTPS 服务器首页地址，可带端口。请移除账户信息、路径、查询参数或片段。';
    $('error').hidden=false;$('endpoint').focus();return;
  }
  try{
    if($('remember').checked)localStorage.setItem(storageKey,value);
    else localStorage.removeItem(storageKey);
  }catch{}
  location.assign(value);
};
const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),3500);
try{
  const response=await fetch('./default-endpoint.json',{cache:'no-store',credentials:'omit',redirect:'error',signal:abort.signal});
  if(response.ok)defaultEndpoint=endpoint((await response.json()).endpoint);
}catch{}finally{
  clearTimeout(timer);
  if(!edited)show(deviceEndpoint||defaultEndpoint);
  else if(!$('editor').hidden)$('setup-status').textContent='填写后进入聊天服务器。';
}
