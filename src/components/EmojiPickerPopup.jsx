import { useState } from "react";
import { Image, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { getIconUrl } from "../util/helper";

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleEmojiClick = (emoji) => {
    const chosen = emoji?.imageUrl
      ? getIconUrl(emoji.imageUrl) || emoji.imageUrl
      : emoji?.emoji || "";
    onSelect(chosen);
    setIsOpen(false);
  };

  const previewUrl = getIconUrl(icon);

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-12 h-12 flex items-center justify-center text-2xl text-purple-600 bg-purple-50 group-hover:bg-purple-100 rounded-xl border border-purple-100 transition-colors">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Icon"
              className="w-8 h-8 object-contain"
            />
          ) : icon && icon.length <= 4 ? (
            <span>{icon}</span>
          ) : (
            <Image size={22} />
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700">
            {icon ? "Change Icon" : "Select Icon"}
          </p>
          <p className="text-[11px] text-gray-400">
            Click to pick an emoji
          </p>
        </div>
      </div>
            {isOpen&&(
                <div className="relative">
                    <button 
                    onClick={()=>setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top -right-2 z-10 cursor-pointer">
                    <X/>

                    </button>

                    <EmojiPicker open={isOpen}
                    // onEmojiClick={(emoji)=>onSelect(emoji ?. imageUrl ||"")}
                  onEmojiClick={handleEmojiClick}

                  />
                </div>
            )}
            
            
        
        </div>
    )
}
export default EmojiPickerPopup;