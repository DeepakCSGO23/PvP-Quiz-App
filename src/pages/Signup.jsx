import "../index.css";
import "../App.css";
import { useState } from "react";
export default function Signup() {
  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileRePassword, setProfileRePassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmitingProfile = async (e) => {
    e.preventDefault();
    // Checking if password and repassword matches
    if (profilePassword !== profileRePassword) {
      setErrorMessage("Passwords do not match");
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
      return;
    }
    // First check if the user user name is already taken
    const response = await fetch(
      `http://localhost:5000/check-profile-name?profile-name=${profileName}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (response.status === 200) {
      console.log("username not available");
    } else if (response.status === 409) {
      setErrorMessage("Username available");
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
      return;
    } else {
      console.log("server error");
    }
    // Create a brand new profile with profile name & password
    // const response = await fetch("http://localhost:5000/create-profile", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     profileName,
    //     profilePassword,
    //   }),
    // });
  };
  return (
    <div className="flex h-screen w-screen text-white font-roboto">
      {/* Left side - Signup */}
      <div className="flex border-2 flex-col bg-white text-black w-1/2 items-center justify-center">
        <h1 className="text-4xl tracking-widest">Signup</h1>
        <span className="text-gray-400 mt-2">Secure your webapp</span>
        <form
          action=""
          onSubmit={handleSubmitingProfile}
          className="flex flex-col space-y-8 mt-10"
        >
          <label htmlFor="username" className="flex items-center">
            <img src="profile.svg" alt="Profile" />{" "}
            <input
              onChange={(e) => setProfileName(e.target.value)}
              id="username"
              className="ml-4"
              type="text"
            />
            {errorMessage && (
              <p className="text-red-500 text-xs">{errorMessage}</p>
            )}
          </label>
          <label htmlFor="password" className="flex items-center">
            <img src="password.svg" alt="Profile" />{" "}
            <input
              onChange={(e) => setProfilePassword(e.target.value)}
              id="password"
              className="ml-4"
              type="password"
            />
          </label>
          <label htmlFor="repassword" className="flex items-center">
            <img src="password.svg" alt="Profile" />{" "}
            <input
              onChange={(e) => setProfileRePassword(e.target.value)}
              id="repassword"
              className="ml-4"
              type="password"
            />
          </label>
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-3xl hover:bg-blue-600 duration-500"
          >
            Sign up
          </button>{" "}
        </form>
      </div>
      {/* Right side - Login*/}
      <div className="flex border-2 flex-col bg-[#afbbdd] text-black w-1/2 items-center justify-center"></div>
    </div>
  );
}
