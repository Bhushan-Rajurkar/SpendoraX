import { Pencil } from "lucide-react";
import TransactionIcon from "./TransactionIcon";

const CategoryList = ({ categories, onEditCategory, onDeleteCategory }) => {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Category Sources</h4>
      </div>
      {/* Category List */}
      {categories.length === 0 ? (
        <p className="text-gray-500">
          No categories added yet. Add some to get started
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100/60"
            >
              {/* Add icon or emoji display */}
              <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
                <TransactionIcon
                  icon={category.icon}
                  type={category.type}
                  className="h-6 w-6"
                />
              </div>
                        {/*Add category details*/} 
                        <div className="flex-1 flex items-canter justify-between">

                       
                         {/*Catgeory Name and type */}
                         <div>
                            <p className="text-sm text-gray-700 font-medium">

                                {category.name}
                            </p>
                            
                            <p className="text-sm text-gray-400 mt-1 capitalize">

                                {category.type}
                            </p>
                         </div>
                          </div>
                           {/*Action Bottuns*/}

                           <div className="flex items-center gap-2">
                            <button 
                            onClick={()=>onEditCategory(category)}
                            className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                 <Pencil size={18}/>
                            </button>
                           </div>
                    </div>
                    ))}
                </div>
            ) }

        </div>
    )
}
export  default  CategoryList;


// import { Layers2, Pencil, Trash2 } from "lucide-react";

// const CategoryList = ({ categories = [], onEditCategory, onDeleteCategory }) => {
//   return (
//     <div className="card p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h4 className="text-lg font-semibold">Category Sources</h4>
//       </div>

//       {categories.length === 0 ? (
//         <p className="text-gray-500">
//           No categories added yet. Add some to get started.
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {categories.map((category) => (
//             <div
//               key={category.id}
//               className="group flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-100/60"
//             >
//               {/* Icon */}
//               <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
//                 {category.icon ? (
//                   <img
//                     src={category.icon}
//                     alt={category.name}
//                     className="h-5 w-5"
//                   />
//                 ) : (
//                   <Layers2 className="text-purple-600" size={20} />
//                 )}
//               </div>

//               {/* Name + Type */}
//               <div className="flex-1">
//                 <p className="text-sm text-gray-700 font-medium">
//                   {category.name}
//                 </p>
//                 <p className="text-sm text-gray-400 capitalize">
//                   {category.type}
//                 </p>
//               </div>

//               {/* Actions */}
//               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
//                 <button onClick={() => onEditCategory(category)}>
//                   <Pencil size={16} />
//                 </button>

//                 <button onClick={() => onDeleteCategory(category.id)}>
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CategoryList;