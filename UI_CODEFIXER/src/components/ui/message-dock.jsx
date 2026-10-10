import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { cn } from '../../lib/utils';

export function MessageDock({
  items,
  value,
  onChange,
  className,
  label = 'Search mode',
}) {
  const shouldReduceMotion = useReducedMotion();
  const activeItem = items.find((item) => item.value === value) ?? items[0];

  return (
    <div className={cn('message-dock-switch', className)}>
      <span className="message-dock-switch__label">{label}</span>
      <div className="message-dock-switch__track" role="tablist" aria-label={label}>
        {items.map((item) => {
          const isActive = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'message-dock-switch__item',
                isActive && 'message-dock-switch__item--active',
              )}
              onClick={() => onChange?.(item.value)}
            >
              {isActive && (
                <motion.span
                  layoutId="message-dock-switch-active"
                  className="message-dock-switch__active-bg"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 32 }
                  }
                />
              )}
              <span className="message-dock-switch__emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="message-dock-switch__value">{item.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={activeItem.value}
          className="message-dock-switch__hint"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18 }}
        >
          {activeItem.description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
