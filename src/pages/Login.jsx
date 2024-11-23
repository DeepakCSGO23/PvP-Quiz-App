import "../index.css";
import "../App.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function Signup() {
  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileRePassword, setProfileRePassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const history = useNavigate();

  const handleSubmitingProfile = async (e) => {
    e.preventDefault();
    // First check if the user user name is already taken
    const response = await fetch(
      `http://localhost:5000/check-profile?profile-name=${profileName}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    // Check first if password and repassword match
    if (profilePassword !== profileRePassword) {
      setErrorMessage("Passwords dont match");
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
      return;
    }
    // Contains json data from the golang backend
    const data = await response.json();
    console.log(data);
    // There is no username registered
    if (data.message === "notTaken") {
      setErrorMessage("Cannot find player name");
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
    }
    // Profile name is registered already
    else if (data.message === "taken") {
      // Password and Repassword dont match
      if (data.profilePassword !== profilePassword) {
        setErrorMessage("Wrong Password");
        setTimeout(() => {
          setErrorMessage("");
        }, 4000);
      }
      // current password and password in database matches
      else {
        setErrorMessage("Login Successful");
        setTimeout(() => {
          setErrorMessage("");
        }, 4000);
        history(`/dashboard?playerName=${profileName}`);
      }
    }
  };
  return (
    <div className="flex h-screen w-screen text-white font-roboto">
      <div className="flex flex-col bg-white text-black w-full items-center justify-center login">
        {errorMessage &&
          (errorMessage !== "Login Successful" ? (
            <p className="absolute top-40 bg-red-500 text-white p-2 px-6 text-xs rounded-3xl">
              {errorMessage}!
            </p>
          ) : (
            <p className="absolute top-40 bg-green-500 text-white p-2 px-6 text-xs rounded-3xl">
              {errorMessage}!
            </p>
          ))}
        <h1 className="text-3xl tracking-widest">Login</h1>
        <h6 className="text-gray-200 mt-2 text-xs">
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
              autoComplete="off"
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
            onTouchStart={handleSubmitingProfile}
            type="submit"
            className="p-3 bg-blue-500 text-white text-sm rounded-3xl hover:bg-blue-600 duration-500 cursor-pointer"
          >
            Login
          </button>{" "}
        </form>
        <h6 className="text-gray-400 mt-6 text-xs">
          New User?{" "}
          <Link to="/">
            {" "}
            <span className="hover:underline">Signup here</span>
          </Link>
        </h6>
      </div>
    </div>
  );
}
