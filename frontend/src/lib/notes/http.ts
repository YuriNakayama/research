import { NextResponse } from "next/server";

// Shared API envelope (see .claude/rules/frontend.md "API Response Format").
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function fail(error: string, status: number): NextResponse {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error },
    { status },
  );
}
