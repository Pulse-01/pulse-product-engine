(function(){
'use strict';
function init(){
 var overlay=document.querySelector('.menu-overlay'); if(!overlay)return;
 var groups=overlay.querySelectorAll('.main-menu-categories');
 var links=overlay.querySelectorAll('.main-menu-link');
 var utility=overlay.querySelectorAll('.menu-utility-link');
 function setLink(a,label){if(!a)return;var t=a.querySelector('.main-menu-item, .main-menu-categories');if(t)t.textContent=label;else a.textContent=label;a.setAttribute('data-menu-placeholder','true');a.setAttribute('aria-disabled','true');}
 var shop=['New Arrivals','Necklaces & Pendants','Bracelets','Rings','Earrings','Shop All'];
 shop.forEach(function(v,i){setLink(links[i],v)});
 if(groups[0])groups[0].textContent='SHOP';
 if(groups[1])groups[1].textContent='COLLECTIONS';
 if(groups[2])groups[2].textContent='DISCOVER';
 if(groups[3])groups[3].textContent='GIFTING';
 ['Pulse','Sacred','Elemental'].forEach(function(v,i){setLink(links[6+i],v)});
 ['Our Story','Craftsmanship','The Meaning of :01','Journal'].forEach(function(v,i){setLink(links[9+i],v)});
 ['Gifts','Gift Cards'].forEach(function(v,i){setLink(links[13+i],v)});
 if(utility[0]){var t0=utility[0].querySelector('.main-menu-categories');if(t0)t0.textContent='ACCOUNT';utility[0].setAttribute('data-menu-placeholder','true');}
 if(utility[1]){var t1=utility[1].querySelector('.main-menu-categories');if(t1)t1.textContent='FAVORITES';utility[1].setAttribute('data-menu-placeholder','true');}
 if(utility[2]){var t2=utility[2].querySelector('.main-menu-categories');if(t2)t2.textContent='SEARCH';utility[2].setAttribute('data-menu-placeholder','true');}
 if(utility[3]){var t3=utility[3].querySelector('.main-menu-categories');if(t3)t3.textContent='CONTACT';utility[3].setAttribute('data-menu-placeholder','true');}
 overlay.addEventListener('click',function(e){var a=e.target.closest('[data-menu-placeholder]');if(a)e.preventDefault();});
 var s=document.createElement('style');s.id='p01-menu-polish';s.textContent=`
.menu-overlay{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.main-menu-categories{color:#b9a590!important;letter-spacing:.16em;text-transform:uppercase;font-size:11px!important}.main-menu-item{font-size:20px!important;line-height:1.25}.main-menu-link{padding-bottom:7px!important}
@media(max-width:767px){
.menu-overlay{display:none;align-items:flex-start!important;justify-content:flex-start!important;width:100vw!important;max-width:100vw!important;height:100dvh!important;padding:0!important;background:rgba(20,17,14,.985)!important;background-image:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow-y:auto!important;overflow-x:hidden!important}
.menu-overlay.is-open{display:flex!important}.menu-overlay>div:first-child{width:100%!important;max-width:none!important;min-height:100%!important;background:transparent!important}.menu-overlay .div-block-11{display:flex!important;flex-direction:column!important;width:100%!important;gap:26px!important;background:transparent!important}
.menu-overlay .div-block-30,.menu-overlay .div-block-31,.menu-overlay .div-block-43,.menu-overlay .div-block-48,.menu-overlay .div-block-49{width:100%!important;max-width:none!important;background:transparent!important}
.menu-overlay .main-menu-link,.menu-overlay .menu-utility-link{color:#ece4da!important}.menu-overlay .main-menu-item{font-size:18px!important;line-height:1.22!important;color:#ece4da!important;opacity:.96!important}.menu-overlay .main-menu-categories{font-size:10px!important;letter-spacing:.14em!important;color:#b9a590!important}
}`;var old=document.getElementById(s.id);if(old)old.remove();document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();