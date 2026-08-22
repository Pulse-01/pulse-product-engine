(function(){
  'use strict';
  var META_KEY='p01:favorite-meta:v1';
  function metalHero(){
    var group=document.querySelector('[data-option-group="metal"]');
    var selected=group&&group.querySelector('.is-selected');
    var metal=group&&(group.getAttribute('data-selected')||(selected&&selected.getAttribute('data-option-button')));
    var img=metal&&document.querySelector('[data-metal-image="'+metal+'-hero"]');
    var main=document.querySelector('[data-main-image="true"]');
    return (img&&(img.currentSrc||img.src))||(main&&(main.currentSrc||main.src))||'';
  }
  function productType(){
    var el=document.querySelector('.product-type, .product-type-text, [data-product-type]');
    if(el&&el.textContent.trim()) return el.textContent.trim();
    var wrap=document.querySelector('.product-info-wrap');
    if(wrap){
      var name=document.querySelector('.product-name');
      var kids=Array.prototype.slice.call(wrap.children||[]);
      var index=name?kids.indexOf(name):-1;
      if(index>-1&&kids[index+1]){
        var text=kids[index+1].textContent.trim();
        if(text&&text.length<40) return text;
      }
    }
    return '';
  }
  function favorites(){try{var x=JSON.parse(localStorage.getItem('p01:favorites')||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
  function metadata(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}catch(e){return{}}}
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
  function enhanceFavorites(){
    var list=document.querySelector('#p01-fav-shell [data-fav-list]'); if(!list)return;
    var items=favorites(), data=metadata(); if(!items.length)return;
    list.innerHTML=items.map(function(path){
      var d=data[path]||{}, slug=path.split('/').filter(Boolean).pop()||'Saved piece';
      var name=d.name||slug.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()});
      var type=d.type||'';
      var image=d.image?'<img src="'+d.image+'" alt="" style="width:92px;height:110px;object-fit:cover;background:#ece4da">':'<div style="width:92px;height:110px;background:#ece4da"></div>';
      var copy='<span><span style="display:block;font:24px Playfair Display,serif">'+name+'</span>'+(type?'<span style="display:block;margin-top:4px;font:11px Inter Tight,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#817970">'+type+'</span>':'')+'</span>';
      return '<a href="'+path+'" style="display:grid;grid-template-columns:92px 1fr;gap:18px;align-items:center;padding:20px 0;border-bottom:1px solid #e2dbd2;color:#36302a;text-decoration:none">'+image+copy+'</a>';
    }).join('');
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
    if(e.target.closest('.favorite-button')) setTimeout(syncFavoriteMeta,60);
    if(e.target.closest('.heart-icon')) setTimeout(enhanceFavorites,80);
  },true);
  document.addEventListener('DOMContentLoaded',function(){if(favorites().indexOf(location.pathname)!==-1)syncFavoriteMeta();});
})();