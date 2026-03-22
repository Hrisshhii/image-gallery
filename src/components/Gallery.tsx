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

  const images=useMemo(()=>
    Array.from({ length:100 },(_,i)=>
      `https://picsum.photos/1200/800?random=${i}`
    ),[]);

  let columnCount=2;
  if (width>=640) columnCount=3;
  if (width>=1024) columnCount=4;
  if (width>=1400) columnCount=5;

  const COLUMN_WIDTH=(width-(columnCount-1)*GAP)/columnCount;
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
                    >
                      <img src={images[index]} onClick={()=>setSelectedImg(images[index])} className="w-full h-full object-cover rounded-xl shadow-md cursor-pointer hover:scale-105 transition duration-500"/>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <ImageModal image={selectedImg} onClose={()=>setSelectedImg(null)}/>
    </div>
  );
};

export default Gallery;