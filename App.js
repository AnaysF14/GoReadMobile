import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Navigation />
    </>
  );
}