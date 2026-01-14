import { useState } from "react";

import {
  ActionButton,
  CancelButton,
  CheckboxField,
  InputField,
  RadioField,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "~/components/forms";
import logoLight from "../welcome/logo-light.png";
import background from "./backs.jpg";
import { useNavigate } from "react-router";

export default function Signin() {
  const nav = useNavigate();
  const [select, setSelect] = useState("standard");
  return (
    <>
      <div
        className="flex items-center justify-center bg-stone-50 dark:bg-stone-900 p-4"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="mb-16 mt-12 border border-stone-300 rounded-lg p-8 max-w-xl bg-stone-50 backdrop-blur-lg w-full">
          {/** Header */}
          <img
            src={logoLight}
            alt="Ruler Logo"
            className="mx-auto pr-4 cursor-pointer"
            onClick={() => {
              nav("/");
            }}
          />
          <div className="mt-14 mb-6 ">
            <InputField
              id="email"
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
            />
            <InputField
              id="password"
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              style={{ marginTop: "24px" }}
            />
            <div className="text-sm text-stone-400 mt-3 flex justify-between ">
              <div>
                <CheckboxField
                  id="remember"
                  label="Remember me"
                  name="remember"
                  style={{
                    marginTop: "0",
                    color: "var(--color-stone-500)",
                  }}
                />
              </div>
              <div className="hover:underline cursor-pointer">
                Forgot your password?
              </div>
            </div>
            <div className="flex justify-end">
              <SubmitButton
                label="Sign In"
                style={{
                  fontSize: "16px",
                  padding: "12px 16px",
                  marginTop: "32px",
                  borderRadius: "30px",
                  width: "100%",
                }}
                onClick={() => {
                  nav("/game");
                }}
              />
            </div>
            <div className="flex justify-center">
              <div className="text-sm text-stone-500 mt-6">
                Don't have an account?{" "}
                <span
                  className="text-stone-900 font-medium hover:underline cursor-pointer"
                  onClick={() => {
                    nav("/auth/register");
                  }}
                >
                  Register
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
