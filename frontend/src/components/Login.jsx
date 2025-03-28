import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { baseApiURL } from "../baseUrl";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected] = useState("Student");
  const [otpSent, setOtpSent] = useState(false);
  const [loginData, setLoginData] = useState({});
  const { register, handleSubmit } = useForm();
  const [temporary , setTemporary] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [loginid , setLoginid] = useState(0);

  const [userEmail , setUserEmail] = useState("");

  const fetchUserEmail = async (loginid) => {
    try {
      if (!loginid) return; 
      const requestData = 
      selected.toLowerCase() === "student" 
      ? { enrollmentNo: loginid } 
      : { employeeId: loginid };
      console.log(requestData);
      const response = await axios.post(`${baseApiURL()}/${selected.toLowerCase()}/details/getDetails`, requestData);
      if (response.data.success && response.data.user.length > 0) {
        setUserEmail(response.data.user[0].email);
      }   
    } catch (error) {
      console.error("Error fetching user email:", error);
    }
  };

  const notifyAdmin = async (email) => {
    await axios.post(`${baseApiURL()}/notify-security`, { email })
      .catch(err => console.error("Email notification error:", err));
  };


  const onSubmit = (data) => {
    if (data.loginid !== "" && data.password !== "") {
      const headers = {
        "Content-Type": "application/json",
      };
      axios
        .post(`${baseApiURL()}/${selected.toLowerCase()}/auth/login`, data, {
          headers: headers,
        })
        .then((response) => {
          setLoginid(data.loginid);
          if (response.data.message === "Temporary") {
            setTemporary(true);
            toast.success("Temporary login successful!");
            navigate(`/${selected.toLowerCase()}`, {
              state: { type: selected, loginid: response.data.loginid , temporary: true },
            });
          } else {
            toast.success("Password verified! OTP sent.");
            setOtpSent(true);
            setLoginData(data); 
            setLoginAttempts(0);
          }
        })
        .catch((error) => {
          toast.dismiss();
          setLoginAttempts(prev => prev + 1);
          if (loginAttempts + 1 >= 3 && !userEmail) {
            fetchUserEmail(data.loginid);  // Fetch email if not set

          }
          
          if (loginAttempts + 1 >= 3 && userEmail) {
            notifyAdmin(userEmail);
          }
          console.error(error);
          toast.error(error.response?.data?.message || "Invalid credentials!");
        });
    } else {
    }
  };

  // Handle OTP Submission
  const handleOtpSubmit = (otpData) => {
    axios
      .post(`${baseApiURL()}/${selected.toLowerCase()}/auth/verify-otp`, {
        ...loginData,
        otp: otpData.otp,
      })
      .then((response) => {
        toast.success("Login Successful!");
        setTemporary(false);
        setOtpAttempts(0);
        setLoginid(response.data.loginid);
        navigate(`/${selected.toLowerCase()}`, {
          state: { type: selected, loginid: response.data.loginid , temporary: false},
        });
      })
      .catch((error) => {
        toast.dismiss();
        setOtpAttempts(prev => prev + 1);
        
        if (otpAttempts + 1 >= 3 && !userEmail) {
          fetchUserEmail(loginid);  // Fetch email if not set
        }
        
        if (otpAttempts + 1 >= 3 && userEmail) {
          notifyAdmin(userEmail);
        }
        toast.error(error.response?.data?.message || "Invalid OTP!");
      });
  };

  return (
    <div className="bg-white h-[100vh] w-full flex justify-between items-center">
      <img
        className="w-[60%] h-[100vh] object-cover"
        src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt=""
      />
      <div className="w-[40%] flex justify-center items-start flex-col pl-8">
        <p className="text-3xl font-semibold pb-2 border-b-2 border-green-500">
          {selected && selected} Login
        </p>

        {!otpSent ? (
        <form
          className="flex justify-center items-start flex-col w-full mt-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col w-[70%]">
            <label className="mb-1" htmlFor="eno">
              {selected && selected} Login ID
            </label>
            <input
              type="number"
              id="eno"
              required
              className="bg-white outline-none border-2 border-gray-400 py-2 px-4 rounded-md w-full focus:border-blue-500"
              {...register("loginid")}
            />
          </div>
          <div className="flex flex-col w-[70%] mt-3">
            <label className="mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                className="bg-white outline-none border-2 border-gray-400 py-2 px-4 rounded-md w-full focus:border-blue-500"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {/* <div className="flex w-[70%] mt-3 justify-start items-center">
            <input type="checkbox" id="remember" className="accent-blue-500" />{" "}
            Remember Me
          </div> */}
          <button className="bg-blue-500 mt-5 text-white px-6 py-2 text-xl rounded-md hover:bg-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all flex justify-center items-center">
            Login
            <span className="ml-2">
              <FiLogIn />
            </span>
          </button>
        </form>
        ):(<form
          className="flex justify-center items-start  flex-col w-full mt-10"
          onSubmit={handleSubmit(handleOtpSubmit)}
        >
          <div className="flex flex-col w-[70%]">
            <label className="mb-1" htmlFor="otp">Enter OTP</label>
            <input
              type="number"
              id="otp"
              required
              className="bg-white border-2 border-gray-400 py-2 px-4 rounded-md w-full"
              {...register("otp" , { value: "" })}
            />
          </div>
          <button className="bg-blue-500 btn-sm mt-5 text-white px-6 py-2 text-xl rounded-md hover:bg-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all flex justify-center items-center">
            Verify OTP
          </button>
        </form>
        )}
      </div>
      <div className="absolute top-4 right-4">
        <button
          className={`text-blue-500 mr-6 text-base font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${
            selected === "Student" && "border-b-2 border-green-500"
          }`}
          onClick={() => setSelected("Student")}
        >
          Student
        </button>
        <button
          className={`text-blue-500 mr-6 text-base font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${
            selected === "Faculty" && "border-b-2 border-green-500"
          }`}
          onClick={() => setSelected("Faculty")}
        >
          Faculty
        </button>
        <button
          className={`text-blue-500 mr-6 text-base font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${
            selected === "Admin" && "border-b-2 border-green-500"
          }`}
          onClick={() => setSelected("Admin")}
        >
          Admin
        </button>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Login;
