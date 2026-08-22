(function(){
'use strict';
function init(){
 var overlay=document.querySelector('.menu-overlay'); if(!overlay)return;
 var groups=overlay.querySelectorAll('.main-menu-categories');
 var links=overlay.querySelectorAll('.main-menu-link');
 function setText(a,label){if(!a)return;var t=a.querySelector('.main-menu-item, .main-menu-categories');if(t)t.textContent=label;}
 var shop=['New Arrivals','Necklaces & Pendants','Bracelets','Rings','Earrings','Shop All'];
 shop.forEach(function(v,i){setText(links[i],v)});
 if(groups[0])groups[0].textContent='SHOP';
 if(groups[1])groups[1].textContent='COLLECTIONS';
 ['Pulse','Sacred','Elemental'].forEach(function(v,i){setText(links[6+i],v)});

 function mobileMenu(){
   if(document.getElementById('p01-mobile-menu'))return;
   var nav=document.createElement('nav');
   nav.id='p01-mobile-menu';
   nav.setAttribute('aria-label','Main navigation');
   nav.innerHTML=`
    <section><div class="p01-mm-label">SHOP</div>
      <a href="#" data-ph>New Arrivals</a><a href="#" data-ph>Necklaces &amp; Pendants</a><a href="#" data-ph>Bracelets</a><a href="#" data-ph>Rings</a><a href="#" data-ph>Earrings</a><a href="#" data-ph>Shop All</a>
    </section>
    <section><div class="p01-mm-label">COLLECTIONS</div>
      <a href="#" data-ph>Pulse</a><a href="#" data-ph>Sacred</a><a href="#" data-ph>Elemental</a>
    </section>
    <section><div class="p01-mm-label">DISCOVER</div>
      <a href="/our-story">Our Story</a><a href="#" data-ph>Craftsmanship</a><a href="#" data-ph>The Meaning of :01</a><a href="#" data-ph>Journal</a>
    </section>
    <section><div class="p01-mm-label">GIFTING</div>
      <a href="#" data-ph>Gifts</a><a href="#" data-ph>Gift Cards</a>
    </section>
    <div class="p01-mm-utils">
      <a href="#" data-ph>Account</a><a href="#" data-favorites>Favorites</a><a href="#" data-ph>Search</a><a href="#" data-ph>Contact</a><a href="#" data-ph>Shipping &amp; Returns</a>
    </div>`;
   overlay.appendChild(nav);
   nav.addEventListener('click',function(e){
     var a=e.target.closest('a'); if(!a)return;
     if(a.hasAttribute('data-ph')){e.preventDefault();return;}
     if(a.hasAttribute('data-favorites')){e.preventDefault();var c=overlay.querySelector('.menu-close-trigger');if(c)c.click();setTimeout(function(){if(window.PULSE_HEADER_UI&&window.PULSE_HEADER_UI.openFavorites)window.PULSE_HEADER_UI.openFavorites();},220);}
   });
 }
 mobileMenu();

 var s=document.createElement('style');s.id='p01-menu-polish';s.textContent=`
.menu-overlay{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.main-menu-categories{color:#b9a590!important;letter-spacing:.16em;text-transform:uppercase;font-size:11px!important}.main-menu-item{font-size:20px!important;line-height:1.25}.main-menu-link{padding-bottom:7px!important}
#p01-mobile-menu{display:none}
@media(max-width:767px){
.menu-overlay{display:none;align-items:flex-start!important;justify-content:flex-start!important;width:100vw!important;max-width:100vw!important;height:100dvh!important;padding:0!important;background:rgb(20,17,14)!important;background-image:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow-y:auto!important;overflow-x:hidden!important}
.menu-overlay.is-open{display:flex!important}
.menu-overlay .main-menu-link,.menu-overlay .main-menu-categories,.menu-overlay .menu-utility-link{visibility:hidden!important;pointer-events:none!important}
#p01-mobile-menu{display:block;position:absolute;z-index:3;top:92px;left:0;width:100%;min-height:calc(100dvh - 92px);box-sizing:border-box;padding:22px 28px 38px;background:rgb(20,17,14);color:#eee7df;overflow:visible}
#p01-mobile-menu section{margin:0 0 26px}
#p01-mobile-menu .p01-mm-label{margin:0 0 10px;color:#b9a590;font:500 10px/1.2 Inter Tight,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}
#p01-mobile-menu section>a{display:block;width:max-content;max-width:100%;margin:0 0 8px;color:#eee7df;text-decoration:none;font:400 18px/1.25 Inter Tight,Arial,sans-serif;letter-spacing:0}
#p01-mobile-menu section>a:last-child{margin-bottom:0}
#p01-mobile-menu .p01-mm-utils{margin-top:6px;padding-top:20px;border-top:1px solid rgba(238,231,223,.16);display:flex;flex-wrap:wrap;gap:12px 22px}
#p01-mobile-menu .p01-mm-utils a{color:#b9a590;text-decoration:none;font:500 10px/1.2 Inter Tight,Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase}
.menu-overlay .menu-close-trigger{position:relative!important;z-index:5!important}
}
`;var old=document.getElementById(s.id);if(old)old.remove();document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();