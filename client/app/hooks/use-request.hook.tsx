import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { axiosInstance } from "~/axios-instance";
import { AuthContext } from "~/contexts/authContext";

interface ResponseDataType {
  data: { responseObject: any; statusCode: number };
  status: number;
}

export default function useRequest(url: string, method: "post" | "get") {
  const { logout } = useContext(AuthContext);
  const [res, setRes] = useState<ResponseDataType | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const sendRequest = async (options: {
    authorization?: string;
    method?: string;
    queries?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<ResponseDataType | null> => {
    setIsLoading(true);
    setErrorCode(null);
    const queryString = options.queries
      ? "?" + new URLSearchParams(options.queries).toString()
      : "";
    const fullUrl = url + queryString;
    const fullHeader = options.headers ? { ...options.headers } : {};
    if (options.authorization) {
      fullHeader["Authorization"] = `Bearer ${options.authorization}`;
    }
    try {
      const res = await axiosInstance.request({
        method: method,
        url: fullUrl,
        data: options.body ?? null,
        headers: fullHeader,
      });
      console.log(
        `Request successfully managed (${fullUrl}):\n${res.status}\n${res.data}`,
      );
      setRes(res as ResponseDataType);
      return res as ResponseDataType;
    } catch (ex) {
      if (axios.isAxiosError<ResponseDataType, any>(ex)) {
        const errorCode = ex.response?.status;
        console.log(`useRequest get ${errorCode}`);
        setErrorCode(errorCode ?? 500);
        if (errorCode === 400) {
          console.log("Wrong Data Submitted");
        } else if (errorCode === 401) {
          console.log("Unauthorized");
        } else if (errorCode === 403) {
          console.log("Bad URL");
        } else if (errorCode === 404) {
          console.log("Data not Found");
        }
      } else {
        console.log("Unexpected error occured, try again later.");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { res, isLoading, errorCode, sendRequest };
}
