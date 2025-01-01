import "../index.css";
import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Profile() {
  // ! TEMP SOLUTION USING PLAYER NAME FROM LOCAL STORAGE
  const [profileName] = useState(localStorage.getItem("profileName"));
  const [initialProfileData, setInitialProfileData] = useState({});
  const [profileData, setProfileData] = useState({});
  const [countryList, setCountryList] = useState([]);
  const [country, setCountry] = useState("IN");
  //
  useEffect(() => {
    // Get profile information
    const getProfileData = async () => {
      try {
        const countryResponse = await fetch("country_name.json");
        const countryData = await countryResponse.json();
        // * JUST A TRY
        const profileImageURLInLocalStorage =
          sessionStorage.getItem("profileImageURL");

        const profileResponse = await fetch(
          `http://localhost:5000/check-profile?profile-name=${encodeURIComponent(
            profileName
          )}&get-profile-image=${
            profileImageURLInLocalStorage ? "false" : "true"
          }`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const profileData = await profileResponse.json();
        if (!profileImageURLInLocalStorage) {
          sessionStorage.setItem(
            "profileImageURL",
            profileData.profileImageURL
          );
        }
        setProfileData(
          !profileImageURLInLocalStorage
            ? profileData
            : { ...profileData, profileImageURL: profileImageURLInLocalStorage }
        );
        setInitialProfileData(profileData);
        setCountryList(countryData);
      } catch (err) {
        console.error("Error retreiving profile data", err);
      }
    };
    getProfileData();
  }, []);

  const handleUpdatingProfileImage = async (e) => {
    const formData = new FormData();
    formData.append("profileImage", e.target.files[0]);
    formData.append("profileName", profileData.profileName);
    const response = await fetch("http://localhost:5000/update-profile-image", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log(data);
  };

  const handleProfileDataChange = async (e) => {
    const { id, value } = e.target;
    setProfileData((prevProfileData) => ({
      ...prevProfileData,
      [id]: value,
    }));
    console.log(id, value);
  };

  const handleSavingProfileData = async (e) => {
    e.preventDefault();
    // Check if the profile data which we got on the first render is same or not
    if (JSON.stringify(profileData) === JSON.stringify(initialProfileData)) {
      return;
    }
    await fetch(
      `http://localhost:5000/update-profile-data?profileName=Nirmala Kumari`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      }
    );
  };
  return (
    <div className="flex flex-col h-screen w-screen font-roboto overflow-hidden">
      <Header />
      {/* Correct y-axis space between topic and the next section */}
      <div className="bg-[#C5E6DF] text-black flex flex-col space-y-20 h-full w-full items-center">
        {/* Correct space of header from header section */}
        <h1 className="text-2xl tracking-widest mt-20 font-bebas-neue border-2 p-2 border-black pl-8 pr-8">
          Profile
        </h1>

        <div className="flex flex-col h-full w-full items-center space-y-10">
          <div className="relative h-32 w-32">
            {/* Profile image */}
            {profileData && profileData.profileImageURL ? (
              <img
                fetchpriority="high"
                src={profileData.profileImageURL.replace(
                  "upload/",
                  "upload/w_128,h_128,c_fill/"
                )}
                alt="Profile Image"
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <img
                fetchpriority="high"
                src="default.jpg"
                alt="Default"
                className="h-32 w-32 rounded-full object-cover"
              />
            )}

            {/* Upload icon */}
            <div className="absolute -bottom-3 left-14 bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center shadow-md cursor-pointer">
              <label htmlFor="profileimage">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-600"
                >
                  <input
                    id="profileimage"
                    onChange={handleUpdatingProfileImage}
                    type="file"
                    className=""
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </label>
              <input
                onChange={handleUpdatingProfileImage}
                type="file"
                id="profileImage"
                className="hidden"
              />
            </div>
          </div>
          <form
            onSubmit={handleSavingProfileData}
            action=""
            className="flex flex-col space-y-8"
          >
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="text-teal-800 text-base font-medium"
              >
                Name
              </label>
              <input
                id="name"
                onChange={handleProfileDataChange}
                type="text"
                defaultValue={
                  profileData &&
                  profileData.profileName &&
                  profileData.profileName.length > 0 &&
                  profileData.profileName
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="status" className="text-teal-800 font-medium">
                Status
              </label>
              <input
                id="status"
                onChange={handleProfileDataChange}
                type="text"
                defaultValue={
                  profileData &&
                  profileData.status &&
                  profileData.status.length > 0 &&
                  profileData.status
                }
              />
            </div>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="country" className="text-teal-800 font-medium">
                  Country
                </label>
                <img
                  src={`https://flagsapi.com/${country}/shiny/32.png`}
                  alt="country"
                  className="h-8 w-8"
                />
              </div>

              <select
                id="country"
                value={country}
                // Set country to value i.e country code
                onChange={(e) => setCountry(e.target.value)}
              >
                {countryList.map((country, index) => (
                  <option key={index} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="p-3 bg-green-700 text-white text-sm rounded-3xl hover:bg-green-600 duration-500"
            >
              Save
            </button>{" "}
          </form>
        </div>
      </div>
    </div>
  );
}
