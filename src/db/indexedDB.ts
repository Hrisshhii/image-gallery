const DB_NAME="CelebrareDB";
const STORE_NAME="images";
const DB_VERSION=1;

export const openDB=(): Promise<IDBDatabase>=>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE_NAME)){
        db.createObjectStore(STORE_NAME,{
          keyPath:"id",
        });
      }
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject("Error opening DB: "+request.error);
  });
};

export const saveImages=async (images:{id:number;url:string}[])=>{
  const db=await openDB();
  const tx=db.transaction(STORE_NAME,"readwrite");
  const store=tx.objectStore(STORE_NAME);
  images.forEach((img)=>store.put(img));
  return new Promise((resolve)=>{
    tx.oncomplete=()=>resolve(true);
  });
};

export const getImages=async ():Promise<{id:number;url:string}[]>=>{
  const db=await openDB();
  const tx=db.transaction(STORE_NAME,"readonly");
  const store=tx.objectStore(STORE_NAME);

  return new Promise((resolve,reject)=>{
    const request=store.getAll();
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject("Error fetching images: "+request.error);
  });
};