import { useState } from "react";
import "./dev.css";
export default function DevNavigator() {
  const [navPosition, setNavPosition] = useState<"0" | "100%">("0");
  return (
    <>
      <div
        className="dev-navigator"
        style={{
          position: "fixed",
          left: 0,
          height: "100vh",
          width: "200px",
          backgroundColor: "#eee",
          padding: "10px",
          boxSizing: "border-box",

          transform: `translateX(-${navPosition})`,
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div
          className="toggle"
          onClick={(e) => {
            if (navPosition == "0") {
              setNavPosition("100%");
            } else {
              setNavPosition("0");
            }
          }}
        >
          NAVI
        </div>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/auth/signin">Sign In</a>
          </li>
          <li>
            <a href="/auth/register">Register</a>
          </li>
          <li>
            <a href="/game">Game Index</a>
          </li>
        </ul>
      </div>
    </>
  );
}
