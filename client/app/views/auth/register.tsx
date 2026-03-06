import {
  CheckBadgeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "react-router";
import logoLight from "../welcome/logo-light.png";
import { useState } from "react";
import { postRequest } from "~/request";

export default function Register() {
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
  const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
  const [isValidPasswordCheck, setIsValidPasswordCheck] = useState<
    boolean | null
  >(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    passwordCheck: "",
  });

  const registerHandler = async () => {
    try {
      if (emailRegex.test(data.email) === false) {
        return;
      }
      if (
        data.email.trim() === "" ||
        data.password.trim() === "" ||
        data.username.trim() === ""
      ) {
        return;
      }
      await postRequest("/user/create", {
        name: data.username,
        email: data.email,
        password: data.password,
      });

      nav("/auth/signin");
    } catch (ex) {
      alert("Registration failed. Please try again.");
    }
  };

  const checkEmail = async () => {
    try {
      if (emailRegex.test(data.email) === false) {
        return false;
      }
      const res = await postRequest("/user/check-email", { email: data.email });
      return !res.data.exists;
    } catch (ex) {
      return false;
    }
  };

  const nav = useNavigate();
  return (
    <>
      <div
        className="flex items-center justify-center bg-white dark:bg-stone-900"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="max-w-2xl bg-white w-full">
          {/** Header */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-center text-stone-700 rounded-lg py-2 px-3 bg-[#a4b9bd] text-white">
              Welcome to :
            </span>
            <img
              src={logoLight}
              alt="Ruler Logo"
              className="ml-5 cursor-pointer w-48"
              onClick={() => {
                nav("/");
              }}
            />
          </div>
          <p className="px-1 text-stone-500 text-sm">
            Create your account and start your journey with us.
          </p>
          <div className="p-1 mt-5 border-t border-stone-300 pt-4">
            <div className="">
              <div className="">
                <div className="">
                  <label
                    htmlFor="username"
                    className="block text-sm/6 font-medium text-stone-900"
                  >
                    Username *
                  </label>
                  <p className="mt-1 text-sm/6 text-stone-400">
                    Your username will be displayed publicly so be careful what
                    you share.
                    <br />
                    You can change it later if you want.
                  </p>
                  <div className="flex mt-3 items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-stone-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#a4b9bd]">
                    <input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      className="block min-w-0 grow bg-white py-1.5 pr-3 text-base text-gray-900 placeholder:text-stone-400 focus:outline-none sm:text-sm/6"
                      value={data.username}
                      onChange={(e) =>
                        setData({ ...data, username: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-7">
                  <label
                    htmlFor="photo"
                    className="block text-sm/6 font-medium text-stone-900"
                  >
                    Photo
                  </label>
                  <p className="mt-1 text-sm/6 text-stone-400">
                    Your profile image will be displayed publicly so be careful
                    what you share.
                  </p>
                  <div className="mt-3 flex items-center gap-x-3">
                    <div className="w-14 h-14 bg-stone-100 rounded-full"></div>
                    <button
                      type="button"
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-stone-900 hover:shadow-md active:scale-95 border border-stone-300 transition duration-150"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div className="mt-7">
                  <label
                    htmlFor="email"
                    className="block text-sm/6 font-medium text-stone-900"
                  >
                    Email address *
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-stone-900 outline-1 -outline-offset-1 outline-stone-300 placeholder:text-stone-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#a4b9bd] sm:text-sm/6"
                      value={data.email}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                      onBlur={async () => {
                        if (
                          emailRegex.test(data.email) &&
                          (await checkEmail())
                        ) {
                          setIsValidEmail(true);
                        } else {
                          setIsValidEmail(false);
                        }
                      }}
                    />
                  </div>

                  <p
                    className="mt-2 text-sm/6 text-stone-600 flex items-center"
                    style={{
                      visibility:
                        isValidEmail || isValidEmail === false
                          ? "visible"
                          : "hidden",
                    }}
                  >
                    <span
                      className="material-symbols-outlined mr-1"
                      style={{
                        fontSize: "1.2rem",
                        color: isValidEmail ? "#a4b9bd" : "#f87171",
                      }}
                    >
                      {isValidEmail
                        ? "check_circle"
                        : isValidEmail === false
                          ? "cancel"
                          : ""}
                    </span>
                    <span>
                      {isValidEmail
                        ? "This email is available!"
                        : isValidEmail === false
                          ? "This email is already taken or invalid."
                          : ""}
                    </span>
                  </p>
                </div>
                <div className="mt-7">
                  <label
                    htmlFor="password"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Password *
                  </label>
                  <p className="mt-1 text-sm/6 text-stone-400">
                    Make your password strong by using a mix of letters,
                    numbers, symbols at least 8 characters long.
                  </p>
                  <div className="mt-2">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-stone-900 outline-1 -outline-offset-1 outline-stone-300 placeholder:text-stone-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#a4b9bd] sm:text-sm/6"
                      value={data.password}
                      onChange={(e) => {
                        setData({ ...data, password: e.target.value });
                        setIsValidPasswordCheck(false);
                      }}
                      onBlur={() => {
                        if (passwordRegex.test(data.password)) {
                          setIsValidPassword(true);
                        } else {
                          setIsValidPassword(false);
                        }
                      }}
                    />
                  </div>
                  <p
                    className="mt-2 text-sm/6 text-stone-600 flex items-center"
                    style={{
                      visibility:
                        isValidPassword || isValidPassword === false
                          ? "visible"
                          : "hidden",
                    }}
                  >
                    <span
                      className="material-symbols-outlined mr-1"
                      style={{
                        fontSize: "1.2rem",
                        color: isValidPassword ? "#a4b9bd" : "#f87171",
                      }}
                    >
                      {isValidPassword
                        ? "check_circle"
                        : isValidPassword === false
                          ? "cancel"
                          : ""}
                    </span>
                    <span>
                      {isValidPassword
                        ? "This password is strong!"
                        : isValidPassword === false
                          ? "This password is weak."
                          : ""}
                    </span>
                  </p>

                  <div className="mt-5">
                    <input
                      id="password-check"
                      type="password"
                      name="password-check"
                      autoComplete="password-check"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-stone-900 outline-1 -outline-offset-1 outline-stone-300 placeholder:text-stone-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#a4b9bd] sm:text-sm/6"
                      placeholder="Confirm your password"
                      value={data.passwordCheck}
                      onChange={(e) => {
                        setData({ ...data, passwordCheck: e.target.value });
                        if (data.password === e.target.value) {
                          setIsValidPasswordCheck(true);
                        } else {
                          setIsValidPasswordCheck(false);
                        }
                      }}
                    />
                  </div>
                  <p
                    className="mt-2 text-sm/6 text-stone-600 flex items-center"
                    style={{
                      visibility:
                        isValidPasswordCheck || isValidPasswordCheck === false
                          ? "visible"
                          : "hidden",
                    }}
                  >
                    <span
                      className="material-symbols-outlined mr-1"
                      style={{
                        fontSize: "1.2rem",
                        color: isValidPasswordCheck ? "#a4b9bd" : "#f87171",
                      }}
                    >
                      {isValidPasswordCheck
                        ? "check_circle"
                        : isValidPasswordCheck === false
                          ? "cancel"
                          : ""}
                    </span>
                    <span>
                      {isValidPasswordCheck
                        ? "Passwords match!"
                        : isValidPasswordCheck === false
                          ? "Passwords do not match."
                          : ""}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-2 text-sm text-stone-500">
              <ul>
                <li className="flex items-center gap-1">
                  <input type="checkbox" className="mr-2" />I have read and
                  accept to
                  <span className="cursor-pointer hover:underline">
                    Terms of Service
                  </span>
                  and
                  <span className="cursor-pointer hover:underline">
                    Privacy Policy
                  </span>
                </li>
                <li className="flex items-center gap-1">
                  <input type="checkbox" className="mr-2" />I am at least 14
                  years old
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
              <button
                type="button"
                className="border rounded-md border-stone-300 text-stone-900 px-5 py-2 hover:shadow-md active:scale-95 cursor-pointer transition duration-150"
                onClick={() => nav(-1)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-[#a4b9bd] px-5 py-2 text-white hover:shadow-md active:scale-95 cursor-pointer transition duration-150"
                onClick={async () => await registerHandler()}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
