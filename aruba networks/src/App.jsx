import './App.css';
import './components/Toast.css';
import NeuralCanvas from './components/NeuralCanvas';
import BrandPanel   from './components/BrandPanel';
import AuthPanel    from './components/AuthPanel';

/**
 * Root application component.
 * Renders:
 *  - NeuralCanvas  — animated background (fixed, full-screen)
 *  - BrandPanel    — left marketing column (hidden on mobile)
 *  - AuthPanel     — right auth column (login / signup forms)
 */
export default function App() {
  return (
    <>
      {/* Animated background layer */}
      <NeuralCanvas />

      {/* Two-column page layout */}
      <div className="page-wrapper">
        <BrandPanel />
        <AuthPanel />
      </div>
    </>
  );
}
