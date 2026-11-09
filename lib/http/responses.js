import { NextResponse } from 'next/server';
export const ok = (data, message = 'OK', status = 200) =>
  NextResponse.json({ success: true, data, message }, { status });
export const fail = (message, status = 400, errors) =>
  NextResponse.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    { status },
  );
