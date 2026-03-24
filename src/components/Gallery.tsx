/* eslint-disable react-hooks/incompatible-library */
import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ImageModal from "./ImageModel";
import ImageCard from "./ImageCard";
import { getImages, saveImages } from "../db/indexedDB";

const ROW_HEIGHT=220;
const GAP=24;

const Gallery=()=>{
  const parentRef=useRef<HTMLDivElement>(null);
  const workerRef=useRef<Worker|null>(null);
  const [width,setWidth]=useState(window.innerWidth);
  const [selectedImg,setSelectedImg]=useState<string|null>(null);
  const [selectImages,setSelectImages]=useState<Set<string>>(new Set());
  const [images,setImages]=useState<string[]>([]);
  const [source,setSource]=useState<"cache"|"network">("network");

  const loadImages=async()=>{
    try{
      const cached=await getImages();
      if(cached.length>0){
        setImages(cached.map((img)=>img.url));
        setSource("cache");
        return;
      }
      const fresh=Array.from({length:100},(_,i)=>({
        id:i+15,
        url:`https://picsum.photos/id/${i+15}/1200/800?cacheBust=${Date.now()}`,
      }));
      setImages(fresh.map((img)=>img.url));
      await saveImages(fresh);
      setSource("network");
    }catch(err){
      console.error(err);
    }
  };

  useEffect(()=>{
    loadImages();
  },[]);

  let columnCount=2;
  if (width>=640) columnCount=3;
  if (width>=1024) columnCount=4;
  if (width>=1400) columnCount=5;

  const COLUMN_WIDTH=(width-(columnCount-3)*GAP)/columnCount;
  const rowCount=Math.ceil(images.length/columnCount);

  const rowVirtualizer=useVirtualizer({
    count:rowCount,
    getScrollElement:()=>parentRef.current,
    estimateSize:()=>ROW_HEIGHT,
    overscan:3,
  });

  useEffect(()=>{
    const handleResize=()=>setWidth(window.innerWidth);
    window.addEventListener("resize",handleResize);
    return ()=>window.removeEventListener("resize",handleResize);
  },[]);

  useEffect(()=>{
    workerRef.current=new Worker(
      new URL("../workers/imageWorker.ts",import.meta.url),
      {type:"module"}
    );
    workerRef.current.onmessage=(e)=>{
      if(e.data.error){
        alert("Processing failed");
        return;
      }
      const url=URL.createObjectURL(e.data.blob);

      const link=document.createElement("a");
      link.href=url;
      link.download="celebrare-image.png";
      link.click();

      URL.revokeObjectURL(url);
    }

    return ()=>workerRef.current?.terminate();
  },[]);

  const handleDownload=(src:string)=>{
    if(!workerRef.current) return;
    const id=Date.now();
    workerRef.current?.postMessage({src,id});
  };

  const toggleSelect=(src:string)=>{
    setSelectImages((prev)=>{
      const newSet=new Set(prev);
      if (newSet.has(src)) newSet.delete(src);
      else newSet.add(src);
      return newSet;
    });
  };

  const handleSelectAll=()=>{
    if(selectImages.size===images.length){
      setSelectImages(new Set());
    }else{
      setSelectImages(new Set(images));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-300 via-gray-100 to-gray-300">
      <h1 className="text-5xl font-bold text-center py-5 bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-blue-500/70 to-purple-950">
        Celebrare
      </h1>
      <p className="text-center text-sm text-gray-600/50">
        {source==="cache"?"Loaded from cache":"Loaded from network"}
      </p>
      <div ref={parentRef} className="h-[calc(100vh-100px)] overflow-auto px-4">
        <div
          style={{
            height:rowVirtualizer.getTotalSize(),
            position:"relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow)=>{
            const rowIndex=virtualRow.index;
            return (
              <div key={rowIndex}
                style={{
                  position:"absolute",
                  top:0,
                  left:0,
                  width:"100%",
                  height:ROW_HEIGHT,
                  transform:`translateY(${virtualRow.start}px)`,
                  display:"flex",
                }}
              >
                {Array.from({length:columnCount}).map((_,colIndex)=>{
                  const index=rowIndex * columnCount + colIndex;
                  if (index>=images.length) return null;

                  return (
                    <ImageCard
                      key={colIndex}
                      src={images[index]}
                      isSelected={selectImages.has(images[index])}
                      onSelect={()=>toggleSelect(images[index])}
                      onClick={()=>setSelectedImg(images[index])}
                      onDownload={()=>handleDownload(images[index])}
                      width={COLUMN_WIDTH}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <ImageModal image={selectedImg} onClose={()=>setSelectedImg(null)} onDownload={handleDownload}/>

      {selectImages.size>0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg flex items-center justify-between px-6 py-4 z-50">
          <div className="flex items-center gap-4">
            <input type="checkbox" checked={selectImages.size===images.length} onChange={handleSelectAll}/>
            <span>{selectImages.size} selected</span>
          </div>
          <button onClick={()=>{selectImages.forEach((img)=>handleDownload(img))}}
            className="bg-black text-white px-4 py-2 rounded hover:scale-105 transition"
          >Download Selected</button>
        </div>
      )}
    </div>
  );
};

export default Gallery;