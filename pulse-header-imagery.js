(function(){
  'use strict';
  var FKEY='p01:favorites';
  var META_KEY='p01:favorite-meta:v1';

  function metalHero(){
    var group=document.querySelector('[data-option-group="metal"]');
    var selected=group&&group.querySelector('.is-selected');
    var metal=group&&(group.getAttribute('data-selected')||(selected&&selected.getAttribute('data-option-button')));
    var img=metal&&document.querySelector('[data-metal-image="'+metal+'-hero"]');
    var main=document.querySelector('[data-main-image="true"]');
    return (img&&(img.currentSrc||img.src))||(main&&(main.currentSrc||main.src))||'';
  }

  function cleanType(value){
    value=String(value||'').trim();
    return value.length&&value.length<40?value:'';
  }

  function productType(){
    var selectors=['.product-type','.product-type-text','[data-product-type]','.product-subtitle','.product-category'];
    for(var i=0;i<selectors.length;i++){
      var el=document.querySelector(selectors[i]);
      var txt=el&&cleanType(el.textContent);
      if(txt) return txt;
    }
    var wrap=document.querySelector('.product-info-wrap');
    var name=document.querySelector('.product-name');
    if(wrap&&name){
      var all=Array.prototype.slice.call(wrap.querySelectorAll('*'));
      var n=all.indexOf(name);
      for(var j=n+1;j>-1&&j<Math.min(all.length,n+6);j++){
        var t=cleanType(all[j]&&all[j].textContent);
        if(t&&t!==name.textContent.trim()&&!/\$|description|material/i.test(t)) return t;
      }
    }
    var slug=location.pathname.split('/').filter(Boolean).pop()||'';
    var known=['pendant','necklace','bracelet','ring','earrings','earring','cuff','bangle','chain','charm'];
    for(var k=0;k<known.length;k++){
      if(slug.toLowerCase().indexOf(known[k])!==-1) return known[k].charAt(0).toUpperCase()+known[k].slice(1);
    }
    return '';
  }

  function favorites(){
    try{var x=JSON.parse(localStorage.getItem(FKEY)||'[]');return Array.isArray(x)?x:[]}
    catch(e){return[]}
  }
  function metadata(){
    try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}
    catch(e){return{}}
  }
  function writeFavorites(items){
    localStorage.setItem(FKEY,JSON.stringify(items));
    if(window.PULSE_HEADER_UI&&window.PULSE_HEADER_UI.sync) window.PULSE_HEADER_UI.sync();
  }
  function syncCurrentHeart(){
    var heart=document.querySelector('.favorite-button');
    if(!heart) return;
    var saved=favorites().indexOf(location.pathname)!==-1;
    heart.classList.toggle('is-saved',saved);
    heart.setAttribute('aria-pressed',saved?'true':'false');
    heart.setAttribute('title',saved?'Saved to favorites':'Add to favorites');
  }
  function syncFavoriteMeta(){
    var path=location.pathname, list=favorites(), data=metadata();
    if(list.indexOf(path)!==-1){
      data[path]={
        image:metalHero(),
        name:(document.querySelector('.product-name')&&document.querySelector('.product-name').textContent.trim())||'',
        type:productType()
      };
    } else delete data[path];
    localStorage.setItem(META_KEY,JSON.stringify(data));
  }
  function inferTypeFromPath(path){
    var slug=path.split('/').filter(Boolean).pop()||'';
    var known=['pendant','necklace','bracelet','ring','earrings','earring','cuff','bangle','chain','charm'];
    for(var i=0;i<known.length;i++){
      if(slug.toLowerCase().indexOf(known[i])!==-1) return known[i].charAt(0).toUpperCase()+known[i].slice(1);
    }
    return '';
  }
  function enhanceFavorites(){
    var list=document.querySelector('#p01-fav-shell [data-fav-list]');
    if(!list) return;
    var items=favorites(), data=metadata();
    if(!items.length){
      list.innerHTML='<div style="padding:42px 0;color:#756e66;font:13px/1.6 Inter Tight,Arial">No saved pieces yet.</div>';
      return;
    }
    list.innerHTML=items.map(function(path){
      var d=data[path]||{}, slug=path.split('/').filter(Boolean).pop()||'Saved piece';
      var name=d.name||slug.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()});
      var type=d.type||inferTypeFromPath(path);
      var image=d.image?'<img src="'+d.image+'" alt="" style="width:92px;height:110px;object-fit:cover;background:#ece4da">':'<div style="width:92px;height:110px;background:#ece4da"></div>';
      return '<div data-fav-item="'+path+'" style="display:grid;grid-template-columns:92px 1fr;gap:18px;align-items:center;padding:20px 0;border-bottom:1px solid #e2dbd2">'+image+
        '<div><a href="'+path+'" style="display:block;color:#36302a;text-decoration:none"><span style="display:block;font:24px Playfair Display,serif">'+name+'</span>'+
        (type?'<span style="display:block;margin-top:4px;font:11px Inter Tight,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#817970">'+type+'</span>':'')+
        '</a><button type="button" data-fav-remove="'+path+'" style="margin-top:12px;padding:0;border:0;border-bottom:1px solid #cfc5b9;background:none;color:#817970;font:10px Inter Tight,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer">Remove</button></div></div>';
    }).join('');
  }
  function removeFavorite(path){
    var items=favorites().filter(function(p){return p!==path});
    writeFavorites(items);
    var data=metadata();
    delete data[path];
    localStorage.setItem(META_KEY,JSON.stringify(data));
    syncCurrentHeart();
    enhanceFavorites();
  }

  window.addEventListener('click',function(e){
    if(!e.target.closest('.add-to-cart-button')) return;
    var main=document.querySelector('[data-main-image="true"]'), hero=metalHero();
    if(!main||!hero) return;
    var old=main.src, oldset=main.getAttribute('srcset');
    main.src=hero;
    main.removeAttribute('srcset');
    setTimeout(function(){main.src=old;if(oldset)main.setAttribute('srcset',oldset);},120);
  },true);

  document.addEventListener('click',function(e){
    var remove=e.target.closest('[data-fav-remove]');
    if(remove){e.preventDefault();e.stopPropagation();removeFavorite(remove.getAttribute('data-fav-remove'));return;}
    if(e.target.closest('.favorite-button')) setTimeout(function(){syncFavoriteMeta();syncCurrentHeart();},60);
    if(e.target.closest('.heart-icon')) setTimeout(enhanceFavorites,80);
  },true);

  document.addEventListener('DOMContentLoaded',function(){
    if(favorites().indexOf(location.pathname)!==-1) syncFavoriteMeta();
    syncCurrentHeart();
  });
})();