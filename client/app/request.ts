import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getRequest(url: string, query = {}, headers = {}) {
  return instance.get(url, { params: query, headers });
}
export function postRequest(url: string, data: any, headers = {}) {
  return instance.post(url, data, { headers });
}
