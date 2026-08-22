(function(){
  'use strict';
  var META_KEY='p01:favorite-meta:v1';
  function metalHero(){
    var group=document.querySelector('[data-option-group="metal"]');
    var metal=group&&(group.getAttribute('data-selected')||(group.querySelector('.is-selected')&&group.querySelector('.is-selected').getAttribute('data-option-button')));
    var img=metal&&document.querySelector('[data-metal-image="'+metal+'-hero"]');
    var main=document.querySelector('[data-main-image="true"]');
    return (img&&(img.currentSrc||img.src))||(main&&(main.currentSrc||main.src))||'';
  }
  function favorites(){try{var x=JSON.parse(localStorage.getItem('p01:favorites')||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
  function metadata(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}catch(e){return{}}}
  function syncFavoriteMeta(){
    var path=location.pathname, list=favorites(), data=metadata();
    if(list.indexOf(path)!==-1){data[path]={image:metalHero(),name:(document.querySelector('.product-name')&&document.querySelector('.product-name').textContent.trim())||''};}
    else delete data[path];
    localStorage.setItem(META_KEY,JSON.stringify(data));
  }
  function enhanceFavorites(){
    var list=document.querySelector('#p01-fav-shell [data-fav-list]'); if(!list)return;
    var items=favorites(), data=metadata(); if(!items.length)return;
    list.innerHTML=items.map(function(path){
      var d=data[path]||{}, slug=path.split('/').filter(Boolean).pop()||'Saved piece';
      var name=d.name||slug.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()});
      var image=d.image?'<img src="'+d.image+'" alt="" style="width:92px;height:110px;object-fit:cover;background:#ece4da">':'<div style="width:92px;height:110px;background:#ece4da"></div>';
      return '<a href="'+path+'" style="display:grid;grid-template-columns:92px 1fr;gap:18px;align-items:center;padding:20px 0;border-bottom:1px solid #e2dbd2;color:#36302a;text-decoration:none">'+image+'<span style="font:24px Playfair Display,serif">'+name+'</span></a>';
    }).join('');
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('.add-to-cart-button')){
      var main=document.querySelector('[data-main-image="true"]'), hero=metalHero();
      if(main&&hero){var old=main.src, oldset=main.getAttribute('srcset'); main.src=hero; main.removeAttribute('srcset'); setTimeout(function(){main.src=old;if(oldset)main.setAttribute('srcset',oldset);},120);}
    }
    if(e.target.closest('.favorite-button')) setTimeout(syncFavoriteMeta,60);
    if(e.target.closest('.heart-icon')) setTimeout(enhanceFavorites,80);
  },true);
  document.addEventListener('DOMContentLoaded',function(){if(favorites().indexOf(location.pathname)!==-1)syncFavoriteMeta();});
})();