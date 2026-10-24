// // import Input from "../components/Input.jsx";
// // import { useState } from "react";
// // import EmojiPickerPopup from "./EmojiPickerPopup.jsx";

// // const AddCategoryForm=({onAddCategory})=>{

// //     const [category,setCategory]=useState({
// //         name:"",
// //         type:"income",
// //         icon:""
// //     }) 
// //     const categoryTypeOptions=[
// //         {value:"income",label:"Income"},
// //         {value:"expense",label:"Expense"},
      
        
// //     ]
// //     const handleChange=(key,value)=>{
// // setCategory({...category,[key]:value})
// //     }

// //     const handleSubmit=()=>{
// //         console.log('button clicked')
// //         onAddCategory(category);
// //     }
    
// //     return(
    
// //     <div className="p-4">
// //         <EmojiPickerPopup
// //          icon={category.icon}
// //          onSelect={(selectedIcon)=>handleChange("name",selectedIcon)}

// //         />
// //         <Input
// //         value={category.name}
// //         onChange={({target})=>handleChange("name",target.value) }
// //         label="Category Name"
// //         placeholder="e.g., Freelance, Salary, Bonus, Groceries"
// //         type="text"
// //         />
// //         <Input label="Category Type"
// //         value={category.type}
// //         onChange={({target})=>handleChange("type",target.value)}
// //         isSelect={true}
// //         options={categoryTypeOptions}
// //         />

// //         <div className="flex justify-end mt-6">
// //  <button
// //  type="button"
// //  onClick={handleSubmit}
// //   className="add-btn add-btn-fill">

// //     Add Category
// //  </button>

// //         </div>
         
// //     </div>)
// // }
// // export default AddCategoryForm;

// import Input from "../components/Input.jsx";
// import { useEffect, useState } from "react";
// import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
// import { LoaderCircle } from "lucide-react";

// const AddCategoryForm = ({ onAddCategory,initialCategorydata,isEditing}) => {
//     const [category, setCategory] = useState({
//         name: "",
//         type: "income",
//         icon: "",
//     });

// useEffect(()=>{
//     if(isEditing && initialCategorydata){
// setCategory(initialCategorydata);
//     }
//     else{
//         setCategory({name="",type="",icon=""})
//     }
// },[isEditing,initialCategorydata]);

//     const categoryTypeOptions = [
//         {
//             value: "income",
//             label: "Income",
//         },
//         {
//             value: "expense",
//             label: "Expense",
//         },
//     ];
   
//     const [loading ,setLoading] =useState(false);
//     const handleChange = (key, value) => {
//         setCategory((prev) => ({
//             ...prev,
//             [key]: value,
//         }));
//     };

//      const handleSubmit = async () => {
        
//         setLoading(true);
        
//         try{
//  await onAddCategory(category);
//         }finally{
//       setLoading(false);
//         }
//      }
//     // const handleSubmit = async () => {
//     //     console.log("Category Submitted:", category);

//     //     onAddCategory(category);

//     //     // Reset form after adding category
//     //     setCategory({
//     //         name: "",
//     //         type: "income",
//     //         icon: "",
//     //     });
//     // };

//     return (
//         <div className="p-4">
//             {/* Emoji Picker */}
//             <EmojiPickerPopup
//                 icon={category.icon}
//                 onSelect={(selectedIcon) =>
//                     handleChange("icon", selectedIcon)
//                 }
//             />

//             {/* Category Name Input */}
//             <Input
//                 label="Category Name"
//                 placeholder="e.g., Salary, Freelance, Groceries"
//                 type="text"
//                 value={category.name}
//                 onChange={({ target }) =>
//                     handleChange("name", target.value)
//                 }
//             />

//             {/* Category Type Select */}
//             <Input
//                 label="Category Type"
//                 value={category.type}
//                 onChange={({ target }) =>
//                     handleChange("type", target.value)
//                 }
//                 isSelect={true}
//                 options={categoryTypeOptions}
//             />

//             {/* Submit Button */}
//             <div className="flex justify-end mt-6">
//                 <button
//                     type="button"
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     className="add-btn add-btn-fill bg-purple-800 rounded-full text-white  cursor-pointer  flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 "
//                 >
//                {loading ? (<>
//                <LoaderCircle   className ="w-4 h-4 animate-spin"/> 
//               {isEditing ?"Upadting...":"Adding..."}
//                </>):(
//                 <>
//                {isEditing?"Updating Category":"Add Category"}
//                </>
//                )}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default AddCategoryForm;


import Input from "../components/Input.jsx";
import { useEffect, useState } from "react";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import { LoaderCircle } from "lucide-react";

const AddCategoryForm = ({
  onAddCategory,
  initialCategoryData,
  isEditing,
}) => {
  const [category, setCategory] = useState({
    name: "",
    type: "income",
    icon: "",
  });

  const [loading, setLoading] = useState(false);

  // Set data when editing or reset when adding

  useEffect(() => {
  if (isEditing && initialCategoryData) {
    setCategory(initialCategoryData);
  } else {
    setCategory({
      name: "",
      type: "income",
      icon: "",
    });
  }
}, [isEditing, initialCategoryData]);

  // useEffect(() => {
  //   if (isEditing && initialCategoryData) {
  //     setCategory({
  //       name: initialCategoryData.name || "",
  //       type: initialCategoryData.type || "income",
  //       icon: initialCategoryData.icon || "",
  //     });
  //   } else {
  //     setCategory({
  //       name: "",
  //       type: "income",
  //       icon: "",
  //     });
  //   }
  // }, [isEditing, initialCategoryData]);

  const categoryTypeOptions = [
    {
      value: "income",
      label: "Income",
    },
    {
      value: "expense",
      label: "Expense",
    },
  ];

  const handleChange = (key, value) => {
    setCategory((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!category.name.trim()) {
      return;
    }

    setLoading(true);

    try {
      await onAddCategory(category);

      // Clear form only after adding
      if (!isEditing) {
        setCategory({
          name: "",
          type: "income",
          icon: "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Emoji Picker */}
      <EmojiPickerPopup
        icon={category.icon}
        onSelect={(selectedIcon) =>
          handleChange("icon", selectedIcon)
        }
      />

      {/* Category Name */}
      <Input
        label="Category Name"
        placeholder="e.g., Salary, Freelance, Groceries"
        type="text"
        value={category.name}
        onChange={({ target }) =>
          handleChange("name", target.value)
        }
      />

      {/* Category Type */}
      <Input
        label="Category Type"
        value={category.type}
        onChange={({ target }) =>
          handleChange("type", target.value)
        }
        isSelect={true}
        options={categoryTypeOptions}
      />

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="add-btn add-btn-fill bg-purple-800 text-white cursor-pointer flex items-center gap-2 text-[15px] py-3 px-6 rounded-lg mb-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin" />
              {isEditing ? "Updating..." : "Adding..."}
            </>
          ) : (
            isEditing ? "Update Category" : "Add Category"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddCategoryForm;