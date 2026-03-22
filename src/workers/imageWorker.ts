self.onmessage=async (e:MessageEvent)=>{
  const {src}=e.data;
  try {
    const response=await fetch(src);
    const blob=await response.blob();
    const bitmap=await createImageBitmap(blob);

    const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);
    const ctx=canvas.getContext("2d");
    ctx?.drawImage(bitmap, 0, 0);

    ctx!.font=`${canvas.width*0.03}px Arial`;
    ctx!.fillStyle="rgba(255,255,255,0.7)";
    ctx!.textAlign="right";
    ctx!.fillText("Celebrare",canvas.width-20,canvas.height-20);

    const finalBlob=await canvas.convertToBlob();

    self.postMessage({blob:finalBlob});
  } catch(err){
    console.log(err);
    self.postMessage({error:true});
  }
};