const batchSize=50;let currentBatch=0;let isLoading=false;let allLoaded=false;const selectedImages=new Set();let currentLightboxIndex=-1;let touchStartX=0;let touchEndX=0;function updateBuyButtonState(){const contactBtn=document.getElementById('contact-action-link');const contactText=document.getElementById('contact-action-text');if(!contactBtn)return;const selectedArray=Array.from(selectedImages);const count=selectedArray.length;if(count>0){const imageListParam=selectedArray.map(encodeURIComponent).join(',');contactBtn.href='/contact/#items='+imageListParam;if(contactText){contactText.textContent='Buy Selected ('+count+')';}
contactBtn.classList.add('is-active');}else{contactBtn.classList.remove('is-active');}}
function handleGlobalHover(parentEl){const exifContainer=parentEl.querySelector('.exif-info');if(!exifContainer)return;const content=exifContainer.querySelector('.exif-content');if(!content)return;const isActuallyOverflowing=content.scrollWidth>(exifContainer.offsetWidth+2);if(isActuallyOverflowing){exifContainer.classList.add('is-overflowing');}else{exifContainer.classList.remove('is-overflowing');}}
function resetOverflow(parentEl){const exifContainer=parentEl.querySelector('.exif-info');if(exifContainer){exifContainer.classList.remove('is-overflowing');}}
function checkOverflow(el){const track=el.querySelector('.exif-content');const container=el;if(track.offsetWidth>container.offsetWidth){el.classList.add('is-overflowing');}else{el.classList.remove('is-overflowing');}}
function initLightboxDOM(){if(document.getElementById('gallery-lightbox'))return;const lightboxHTML=`
        <div id="gallery-lightbox" class="lightbox-overlay" role="dialog" aria-modal="true" style="display: none;">
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-prev" aria-label="Previous">&lsaquo;</button>
            <button class="lightbox-next" aria-label="Next">&rsaquo;</button>
            <div class="lightbox-content-wrapper">
                <div id="lightbox-media-container" class="lightbox-media-container"></div>
                <div id="lightbox-caption" class="lightbox-caption"></div>
            </div>
        </div>
    `;document.body.insertAdjacentHTML('beforeend',lightboxHTML);const lightbox=document.getElementById('gallery-lightbox');lightbox.querySelector('.lightbox-close').addEventListener('click',closeLightbox);lightbox.querySelector('.lightbox-prev').addEventListener('click',showPrevLightboxItem);lightbox.querySelector('.lightbox-next').addEventListener('click',showNextLightboxItem);lightbox.addEventListener('click',(e)=>{if(e.target===lightbox||e.target.classList.contains('lightbox-content-wrapper')){closeLightbox();}});document.addEventListener('keydown',(e)=>{if(lightbox.style.display==='none')return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')showPrevLightboxItem();if(e.key==='ArrowRight')showNextLightboxItem();});lightbox.addEventListener('touchstart',(e)=>{touchStartX=e.changedTouches[0].screenX;},{passive:true});lightbox.addEventListener('touchend',(e)=>{touchEndX=e.changedTouches[0].screenX;handleSwipeGesture();},{passive:true});}
function handleSwipeGesture(){const swipeThreshold=50;if(touchEndX<touchStartX-swipeThreshold){showNextLightboxItem();}
if(touchEndX>touchStartX+swipeThreshold){showPrevLightboxItem();}}
function openLightbox(index){if(index<0||index>=images.length)return;currentLightboxIndex=index;const item=images[currentLightboxIndex];const lightbox=document.getElementById('gallery-lightbox');const container=document.getElementById('lightbox-media-container');const caption=document.getElementById('lightbox-caption');container.innerHTML='';if(item.isVideo){const video=document.createElement('video');video.src=item.isVideo;video.controls=true;video.autoplay=true;video.classList.add('lightbox-media');container.appendChild(video);}else{const fullResUrl=`${item.url}-2048${item.fext}`;const fullResLink=document.createElement('a');fullResLink.href=fullResUrl;fullResLink.target='_blank';fullResLink.title='Click to open full size version in new tab';fullResLink.classList.add('lightbox-img-link');const img=document.createElement('img');img.src=fullResUrl;img.alt=item.fname||item.title||'';img.classList.add('lightbox-media');fullResLink.appendChild(img);container.appendChild(fullResLink);}
let captionHTML='';if(item.title){captionHTML+=`<h3 class="lightbox-title">${item.title}</h3>`;}
if(item.fname){captionHTML+=`<span class="lightbox-filename"><i class="fa-regular fa-file-image"></i> ${item.fname}</span>`;}
if(item.desc){captionHTML+=`<p class="lightbox-desc">${item.desc}</p>`;}
if(item.shutter||item.aperture||item.iso){let exif=[];if(item.shutter)exif.push(`<span><i class="fa-solid fa-stopwatch"></i> ${item.shutter}</span>`);if(item.aperture)exif.push(`<span><i class="fa-solid fa-circle-dot"></i> ${item.aperture}</span>`);if(item.iso)exif.push(`<span>${item.iso}</span>`);captionHTML+=`<div class="lightbox-exif">${exif.join(' • ')}</div>`;}
if(item.tags){const rawArray=Array.isArray(item.tags)?item.tags:item.tags.split(',');const limitedTags=rawArray.map(t=>t.trim()).filter(Boolean).slice(0,5);if(limitedTags.length>0){const tagsHTML=limitedTags.map(t=>`<span class="lightbox-tag">#${t}</span>`).join(' ');captionHTML+=`<div class="lightbox-tags">${tagsHTML}</div>`;}}
if(!item.isVideo){const buyUrl=`/contact/#items=${encodeURIComponent(item.fname || item.url)}`;captionHTML+=`
            <div class="lightbox-actions">
                <a href="${buyUrl}" target="_blank" class="lightbox-buy-button">
                    <i class="fa-solid fa-cart-shopping"></i> Buy Original
                </a>
            </div>
        `;}
caption.innerHTML=captionHTML;lightbox.style.display='flex';document.body.style.overflow='hidden';}
function closeLightbox(){const lightbox=document.getElementById('gallery-lightbox');if(!lightbox)return;const video=lightbox.querySelector('video');if(video)video.pause();lightbox.style.display='none';document.body.style.overflow='';}
function showNextLightboxItem(){if(currentLightboxIndex<images.length-1){openLightbox(currentLightboxIndex+1);}else{openLightbox(0);}}
function showPrevLightboxItem(){if(currentLightboxIndex>0){openLightbox(currentLightboxIndex-1);}else{openLightbox(images.length-1);}}
initLightboxDOM();function createBatch(startIndex){const batch=document.createElement('div');batch.classList.add('panel-images');const slice=images.slice(startIndex,startIndex+batchSize);slice.forEach((item,sliceIndex)=>{const globalIndex=startIndex+sliceIndex;const fullImageUrl=`https://keitr.ee${item.url}-2048${item.fext}`;const schemaData={"@context":"https://schema.org/","@type":"ImageObject","name":item.fname||item.title||"Stock Photography","contentUrl":fullImageUrl,"license":"https://keitr.ee/contact/","acquireLicensePage":"https://keitr.ee/contact/","creditText":"Kei Tree Photography","creator":{"@type":"Person","name":"Kei Tree"},"keywords":Array.isArray(item.tags)?item.tags.slice(0,5).join(", "):(typeof item.tags==="string"?item.tags.split(",").map(t=>t.trim()).slice(0,5).join(", "):"")};const scriptTag=document.createElement('script');scriptTag.type='application/ld+json';scriptTag.text=JSON.stringify(schemaData);document.head.appendChild(scriptTag);const previewSrc=`${item.url}-512${item.fext}`;const thumbSrc=`${item.url}-150${item.fext}`;const imageId=item.fname||item.url;const isChecked=selectedImages.has(imageId);const div=document.createElement('div');div.classList.add('image','item');if(isChecked){div.classList.add('selected');}
div.addEventListener('mouseenter',function(){handleGlobalHover(this);});div.addEventListener('mouseleave',function(){resetOverflow(this);});let selectBoxHTML=`
            <label class="image-select-label">
                <input type="checkbox" class="image-select-checkbox" data-id="${imageId}" ${isChecked ? 'checked' : ''}>
            </label>
        `;let mediaData=selectBoxHTML;if(item.isVideo){mediaData+=`
                <a href="${item.isVideo}" class="lightbox-trigger" data-index="${globalIndex}">
                    <div class="imgbox">
                        <video src="${item.isVideo}" poster="${thumbSrc}" class="image-embed" preload="none" width="160" height="160"></video>
                    </div>
                    <div class="imgbox-full">
                        <video src="${item.isVideo}" poster="${thumbSrc}" class="image-embed" preload="none"></video>
                    </div>
                </a>
            `;}else{mediaData+=`
                <a href="${item.url}-2048${item.fext}" class="lightbox-trigger" data-index="${globalIndex}">
                    <div class="imgbox">
                        <img src="${thumbSrc}" width="160" height="160" alt="${Array.isArray(item.tags) ? item.tags.slice(0, 5).join(', ') : ''}">
                    </div>
                    <div class="imgbox-full">
                        <img class="image-embed" src="${previewSrc}" alt="${Array.isArray(item.tags) ? item.tags.slice(0, 5).join(', ') : ''}">
                    </div>
                </a>
            `;}
if(!item.isVideo){mediaData+=`<div class="image-meta" title="${item.fname}">
            <div class="meta-left">
                    <span class="image-title">
                        <i class="fa-regular fa-file-image"></i> <span class="filename">${item.fname}</span>
                    </span>`;if(item.isPhoto=="True"){if(item.shutter){let tags=`<span><i class="fa-solid fa-stopwatch"></i> ${item.shutter}</span>`;if(item.aperture)tags+=`<span><i class="fa-solid fa-circle-dot"></i> ${item.aperture}</span>`;if(item.iso)tags+=`<span>${item.iso}</span>`;mediaData+=`
                        <div class="exif-info">
                            <div class="exif-scroll-track">
                                <div class="exif-content">${tags}</div>
                                <div class="exif-content duplicate-content">${tags}</div>
                            </div>
                        </div>`;}
mediaData+=`</div>`;mediaData+=`<a href="/contact/#items=${item.fname}" target="_blank" class="buy-button" title="Buy original image">
                                    <i class="fa-solid fa-cart-shopping"></i> Buy
                            </a>`;}}
mediaData+=`</div>`;div.innerHTML=mediaData;const trigger=div.querySelector('.lightbox-trigger');if(trigger){trigger.addEventListener('click',(e)=>{e.preventDefault();const idx=parseInt(trigger.getAttribute('data-index'),10);openLightbox(idx);});}
const checkbox=div.querySelector('.image-select-checkbox');if(checkbox){checkbox.addEventListener('change',(e)=>{const targetId=e.target.getAttribute('data-id');if(e.target.checked){selectedImages.add(targetId);div.classList.add('selected');}else{selectedImages.delete(targetId);div.classList.remove('selected');}
updateBuyButtonState();});}
const img=div.querySelector('.imgbox-full .image-embed');if(img&&img.tagName==='IMG'){if(img.complete){img.classList.add('loaded');}else{img.addEventListener('load',()=>img.classList.add('loaded'));}}
batch.appendChild(div);});return batch;}
function loadNextBatch(){if(isLoading||allLoaded)return;const startIndex=currentBatch*batchSize;if(startIndex>=images.length){allLoaded=true;if(observer)observer.disconnect();return;}
isLoading=true;const batch=createBatch(startIndex);document.getElementById('gallery-container').appendChild(batch);if(typeof applyImageMode==='function'){applyImageMode(currentMode);}
currentBatch++;isLoading=false;}
const sentinel=document.getElementById('sentinel');let observer;if(sentinel){observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){loadNextBatch();}});},{rootMargin:'400px'});observer.observe(sentinel);}else{console.error('Sentinel element not found!');}
loadNextBatch();