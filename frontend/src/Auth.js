import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Phone, Droplet, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 p-4 px-10 flex justify-between items-center bg-white/75 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300">
      <Link to="/" className="flex items-center gap-2 text-gray-900 dark:text-white font-extrabold text-xl tracking-tight hover:opacity-80 transition">
        <Droplet className="text-[#e20000] fill-transparent stroke-2 h-7 w-7" />
        <span>BloodBank Plus</span>
      </Link>
      <div className="flex items-center gap-6">
        <button onClick={toggleTheme} className="text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition cursor-pointer">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <Link to="/auth" className="text-gray-900 dark:text-white font-extrabold hover:text-red-700 dark:hover:text-red-500 transition text-base">
          Login
        </Link>
        <Link to="/auth?mode=signup" className="bg-[#e60000] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#b30000] dark:hover:bg-[#b30000] transition shadow-md text-base tracking-wide">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

const colors = [
  'rgba(220, 38, 38, 0.75)', 'rgba(239, 68, 68, 0.7)', 'rgba(248, 113, 113, 0.65)', 
  'rgba(153, 27, 27, 0.65)', 'rgba(185, 28, 28, 0.75)', 'rgba(171, 107, 107, 0.85)',
  'rgba(143, 79, 79, 0.85)', 'rgba(202, 138, 138, 0.75)', 'rgba(190, 18, 60, 0.65)'
];

const bloodTypes = ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"];

