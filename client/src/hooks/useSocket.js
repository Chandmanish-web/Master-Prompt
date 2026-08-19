import { useEffect, useCallback } from 'react';
import { getSocket } from '../socket/socket';

/**
 * Hook to use Socket.IO events in components
 * @param {string} eventName - The event name to listen for
 * @param {Function} handler - Callback function when event is received
 * @param {any[]} dependencies - Dependencies array for useEffect
 */
export const useSocketEvent = (eventName, handler, dependencies = []) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler, ...dependencies]);
};

/**
 * Hook to emit Socket.IO events
 * @returns {Function} Function to emit events
 */
export const useSocketEmit = () => {
  return useCallback((eventName, data) => {
    const socket = getSocket();
    if (socket) {
      socket.emit(eventName, data);
    }
  }, []);
};

/**
 * Combined hook for listening and emitting events
 * @returns {Object} Object with on and emit methods
 */
export const useSocket = () => {
  const emit = useSocketEmit();

  const on = useCallback((eventName, handler) => {
    const socket = getSocket();
    if (socket) {
      socket.on(eventName, handler);
    }
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off(eventName, handler);
      }
    };
  }, []);

  return { on, emit };
};

export default useSocket;
