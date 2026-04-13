/**
 * socket.js — Singleton quản lý Socket.io instance
 * Được khởi tạo trong server.js và export qua getIo()
 */

let _io = null;

export const initIo = (io) => {
  _io = io;
};

export const getIo = () => _io;
