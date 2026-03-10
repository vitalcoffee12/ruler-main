import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function useFetch(
  url: string,
  options: {
    authorization?: string;
    method?: string;
    queries?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
  },
) {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const queryString = options.queries
        ? "?" + new URLSearchParams(options.queries).toString()
        : "";
      const fullUrl = url + queryString;
      try {
        const response = await fetch(fullUrl, {
          method: options.method || "GET",
          body: options.body ? JSON.stringify(options.body) : undefined,
          headers: {
            "Content-Type": "application/json",
            ...(options.authorization
              ? { Authorization: `Bearer ${options.authorization}` }
              : {}),
            ...options.headers,
          },
        });

        if (response.status === 401) {
          nav("/auth/signin");
          throw new Error("Unauthorized. Redirecting to sign-in.");
        } else if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        setData(result.data.responseObject);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url, options]);

  return { data, loading, error };
}
