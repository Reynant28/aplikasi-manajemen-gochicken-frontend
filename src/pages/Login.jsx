// LoginPage.jsx
import React, { useState } from "react";

const Login = () => {
  const [activeTab, setActiveTab] = useState("signIn"); // Default ke 'signIn'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State untuk form "Admin Cabang" tidak relevan di sini,
  // tapi saya tetap sertakan jika Anda ingin mengintegrasikannya nanti
  const [branch, setBranch] = useState("");
  const [branchPassword, setBranchPassword] = useState("");
  const [personalPassword, setPersonalPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "signIn") {
      console.log("Sign In attempt with:", { email, password });
      alert("Sign In attempt with: " + email);
    } else {
      console.log("Sign Up attempt with:", { email, password });
      alert("Sign Up attempt with: " + email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--light-bg)] p-6">
        <div className="flex bg-[var(--light-bg-light)] rounded-2xl shadow-lg max-w-3xl w-full overflow-hidden">
            {/* Left Half: Image Section */}
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-[var(--themered)]">
            <img
                src="./images/LogoGoChicken.jpg"
                className="object-cover h-full w-full"
                alt="Login Illustration"
            />
            </div>

            {/* Right Half: Form Section */}
            <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
            {/* Switch Button Section */}
            <div className="flex justify-center mb-8 bg-gray-200 rounded-full p-1 relative">
                <div
                className={`absolute top-1 left-1 h-[calc(100%-8px)] bg-[var(--themered)] rounded-full transition-all duration-300 ease-in-out ${
                    activeTab === "signIn"
                    ? "w-[calc(50%-4px)]" // Adjust width and left for 'First' button
                    : "w-[calc(50%-4px)] translate-x-full" // Adjust width and translate for 'Second' button
                }`}
                ></div>
                <button
                onClick={() => setActiveTab("signIn")}
                className={`relative z-10 flex-1 py-2 px-4 rounded-full text-center font-semibold transition-colors duration-300 ${
                    activeTab === "signIn" ? "text-white" : "text-gray-700"
                }`}
                >
                Super Admin
                </button>
                <button
                onClick={() => setActiveTab("signUp")}
                className={`relative z-10 flex-1 py-2 px-4 rounded-full text-center font-semibold transition-colors duration-300 ${
                    activeTab === "signUp" ? "text-white" : "text-gray-700"
                }`}
                >
                Admin Cabang
                </button>
            </div>

                <div className="relative overflow-hidden min-h-[340px]">
                    {/* Super Admin Form */}
                    <div
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out transform ${
                        activeTab === "signIn"
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-full pointer-events-none"
                    }`}
                    >
                    <form onSubmit={handleSubmit} className="p-1">
                        {/* Email */}
                        <div className="mb-6">
                        <label
                            htmlFor="signInEmail"
                            className="block text-[var(--light-text-muted)] text-sm font-semibold mb-2"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="signInEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow-sm border rounded-lg w-full py-2 px-3 text-[var(--light-text)] bg-[var(--light-bg)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="you@example.com"
                            required
                        />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                        <label
                            htmlFor="signInPassword"
                            className="block text-[var(--light-text-muted)] text-sm font-semibold mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="signInPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow-sm border rounded-lg w-full py-2 px-3 text-[var(--light-text)] bg-[var(--light-bg)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="********"
                            required
                        />
                        </div>

                        {/* Button */}
                        <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-[var(--themered)] hover:bg-[var(--themeredhover)] text-white font-semibold py-2 px-4 rounded-lg w-full transition-all duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Sign In
                        </button>
                        </div>
                    </form>
                    </div>

                    {/* Admin Cabang Form */}
                    <div
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out transform ${
                        activeTab === "signUp"
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-full pointer-events-none"
                    }`}
                    >
                    <form onSubmit={handleSubmit} className="p-1">
                        {/* Pilih Cabang */}
                        <div className="mb-6">
                        <label
                            htmlFor="branch"
                            className="block text-[var(--light-text-muted)] text-sm font-semibold mb-2"
                        >
                            Pilih Cabang
                        </label>
                        <select
                            id="branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="shadow-sm border rounded-lg w-full py-2 px-3 text-[var(--light-text)] bg-[var(--light-bg)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            required
                        >
                            <option value="">-- Pilih Cabang --</option>
                            <option value="jakarta">Cabang Jakarta</option>
                            <option value="bandung">Cabang Bandung</option>
                            <option value="surabaya">Cabang Surabaya</option>
                        </select>
                        </div>

                        {/* Password Cabang */}
                        <div className="mb-6">
                        <label
                            htmlFor="branchPassword"
                            className="block text-[var(--light-text-muted)] text-sm font-semibold mb-2"
                        >
                            Password Cabang
                        </label>
                        <input
                            type="password"
                            id="branchPassword"
                            value={branchPassword}
                            onChange={(e) => setBranchPassword(e.target.value)}
                            className="shadow-sm border rounded-lg w-full py-2 px-3 text-[var(--light-text)] bg-[var(--light-bg)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Password cabang"
                            required
                        />
                        </div>

                        {/* Password Pribadi */}
                        <div className="mb-6">
                        <label
                            htmlFor="personalPassword"
                            className="block text-[var(--light-text-muted)] text-sm font-semibold mb-2"
                        >
                            Password Pribadi
                        </label>
                        <input
                            type="password"
                            id="personalPassword"
                            value={personalPassword}
                            onChange={(e) => setPersonalPassword(e.target.value)}
                            className="shadow-sm border rounded-lg w-full py-2 px-3 text-[var(--light-text)] bg-[var(--light-bg)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Password pribadi"
                            required
                        />
                        </div>

                        {/* Button */}
                        <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-[var(--themered)] hover:bg-[var(--themeredhover)] text-white font-semibold py-2 px-4 rounded-lg w-full transition-all duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Login Admin Cabang
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;