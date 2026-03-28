import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STATE_PATH = path.join(process.cwd(), "data", "shopping-state.json");

interface ShoppingState {
  checked: string[];
  updatedAt: string;
}

async function readState(): Promise<ShoppingState> {
  try {
    const raw = await fs.readFile(STATE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { checked: [], updatedAt: new Date().toISOString() };
  }
}

async function writeState(state: ShoppingState): Promise<void> {
  await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
  await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const state: ShoppingState = {
      checked: body.checked ?? [],
      updatedAt: new Date().toISOString(),
    };
    await writeState(state);
    return NextResponse.json(state);
  } catch {
    return NextResponse.json(
      { error: "Failed to save shopping state" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const state: ShoppingState = {
    checked: [],
    updatedAt: new Date().toISOString(),
  };
  await writeState(state);
  return NextResponse.json(state);
}
