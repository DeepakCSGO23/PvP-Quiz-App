import "../index.css";
import "../App.css";
import { useState } from "react";
import { Link } from "react-router-dom";
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
      `http://localhost:5000/check-profile?profile-name=${profileName}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await response.json();

    if (response.status === 200) {
      console.log("username not available");
    } else if (response.status === 409) {
      setErrorMessage("Username available");
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
      return;
    } else {
      return;
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
      <div className="flex flex-col bg-white text-black w-full items-center justify-center signup">
        {errorMessage && (
          <p className="absolute top-40 bg-red-500 text-white p-2 px-6 text-xs rounded-3xl">
            {errorMessage}!
          </p>
        )}
        <h1 className="text-3xl tracking-widest">Signup</h1>
        <h6 className="text-gray-400 mt-2 text-xs">
          Secure your quiz experience!
        </h6>
        <form
          action=""
          onSubmit={handleSubmitingProfile}
          className="flex flex-col space-y-8 mt-10"
        >
          <label htmlFor="username" className="flex items-center">
            <img src="profile.svg" alt="Profile" />{" "}
            <input
              placeholder="User Name"
              onChange={(e) => setProfileName(e.target.value)}
              id="username"
              className="ml-4"
              type="text"
            />
          </label>
          <label htmlFor="password" className="flex items-center">
            <img src="password.svg" alt="Profile" />{" "}
            <input
              placeholder="Password"
              onChange={(e) => setProfilePassword(e.target.value)}
              id="password"
              className="ml-4"
              type="password"
            />
          </label>
          <label htmlFor="repassword" className="flex items-center">
            <img src="password.svg" alt="Profile" />{" "}
            <input
              placeholder="Re-Password"
              onChange={(e) => setProfileRePassword(e.target.value)}
              id="repassword"
              className="ml-4"
              type="password"
            />
          </label>
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white text-sm rounded-3xl hover:bg-blue-600 duration-500"
          >
            Sign up
          </button>{" "}
        </form>
        <h6 className="text-gray-400 mt-6 text-xs">
          Already a user?{" "}
          <Link to="/login">
            {" "}
            <span className="hover:underline">Login here</span>
          </Link>
        </h6>
      </div>
    </div>
  );
}
