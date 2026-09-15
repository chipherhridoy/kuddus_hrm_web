import * as signalR from "@microsoft/signalr";
import { useEffect, useState, useRef } from "react";
import { API_BASE } from "./api";

export interface LiveAttendanceEvent {
  type: "CHECK_IN" | "CHECK_OUT" | string;
  userId: number;
  userName: string;
  userRole?: string;
  timestamp: string;
  status: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export function getAttendanceHubUrl(): string {
  const base = API_BASE.replace(/\/api\/?$/, "");
  return `${base}/hubs/attendance`;
}

// Module-level connection singleton so multiple components share the same WebSocket connection
let sharedConnection: signalR.HubConnection | null = null;
let connectionPromise: Promise<signalR.HubConnection> | null = null;
const eventListeners = new Set<(event: LiveAttendanceEvent) => void>();
const connectionStateListeners = new Set<(connected: boolean) => void>();

function notifyConnectionState(connected: boolean) {
  connectionStateListeners.forEach((listener) => {
    try {
      listener(connected);
    } catch (err) {
      console.error("[SignalR] Error in state listener:", err);
    }
  });
}

function notifyEvent(event: LiveAttendanceEvent) {
  eventListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error("[SignalR] Error in event listener:", err);
    }
  });
}

export function getOrCreateAttendanceConnection(): Promise<signalR.HubConnection> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SignalR cannot run during SSR"));
  }

  if (
    sharedConnection &&
    (sharedConnection.state === signalR.HubConnectionState.Connected ||
      sharedConnection.state === signalR.HubConnectionState.Connecting ||
      sharedConnection.state === signalR.HubConnectionState.Reconnecting)
  ) {
    return Promise.resolve(sharedConnection);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const hubUrl = getAttendanceHubUrl();

  const conn = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () =>
        typeof window !== "undefined" ? localStorage.getItem("token") || "" : "",
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  conn.on("AttendanceRecorded", (event: LiveAttendanceEvent) => {
    notifyEvent(event);
  });

  conn.onreconnecting(() => {
    notifyConnectionState(false);
  });

  conn.onreconnected(() => {
    notifyConnectionState(true);
  });

  conn.onclose(() => {
    notifyConnectionState(false);
    connectionPromise = null;
  });

  sharedConnection = conn;

  connectionPromise = conn
    .start()
    .then(() => {
      notifyConnectionState(true);
      return conn;
    })
    .catch((err) => {
      console.warn("[SignalR] Could not connect to AttendanceHub:", err.message || err);
      notifyConnectionState(false);
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

export function useAttendanceSignalR(
  onEvent?: (event: LiveAttendanceEvent) => void
) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return sharedConnection?.state === signalR.HubConnectionState.Connected;
  });
  const [lastEvent, setLastEvent] = useState<LiveAttendanceEvent | null>(null);

  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle connection state listener
    const handleStateChange = (connected: boolean) => {
      setIsConnected(connected);
    };
    connectionStateListeners.add(handleStateChange);

    // Handle incoming events
    const handleIncomingEvent = (event: LiveAttendanceEvent) => {
      setLastEvent(event);
      if (onEventRef.current) {
        onEventRef.current(event);
      }
    };
    eventListeners.add(handleIncomingEvent);

    // Ensure connection is started
    getOrCreateAttendanceConnection()
      .then(() => {
        setIsConnected(true);
      })
      .catch(() => {
        setIsConnected(false);
      });

    return () => {
      connectionStateListeners.delete(handleStateChange);
      eventListeners.delete(handleIncomingEvent);
    };
  }, []);

  return { isConnected, lastEvent };
}
