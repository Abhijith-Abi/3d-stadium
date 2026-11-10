'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStadiumStore } from '@/stores/stadiumStore';
import { Header } from '@/components/layout/Header';
import { WelcomeScreen } from '@/components/welcome/WelcomeScreen';
import { ChooseModeScreen } from '@/components/design-mode/ChooseModeScreen';
import { AIAssistantScreen } from '@/components/ai-assistant/AIAssistantScreen';
import { AIResultScreen } from '@/components/ai-assistant/AIResultScreen';
import { CustomizationWorkspace } from '@/components/customization/CustomizationWorkspace';
import { PreviewScreen } from '@/components/preview/PreviewScreen';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

export default function HomePage() {
  const appStep = useStadiumStore((s) => s.appStep);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {appStep === 'welcome' && (
            <motion.div key="welcome" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <WelcomeScreen />
            </motion.div>
          )}
          {appStep === 'choose-mode' && (
            <motion.div key="choose-mode" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ChooseModeScreen />
            </motion.div>
          )}
          {appStep === 'ai-input' && (
            <motion.div key="ai-input" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AIAssistantScreen />
            </motion.div>
          )}
          {appStep === 'ai-result' && (
            <motion.div key="ai-result" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AIResultScreen />
            </motion.div>
          )}
          {appStep === 'customize' && (
            <motion.div key="customize" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <CustomizationWorkspace />
            </motion.div>
          )}
          {appStep === 'preview' && (
            <motion.div key="preview" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PreviewScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
