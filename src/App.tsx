/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import MainLayout from './app/(main)/layout';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [userId] = useState(() => `user_${Math.floor(Math.random() * 1000)}`); // Mock auth

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <MainLayout userId={userId} />;
}
