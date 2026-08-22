/* PULSE:01 product gallery enhancement — isolated from pricing/commerce */
(function(){
  'use strict';
  function init(){
    var image=document.querySelector('[data-main-image="true"]');
    var wrap=image&&image.closest('.hero-image-wrap');
    var thumbs=Array.prototype.slice.call(document.querySelectorAll('[data-thumb-trigger="true"]'));
    if(!image||!wrap||!thumbs.length)return;

    image.setAttribute('tabindex','0');
    image.setAttribute('role','button');
    image.setAttribute('aria-label','Open enlarged product image');

    var style=document.createElement('style');
    style.textContent='.p01-gallery-modal{position:fixed;inset:0;z-index:100000;background:rgba(18,18,18,.94);display:flex;align-items:center;justify-content:center;padding:32px;opacity:0;pointer-events:none;transition:opacity .22s ease}.p01-gallery-modal.is-open{opacity:1;pointer-events:auto}.p01-gallery-modal-image{max-width:min(1100px,92vw);max-height:88vh;object-fit:contain}.p01-gallery-modal-close{position:absolute;top:22px;right:24px;border:0;background:transparent;color:#fff;font:300 30px/1 Arial,sans-serif;cursor:pointer;padding:10px}.hero-product-image{cursor:zoom-in}';
    document.head.appendChild(style);

    var modal=document.createElement('div');
    modal.className='p01-gallery-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-label','Enlarged product image');
    modal.innerHTML='<button class="p01-gallery-modal-close" type="button" aria-label="Close enlarged image">×</button><img class="p01-gallery-modal-image" alt="">';
    document.body.appendChild(modal);
    var modalImage=modal.querySelector('.p01-gallery-modal-image');
    var close=modal.querySelector('.p01-gallery-modal-close');

    function openModal(){
      modalImage.src=image.currentSrc||image.src;
      modalImage.alt=image.alt||'Product image';
      modal.classList.add('is-open');
      document.body.style.overflow='hidden';
      close.focus();
    }
    function closeModal(){
      modal.classList.remove('is-open');
      document.body.style.overflow='';
      image.focus();
    }
    image.addEventListener('click',openModal);
    image.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal();return;}
      var active=thumbs.findIndex(function(t){return t.classList.contains('is-active');});
      if(active<0)active=0;
      if(e.key==='ArrowRight'){e.preventDefault();thumbs[(active+1)%thumbs.length].click();}
      if(e.key==='ArrowLeft'){e.preventDefault();thumbs[(active-1+thumbs.length)%thumbs.length].click();}
    });
    close.addEventListener('click',closeModal);
    modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('is-open'))closeModal();});

    var startX=null;
    wrap.addEventListener('touchstart',function(e){if(e.touches.length===1)startX=e.touches[0].clientX;},{passive:true});
    wrap.addEventListener('touchend',function(e){
      if(startX===null)return;
      var dx=e.changedTouches[0].clientX-startX; startX=null;
      if(Math.abs(dx)<45)return;
      var active=thumbs.findIndex(function(t){return t.classList.contains('is-active');});
      if(active<0)active=0;
      thumbs[dx<0?(active+1)%thumbs.length:(active-1+thumbs.length)%thumbs.length].click();
    },{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}());
