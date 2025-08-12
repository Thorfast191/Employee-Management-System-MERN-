// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";
// import { Label } from "../components/ui/label";
// import { toast } from "react-toastify";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "../components/ui/card";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setError("");

//   //   const result = await login(email, password);
//   //   if (result.success) {
//   //     toast.success("Login successful!");
//   //   } else {
//   //     toast.error(result.error || "Invalid credentials");
//   //     setError(result.error || "Invalid credentials");
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const result = await login(email, password);

//       if (result.success) {
//         toast.success("Login successful!");
//       } else {
//         toast.error(result.error || "Invalid credentials");
//         setError(result.error || "Invalid credentials");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       toast.error("An unexpected error occurred");
//       setError("An unexpected error occurred");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Employee Management System</CardTitle>
//           <CardDescription>
//             Please enter your credentials to login
//           </CardDescription>
//         </CardHeader>
//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             {error && (
//               <div className="text-red-500 text-sm text-center">{error}</div>
//             )}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="email@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//           </CardContent>
//           <CardFooter className="flex flex-col gap-2">
//             <Button type="submit" className="w-full">
//               Login
//             </Button>
//             <div className="text-sm text-center">
//               Don't have an account?{" "}
//               <Button
//                 variant="link"
//                 className="p-0"
//                 onClick={() => navigate("/register")}
//               >
//                 Register
//               </Button>
//             </div>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "Invalid credentials");
        toast.error(result.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Employee Management System</CardTitle>
          <CardDescription>
            Please enter your credentials to login
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="py-2 px-3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="py-2 px-3 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full py-2"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-sm text-center mt-2">
              <Button
                variant="link"
                type="button"
                className="text-blue-600 hover:text-blue-800 p-0"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </Button>
            </div>

            <div className="text-sm text-center border-t pt-3 mt-2 w-full">
              Don't have an account?{" "}
              <Button
                variant="link"
                type="button"
                className="p-0 text-blue-600 hover:text-blue-800"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
