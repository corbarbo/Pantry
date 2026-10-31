const DB='pantrypal-db', STORE='state'; let state={recipes:[],books:[],plan:{},groceries:[]};
const $=id=>document.getElementById(id); const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function openDB(){return new Promise((res,rej)=>{let req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE);req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)})}
async function load(){try{let db=await openDB();let tx=db.transaction(STORE);let v=await new Promise(r=>{let q=tx.objectStore(STORE).get('main');q.onsuccess=()=>r(q.result)});if(v)state=v;else{state.recipes=[{id:crypto.randomUUID(),title:'Creamy lemon orzo',category:'Dinner',time:'25 min',description:'Bright, cozy and quick.',ingredients:'1 cup orzo\\n2 cups broth\\n1 lemon\\n½ cup parmesan',steps:'Toast orzo briefly. Add broth and simmer until tender. Finish with lemon and parmesan.',url:''},{id:crypto.randomUUID(),title:'Crispy breakfast potatoes',category:'Breakfast',time:'30 min',description:'Golden edges, soft centers.',ingredients:'4 potatoes\\n2 tbsp oil\\nSalt and paprika',steps:'Dice potatoes. Toss with oil and seasoning. Roast at 425°F until crisp.',url:''}] ;await save()}}catch(e){toast('Could not open local storage.')}} 
async function save(){let db=await openDB();let tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(state,'main');return new Promise(r=>tx.oncomplete=r)}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2100)}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){renderRecipes();renderBooks();renderPlan();renderGroceries()}
function renderRecipes(){let q=$('search').value.toLowerCase();let list=state.recipes.filter(r=>(r.title+' '+r.ingredients+' '+r.category).toLowerCase().includes(q));$('recipeList').innerHTML=list.length?list.map(r=>`<article class="recipe" data-id="${r.id}"><div>${r.image?`<img class="recipe-photo" src="${esc(r.image)}" alt="Food photo" loading="lazy">`:``}<span class="pill">${esc(r.category||'Recipe')}</span><h3>${esc(r.title)}</h3><p>${esc(r.description||'A recipe in your collection')}</p></div><p>◷ ${esc(r.time||'Time not set')}</p></article>`).join(''):'<p class="muted">No recipes yet. Add one to get started.</p>';document.querySelectorAll('.recipe').forEach(el=>el.onclick=()=>detail(el.dataset.id))}
function renderBooks(){$('bookList').innerHTML=state.books.length?state.books.map(b=>`<div class="book"><h3>${esc(b.name)}</h3><p class="muted">${b.ids.length} saved recipes</p><select data-book="${b.id}"><option value="">Add a recipe…</option>${state.recipes.map(r=>`<option value="${r.id}">${esc(r.title)}</option>`).join('')}</select><div>${b.ids.map(id=>{let r=state.recipes.find(x=>x.id===id);return r?`<p>• ${esc(r.title)}</p>`:''}).join('')}</div></div>`).join(''):'<p class="muted">Create a cookbook to collect your favorites.</p>';document.querySelectorAll('[data-book]').forEach(s=>s.onchange=async()=>{let b=state.books.find(x=>x.id===s.dataset.book);if(s.value&&!b.ids.includes(s.value))b.ids.push(s.value);await save();renderBooks()})}
function renderPlan(){$('plannerGrid').innerHTML=days.map(d=>`<div class="day"><h3>${d}</h3><select data-day="${d}"><option value="">No meal planned</option>${state.recipes.map(r=>`<option value="${r.id}" ${state.plan[d]===r.id?'selected':''}>${esc(r.title)}</option>`).join('')}</select></div>`).join('');document.querySelectorAll('[data-day]').forEach(s=>s.onchange=async()=>{state.plan[s.dataset.day]=s.value;await save();toast('Meal plan saved')})}
function renderGroceries(){$('groceryList').innerHTML=state.groceries.length?state.groceries.map((g,i)=>`<div class="grocery ${g.done?'done':''}"><input type="checkbox" data-check="${i}" ${g.done?'checked':''}><span>${esc(g.text)}</span></div>`).join(''):'<p class="muted">Your grocery list is empty.</p>';document.querySelectorAll('[data-check]').forEach(c=>c.onchange=async()=>{state.groceries[+c.dataset.check].done=c.checked;await save();renderGroceries()})}
function detail(id){let r=state.recipes.find(x=>x.id===id);if(!r)return;$('detailContent').innerHTML=`<div class="modalhead"><h2>${esc(r.title)}</h2><button class="quiet close">✕</button></div>${r.image?`<img class="detail-photo" src="${esc(r.image)}" alt="Food photo">`:``}<p class="pill">${esc(r.category)} · ${esc(r.time)}</p><p>${esc(r.description)}</p><h3>Ingredients</h3><div class="detailtext">${esc(r.ingredients)}</div><h3>Instructions</h3><div class="detailtext">${esc(r.steps)}</div>${r.url?`<p><a href="${esc(r.url)}" target="_blank" rel="noopener">Original source ↗</a></p>`:''}<div class="detailbuttons"><button class="primary" id="editDetail">Edit recipe</button><button id="addIngredients">Add ingredients to groceries</button></div>`;$('detailDialog').showModal();$('detailContent').querySelector('.close').onclick=()=>$('detailDialog').close();$('editDetail').onclick=()=>{ $('detailDialog').close();editRecipe(r)};$('addIngredients').onclick=async()=>{r.ingredients.split('\\n').map(x=>x.trim()).filter(Boolean).forEach(x=>state.groceries.push({text:x,done:false}));await save();renderGroceries();$('detailDialog').close();toast('Ingredients added')}}
function editRecipe(r){photoData='';$('recipeDialogTitle').textContent='Edit recipe';$('recipeId').value=r.id;$('rTitle').value=r.title;$('rDescription').value=r.description||'';$('rCategory').value=r.category||'Dinner';$('rTime').value=r.time||'';$('rIngredients').value=r.ingredients||'';$('rSteps').value=r.steps||'';$('rUrl').value=r.url||'';$('rImage').value=r.image?.startsWith('data:')?'':r.image||'';$('deleteRecipe').hidden=false;$('recipeDialog').showModal()}
$('newRecipe').onclick=()=>{photoData=''; $('recipeForm').reset();$('recipeId').value='';$('recipeDialogTitle').textContent='Add a recipe';$('deleteRecipe').hidden=true;$('recipeDialog').showModal()};
let photoData='';$('rPhotoFile').onchange=async()=>{let f=$('rPhotoFile').files[0];if(!f)return;if(f.size>3000000){toast('Photo must be under 3 MB');return}photoData=await new Promise(resolve=>{let rd=new FileReader();rd.onload=()=>resolve(rd.result);rd.readAsDataURL(f)});toast('Photo ready to save')};$('recipeForm').onsubmit=async e=>{e.preventDefault();let id=$('recipeId').value;let r={id:id||crypto.randomUUID(),title:$('rTitle').value.trim(),description:$('rDescription').value,category:$('rCategory').value,time:$('rTime').value,ingredients:$('rIngredients').value,steps:$('rSteps').value,url:$('rUrl').value,image:photoData||$('rImage').value||(id?state.recipes.find(x=>x.id===id)?.image:'')||''};photoData='';if(id)state.recipes=state.recipes.map(x=>x.id===id?r:x);else state.recipes.unshift(r);await save();$('recipeDialog').close();render();toast('Recipe saved')};
$('deleteRecipe').onclick=async()=>{let id=$('recipeId').value;state.recipes=state.recipes.filter(r=>r.id!==id);Object.keys(state.plan).forEach(d=>{if(state.plan[d]===id)delete state.plan[d]});state.books.forEach(b=>b.ids=b.ids.filter(x=>x!==id));await save();$('recipeDialog').close();render();toast('Recipe deleted')};
$('newBook').onclick=()=>$('bookDialog').showModal();$('bookForm').onsubmit=async e=>{e.preventDefault();state.books.push({id:crypto.randomUUID(),name:$('bookName').value.trim(),ids:[]});await save();$('bookDialog').close();$('bookForm').reset();renderBooks()};
$('addGrocery').onclick=async()=>{let v=prompt('What do you need?');if(v?.trim()){state.groceries.push({text:v.trim(),done:false});await save();renderGroceries()}};
$('clearChecked').onclick=async()=>{state.groceries=state.groceries.filter(g=>!g.done);await save();renderGroceries()};
$('fromPlan').onclick=async()=>{Object.values(state.plan).filter(Boolean).forEach(id=>{let r=state.recipes.find(x=>x.id===id);if(r)r.ingredients.split('\\n').map(x=>x.trim()).filter(Boolean).forEach(x=>state.groceries.push({text:x,done:false}))});await save();renderGroceries();toast('Planned ingredients added')};
$('search').oninput=renderRecipes;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===b.dataset.tab))});
document.querySelectorAll('.close').forEach(b=>b.onclick=()=>b.closest('dialog').close());

