/** 全站有限动效参数；历史时钟与环境时钟继续由各自原有实现管理。 */
export const motion = { feedback:180, hover:320, reveal:520, dialog:380, camera:750, page:680, portrait:640, ease:'cubic-bezier(.22,.65,.25,1)' } as const
const owned=new Map<Animation,Element>()
const slots=new WeakMap<Element,Map<string,Animation>>()
export const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches
export function cancelMotion(root:Element){
 for(const [animation,element] of owned)if(root===element||root.contains(element))animation.cancel()
}
export function animateMotion(element:Element|null|undefined,key:string,frames:Keyframe[],options:KeyframeAnimationOptions={}){
 if(!element)return null
 slots.get(element)?.get(key)?.cancel()
 if(document.hidden||reducedMotion()||typeof element.animate!=='function')return null
 const animation=element.animate(frames,{duration:motion.reveal,easing:motion.ease,fill:'backwards',...options})
 const entries=slots.get(element)??new Map<string,Animation>();entries.set(key,animation);slots.set(element,entries)
 owned.set(animation,element)
 const release=()=>{owned.delete(animation);if(entries.get(key)===animation)entries.delete(key)}
 void animation.finished.then(()=>{release();animation.cancel()},release)
 return animation
}
/** 仅维护有限动效和CSS后台状态，不新增常驻RAF或接管历史播放。 */
export function installMotionPolicy(){
 const media=matchMedia('(prefers-reduced-motion: reduce)')
 const sync=()=>{
  document.documentElement.dataset.motionState=document.hidden?'background':media.matches?'reduced':'running'
  if(document.hidden||media.matches)for(const animation of owned.keys())animation.cancel()
 }
 sync();media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync)
 return()=>{media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);for(const animation of owned.keys())animation.cancel();delete document.documentElement.dataset.motionState}
}
