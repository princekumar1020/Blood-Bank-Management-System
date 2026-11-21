import { motion, useReducedMotion } from "framer-motion";

const groups = [
  { type: "A+", x: 7, y: 17, size: 42, color: "rgba(200, 16, 46, 0.8)" },
  { type: "O-", x: 83, y: 15, size: 48, color: "rgba(161, 14, 39, 0.76)" },
  { type: "B+", x: 10, y: 70, size: 54, color: "rgba(229, 72, 93, 0.72)" },
  { type: "AB+", x: 88, y: 72, size: 46, color: "rgba(184, 37, 61, 0.78)" },
  { type: "A-", x: 24, y: 10, size: 34, color: "rgba(153, 27, 49, 0.7)" },
  { type: "O+", x: 73, y: 82, size: 36, color: "rgba(200, 16, 46, 0.72)" },
  { type: "B-", x: 94, y: 38, size: 31, color: "rgba(161, 14, 39, 0.7)" },
  { type: "AB-", x: 4, y: 45, size: 32, color: "rgba(229, 72, 93, 0.7)" },
  { type: "A+", x: 21, y: 86, size: 30, color: "rgba(184, 37, 61, 0.72)" },
  { type: "O-", x: 79, y: 46, size: 28, color: "rgba(153, 27, 49, 0.68)" },
];

export default function FloatingBloodGroups() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="blood-groups" aria-hidden="true">
      {groups.map(({ type, x, y, size, color }, index) => (
        <motion.div
          key={`${type}-${index}`}
          className="blood-groups__item"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            backgroundColor: color,
            fontSize: Math.max(11, size * 0.3),
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={shouldReduceMotion ? { opacity: 0.12 } : { opacity: [0.12, 0.25, 0.12], y: [0, -7, 0] }}
          transition={shouldReduceMotion ? { duration: 0 } : {
            duration: 6 + (index % 4),
            delay: index * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {type}
        </motion.div>
      ))}
    </div>
  );
}
