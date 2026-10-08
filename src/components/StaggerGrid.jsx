import { motion, useReducedMotion } from "framer-motion";

// كل عنصر يراقب ظهوره بنفسه بدل الاعتماد على الحاوية: المنتجات تُحمَّل بعد ظهور الشبكة،
// ولو اعتمدنا على الحاوية لبقيت العناصر التي تُضاف لاحقاً مخفية للأبد.
export default function StaggerGrid({ children, className = "", columns = 4 }) {
  const reduceMotion = useReducedMotion();
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.95 };

  return (
    <div className={className}>
      {children.map((child, i) => (
        <motion.div
          key={child.key}
          initial={hidden}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{
            duration: reduceMotion ? 0.3 : 0.6,
            ease: [0.16, 0.84, 0.44, 1],
            delay: reduceMotion ? 0 : (i % columns) * 0.08,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
