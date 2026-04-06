/**
 * useWebSocket — production-ready shared WebSocket hook.
 *
 * Features:
 * - Single WS instance per hook mount (via useRef)
 * - Authentication via httpOnly cookie (sent automatically by browser on Upgrade handshake)
 * - Exponential backoff reconnection (max 5 retries, cap 30s)
 * - Auto-cleanup on unmount
 * - onMessage, onOpen, onClose callbacks via ref (stable — no stale closures)
 */

import { useRef, useEffect, useCallback, useState } from 'react';

function getWsBase() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const url = new URL(apiUrl);
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${url.host}`;
}
const WS_BASE = getWsBase();
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export function useWebSocket({ path, onMessage, onOpen, onClose, enabled = true, token = null }) {
    const wsRef = useRef(null);
    const retriesRef = useRef(0);
    const reconnectTimerRef = useRef(null);
    const callbacksRef = useRef({ onMessage, onOpen, onClose });
    const connectRef = useRef(null); // ref to latest connect — avoids self-reference in useCallback
    // Lazy initializer: start as 'connecting' immediately if we have a path — avoids
    // calling setStatus inside the effect body (which triggers react-hooks/set-state-in-effect).
    const [status, setStatus] = useState(() => (enabled && path) ? 'connecting' : 'closed');
    const [retryCount, setRetryCount] = useState(0);

    // Keep callbacks fresh without triggering reconnections
    useEffect(() => {
        callbacksRef.current = { onMessage, onOpen, onClose };
    });

    const connect = useCallback(() => {
        if (!enabled || !path) return;

        // Token is appended as a query param for cross-origin WebSocket auth.
        // Browsers block cross-site cookies on WS upgrades (Chrome PSL behaviour),
        // so the store token is the only reliable channel.
        const url = token ? `${WS_BASE}/${path}?token=${token}` : `${WS_BASE}/${path}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            retriesRef.current = 0;
            setRetryCount(0);
            setStatus('open');
            callbacksRef.current.onOpen?.();
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                callbacksRef.current.onMessage?.(data);
            } catch {
                // Non-JSON frame — ignore
            }
        };

        ws.onclose = (event) => {
            setStatus('closed');
            callbacksRef.current.onClose?.(event);

            // Reconnect unless deliberately closed (code 1000) or auth failure
            if (event.code !== 1000 && event.code !== 4001 && event.code !== 4003) {
                if (retriesRef.current < MAX_RETRIES) {
                    const delay = Math.min(
                        BASE_DELAY_MS * Math.pow(2, retriesRef.current),
                        30000
                    );
                    retriesRef.current += 1;
                    setRetryCount(retriesRef.current);
                    setStatus('connecting'); // async callback — linter-safe
                    reconnectTimerRef.current = setTimeout(() => connectRef.current?.(), delay);
                }
            }
        };

        ws.onerror = () => {
            // onclose fires after onerror — let it handle reconnection
        };
    }, [path, enabled, token]);

    // Keep ref in sync after render so the onclose handler always calls the latest version
    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    useEffect(() => {
        connect();
        return () => {
            clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null; // prevent reconnect on intentional close
                wsRef.current.close(1000);
            }
        };
    }, [connect]);

    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    return { status, retryCount, send };
}
