(function(){
'use strict';
function init(){
 var overlay=document.querySelector('.menu-overlay'); if(!overlay)return;
 if(!document.getElementById('p01-main-menu')){
  var nav=document.createElement('nav');nav.id='p01-main-menu';nav.setAttribute('aria-label','Main navigation');
  nav.innerHTML='<div class="p01-mm-grid">'+
   '<section><div class="p01-mm-label">SHOP</div><a href="#" data-ph>New Arrivals</a><a href="#" data-ph>Necklaces &amp; Pendants</a><a href="#" data-ph>Bracelets</a><a href="#" data-ph>Rings</a><a href="#" data-ph>Earrings</a><a href="#" data-ph>Shop All</a></section>'+
   '<section><div class="p01-mm-label">COLLECTIONS</div><a href="#" data-ph>Pulse</a><a href="#" data-ph>Sacred</a><a href="#" data-ph>Elemental</a></section>'+
   '<section><div class="p01-mm-label">DISCOVER</div><a href="/our-story">Our Story</a><a href="#" data-ph>Craftsmanship</a><a href="#" data-ph>The Meaning of :01</a><a href="#" data-ph>Journal</a></section>'+
   '<section><div class="p01-mm-label">GIFTING</div><a href="#" data-ph>Gifts</a><a href="#" data-ph>Gift Cards</a></section></div>'+
   '<div class="p01-mm-utils"><a href="#" data-ph>Account</a><a href="#" data-favorites>Favorites</a><a href="#" data-ph>Search</a><a href="#" data-ph>Contact</a><a href="#" data-ph>Shipping &amp; Returns</a></div>'+
   '<div class="p01-mm-tagline">Science. Spirit. Life. In Form.</div>';
  overlay.appendChild(nav);
  nav.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;if(a.hasAttribute('data-ph')){e.preventDefault();return;}if(a.hasAttribute('data-favorites')){e.preventDefault();closeMenu();setTimeout(function(){if(window.PULSE_HEADER_UI&&window.PULSE_HEADER_UI.openFavorites)window.PULSE_HEADER_UI.openFavorites();},80);}});
 }
 function closeMenu(){overlay.classList.remove('is-open');overlay.style.display='none';document.body.classList.remove('menu-open');document.body.style.overflow='';}
 window.PULSE_MENU_CLOSE=closeMenu;
 var s=document.createElement('style');s.id='p01-menu-polish';s.textContent='\
.menu-overlay{background:rgba(20,17,14,.96)!important;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);overflow:hidden!important}\
.menu-overlay .main-menu-link,.menu-overlay .main-menu-categories,.menu-overlay .menu-utility-link{visibility:hidden!important;pointer-events:none!important}\
#p01-main-menu{position:absolute;z-index:4;inset:118px 7vw 34px;color:#eee7df;display:flex;flex-direction:column;box-sizing:border-box}\
#p01-main-menu .p01-mm-grid{display:grid;grid-template-columns:1.25fr 1fr 1.15fr .9fr;gap:5vw}\
#p01-main-menu section{margin:0}.p01-mm-label{margin:0 0 16px;color:#b9a590;font:500 11px/1.2 Inter Tight,Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase}\
#p01-main-menu section>a{display:block;width:max-content;max-width:100%;margin:0 0 12px;color:#eee7df;text-decoration:none;font:400 20px/1.25 Inter Tight,Arial,sans-serif}\
#p01-main-menu .p01-mm-utils{margin-top:auto;padding-top:22px;border-top:1px solid rgba(238,231,223,.16);display:flex;flex-wrap:wrap;gap:14px 30px}\
#p01-main-menu .p01-mm-utils a{color:#b9a590;text-decoration:none;font:500 10px/1.2 Inter Tight,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}\
#p01-main-menu .p01-mm-tagline{margin-top:18px;color:rgba(238,231,223,.46);font:400 13px/1.3 Inter Tight,Arial,sans-serif;letter-spacing:.12em}\
.menu-overlay .menu-close-trigger{position:relative!important;z-index:8!important}\
@media(max-width:767px){.menu-overlay{width:100vw!important;max-width:100vw!important;height:100dvh!important;padding:0!important;background:rgb(20,17,14)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow-y:auto!important;overflow-x:hidden!important}.menu-overlay img{display:none!important}#p01-main-menu{position:absolute;inset:88px 0 auto 0;min-height:calc(100dvh - 88px);padding:18px 28px 28px;background:rgb(20,17,14)}#p01-main-menu .p01-mm-grid{display:block}#p01-main-menu section{margin:0 0 22px}.p01-mm-label{margin-bottom:9px;font-size:10px!important}#p01-main-menu section>a{margin-bottom:7px;font-size:18px!important;line-height:1.22!important}#p01-main-menu .p01-mm-utils{margin-top:2px;padding-top:18px;gap:11px 20px}#p01-main-menu .p01-mm-tagline{margin-top:18px;padding-bottom:8px;font-size:11px}}';
 var old=document.getElementById(s.id);if(old)old.remove();document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();