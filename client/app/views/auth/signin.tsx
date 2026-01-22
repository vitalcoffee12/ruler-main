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
        <div className="mb-16 mt-12 border border-stone-300 rounded-lg p-8 max-w-md bg-stone-50 w-full">
          {/** Header */}
          <img
            src={logoLight}
            alt="Ruler Logo"
            className="mx-auto pr-4 cursor-pointer"
            onClick={() => {
              nav("/");
            }}
          />
          <div className="mt-14 mb-2">
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
            <div className="flex justify-center mb-6">
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
            <div className="border-b border-stone-300" />
            <div className="text-center text-stone-500 my-4 text-sm">
              Or sign in with
            </div>
            <div className="flex flex-col items-center mt-6 gap-2">
              {oauthProviders.map((provider) => (
                <OAuthButton
                  key={provider.id}
                  provider={provider.id}
                  icon={provider.icon}
                  color={provider.color}
                  background={provider.background}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const oauthProviders = [
  {
    id: "google",
    name: "Google",
    icon: "https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1731911497387",
    color: "#424242",
    background: "#FFFFFF",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "https://cdn.brandfetch.io/idZAyF9rlg/w/1000/h/410/theme/light/logo.png?c=1bxid64Mup7aczewSAYMX&t=1719469980640",
    color: "#FFFFFF",
    background: "#24292E",
  },
  {
    id: "naver",
    name: "Naver",
    icon: "https://cdn.brandfetch.io/idy7-U4_1-/theme/dark/idDi4nbaBz.svg?c=1bxid64Mup7aczewSAYMX&t=1749526654977",
    color: "#080808",
    background: "#03CF5D",
  },
  {
    id: "kakao",
    name: "Kakao",
    icon: "https://cdn.brandfetch.io/idJmQaiEA1/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1721644049621",
    color: "#000000",
    background: "#FEE102",
  },
];
function OAuthButton(props: {
  provider: string;
  icon: string;
  color?: string;
  background?: string;
}) {
  let height = "14px";
  if (props.provider === "github") {
    height = "24px";
  } else if (props.provider === "google") {
    height = "18px";
  }
  let leftMargin = "0px";
  // if (props.provider === "naver") {
  //   leftMargin = "4px";
  // } else if (props.provider === "kakao") {
  //   leftMargin = "4px";
  // } else if (props.provider === "google") {
  //   leftMargin = "2px";
  // }
  let border = "";
  if (props.provider === "google") {
    border = "border border-stone-300";
  }
  let seperator = "";
  if (props.provider === "google") {
    seperator = "#E4E4E4";
  } else if (props.provider === "github") {
    seperator = "#444D56";
  } else if (props.provider === "naver") {
    seperator = "#008c3f";
  } else if (props.provider === "kakao") {
    seperator = "#b9a50c";
  }

  return (
    <div
      className={`flex items-center rounded-lg px-4 py-3 cursor-pointer hover:shadow-md w-full justify-center relative text-sm font-medium transition duration-150 ease-in-out ${border}`}
      style={{
        backgroundColor: props.background || "#FFFFFF",
        color: props.color || "#000000",
      }}
    >
      <div
        style={{
          backgroundImage: `url(${props.icon})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          width: "80px",
          height: height,
          borderRadius: "2px",
          paddingLeft: leftMargin,
        }}
      ></div>
      <div
        className={`border-l pl-3 ml-1`}
        style={{
          borderColor: seperator,
          width: "140px",
        }}
      >
        Sign in with <span className="font-bold">{props.provider}</span>
      </div>
    </div>
  );
}

function GithunLogin() {
  return <></>;
}
