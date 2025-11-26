/** WebSocket hooks for real-time updates. */
"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { api } from "../api/base";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

export function useAlertsWS(homeId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!homeId) return;

    // WebSocket endpoint not implemented yet, so we'll skip for now
    // When implemented, uncomment below:
    /*
    const wsUrl = `${WS_URL}/ws/alerts?homeId=${homeId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected for alerts");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "alert_created" || data.type === "alert_updated") {
          // Invalidate alerts cache to trigger refetch
          dispatch(api.util.invalidateTags(["Alert"]));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected for alerts");
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    */
  }, [homeId, dispatch]);
}
