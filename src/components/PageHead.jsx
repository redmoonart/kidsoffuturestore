import { motion } from "framer-motion";

export default function PageHead({ title, subtitle, chips }) {
  return (
    <section className="page-head">
      {chips && chips.length > 0 && (
        <div className="page-head-orbit" aria-hidden="true">
          {chips.map((c, i) => (
            <span key={i} className={`pchip p${i + 1}`}>{c}</span>
          ))}
        </div>
      )}
      <div className="wrap">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.08 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
