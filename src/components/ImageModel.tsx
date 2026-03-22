/* eslint-disable @typescript-eslint/no-explicit-any */
import {motion} from "framer-motion";

const ImageModal=({image,onClose,onDownload}:any)=>{
  if(!image) return null;
  return(
    <div onClick={onClose} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <button onClick={onClose} className="absolute top-6 right-6 text-white text-3xl font-bold hover:scale-125 transition cursor-pointer">✕</button>
      <button onClick={e=>{
          e.stopPropagation();
          onDownload(image);
        }}
        className="absolute bottom-10 right-10 bg-white text-black px-4 py-2 rounded-lg shadow hover:scale-105 transition cursor-pointer"
      >Download</button>
      <motion.img src={image} className="w-[50%] rounded-xl shadow-xl"
        initial={{scale:0.8,opacity:0}}
        animate={{scale:1,opacity:1}}
        transition={{duration:0.3}}
        onClick={(e)=>e.stopPropagation()}
      />
    </div>
  );
};

export default ImageModal;