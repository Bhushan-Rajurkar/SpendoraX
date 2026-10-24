import { API_ENDPOINTS } from "./apiEndpoints";

const CLOUDINARY_UPLOAD_PRESET="moneymanager";
const uploadProfileImage= async(image)=>{
    const formdata=new FormData();
    formdata.append("file", image);
    formdata.append("upload_preset",CLOUDINARY_UPLOAD_PRESET);
    try{
      const response=await  fetch(API_ENDPOINTS.UPLOAD_IMAGE,{
          method:"POST",
            body:formdata
        });
        if(!response.ok){
            const errorData=await response.json();
           throw new Error(`Cloudinary upload failed: ${errorData.error.message || response.statusText}`);
        }

        const data=await response.json();
        console.log('Image uploaded successfully.',data);
        return data.secure_url;
    }catch(error){
        console.error("Error uploading the image",error);
          throw error;
    }

}

export default uploadProfileImage;