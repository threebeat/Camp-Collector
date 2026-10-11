// Pointer Events cover mouse, pen and touch. Only a resident captures the gesture;
// the rest of a map remains available for normal scrolling and panning.
export function attachResidentDragging(root,{select,move,drop,dragging=()=>{}}){
 let held=null;
 const clear=()=>{if(!held)return;held.el.classList.remove('picked-up');root.querySelectorAll('[data-drop-target]').forEach(el=>el.classList.remove('drop-ready'));held=null;dragging(false);};
 for(const el of root.querySelectorAll('[data-resident]')){
  el.addEventListener('pointerdown',event=>{
   if(held||event.button!==undefined&&event.button!==0)return;
   const map=el.closest('[data-local-map]');if(!map)return;
   const rect=map.getBoundingClientRect(),pos=el.getBoundingClientRect();
   held={el,map,rect,id:el.dataset.hero,pointer:event.pointerId,startX:event.clientX,startY:event.clientY,offsetX:event.clientX-(pos.left+pos.width/2),offsetY:event.clientY-(pos.top+pos.height*.9),lifted:false};
   select(held.id);el.setPointerCapture?.(event.pointerId);event.preventDefault();
  });
  el.addEventListener('pointermove',event=>{
   if(!held||event.pointerId!==held.pointer)return;
   if(!held.lifted&&Math.hypot(event.clientX-held.startX,event.clientY-held.startY)<6)return;
   if(!held.lifted){held.lifted=true;el.classList.add('picked-up');dragging(true);}
   if(event.pointerType==='touch'&&typeof window!=='undefined'){const height=window.innerHeight||0;if(height&&event.clientY>height-100)window.scrollBy?.({top:14});else if(event.clientY<80)window.scrollBy?.({top:-14});}
   held.rect=held.map.getBoundingClientRect();
   const x=Math.max(5,Math.min(95,(event.clientX-held.rect.left-held.offsetX)/held.rect.width*100)),y=Math.max(16,Math.min(95,(event.clientY-held.rect.top-held.offsetY)/held.rect.height*100));
   held.x=x;held.y=y;el.style.left=x+'%';el.style.top=y+'%';
   const hit=document.elementFromPoint?.(event.clientX,event.clientY)?.closest('[data-drop-target]');
   root.querySelectorAll('[data-drop-target]').forEach(target=>target.classList.toggle('drop-ready',target===hit));event.preventDefault();
  });
  el.addEventListener('pointerup',async event=>{
   if(!held||event.pointerId!==held.pointer)return;
   const current=held,lifted=current.lifted,hit=document.elementFromPoint?.(event.clientX,event.clientY)?.closest('[data-drop-target]');
   el.releasePointerCapture?.(event.pointerId);el.dataset.ignoreClick='yes';clear();
   if(lifted){await move(current.id,current.x,current.y);if(hit)await drop(current.id,hit.dataset.dropTarget);}
   setTimeout(()=>{delete el.dataset.ignoreClick;},350);event.preventDefault();
  });
  el.addEventListener('pointercancel',event=>{if(held?.pointer===event.pointerId){el.releasePointerCapture?.(event.pointerId);clear();}});
 }
 return{isDragging:()=>!!held,cancel:clear};
}

export function mapPoint(rect,x,y){return{x:Math.max(5,Math.min(95,(x-rect.left)/rect.width*100)),y:Math.max(16,Math.min(95,(y-rect.top)/rect.height*100))};}
