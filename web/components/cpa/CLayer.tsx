'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import type { OperationType } from './Calculator';

interface CLayerProps {
  num1: number;
  num2: number;
  operation: OperationType;
  result: number | null;
  animationPhase: 'idle' | 'showing-first' | 'showing-second' | 'showing-result';
  onInteract?: () => void;
}

const operatorColors: Record<OperationType, { primary: string; secondary: string; glow: string }> = {
  add: { primary: '#22c55e', secondary: '#86efac', glow: 'rgba(34, 197, 94, 0.3)' },
  subtract: { primary: '#ef4444', secondary: '#fca5a5', glow: 'rgba(239, 68, 68, 0.3)' },
  multiply: { primary: '#3b82f6', secondary: '#93c5fd', glow: 'rgba(59, 130, 246, 0.3)' },
  divide: { primary: '#eab308', secondary: '#fde047', glow: 'rgba(234, 179, 8, 0.3)' },
};

const operatorIcons: Record<OperationType, string> = {
  add: 'mdi:plus-circle',
  subtract: 'mdi:minus-circle',
  multiply: 'mdi:close-circle',
  divide: 'mdi:division',
};

interface DotProps {
  index: number;
  color: string;
  glow: string;
  delay: number;
  isRemoving?: boolean;
  onClick?: () => void;
}

