export interface Entity { id: string; }
export interface Repository<T extends Entity> {
  save(item: T): T;
  findById(id: string): T | undefined;
  list(): T[];
}
export class InMemoryRepository<T extends Entity> implements Repository<T> {
  private items = new Map<string, T>();
  save(item: T): T { this.items.set(item.id, item); return item; }
  findById(id: string): T | undefined { return this.items.get(id); }
  list(): T[] { return [...this.items.values()]; }
}
export interface User extends Entity { name: string; email: string; }