const BloodDroplet = ({ type, x, y, size, color, delay, mouseX, mouseY }) => {
  const massX = useMotionValue(0);
  const massY = useMotionValue(0);
  const dx = useSpring(massX, { damping: 40, stiffness: 80, mass: 2 });
  const dy = useSpring(massY, { damping: 40, stiffness: 80, mass: 2 });

  useEffect(() => {
    const randomMove = setInterval(() => {
      if (mouseX.get() === -1000) { 
        const driftX = (Math.random() - 0.5) * 40;
        const driftY = (Math.random() - 0.5) * 40;
        massX.set(driftX);
        massY.set(driftY);
      }
    }, 2500 + Math.random() * 2000);

    const handleMouseMove = () => {
      const mx = mouseX.get();
      const my = mouseY.get();
      if (mx === -1000) return;

      const elX = (x / 100) * window.innerWidth;
      const elY = (y / 100) * window.innerHeight;
      const currentX = elX + massX.get();
      const currentY = elY + massY.get();
      const distX = currentX - mx;
      const distY = currentY - my;
      const distance = Math.sqrt(distX * distX + distY * distY);
      const repelRadius = 250;
      
      if (distance < repelRadius) {
        const force = (repelRadius - distance) * 0.8;
        const angle = Math.atan2(distY, distX);
        massX.set(massX.get() + Math.cos(angle) * force);
        massY.set(massY.get() + Math.sin(angle) * force);
      } else {
        massX.set(massX.get() * 0.95);
        massY.set(massY.get() * 0.95);
      }
    };

    const unsubscribeX = mouseX.onChange(handleMouseMove);
    const unsubscribeY = mouseY.onChange(handleMouseMove);

    return () => {
      clearInterval(randomMove);
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, x, y, dx, dy, massX, massY]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ opacity: { duration: 1.5, delay }, scale: { duration: 1.5, delay, type: "spring", bounce: 0.3 } }}
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, backgroundColor: color, x: dx, y: dy }}
      className="absolute flex items-center justify-center rounded-full text-white font-bold select-none z-0 backdrop-blur-[2px] shadow-sm"
    >
      <span style={{ fontSize: size * 0.35 }}>{type}</span>
    </motion.div>
  );
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modeParam = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam !== "signup");
  
  const [droplets, setDroplets] = useState([]);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  useEffect(() => {
    if(modeParam === 'signup') setIsLogin(false);
    else if (modeParam === 'login' || !modeParam) setIsLogin(true);
  }, [modeParam]);

  useEffect(() => {
    const newDroplets = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      type: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      x: Math.random() * 94 + 3,
      y: Math.random() * 90 + 5,
      size: Math.random() * 55 + 25,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5
    }));
    setDroplets(newDroplets);
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // Trim password fields to avoid autofill/space issues
      const trimmedFormData = {
        ...formData,
        password: formData.password.trim(),
        confirmPassword: formData.confirmPassword ? formData.confirmPassword.trim() : undefined
      };
      // Direct admin dashboard logic
      if (isLogin && trimmedFormData.email === 'admin123@gmail.com' && trimmedFormData.password === 'Admin@123') {
        alert('Logged in as admin');
        navigate('/admin-dashboard', { replace: true });
        return;
      }
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email: trimmedFormData.email,
          password: trimmedFormData.password
        });
        localStorage.setItem("token", res.data.token);
        if (res.data.userId) localStorage.setItem("userId", res.data.userId);
        alert(`Logged in as ${res.data.role}`);
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
        const { email, password, confirmPassword, age, role, mobileNo } = trimmedFormData;
        // Frontend Validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return alert("Please enter a valid email address.");
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          return alert("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        }
        if (password !== confirmPassword) {
          return alert("Passwords do not match");
        }
        const ageNum = parseInt(age, 10);
        if (role === 'donor' && (ageNum < 18 || ageNum > 65)) {
          return alert("Donors must be between 18 and 65 years old.");
        }
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobileNo)) {
          return alert("Please enter a valid 10-digit mobile number.");
        }
        const res = await axios.post("http://localhost:5000/api/auth/signup", trimmedFormData);
        alert("Registered successfully! Please login to continue.");
        setIsLogin(true);
        // Reset sensitive fields
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.error === "User does not exist") {
             alert("User does not exist. Please sign up.");
             navigate("/auth?mode=signup");
        } else {
            alert(err.response.data.error);
        }
      } else {
        alert(err.response?.data?.message || "An error occurred. Please try again.");
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

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };
  
  const handleMouseLeave = () => {
     mouseX.set(-1000);
     mouseY.set(-1000);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-[#F3F3F5] dark:bg-[#0a0a0a] transition-colors duration-300 w-full flex flex-col items-center justify-center font-sans tracking-tight pt-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={(e) => {
        if(e.touches.length > 0) {
            mouseX.set(e.touches[0].clientX);
            mouseY.set(e.touches[0].clientY);
        }
      }}
    >
      <Navbar />
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {droplets.map((d) => (
          <BloodDroplet key={d.id} {...d} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>

      <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl w-full max-w-[450px] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white dark:border-gray-700/50 z-10 my-8 transition-colors duration-300">
        <div className="p-10 space-y-6">
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
                <div className="relative flex w-full bg-[#F3F3F5] dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 mb-2">
                  <motion.div 
                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#e60000] rounded-lg shadow-sm"
                    animate={{ x: formData.role === 'recipient' ? '100%' : '0%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'donor' })}
                    className={`relative z-10 flex-1 py-1 text-sm font-bold text-center transition-colors ${formData.role === 'donor' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'recipient' })}
                    className={`relative z-10 flex-1 py-1 text-sm font-bold text-center transition-colors ${formData.role === 'recipient' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Recipient
                  </button>
                </div>

                <div className="relative group">
                   <User className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
                   <input
                    name="fullName" placeholder="Full Name" onChange={handleInputChange} required
                    className="w-full pl-12 pr-4 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
                </div>
                
                {/* Elegant Sliding Button for Gender */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-1">Gender</label>
                  <div className="relative flex w-full bg-[#F3F3F5] dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <motion.div 
                      className="absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-[#e60000] rounded-lg shadow-sm"
                      animate={{ x: formData.gender === 'Female' ? '100%' : formData.gender === 'Other' ? '200%' : '0%' }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g} type="button"
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
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-1">Blood Group</label>
                    <select name="bloodGroup" onChange={handleInputChange} className="w-full bg-[#F3F3F5] dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors">
                      <option>A+</option><option>B+</option><option>AB+</option><option>O+</option>
                      <option>A-</option><option>B-</option><option>AB-</option><option>O-</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-1">Age</label>
                    <input name="age" type="number" placeholder="18" onChange={handleInputChange} required className="w-full p-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 font-semibold transition-colors" />
                  </div>
                </div>

                <div className="relative group">
                   <Phone className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
                   <input name="mobileNo" placeholder="Mobile Number" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
                </div>
              </>
            )}

            <div className="relative group">
               <Mail className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
               <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
            </div>

            <div className="relative group">
               <Lock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
               <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" onChange={handleInputChange} required autoComplete="new-password" className="w-full pl-12 pr-12 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)} 
                 className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
               >
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
            </div>

            {!isLogin && (
              <div className="relative group">
                <Lock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e20000] dark:group-focus-within:text-[#e20000]" size={18} />
                <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" onChange={handleInputChange} required autoComplete="new-password" className="w-full pl-12 pr-12 py-3 bg-[#F3F3F5] dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/50 transition-colors" />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
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
      </div>
    </div>
  );
}