function Dot({ index, color, glow, delay, isRemoving, onClick }: DotProps) {
  return (
    <motion.div
      onClick={onClick}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color}ee, ${color})`,
        boxShadow: `0 4px 12px ${glow}, inset 0 2px 4px rgba(255,255,255,0.4)`,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={
        isRemoving
          ? { scale: 0, opacity: 0, rotate: 180, y: -20 }
          : { scale: 1, opacity: 1, rotate: 0, y: 0 }
      }
      exit={{ scale: 0, opacity: 0, rotate: 180 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: delay,
      }}
      whileHover={onClick ? { scale: 1.15 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      <motion.div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
          position: 'relative',
          top: '-6px',
          left: '-6px',
        }}
      />
    </motion.div>
  );
}

interface BlockProps {
  index: number;
  color: string;
  glow: string;
  delay: number;
  onClick?: () => void;
}

function Block({ index, color, glow, delay, onClick }: BlockProps) {
  return (
    <motion.div
      onClick={onClick}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: `linear-gradient(135deg, ${color}ee, ${color})`,
        boxShadow: `0 4px 12px ${glow}, inset 0 2px 4px rgba(255,255,255,0.3)`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      initial={{ scale: 0, opacity: 0, rotateX: -90 }}
      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
      exit={{ scale: 0, opacity: 0, rotateX: 90 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: delay,
      }}
      whileHover={onClick ? { scale: 1.1, rotate: 5 } : undefined}
      whileTap={onClick ? { scale: 0.9 } : undefined}
    />
  );
}

export default function CLayer({
  num1,
  num2,
  operation,
  result,
  animationPhase,
  onInteract,
}: CLayerProps) {
  const colors = operatorColors[operation];
  const [showingRemoval, setShowingRemoval] = useState(false);

  useEffect(() => {
    if (operation === 'subtract' && animationPhase === 'showing-result') {
      setShowingRemoval(true);
    } else {
      setShowingRemoval(false);
    }
  }, [operation, animationPhase]);

  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: colors.primary,
    fontWeight: 600,
    fontSize: '14px',
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    flex: 1,
  };

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    maxWidth: '200px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '16px',
    background: 'rgba(0,0,0,0.02)',
  };

  const operatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.primary,
  };

  const renderAddition = () => {
    const showFirst = animationPhase !== 'idle';
    const showSecond = animationPhase === 'showing-second' || animationPhase === 'showing-result';

    return (
      <div style={contentStyle}>
        {/* First group */}
        <motion.div
          style={groupStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: showFirst ? 1 : 0 }}
        >
          <AnimatePresence>
            {showFirst &&
              Array.from({ length: num1 }).map((_, i) => (
                <Dot
                  key={`first-${i}`}
                  index={i}
                  color={colors.primary}
                  glow={colors.glow}
                  delay={i * 0.08}
                  onClick={onInteract}
                />
              ))}
          </AnimatePresence>
        </motion.div>

        {/* Operator */}
        <motion.div
          style={operatorStyle}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: showFirst ? 1 : 0, scale: showFirst ? 1 : 0 }}
          transition={{ delay: num1 * 0.08 }}
        >
          <Icon icon={operatorIcons.add} width={36} />
        </motion.div>

        {/* Second group */}
        <motion.div
          style={groupStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: showSecond ? 1 : 0 }}
        >
          <AnimatePresence>
            {showSecond &&
              Array.from({ length: num2 }).map((_, i) => (
                <Dot
                  key={`second-${i}`}
                  index={i}
                  color={colors.secondary}
                  glow={colors.glow}
                  delay={i * 0.08}
                  onClick={onInteract}
                />
              ))}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  const renderSubtraction = () => {
    const showFirst = animationPhase !== 'idle';
    const showRemoving = animationPhase === 'showing-second' || animationPhase === 'showing-result';
    const showResult = animationPhase === 'showing-result';
    const resultNum = Math.max(0, num1 - num2);

    return (
      <div style={contentStyle}>
        {/* Initial group with removal animation */}
        <motion.div
          style={groupStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: showFirst ? 1 : 0 }}
        >
          <AnimatePresence>
            {showFirst &&
              Array.from({ length: num1 }).map((_, i) => (
                <Dot
                  key={`item-${i}`}
                  index={i}
                  color={showRemoving && i >= resultNum ? colors.secondary : colors.primary}
                  glow={colors.glow}
                  delay={i * 0.08}
                  isRemoving={showResult && i >= resultNum}
                  onClick={onInteract}
                />
              ))}
          </AnimatePresence>
        </motion.div>

        {/* Minus indicator */}
        <motion.div
          style={operatorStyle}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: showRemoving ? 1 : 0, scale: showRemoving ? 1 : 0 }}
        >
          <Icon icon={operatorIcons.subtract} width={36} />
        </motion.div>

        {/* Items being removed */}
        {showRemoving && !showResult && (
          <motion.div
            style={{
              ...groupStyle,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px dashed #ef4444',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: num2 }).map((_, i) => (
              <Dot
                key={`remove-${i}`}
                index={i}
                color={colors.secondary}
                glow={colors.glow}
                delay={i * 0.08}
                onClick={onInteract}
              />
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  const renderMultiplication = () => {
    const showFirst = animationPhase !== 'idle';
    const showSecond = animationPhase === 'showing-second' || animationPhase === 'showing-result';
    const showResult = animationPhase === 'showing-result';

    return (
      <div style={contentStyle}>
        {/* Groups representation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <AnimatePresence>
            {showFirst &&
              Array.from({ length: Math.min(num1, 5) }).map((_, groupIndex) => (
                <motion.div
                  key={`group-${groupIndex}`}
                  style={{
                    display: 'flex',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background:
                      showSecond || showResult
                        ? `${colors.primary}15`
                        : 'rgba(0,0,0,0.02)',
                    border: `2px solid ${showSecond || showResult ? colors.primary : 'transparent'}`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.15 }}
                >
                  {Array.from({ length: Math.min(num2, 5) }).map((_, i) => (
                    <Block
                      key={`block-${groupIndex}-${i}`}
                      index={i}
                      color={colors.primary}
                      glow={colors.glow}
                      delay={groupIndex * 0.15 + i * 0.05}
                      onClick={onInteract}
                    />
                  ))}
                  {num2 > 5 && (
                    <span style={{ color: colors.primary, fontWeight: 600, alignSelf: 'center' }}>
                      +{num2 - 5}
                    </span>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
          {num1 > 5 && showFirst && (
            <motion.span
              style={{ color: colors.primary, fontWeight: 600, fontSize: '14px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ... 共 {num1} 组
            </motion.span>
          )}
        </div>

        {/* Operator */}
        <motion.div
          style={{
            ...operatorStyle,
            position: 'absolute',
            left: '50%',
            top: '10px',
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: showFirst ? 1 : 0, scale: showFirst ? 1 : 0 }}
        >
          <span style={{ fontSize: '12px', color: '#666' }}>
            {num1} × {num2}
          </span>
        </motion.div>
      </div>
    );
  };

  const renderDivision = () => {
    const showFirst = animationPhase !== 'idle';
    const showSecond = animationPhase === 'showing-second' || animationPhase === 'showing-result';
    const showResult = animationPhase === 'showing-result';
    const groups = num2 > 0 ? Math.floor(num1 / num2) : 0;
    const remainder = num2 > 0 ? num1 % num2 : num1;

    return (
      <div style={contentStyle}>
        {/* Total items */}
        {!showSecond && (
          <motion.div
            style={groupStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: showFirst ? 1 : 0 }}
          >
            <AnimatePresence>
              {showFirst &&
                Array.from({ length: Math.min(num1, 12) }).map((_, i) => (
                  <Dot
                    key={`total-${i}`}
                    index={i}
                    color={colors.primary}
                    glow={colors.glow}
                    delay={i * 0.06}
                    onClick={onInteract}
                  />
                ))}
            </AnimatePresence>
            {num1 > 12 && (
              <span style={{ color: colors.primary, fontWeight: 600 }}>+{num1 - 12}</span>
            )}
          </motion.div>
        )}

        {/* Division groups */}
        {showSecond && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: Math.min(groups, 4) }).map((_, groupIndex) => (
              <motion.div
                key={`div-group-${groupIndex}`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '12px',
                  background: `${colors.primary}15`,
                  border: `2px solid ${colors.primary}`,
                  maxWidth: '100px',
                  justifyContent: 'center',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: groupIndex * 0.2 }}
              >
                {Array.from({ length: Math.min(num2, 6) }).map((_, i) => (
                  <Dot
                    key={`div-${groupIndex}-${i}`}
                    index={i}
                    color={colors.secondary}
                    glow={colors.glow}
                    delay={groupIndex * 0.2 + i * 0.05}
                    onClick={onInteract}
                  />
                ))}
              </motion.div>
            ))}
            {groups > 4 && (
              <motion.span
                style={{ color: colors.primary, fontWeight: 600, alignSelf: 'center' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ... 共 {groups} 组
              </motion.span>
            )}
            {remainder > 0 && showResult && (
              <motion.div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '2px dashed #9ca3af',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Array.from({ length: remainder }).map((_, i) => (
                  <Dot
                    key={`remainder-${i}`}
                    index={i}
                    color="#9ca3af"
                    glow="rgba(156, 163, 175, 0.3)"
                    delay={0.5 + i * 0.05}
                    onClick={onInteract}
                  />
                ))}
                <span style={{ fontSize: '10px', color: '#666', width: '100%', textAlign: 'center' }}>
                  余数
                </span>
              </motion.div>
            )}
          </div>
        )}

        {/* Operator */}
        <motion.div
          style={operatorStyle}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: showFirst && !showSecond ? 1 : 0, scale: showFirst && !showSecond ? 1 : 0 }}
        >
          <Icon icon={operatorIcons.divide} width={36} />
        </motion.div>
      </div>
    );
  };

  const renderContent = () => {
    switch (operation) {
      case 'add':
        return renderAddition();
      case 'subtract':
        return renderSubtraction();
      case 'multiply':
        return renderMultiplication();
      case 'divide':
        return renderDivision();
      default:
        return null;
    }
  };

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div style={headerStyle}>
        <Icon icon="mdi:cube" width={20} />
        <span>具体 (Concrete)</span>
        <motion.div
          style={{
            marginLeft: 'auto',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: colors.primary,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      {renderContent()}
    </motion.div>
  );
}
