import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import Input from "../components/Input.jsx";
import { Link } from "react-router-dom";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import{ validateEmail }from "../util/validation.js";
import { AppContext } from "../context/AppContext.jsx"
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";



const Login = () => {
  const [fullName, setFullName] = useState( "");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
       const [error, setError] = useState(null);

       const [isLoading, setIsLoading] =useState(false);
       const {setUser}= useContext(AppContext);
  
      const navigate = useNavigate();
      const  handleSubmit = async (e)=>{
       e.preventDefault();
       setIsLoading(true);
       //basic validation 
           if(!validateEmail(email)) {
                   setError( "Please enter valid email address");
                  setIsLoading(false);
                   return;
               }
               
                  if(!password.trim()){
                   setError( "Please enter your Password");
                  setIsLoading(false);
                   return;
               }
               setError("");

               //LoginApicall
               try{
                 const response= await  axiosConfig.post(API_ENDPOINTS.LOGIN ,{
                        email,
                        password,
                    }
                );
                 const  {token, user}=  response.data;
                 if(token){
                    localStorage.setItem("token",token);
                    setUser(user);
                    //  toast.success("Logged in successfully");
                    navigate("/dashboard");
                 }
               }catch(error){
                if(error.response && error.response.data.message){
                   
                    setError(error.response.data.message);

                }
                else{
                console.error("Something went wrong. ",error);
                setError(error.message);
                }
               }
               finally{
                setIsLoading(false);
               }
      }

  return (
    <      div className="h-screen w-full relative flex items-center justify-center overflow-hidden">

            {/* Background image with blur effect */}
            <img
                src={assets.login_bg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover blur-sm"
            />

            {/* Signup card */}
             <div className="relative z-10 w-full max-w-lg px-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8 max-h-[90vh] overflow-y-auto">

                    <h3 className="text-2xl font-semibold text-black mb-2 text-center">
                        Welcome Back
                    </h3>

                    <p className="text-center text-sm text-slate-700 mb-8">
                        Please enter your details to login </p>
                    <form  onSubmit={handleSubmit} className="space-y-4">
                        
                         
                      
                        
                             <Input
                             value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email Address"
                                placeholder="abc@example.com "
                                type="text"
                          /> 

                         
                          
                            <Input
                            value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                label="Password"
                                placeholder="********"
                                type="password"
                          />  
                          

                         
                         {error && (
                            <p className="text-red-800 text-sm text-center bg-red-50 p-2 rounded"
                            >
                                {error}
                            </p>
                         )}
                         <button 
                         disabled={isLoading}
                         className={'btn-primary w-full py-3 text-lg font-medium bg-purple-600 rounded-lg text-white flex items-center justify-center gap-2 {isLoading ? "opacity-60 cursor-not-allowed ":"}'} type="submit">
                            
                            {isLoading ?(
                                    <>
                                    <LoaderCircle className="animate-spin w-5 h-5"/>
                                    Logging in...
                                    </>):("LOGIN")

                            }
                            </button>
                        
                         <p 
                        className="text-sm text-slate-800 text-center mt-6">
                        Dosen't have an existing account?
                        <Link to="/signup"
                        className="font-medium text-primary underline hover:text-primary-dark transition-colors "
                        >SIGN UP</Link>
                        </p>


                    </form>

                </div>
            </div>

        </div>
   )

}


export default Login;