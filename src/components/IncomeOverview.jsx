// import { useEffect, useState } from "react";
// import CustomLineChart from "./CustomLineChart";
// import { prepareIncomeLineChartData } from "../util/helper";

// const IncomeOverview=({transactions})=>{
//    const [chartData,setChartData]=useState([]);
//    useEffect(()=>{
//     const result=prepareIncomeLineChartData(transactions);
//     console.log(result);
//     setChartData(result);
//     return()=>{};
//    },[transactions]);

//     return (
//     <div className="card">
//         <div className="flex items-center justify-between">
//             <div>
//                 <h5 className="text-lg">
//                     Income Overview
//                 </h5>

//                 <p className="text-xs text-gray-400 mt-0 5">
//                     Track your earnings overview over time and analyse your income trends.
//                 </p>
//             </div>

//         </div>
        
//             <div className="mt-10">
//                 {/*create line chart*/}
//              <CustomLineChart data={chartData}/>

//             </div>
//     </div>
//     )
// }

// export default IncomeOverview;


// import { useEffect, useState } from "react";
// import CustomLineChart from "./CustomLineChart";
// import { prepareIncomeLineChartData } from "../util/helper";

// const IncomeOverview = ({
//   transactions,
//   categories,
// }) => {
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     const result = prepareIncomeLineChartData(
//       transactions,
//       categories
//     );

//     setChartData(result);
//   }, [transactions, categories]);

//   return (
//     <div className="card">
//       <div className="flex items-center justify-between">
//         <div>
//           <h5 className="text-lg">
//             Income Overview
//           </h5>

//           <p className="text-xs text-gray-400 mt-0.5">
//             Track your earnings overview over time
//             and analyse your income trends.
//           </p>
//         </div>
//       </div>

//       <div className="mt-10">
//         <CustomLineChart data={chartData} />
//       </div>
//     </div>
//   );
// };

// export default IncomeOverview;



// import { useEffect, useState } from "react";
// import CustomLineChart from "./CustomLineChart";
// import { prepareIncomeLineChartData } from "../util/helper";

// const IncomeOverview = ({
//   transactions,
//   categories,
// }) => {
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     const result = prepareIncomeLineChartData(
//       transactions,
//       categories
//     );

//     setChartData(result);
//   }, [transactions, categories]);

//   return (
//     <div className="card">
//       <div className="flex items-center justify-between">
//         <div>
//           <h5 className="text-lg">Income Overview</h5>

//           <p className="text-xs text-gray-400 mt-0.5">
//             Track your earnings overview over time and analyse your income trends.
//           </p>
//         </div>
//       </div>

//       <div className="mt-10">
//         <CustomLineChart data={chartData} />
//       </div>
//     </div>
//   );
// };

// export default IncomeOverview;



import { useEffect, useState } from "react";
import CustomLineChart from "./CustomLineChart";
import { prepareIncomeLineChartData } from "../util/helper";
import { Plus } from "lucide-react";

const IncomeOverview = ({
  transactions,
  categories,
  onAddIncome,
}) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareIncomeLineChartData(
      transactions,
      categories
    );

    setChartData(result);
  }, [transactions, categories]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg">
            Income Overview
          </h5>

          <p className="text-xs text-gray-400 mt-0.5">
            Track your earnings overview over time
            and analyse your income trends.
          </p>
        </div>
           <button
              onClick={onAddIncome
          
              }
              className="add-btn bg-green-50 text-green-800 flex items-center px-3 py-2 rounded-lg mb-1"
            >
              <Plus
                size={15}
                className="text-lg"
              />
              Add Income
            </button>
      </div>

      <div className="mt-10">
        <CustomLineChart data={chartData} />
      </div>
    </div>
  );
};

export default IncomeOverview;


