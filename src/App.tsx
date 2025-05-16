import { Sidebar } from "./components/Sidebar";
import { Overview } from "./components/Overview";
import { Details } from "./components/Details";
import { SettingsPage } from "./components/SettingsPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/overview" element={<Overview />} />
          <Route path="/details" element={<Details />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
};

export default App; 