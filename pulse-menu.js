(function(){
  'use strict';
  function text(el,value){var target=el&&el.querySelector('.main-menu-item, .main-menu-categories');if(target)target.textContent=value;}
  function init(){
    var overlay=document.querySelector('.menu-overlay'); if(!overlay)return;
    var groups=overlay.querySelectorAll('.main-menu-categories');
    var links=overlay.querySelectorAll('.main-menu-link');
    var utility=overlay.querySelectorAll('.menu-utility-link');

    var shop=['New Arrivals','Necklaces & Pendants','Bracelets','Rings','Earrings','Shop All'];
    for(var i=0;i<6&&i<links.length;i++) text(links[i],shop[i]);
    if(groups[0]) groups[0].textContent='SHOP';
    if(groups[1]) groups[1].textContent='COLLECTIONS';
    if(groups[2]) groups[2].textContent='THE :01 SIGNATURE';
    if(groups[3]) groups[3].textContent='GIFTING';

    var collectionStart=6;
    ['Pulse','Sacred','Elemental'].forEach(function(v,n){ if(links[collectionStart+n]) text(links[collectionStart+n],v); });
    var giftStart=9;
    ['Gifts for Her','Gifts for Him','Gift Cards'].forEach(function(v,n){ if(links[giftStart+n]) text(links[giftStart+n],v); });

    if(utility[0]) utility[0].setAttribute('data-menu-placeholder','signature');
    if(utility[1]){utility[1].href='/our-story'; utility[1].removeAttribute('data-menu-placeholder');}
    if(utility[2]) utility[2].setAttribute('data-menu-placeholder','account');
    if(utility[3]) utility[3].setAttribute('data-menu-placeholder','support');

    links.forEach(function(a){a.setAttribute('data-menu-placeholder','true'); a.setAttribute('aria-disabled','true');});

    overlay.addEventListener('click',function(e){
      var a=e.target.closest('[data-menu-placeholder]');
      if(a){e.preventDefault();}
    });

    var style=document.createElement('style');
    style.id='p01-menu-polish';
    style.textContent='\n.menu-overlay{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}\n.main-menu-categories{color:#b9a590!important;letter-spacing:.16em;text-transform:uppercase;font-size:11px!important;}\n.main-menu-item{font-size:20px!important;line-height:1.25;letter-spacing:.01em;}\n.main-menu-link{padding-bottom:7px!important;}\n.main-menu-link:hover .main-menu-item{opacity:1;}\n.menu-utility-link .main-menu-categories{color:#d4c4b2!important;}\n.menu-meta{letter-spacing:.08em;}\n@media(max-width:767px){.menu-overlay{backdrop-filter:none;-webkit-backdrop-filter:none;background-image:linear-gradient(180deg,rgba(20,17,14,.97),rgba(20,17,14,.92))!important;overflow-y:auto!important;overflow-x:hidden!important;}.main-menu-item{font-size:18px!important;}.main-menu-categories{font-size:10px!important;letter-spacing:.14em;}}\n';
    if(!document.getElementById(style.id))document.head.appendChild(style);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();