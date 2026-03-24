const imageCache=new Map<string,boolean>();

export const isCached=(src:string)=>{
  return imageCache.has(src);
};

export const addToCache=(src:string)=>{
  imageCache.set(src,true);
};