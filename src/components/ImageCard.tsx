type Props={
  src:string;
  isSelected:boolean;
  onSelect:()=>void;
  onClick:()=>void;
  onDownload:()=>void;
  width:number;
};

const ImageCard=({src,isSelected,onSelect,onDownload,onClick,width,}:Props)=>{
   return (
    <div
      style={{ width, padding: 12 }}
      className={`relative group ${
        isSelected ? "ring-4 ring-blue-400 rounded-2xl" : ""
      }`}
    >
      <img
        src={src}
        onError={(e)=>e.currentTarget.src="https://picsum.photos/seed/fallback/1200/800"}
        onClick={onClick}
        className="w-full h-full object-cover rounded-xl shadow-md cursor-pointer"
      />

      <button
        onClick={onDownload}
        className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100"
      >
        Download
      </button>

      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="absolute top-4 left-4 w-5 h-5 opacity-0 group-hover:opacity-100"
      />
    </div>
  );
};
export default ImageCard;