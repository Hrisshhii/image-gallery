/* eslint-disable react-hooks/incompatible-library */
import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ImageModal from "./ImageModel";

const ROW_HEIGHT=220;
const GAP=24;

const Gallery=()=>{
  const parentRef=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(window.innerWidth);
  const [selectedImg,setSelectedImg]=useState<string|null>(null);
  const workerRef=useRef<Worker|null>(null);
  const [selectImages,setSelectImages]=useState<Set<string>>(new Set());

  const images=useMemo(()=>
    Array.from({ length:100 },(_,i)=>
      `https://picsum.photos/id/${i+15}/1200/800`
    ),[]);

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
      <h1 className="text-5xl font-bold text-center py-6 bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-blue-500/70 to-purple-950">
        Celebrare
      </h1>

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
                {Array.from({length:columnCount}).map((_, colIndex)=>{
                  const index=rowIndex * columnCount+colIndex;
                  if (index>=images.length) return null;

                  return (
                    <div key={colIndex}
                      style={{
                        width: COLUMN_WIDTH,
                        padding: 12,
                      }}
                      className={`relative group 
                        ${selectImages.has(images[index])?"ring-4 ring-blue-400 rounded-2xl":""}
                      `}
                    >
                      <img src={images[index]} onClick={()=>setSelectedImg(images[index])} 
                        onError={(e)=>e.currentTarget.src="https://picsum.photos/seed/fallback/1200/800"}
                        className="w-full h-full object-cover rounded-xl shadow-md cursor-pointer hover:scale-105 transition duration-500"
                      />
                      <button onClick={()=>handleDownload(images[index])}
                        className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 transition"
                      >
                        Download
                      </button>

                      <input type="checkbox" checked={selectImages.has(images[index])}
                        onChange={()=>toggleSelect(images[index])}
                        className="absolute top-4 left-4 w-5 h-5 cursor-pointer opacity-0 group-hover:opacity-100"
                      />
                    </div>
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