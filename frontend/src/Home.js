import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Droplet, Moon, Sun } from "lucide-react";
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
      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-extrabold text-xl tracking-tight">
        <Droplet className="text-[#e20000] fill-transparent stroke-2 h-7 w-7" />  
        <span>BloodBank Plus</span>
      </div>
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

const Dashboard = () => {
  const [droplets, setDroplets] = useState([]);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

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
      className="min-h-screen relative overflow-hidden bg-[#F3F3F5] dark:bg-[#0a0a0a] transition-colors duration-300 w-full flex flex-col items-center justify-center font-sans tracking-tight"
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

      <div className="z-10 flex flex-col items-center max-w-4xl px-4 pointer-events-auto mt-16 transition-colors duration-300">
        <h1 className="text-[3.5rem] md:text-6xl lg:text-[6.5rem] font-black mb-5 text-center leading-[1] tracking-tighter">
          <span className="text-[#080808] dark:text-gray-100">Donate Blood, </span>
          <span className="text-[#e20000]">Save Lives</span>
        </h1>

       

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-2">
          <Link
            to="/auth?role=donor"
            className="bg-[#e60000] text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-[0_8px_20px_rgba(230,0,0,0.3)] hover:bg-[#cc0000] hover:-translate-y-1 transition-transform text-center"
          >
            Become a Donor
          </Link>
          <Link
            to="/auth?role=recipient"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-gray-100 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all text-center"
          >
            Request Blood
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return <Dashboard />;
}
