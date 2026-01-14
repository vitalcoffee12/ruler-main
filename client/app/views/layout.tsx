import { Outlet } from "react-router";
import DevNavigator from "./_dev/dev_navi";
import "./main.css";

export default function Layout() {
  return (
    <>
      {/* <DevNavigator /> 
      main image from 
      https://www.freepik.com/free-vector/group-happy-young-people-having-fun-while-playing-games_16607977.htm#fromView=search&page=1&position=19&uuid=7ef281f8-19f4-41af-8fb4-8b8e1f0c7cc4&query=board+game?log-in=google
      
      */}
      <div className="main">
        <Outlet />
      </div>
    </>
  );
}
