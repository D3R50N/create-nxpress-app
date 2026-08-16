import type { Request, Response } from "@nxpress/core";
import { mockUsers } from ".";

export async function GET(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    res.status(404);
    return { error: "User not found" };
  }
  return user;
}

// PUT /api/users/:id -> Updates user record
export async function PUT(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const { name, email } = req.body;
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    res.status(404);
    return { error: "User not found" };
  }
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  return { ...user, updatedAt: new Date().toISOString() };
}

// DELETE /api/users/:id -> Deletes user with 204 No Content
export async function DELETE(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const index = mockUsers.findIndex((u) => u.id === userId);

  if (index !== -1) {
    mockUsers.splice(index, 1);
  }
  return res.status(204).send();
}
