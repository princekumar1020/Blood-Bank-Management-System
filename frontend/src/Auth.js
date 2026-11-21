import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useToast } from "./context/ToastContext";
import PublicHeader from "./components/PublicHeader";
import FloatingBloodGroups from "./components/FloatingBloodGroups";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modeParam = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam !== "signup");
  const shouldReduceMotion = useReducedMotion();
  
  useEffect(() => {
    if(modeParam === 'signup') setIsLogin(false);
    else if (modeParam === 'login' || !modeParam) setIsLogin(true);
  }, [modeParam]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    role: searchParams.get("role") || "donor",
    gender: "Male",
    bloodGroup: "A+",
    age: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: ""
  });

  // Clear password fields on mount or when switching login/signup
  useEffect(() => {
    if (isLogin) {
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use original formData to include potential leading/trailing spaces if the user intended them
      const submissionData = {
        ...formData,
        confirmPassword: formData.confirmPassword || undefined
      };
      
      // Direct admin dashboard logic (Merged conflict fix safely)
      if (isLogin && submissionData.email === 'admin123@gmail.com' && (submissionData.password === 'Admin@123' || submissionData.password === 'Admin@123456')) {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: submissionData.email,
          password: submissionData.password
        });
        sessionStorage.setItem("token", res.data.token);
        if (res.data.userId) sessionStorage.setItem("userId", res.data.userId);
        showToast('Logged in as admin', 'success');
        navigate('/admin-dashboard', { replace: true });
        return;
      }
      
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: submissionData.email,
          password: submissionData.password
        });
        sessionStorage.setItem("token", res.data.token);
        if (res.data.userId) sessionStorage.setItem("userId", res.data.userId);
        showToast(`Logged in as ${res.data.role}`, 'success');
        if (res.data.role === 'recipient') {
          navigate("/recipient-dashboard");
        } else if (res.data.role === 'donor') {
          navigate("/donor-dashboard");
        } else if (res.data.role === 'admin') {
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      } else {
        const { email, password, confirmPassword, age, role, mobileNo } = submissionData;
        // Frontend Validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showToast("Please enter a valid email address.", 'warning');
          return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          showToast("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.", 'warning');
          return;
        }
        if (password !== confirmPassword) {
          showToast("Passwords do not match", 'warning');
          return;
        }
        const ageNum = parseInt(age, 10);
        if (role === 'donor' && (ageNum < 18 || ageNum > 65)) {
          showToast("Donors must be between 18 and 65 years old.", 'warning');
          return;
        }
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobileNo)) {
          showToast("Please enter a valid 10-digit mobile number.", 'warning');
          return;
        }
        
        // Merged signup conflict safely
        const res = await axios.post("http://localhost:5000/api/auth/signup", submissionData);
        showToast("Registered successfully! Please login to continue.", 'success');
        setIsLogin(true);
        // Reset sensitive fields
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.error === "User does not exist") {
             showToast("User does not exist. Please sign up.", 'error');
             navigate("/auth?mode=signup");
        } else {
            showToast(err.response.data.error, 'error');
        }
      } else {
        showToast(err.response?.data?.message || "An error occurred. Please try again.", 'error');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Always trim password fields on change
    if (name === "password" || name === "confirmPassword") {
      setFormData({ ...formData, [name]: value.trim() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="public-page auth-page">
      <PublicHeader />
      <FloatingBloodGroups />
      <main className="auth-card">
        <div className="auth-card-content space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium pb-2">Please enter your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {!isLogin && (
              <>
                {/* Elegant Sliding Button for Role */}
                <div role="group" aria-label="Account type" className="relative flex w-full bg-[#F3F3F5] dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 mb-2">
                  <motion.div 
                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#e60000] rounded-lg shadow-sm"
                    animate={{ x: formData.role === 'recipient' ? '100%' : '0%' }}
                    transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
                  />
                  <button
                    type="button"
                    aria-pressed={formData.role === 'donor'}
                    onClick={() => setFormData({ ...formData, role: 'donor' })}
                    className={`relative z-10 flex-1 py-1 text-sm font-bold text-center transition-colors ${formData.role === 'donor' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Donor
                  </button>
                  <button
                    type="button"
                    aria-pressed={formData.role === 'recipient'}
                    onClick={() => setFormData({ ...formData, role: 'recipient' })}
                    className={`relative z-10 flex-1 py-1 text-sm font-bold text-center transition-colors ${formData.role === 'recipient' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Recipient
                  </button>
                </div>

                <div className="relative group">
                   <User className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
                   <input
                    name="fullName" aria-label="Full name" autoComplete="name" placeholder="Full Name" onChange={handleInputChange} required
                    className="w-full pl-12 pr-4 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
                </div>
                
                {/* Elegant Sliding Button for Gender */}
                <div role="group" aria-label="Gender" className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-1">Gender</label>
                  <div className="relative flex w-full bg-[#F3F3F5] dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <motion.div 
                      className="absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-[#e60000] rounded-lg shadow-sm"
                      animate={{ x: formData.gender === 'Female' ? '100%' : formData.gender === 'Other' ? '200%' : '0%' }}
                      transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
                    />
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g} type="button"
                        aria-pressed={formData.gender === g}
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`relative z-10 flex-1 py-1.5 text-sm font-bold text-center transition-colors ${formData.gender === g ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="signup-blood-group" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-1">Blood Group</label>
                    <select id="signup-blood-group" name="bloodGroup" onChange={handleInputChange} className="w-full bg-[#F3F3F5] dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors">
                      <option>A+</option><option>B+</option><option>AB+</option><option>O+</option>
                      <option>A-</option><option>B-</option><option>AB-</option><option>O-</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="signup-age" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-1">Age</label>
                    <input id="signup-age" name="age" type="number" placeholder="18" onChange={handleInputChange} required className="w-full p-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 font-semibold transition-colors" />
                  </div>
                </div>

                <div className="relative group">
                   <Phone className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
                   <input name="mobileNo" aria-label="Mobile number" autoComplete="tel" placeholder="Mobile Number" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
                </div>
              </>
            )}

            <div className="relative group">
               <Mail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
               <input name="email" aria-label="Email address" autoComplete="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
            </div>

            <div className="relative group">
               <Lock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
               <input name="password" aria-label="Password" type={showPassword ? "text" : "password"} placeholder="Password" onChange={handleInputChange} required autoComplete={isLogin ? "current-password" : "new-password"} className="w-full pl-12 pr-12 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)} 
                 aria-label={showPassword ? "Hide password" : "Show password"}
                 aria-pressed={showPassword}
                 className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
               >
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
            </div>

            {!isLogin && (
              <div className="relative group">
                <Lock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
                <input name="confirmPassword" aria-label="Confirm password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" onChange={handleInputChange} required autoComplete="new-password" className="w-full pl-12 pr-12 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            <button type="submit" className="w-full bg-[#e60000] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#b30000] dark:hover:bg-[#b30000] transition-colors shadow-lg mt-4 active:scale-95 duration-200 uppercase tracking-widest">
              {isLogin ? "Login Now" : "Register Now"}
            </button>
          </form>

          <div className="text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-gray-600 dark:text-gray-400 font-bold hover:text-black dark:hover:text-white transition-colors text-sm">
              {isLogin ? "New here? Create account" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}