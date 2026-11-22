export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchUser(id: string): Promise<{ id: string; name: string }> {
  await delay(10);
  if (!id) throw new Error('id requerido');
  return { id, name: `User-${id}` };
}

export async function loadUsers(ids: string[]): Promise<string[]> {
  const users = await Promise.all(ids.map((id) => fetchUser(id)));
  return users.map((u) => u.name);
}