const IMPORT_API = 'https://pantrypal-importer.barbeaucory.workers.dev'; // Paste your Cloudflare Worker URL here, e.g. https://pantrypal-import.yourname.workers.dev
$('openImport').onclick=()=>$('importDialog').showModal();
$('importForm').onsubmit=async e=>{
 e.preventDefault();
 const url=$('importUrl').value.trim(), pasted=$('importText').value.trim();
 const btn=$('importForm').querySelector('[type=submit]');
 if(!url && !pasted){toast('Paste a recipe link or recipe text');return}
 if(url && !IMPORT_API && !pasted){toast('Import service not configured yet');alert('Automatic URL importing needs your Cloudflare Worker URL. Set IMPORT_API in app.js first. No empty recipe was saved.');return}
 btn.disabled=true;btn.textContent='Importing…';
 try{
   let recipe;
   if(url && IMPORT_API){
     const response=await fetch(IMPORT_API.replace(/\/$/,'')+'/?url='+encodeURIComponent(url));
     const payload=await response.json();
     if(!response.ok)throw Error(payload.error||'Recipe could not be imported');
     recipe=payload;
   }else{
     const lines=pasted.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
     recipe={title:lines[0]||'Imported recipe',ingredients:lines.filter(x=>/^[-•*]|\d+\s/.test(x)).join('\n'),steps:lines.filter(x=>!/^[-•*]|\d+\s/.test(x)).slice(1).join('\n')};
   }
   if(!recipe.ingredients || !recipe.steps)throw Error('The recipe is missing ingredients or instructions. Nothing was saved.');
   const r={id:crypto.randomUUID(),title:recipe.title||'Imported recipe',description:recipe.description||'',category:'Dinner',time:recipe.time||'',ingredients:recipe.ingredients,steps:recipe.steps,url,image:recipe.image||''};
   state.recipes.unshift(r);await save();render();$('importDialog').close();$('importForm').reset();editRecipe(r);toast('Recipe imported — review and save');
 }catch(err){alert('Import failed: '+err.message)}
 finally{btn.disabled=false;btn.textContent='Import recipe'}
};

$('install').onclick=async()=>{if(window.installPrompt){window.installPrompt.prompt();window.installPrompt=null}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.installPrompt=e;$('install').hidden=false});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
load().then(render);
