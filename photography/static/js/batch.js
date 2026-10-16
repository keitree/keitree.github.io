const batchSize=50;let currentBatch=0;let isLoading=false;let allLoaded=false;const selectedImages=new Set();function updateBuyButtonState(){const contactBtn=document.getElementById('contact-action-link');const contactText=document.getElementById('contact-action-text');if(!contactBtn)return;const selectedArray=Array.from(selectedImages);const count=selectedArray.length;if(count>0){const imageListParam=selectedArray.map(encodeURIComponent).join(',');contactBtn.href='/contact/#items='+imageListParam;if(contactText){contactText.textContent='Buy Selected ('+count+')';}
contactBtn.classList.add('is-active');}else{contactBtn.classList.remove('is-active');}}
function handleGlobalHover(parentEl){const exifContainer=parentEl.querySelector('.exif-info');if(!exifContainer)return;const content=exifContainer.querySelector('.exif-content');if(!content)return;const isActuallyOverflowing=content.scrollWidth>(exifContainer.offsetWidth+2);if(isActuallyOverflowing){exifContainer.classList.add('is-overflowing');}else{exifContainer.classList.remove('is-overflowing');}}
function resetOverflow(parentEl){const exifContainer=parentEl.querySelector('.exif-info');if(exifContainer){exifContainer.classList.remove('is-overflowing');}}
function createScrollableExif(item){if(item.shutter){let content=``;content+=`<span><i class="fa-solid fa-stopwatch"></i> \${item.shutter}</span>`;if(item.aperture)content+=`<span><i class="fa-solid fa-circle-dot"></i> \${item.aperture}</span>`;if(item.iso)content+=`<span>\${item.iso}</span>`;return`
            <div class="exif-info" onmouseenter="checkOverflow(this)">
                <div class="exif-scroll-track">
                    <div class="exif-content">\${content}</div>
                    <div class="exif-content">\${content}</div>
                </div>
            </div>`;}else{return``;}}
function checkOverflow(el){const track=el.querySelector('.exif-content');const container=el;if(track.offsetWidth>container.offsetWidth){el.classList.add('is-overflowing');}else{el.classList.remove('is-overflowing');}}
function createBatch(startIndex){const batch=document.createElement('div');batch.classList.add('panel-images');const slice=images.slice(startIndex,startIndex+batchSize);slice.forEach((item)=>{const fullImageUrl=`https://keitr.ee${item.url}-2048${item.fext}`;const schemaData={"@context":"https://schema.org/","@type":"ImageObject","name":item.fname||"Stock Photography","contentUrl":fullImageUrl,"license":"https://keitr.ee/contact/","acquireLicensePage":"https://keitr.ee/contact/","creditText":"Kei Tree Photography","creator":{"@type":"Person","name":"Kei Tree"}};const scriptTag=document.createElement('script');scriptTag.type='application/ld+json';scriptTag.text=JSON.stringify(schemaData);document.head.appendChild(scriptTag);const previewSrc=`${item.url}-512${item.fext}`;const originalSrc=item.isVideo?item.isVideo:`${item.url}-2048${item.fext}`;const thumbSrc=`${item.url}-150${item.fext}`;const imageId=item.fname||item.url;const isChecked=selectedImages.has(imageId);const div=document.createElement('div');div.classList.add('image','item');if(isChecked){div.classList.add('selected');}
div.addEventListener('mouseenter',function(){handleGlobalHover(this);});div.addEventListener('mouseleave',function(){resetOverflow(this);});let selectBoxHTML=`
            <label class="image-select-label">
                <input type="checkbox" class="image-select-checkbox" data-id="${imageId}" ${isChecked ? 'checked' : ''}>
            </label>
        `;let mediaData=selectBoxHTML;if(item.isVideo){mediaData+=`
                <a href="${item.isVideo}" target="_blank">
                    <div class="imgbox">
                        <video src="${item.isVideo}" poster="${thumbSrc}" class="image-embed" controls preload="none" width="160" height="160"></video>
                    </div>
                    <div class="imgbox-full">
                        <video src="${item.isVideo}" poster="${thumbSrc}" class="image-embed" controls preload="none"></video>
                    </div>
                </a>
            `;}else{mediaData+=`
                <a href="${originalSrc}" target="_blank">
                    <div class="imgbox">
                        <img src="${thumbSrc}" width="160" height="160" alt="">
                    </div>
                    <div class="imgbox-full">
                        <img class="image-embed" src="${previewSrc}" alt="">
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
mediaData+=`</div>`;mediaData+=`<a href="/contact/#selected=${item.fname}" target="_blank" class="buy-button" title="Buy original image">
                                    <i class="fa-solid fa-cart-shopping"></i> Buy
                            </a>`;}}
mediaData+=`</div>`;div.innerHTML=mediaData;const checkbox=div.querySelector('.image-select-checkbox');if(checkbox){checkbox.addEventListener('change',(e)=>{const targetId=e.target.getAttribute('data-id');if(e.target.checked){selectedImages.add(targetId);div.classList.add('selected');}else{selectedImages.delete(targetId);div.classList.remove('selected');}
updateBuyButtonState();});}
const img=div.querySelector('.imgbox-full .image-embed');if(img&&img.tagName==='IMG'){if(img.complete){img.classList.add('loaded');}else{img.addEventListener('load',()=>img.classList.add('loaded'));}}
batch.appendChild(div);});return batch;}
function loadNextBatch(){if(isLoading||allLoaded)return;const startIndex=currentBatch*batchSize;if(startIndex>=images.length){allLoaded=true;observer.disconnect();return;}
isLoading=true;const batch=createBatch(startIndex);document.getElementById('gallery-container').appendChild(batch);if(typeof applyImageMode==='function'){applyImageMode(currentMode);}
currentBatch++;isLoading=false;}
const sentinel=document.getElementById('sentinel');let observer;if(sentinel){observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){loadNextBatch();}});},{rootMargin:'400px'});observer.observe(sentinel);}else{console.error('Sentinel element not found!');}
loadNextBatch();