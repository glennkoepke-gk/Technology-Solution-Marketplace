(() => {
  'use strict';
  const db = window.FACILITY_MARKETPLACE_DATA;
  if (!db) { document.querySelector('#vendor-grid').textContent = 'Marketplace data could not be loaded.'; return; }
  const $ = (s) => document.querySelector(s);
  const categories = db.categories;
  const vendors = db.vendors;
  const byId = Object.fromEntries(vendors.map(v => [v.id,v]));
  const catById = Object.fromEntries(categories.map(c => [c.id,c]));
  const escapes = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  const esc = (s='') => String(s).replace(/[&<>"']/g,c=>escapes[c]);
  const shorten = (s,n=165) => s.length>n?s.slice(0,n).replace(/\s+\S*$/,'').trim()+'…':s;
  const getStorage = () => { try { return JSON.parse(localStorage.getItem('vector-facility-saved') || '[]'); } catch {return [];} };
  const state = {category:'all',outcome:'all',sort:'source',query:'',visible:12,saved:new Set(getStorage().filter(x => byId[x])),compare:[],savedOnly:false,matrix:db.matrices[0].id,zone:'gate',lastFocus:null};
  const paths = {
    'arrow-right':'<path d="M5 12h14m-7-7 7 7-7 7"/>',
    'arrow-up-right':'<path d="M7 17 17 7M8 7h9v9"/>',
    'arrow-down-right':'<path d="M7 7 17 17M7 17h10V7"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    'chevron-down':'<path d="m6 9 6 6 6-6"/>',
    'search':'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    'plus':'<path d="M12 5v14m-7-7h14"/>',
    'x':'<path d="M18 6 6 18M6 6l12 12"/>',
    'check':'<path d="m20 6-11 11-5-5"/>',
    'info':'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
    'bookmark':'<path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    'layers':'<path d="m12 2 10 6-10 6L2 8l10-6Zm-10 10 10 6 10-6M2 16l10 6 10-6"/>',
    'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
    'scan-line':'<path d="M7 3H4a1 1 0 0 0-1 1v3m14-4h3a1 1 0 0 1 1 1v3M7 21H4a1 1 0 0 1-1-1v-3m14 4h3a1 1 0 0 0 1-1v-3M7 12h10"/>',
    'truck':'<path d="M3 6h12v12H3zM15 10h4l3 3v5h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    'route':'<circle cx="6" cy="19" r="2"/><path d="M9 19h5a4 4 0 0 0 0-8H8a4 4 0 0 1 0-8h7"/><circle cx="17" cy="3" r="2"/>',
    'move-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    'barrier':'<path d="M4 20V8m0 5 16-8M20 20V5M4 16h6"/><path d="M7 12 10 14m2-6 3 2"/>',
    'radio':'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8m-8 4h8m-8 4h2"/><circle cx="16" cy="16" r="1"/>',
    'shield-check':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'video':'<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/>',
    'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'file-check':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6m-12 5 3 3 5-5"/>',
    'mouse-pointer-click':'<path d="m5 3 13 9-6 1-2 6zM18 18l3 3M18 2v3M21 8h-3"/>',
    'radio-tower':'<path d="M4 20h16M12 2v18M7 8a7 7 0 0 0 0 8m10-8a7 7 0 0 1 0 8"/><path d="m4 5-2 2m18-2 2 2"/>',
    'sliders-horizontal':'<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    'workflow':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M6.5 10v5a2 2 0 0 0 2 2H14M17.5 14V9a2 2 0 0 0-2-2H10"/>',
    'download':'<path d="M12 3v12m-5-5 5 5 5-5M5 18v3h14v-3"/>',
    'share':'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.2m-6.6 8.8 6.6 4.2"/>',
    'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    'check-circle':'<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>'
  };
  const icon = (name, extra='') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${extra}">${paths[name]||paths.info}</svg>`;
  function wireStaticIcons() {document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML=icon(el.dataset.icon));}
  const dim = hex => {let h=hex.slice(1);return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`};
  const initials = name => name.replace(/\([^)]*\)/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const outcomes = [{id:'all',name:'All priorities'},{id:'automate',name:'Automate check-in'},{id:'secure',name:'Prevent theft & fraud'},{id:'visibility',name:'Improve visibility'},{id:'flow',name:'Reduce dwell time'},{id:'autonomy',name:'Prepare for autonomy'},{id:'experience',name:'Improve driver experience'}];
  const zones={
    gate:{number:'01',label:'GATE OPERATIONS',title:'The smart gate',icon:'scan-line',description:'Identify who arrived, what equipment they brought, and what should happen next—before the truck crosses the fence.',tech:['Camera vision','Gate arms','Intercoms','Digital gate'],categories:['camera-vision','gate-arms','intercoms','ebol-digital-gate']},
    perimeter:{number:'02',label:'SECURITY & TRUST',title:'The protected perimeter',icon:'shield-check',description:'See activity around the facility, enforce access rules, and route exceptions to an on-site or remote team.',tech:['Camera providers','Access control','Remote guarding'],categories:['camera-providers','access-control','remote-guarding']},
    yard:{number:'03',label:'MOTION & VISIBILITY',title:'The connected yard',icon:'truck',description:'Know where equipment is, prioritize the right move, and connect human or automated spotters to live assignments.',tech:['Yard trucks','Autonomous yard trucks','YMS integration'],categories:['yard-trucks','autonomous-yard-trucks']},
    dock:{number:'04',label:'DIGITAL HANDOFF',title:'The intelligent dock',icon:'file-check',description:'Connect physical arrival to appointments, loading, receiving, freight documents, and proof of delivery.',tech:['eBOL','Digital check-in','Warehouse & yard systems'],categories:['ebol-digital-gate','camera-vision']},
    road:{number:'05',label:'NEXT-GEN FREIGHT',title:'The autonomous highway',icon:'move-right',description:'Design a facility capable of receiving and serving trucks that may arrive with nobody in the cab.',tech:['Autonomous Class 8','Yard handoff','Gate orchestration'],categories:['autonomous-class-8','ebol-digital-gate']}
  };
  function renderTeasers(){
    $('#category-teasers').innerHTML=categories.map(c=>`<button type="button" class="category-teaser" data-teaser="${esc(c.id)}"><span class="teaser-icon" style="--tint:rgba(${dim(c.color)},.12);--teaser:${c.color}">${icon(c.icon)}</span><span class="teaser-number">${c.number} / 10</span><strong>${esc(c.name)}</strong><small>${esc(c.short)}</small><span class="teaser-arrow">${icon('arrow-up-right')}</span></button>`).join('');
  }
  function renderOutcomes(){
    $('#outcome-filters').innerHTML=outcomes.map(o=>`<button type="button" data-outcome="${o.id}" class="outcome-chip ${state.outcome===o.id?'active':''}" aria-pressed="${state.outcome===o.id}">${esc(o.name)}</button>`).join('');
  }
  function renderCategoryFilters(){
    $('#category-filters').innerHTML=`<button class="category-filter ${state.category==='all'?'active':''}" type="button" data-category="all">${icon('layers')}<span>All solutions</span><span class="cat-count">${vendors.length}</span></button>` + categories.map(c=>`<button class="category-filter ${state.category===c.id?'active':''}" type="button" data-category="${c.id}">${icon(c.icon)}<span>${esc(c.name)}</span><span class="cat-count">${c.count}</span></button>`).join('') + `<button class="category-filter ${state.savedOnly?'active':''}" type="button" data-saved-filter="true">${icon('bookmark')}<span>My saved shortlist</span><span class="cat-count">${state.saved.size}</span></button>`;
  }
  function getFiltered(){
    let list=vendors.filter(v => {
      const category=catById[v.categoryId];
      if(state.savedOnly&&!state.saved.has(v.id))return false;
      if(state.category!=='all'&&v.categoryId!==state.category)return false;
      if(state.outcome!=='all'&&!category.outcomes.includes(state.outcome))return false;
      if(state.query){const q=state.query.toLowerCase();if(!([v.name,category.name,v.description,...v.tags,...v.paragraphs].join(' ').toLowerCase().includes(q)))return false;}
      return true;
    });
    if(state.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  }
  function vendorCard(v){
    const c=catById[v.categoryId];const saved=state.saved.has(v.id);const selected=state.compare.includes(v.id);const full=state.compare.length>=3&&!selected;
    return `<article class="vendor-card"><div class="vendor-card-body"><div class="vendor-card-top"><div class="vendor-avatar" style="--avatar-bg:rgba(${dim(c.color)},.12);--avatar-border:rgba(${dim(c.color)},.2);--avatar-color:${c.color}">${esc(initials(v.name))}</div><button type="button" class="save-button ${saved?'saved':''}" data-save="${esc(v.id)}" aria-label="${saved?'Remove '+esc(v.name)+' from saved':'Save '+esc(v.name)}" aria-pressed="${saved}">${icon('bookmark')}</button></div><div class="vendor-cat-label">${esc(c.name)}</div><h4>${esc(v.name)}</h4><p>${esc(v.description)}</p><div class="vendor-tag-row">${v.tags.slice(0,2).map(t=>`<span class="vendor-tag">${esc(t)}</span>`).join('')}</div></div><div class="vendor-card-actions"><button type="button" data-open="${esc(v.id)}" class="view-profile">Read profile ${icon('arrow-up-right')}</button><button type="button" class="add-compare ${selected?'selected':''}" data-compare="${esc(v.id)}" ${full?'disabled title="Remove a vendor to add another"':''}>${icon(selected?'check':'plus')} ${selected?'Added':'Compare'}</button></div></article>`;
  }
  function renderActiveFilters(){
    const applied=[];
    if(state.category!=='all')applied.push(`<button class="applied-filter" type="button" data-category="all">${esc(catById[state.category].name)} ${icon('x')}</button>`);
    if(state.outcome!=='all')applied.push(`<button class="applied-filter" type="button" data-outcome="all">${esc(outcomes.find(o=>o.id===state.outcome).name)} ${icon('x')}</button>`);
    if(state.savedOnly)applied.push(`<button class="applied-filter" type="button" data-saved-filter="true">Saved only ${icon('x')}</button>`);
    $('#active-filters').innerHTML=applied.length?`<div class="active-filter-bar">${applied.join('')}<button class="reset-filters" data-reset="true">Clear all filters</button></div>`:'';
  }
  function renderDirectory(){
    const filtered=getFiltered();
    $('#results-heading').textContent=state.savedOnly?'My saved shortlist':state.category==='all'?'All solutions':catById[state.category].name;
    $('#result-count').textContent=`${filtered.length} ${filtered.length===1?'result':'results'}`;
    $('#vendor-grid').innerHTML=filtered.slice(0,state.visible).map(vendorCard).join('') || `<div class="empty-state">${icon('search')}<h3>No matching providers</h3><p>Try a different capability or clear your filters.</p><button class="show-more-button" data-reset="true">Clear filters ${icon('arrow-right')}</button></div>`;
    $('#show-more-wrap').innerHTML=filtered.length>state.visible?`<button class="show-more-button" type="button" data-show-more="true">Show more providers <span>${Math.min(12,filtered.length-state.visible)} more</span> ${icon('chevron-down')}</button>`:'';
    $('#saved-count').textContent=state.saved.size;
    renderCategoryFilters();renderOutcomes();renderActiveFilters();renderCompareBar();
  }
  function renderZone(){
    const z=zones[state.zone];
    document.querySelectorAll('.hotspot').forEach(b=>{b.classList.toggle('active',b.dataset.zone===state.zone);b.setAttribute('aria-pressed',String(b.dataset.zone===state.zone));});
    $('#blueprint-detail').innerHTML=`<div class="zone-topline"><span>${esc(z.label)}</span><span class="zone-number">${z.number} / 05</span></div><div class="zone-icon">${icon(z.icon)}</div><h3>${esc(z.title)}</h3><p>${esc(z.description)}</p><div class="zone-label">RELATED TECHNOLOGIES</div><div class="zone-techs">${z.tech.map(t=>`<span>${esc(t)}</span>`).join('')}</div><button type="button" class="zone-action" data-zone-category="${z.categories[0]}">Explore matching solutions ${icon('arrow-up-right')}</button>`;
  }
  function renderMatrix(){
    const m=db.matrices.find(m=>m.id===state.matrix)||db.matrices[0];
    $('#matrix-title').textContent=m.title;
    $('#matrix-tabs').innerHTML=db.matrices.map(v=>`<button type="button" data-matrix="${v.id}" class="matrix-tab ${m.id===v.id?'active':''}" aria-pressed="${m.id===v.id}">${esc(catById[v.categoryId].name)}</button>`).join('');
    $('#matrix-table').innerHTML=`<table class="data-table"><thead><tr>${m.columns.map(x=>`<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${m.rows.map(row=>`<tr>${row.map((cell,i)=>`<td>${esc(cell)||'—'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    $('#matrix-table').scrollLeft=0;
  }
  function renderFundamentals(){
    $('#fundamental-accordions').innerHTML=db.fundamentals.map((f,i)=>`<div class="accordion ${i===0?'open':''}"><button type="button" class="accordion-trigger" aria-expanded="${i===0}" data-accordion="${i}"><span class="accordion-num">${String(i+1).padStart(2,'0')}</span><span class="accordion-title">${esc(f.title)}</span>${icon('plus')}</button><div class="accordion-content">${esc(f.text)}</div></div>`).join('');
  }
  function persistSaved(){try{localStorage.setItem('vector-facility-saved',JSON.stringify([...state.saved]));}catch{}}
  function toggleSave(id){if(state.saved.has(id)){state.saved.delete(id);toast('Removed from saved shortlist');}else{state.saved.add(id);toast('Saved to your shortlist');}persistSaved();renderDirectory();}
  function toggleCompare(id){if(state.compare.includes(id))state.compare=state.compare.filter(v=>v!==id);else if(state.compare.length<3)state.compare.push(id);else {toast('You can compare up to 3 profiles');return;}renderDirectory();}
  function renderCompareBar(){
    const bar=$('#compare-bar');
    if(!state.compare.length){bar.hidden=true;return;}
    bar.hidden=false;
    bar.innerHTML=`<div class="compare-selected"><span class="compare-bar-label">COMPARE <span style="color:#ff987a">${state.compare.length}/3</span></span>${state.compare.map(id=>`<span class="compare-mini">${esc(byId[id].name)} <button type="button" data-compare="${id}" aria-label="Remove ${esc(byId[id].name)}">${icon('x')}</button></span>`).join('')}</div><button class="compare-main-action" type="button" data-open-compare="true" ${state.compare.length<2?'disabled':''}>Compare selected ↗</button>`;
  }
  let toastTimer;
  function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
  function showDrawer(content,wide=false){
    state.lastFocus=document.activeElement;
    $('#drawer').classList.toggle('wide',wide);
    $('#drawer').innerHTML=`<div class="drawer-top"><span>VECTOR / FACILITY MARKETPLACE</span><button type="button" class="drawer-close" data-close="true" aria-label="Close panel">${icon('x')}</button></div><div class="drawer-body">${content}</div>`;
    $('#overlay').hidden=false;$('#drawer').hidden=false;
    document.body.style.overflow='hidden';
    $('#drawer').scrollTop=0;$('.drawer-close').focus();
  }
  function closeDrawer(){if($('#drawer').hidden)return;$('#drawer').hidden=true;$('#overlay').hidden=true;document.body.style.overflow=''; if(state.lastFocus&&document.contains(state.lastFocus))state.lastFocus.focus();}
  function openProfile(id){
    const v=byId[id];if(!v)return;const c=catById[v.categoryId];
    const attributes=v.matrix?`<h4 class="drawer-section-title">Capability matrix notes</h4>${Object.entries(v.matrix).map(([key,val])=>`<div class="profile-attribute"><b>${esc(key)}</b><p>${esc(val||'Not stated')}</p></div>`).join('')}<hr class="drawer-hr">`:'';
    const research=`https://www.google.com/search?q=${encodeURIComponent(v.name+' logistics technology company')}`;
    showDrawer(`<div class="drawer-kicker">${esc(c.name.toUpperCase())} / PROVIDER PROFILE</div><h2 class="drawer-heading">${esc(v.name)}</h2><p class="drawer-lead">${esc(v.description)}</p><div class="profile-metrics">${v.tags.map(t=>`<span class="vendor-tag">${esc(t)}</span>`).join('')}</div><div class="drawer-actions"><button type="button" class="drawer-action primary" data-save="${v.id}">${icon('bookmark')} ${state.saved.has(id)?'Saved to shortlist':'Save to shortlist'}</button><button type="button" class="drawer-action" data-compare="${v.id}">${icon('plus')} ${state.compare.includes(id)?'Remove from compare':'Add to compare'}</button><a class="drawer-action" href="${research}" target="_blank" rel="noopener noreferrer">Research provider ${icon('arrow-up-right')}</a></div><hr class="drawer-hr">${attributes}<h4 class="drawer-section-title">From the October 2026 field guide</h4>${v.paragraphs.map(p=>`<p class="source-paragraph">${esc(p)}</p>`).join('')}<p class="compare-guide">${esc(db.source)}</p><div class="drawer-actions"><button class="drawer-action" data-share-provider="${v.id}">${icon('copy')} Copy profile link</button></div>`);
  }
  function compareModal(){
    const vs=state.compare.map(id=>byId[id]).filter(Boolean);if(vs.length<2)return;
    const same=vs.every(v=>v.categoryId===vs[0].categoryId);
    let props=[{name:'Technology category',v:vs.map(v=>catById[v.categoryId].name)},{name:'Profile overview',v:vs.map(v=>v.description)},{name:'Keywords found in profile',v:vs.map(v=>v.tags.join(' · ')||'—')}];
    if(same&&vs[0].matrix){const columns=db.matrices.find(m=>m.id===vs[0].categoryId)?.columns.slice(1)||[];props=props.concat(columns.map(column=>({name:column,v:vs.map(v=>v.matrix?.[column]||'Not stated')})));}
    const head=`<div class="drawer-kicker">THE COMPARISON LAB / SHORTLIST</div><h2 class="drawer-heading">Side by side.</h2><p class="drawer-lead">Compare up to three solutions. Capability details are drawn from the same source matrix, where available—not from independently verified feature testing.</p>`;
    const table=`<div class="compare-scroll"><table class="compare-table"><thead><tr><th>Evaluation dimension</th>${vs.map(v=>`<th>${esc(v.name)}</th>`).join('')}</tr></thead><tbody>${props.map(p=>`<tr><td>${esc(p.name)}</td>${p.v.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    showDrawer(head+table+(same&&vs[0].matrix?'':`<p class="compare-guide" style="margin-top:18px">For deeper capability comparisons, select solutions within a single matrix-supported category.</p>`)+`<div class="drawer-actions"><button type="button" class="drawer-action primary" data-export="compare">${icon('download')} Download comparison CSV</button><button type="button" class="drawer-action" data-share-comparison="true">${icon('share')} Copy shareable comparison link</button></div>`,true);
  }
  function csv(rows){return rows.map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');}
  function exportList(which){
    const vs=(which==='compare'?state.compare.map(id=>byId[id]):[...state.saved].map(id=>byId[id])).filter(Boolean);
    if(!vs.length){toast('Save a provider first');return;}
    const headers=['Provider','Category','Summary','Keywords','Original profile text'];
    const lines=vs.map(v=>[v.name,catById[v.categoryId].name,v.description,v.tags.join('; '),v.paragraphs.join('\n\n')]);
    const blob=new Blob(['\ufeff'+csv([headers,...lines])],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`vector-facility-${which}-2026.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('CSV exported');
  }
  async function copyText(s){try{await navigator.clipboard.writeText(s);toast('Link copied to clipboard');}catch { const t=document.createElement('textarea');t.value=s;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();toast('Link copied to clipboard');}}
  function linkFor(v){const u=new URL(location.href);u.searchParams.delete('compare');u.searchParams.set('provider',v);u.hash='marketplace';return u.toString();}
  function comparisonLink(){const u=new URL(location.href);u.searchParams.delete('provider');u.searchParams.set('compare',state.compare.join(','));u.hash='marketplace';return u.toString();}
  function setCategory(id){state.category=id;state.savedOnly=false;state.visible=12;renderDirectory();}
  function resetFilters(){state.category='all';state.outcome='all';state.savedOnly=false;state.query='';$('#vendor-search').value='';state.visible=12;renderDirectory();}
  function openSaved(){state.category='all';state.outcome='all';state.query='';$('#vendor-search').value='';state.savedOnly=true;state.visible=12;renderDirectory();$('#marketplace').scrollIntoView({behavior:'smooth'});if(state.saved.size)toast(`${state.saved.size} saved profiles`);}
  document.addEventListener('click',e=>{
    const hit=(attr)=>e.target.closest(`[${attr}]`);
    let x;
    if((x=hit('data-teaser'))){setCategory(x.dataset.teaser);$('#marketplace').scrollIntoView({behavior:'smooth'});return;}
    if((x=hit('data-zone'))){state.zone=x.dataset.zone;renderZone();return;}
    if((x=hit('data-zone-category'))){setCategory(x.dataset.zoneCategory);$('#marketplace').scrollIntoView({behavior:'smooth'});return;}
    if((x=hit('data-category'))){setCategory(x.dataset.category);return;}
    if((x=hit('data-outcome'))){state.outcome=x.dataset.outcome;state.visible=12;renderDirectory();return;}
    if((x=hit('data-saved-filter'))){state.savedOnly=!state.savedOnly;state.category='all';state.visible=12;renderDirectory();return;}
    if((x=hit('data-reset'))){resetFilters();return;}
    if((x=hit('data-show-more'))){state.visible+=12;renderDirectory();return;}
    if((x=hit('data-save'))){toggleSave(x.dataset.save);if(!$('#drawer').hidden&&$('#drawer').querySelector(`[data-save="${x.dataset.save}"]`)){$('#drawer').querySelector(`[data-save="${x.dataset.save}"]`).innerHTML=icon('bookmark')+' '+(state.saved.has(x.dataset.save)?'Saved to shortlist':'Save to shortlist');}return;}
    if((x=hit('data-compare'))){toggleCompare(x.dataset.compare);if(!$('#drawer').hidden&&!$('#drawer').classList.contains('wide')){const btn=$('#drawer').querySelector(`[data-compare="${x.dataset.compare}"]`);if(btn)btn.innerHTML=icon('plus')+' '+(state.compare.includes(x.dataset.compare)?'Remove from compare':'Add to compare');}return;}
    if((x=hit('data-open'))){openProfile(x.dataset.open);return;}
    if((x=hit('data-matrix'))){state.matrix=x.dataset.matrix;renderMatrix();return;}
    if((x=hit('data-accordion'))){const acc=x.closest('.accordion');const was=acc.classList.contains('open');acc.classList.toggle('open',!was);x.setAttribute('aria-expanded',String(!was));return;}
    if((x=hit('data-open-compare'))){compareModal();return;}
    if((x=hit('data-close'))){closeDrawer();return;}
    if((x=hit('data-export'))){exportList(x.dataset.export);return;}
    if((x=hit('data-share-provider'))){copyText(linkFor(x.dataset.shareProvider));return;}
    if((x=hit('data-share-comparison'))){copyText(comparisonLink());return;}
    if((x=hit('data-action'))&&x.dataset.action==='saved-view'){openSaved();return;}
  });
  $('#overlay').addEventListener('click',closeDrawer);
  $('#vendor-search').addEventListener('input',e=>{state.query=e.target.value.trim();state.visible=12;renderDirectory();});
  $('#vendor-sort').addEventListener('change',e=>{state.sort=e.target.value;renderDirectory();});
  $('#menu-toggle').addEventListener('click',e=>{const open=$('#mobile-nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));});
  $('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#mobile-nav').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')closeDrawer();
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();closeDrawer();$('#marketplace').scrollIntoView({behavior:'smooth'});$('#vendor-search').focus();}
    if(!$('#drawer').hidden&&e.key==='Tab'){
      const focusable=[...$('#drawer').querySelectorAll('button:not([disabled]),a[href],input,select,[tabindex]:not([tabindex="-1"])')];
      if(focusable.length){const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }
  });
  wireStaticIcons();renderTeasers();renderZone();renderFundamentals();renderMatrix();renderDirectory();
  try {
    const params=new URL(location.href).searchParams;
    const compare=params.get('compare');
    if(compare){state.compare=compare.split(',').filter(id=>byId[id]).slice(0,3);renderDirectory();if(state.compare.length>=2)compareModal();}
    const profile=params.get('provider');if(profile&&byId[profile])openProfile(profile);
  } catch { }
})();
