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

  function inferIdentity(path){
    var slug=(path||location.pathname).split('/').filter(Boolean).pop()||'';
    var words=slug.split('-').filter(Boolean);
    var types=['pendant','necklace','bracelet','ring','earrings','earring','cuff','bangle','chain','charm'];
    var type='';
    if(words.length){
      var last=words[words.length-1].toLowerCase();
      if(types.indexOf(last)!==-1){type=last.charAt(0).toUpperCase()+last.slice(1);words.pop();}
    }
    var fallbackName=words.join(' ').replace(/\b\w/g,function(c){return c.toUpperCase()});
    return {name:fallbackName||'Saved Piece',type:type};
  }

  function favorites(){try{var x=JSON.parse(localStorage.getItem(FKEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
  function metadata(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}catch(e){return{}}}

  function syncFavoriteMeta(){
    var path=location.pathname, list=favorites(), data=metadata(), id=inferIdentity(path);
    if(list.indexOf(path)!==-1){
      var nameEl=document.querySelector('.product-name');
      var typeEl=document.querySelector('.product-type, .product-type-text, [data-product-type]');
      data[path]={
        image:metalHero(),
        name:(nameEl&&nameEl.textContent.trim())||id.name,
        type:(typeEl&&typeEl.textContent.trim())||id.type
      };
    } else delete data[path];
    localStorage.setItem(META_KEY,JSON.stringify(data));
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
    if(e.target.closest('.favorite-button')) setTimeout(syncFavoriteMeta,80);
  });

  document.addEventListener('DOMContentLoaded',function(){
    if(favorites().indexOf(location.pathname)!==-1) syncFavoriteMeta();
  });
})();