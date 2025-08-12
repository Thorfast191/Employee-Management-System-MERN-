// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./hooks/useAuth";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       <Route
//         path="/"
//         element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
//       />
//       <Route
//         path="/login"
//         element={user ? <Navigate to="/dashboard" /> : <Login />}
//       />
//       <Route
//         path="/dashboard"
//         element={user ? <Dashboard /> : <Navigate to="/login" />}
//       />
//     </Routes>
//   );
// }

// export default App;

import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Login />} />
      <Route path="/login" element={user ? <Dashboard /> : <Login />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
    </Routes>
  );
}

export default App;
