"use client";
import { useEffect, useState } from "react";
import { fetchClientToken } from "@/lib/fetchClientToken";
import { PaymentForm } from "@/components/PaymentForm";

export default function Home() {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getToken() {
      setIsLoading(true);
      try {
        const response = await fetchClientToken("a1b2c3d4e5f6g7h8i9j0");
        if (response.success) {
          setClientToken(response.clientToken);
        } else {
          console.error("Failed to fetch client token:", response.error);
          setError(response.error);
        }
      } catch (err) {
        console.error("Error fetching token:", err);
        setError("Failed to initialize checkout");
      } finally {
        setIsLoading(false);
      }
    }

    getToken();
  }, []);

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Primer Headless Checkout Example
      </h1>

      {isLoading && <p className="text-gray-600">Loading client token...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {clientToken ? (
        <PaymentForm clientToken={clientToken} />
      ) : (
        !isLoading && (
          <p className="text-gray-600">Waiting for client token...</p>
        )
      )}
    </div>
  );
}
