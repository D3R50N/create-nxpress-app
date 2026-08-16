import type { Request, Response } from "@nxpress/core";

export const mockUsers = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

// GET /api/users -> Returns 200 OK + JSON
export async function GET(req: Request, res: Response) {
  const search = req.query.search as string;
  if (search) {
    return mockUsers.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()),
    );
  }
  return mockUsers;
}

// POST /api/users -> Creates record with 201 Created
export async function POST(req: Request, res: Response) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newUser = { id: Date.now(), name, email };
  mockUsers.push(newUser);
  return res.status(201).json(newUser);
}
