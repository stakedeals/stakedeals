import { db, schema } from "@/lib/db";
import { eq, and, asc } from "drizzle-orm";
import { CategoryInput } from "@/lib/validations/catalog";
import { recordAuditEvent } from "@/lib/domain/audit/service";

/**
 * Checks for category cycles: returns true if childId is an ancestor of potentialParentId
 */
export async function isCategoryAncestorOf(
  potentialAncestorId: string,
  targetCategoryId: string
): Promise<boolean> {
  let currId: string | null = targetCategoryId;
  const visited = new Set<string>();

  while (currId && !visited.has(currId)) {
    visited.add(currId);
    if (currId === potentialAncestorId) return true;

    const [cat] = await db
      .select({ parentId: schema.categories.parentId })
      .from(schema.categories)
      .where(eq(schema.categories.id, currId))
      .limit(1);

    currId = cat?.parentId || null;
  }

  return false;
}

export async function createCategory(actorId: string, input: CategoryInput) {
  // 1. Check slug uniqueness
  const [existingSlug] = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.slug, input.slug))
    .limit(1);

  if (existingSlug) {
    throw new Error(`Category slug "${input.slug}" is already taken.`);
  }

  // 2. Validate parent if provided
  if (input.parentId) {
    const [parent] = await db
      .select({ id: schema.categories.id, parentId: schema.categories.parentId })
      .from(schema.categories)
      .where(eq(schema.categories.id, input.parentId))
      .limit(1);

    if (!parent) {
      throw new Error("Specified parent category does not exist.");
    }
    // Specification: Simple category & child category structure
    if (parent.parentId) {
      throw new Error("Multi-level nesting beyond child categories is not permitted.");
    }
  }

  const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record = {
    id,
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    parentId: input.parentId || null,
    isActive: input.isActive ?? true,
    displayOrder: input.displayOrder ?? 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(schema.categories).values(record);

  await recordAuditEvent({
    actorId,
    action: "category.create",
    entityType: "category",
    entityId: id,
    afterState: record,
  });

  return record;
}

export async function updateCategory(
  actorId: string,
  categoryId: string,
  input: Partial<CategoryInput>
) {
  const [existing] = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.id, categoryId))
    .limit(1);

  if (!existing) {
    throw new Error("Category not found.");
  }

  if (input.slug && input.slug !== existing.slug) {
    const [slugConflict] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, input.slug))
      .limit(1);

    if (slugConflict && slugConflict.id !== categoryId) {
      throw new Error(`Category slug "${input.slug}" is already taken.`);
    }
  }

  if (input.parentId !== undefined && input.parentId !== null) {
    if (input.parentId === categoryId) {
      throw new Error("Self-parenting is not permitted.");
    }

    const createsCycle = await isCategoryAncestorOf(categoryId, input.parentId);
    if (createsCycle) {
      throw new Error("Category cycle detected: child cannot be set as parent.");
    }

    const [parent] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, input.parentId))
      .limit(1);

    if (!parent) {
      throw new Error("Parent category not found.");
    }
    if (parent.parentId) {
      throw new Error("Multi-level nesting beyond child categories is not permitted.");
    }
  }

  const updateData = {
    name: input.name ?? existing.name,
    slug: input.slug ?? existing.slug,
    description: input.description !== undefined ? input.description : existing.description,
    parentId: input.parentId !== undefined ? input.parentId : existing.parentId,
    isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
    displayOrder: input.displayOrder !== undefined ? input.displayOrder : existing.displayOrder,
    updatedAt: new Date(),
  };

  await db
    .update(schema.categories)
    .set(updateData)
    .where(eq(schema.categories.id, categoryId));

  await recordAuditEvent({
    actorId,
    action: "category.update",
    entityType: "category",
    entityId: categoryId,
    beforeState: existing,
    afterState: updateData,
  });

  return { ...existing, ...updateData };
}

export async function getAllCategories(includeInactive = false) {
  const conditions = [];
  if (!includeInactive) {
    conditions.push(eq(schema.categories.isActive, true));
  }

  const list = await db
    .select()
    .from(schema.categories)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(schema.categories.displayOrder), asc(schema.categories.name));

  // Build hierarchy: root categories with children
  const roots = list.filter((c) => !c.parentId);
  const childrenMap = new Map<string, typeof list>();

  for (const c of list) {
    if (c.parentId) {
      const arr = childrenMap.get(c.parentId) || [];
      arr.push(c);
      childrenMap.set(c.parentId, arr);
    }
  }

  return roots.map((root) => ({
    ...root,
    children: childrenMap.get(root.id) || [],
  }));
}

export async function getCategoryBySlug(slug: string) {
  const [cat] = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug))
    .limit(1);

  if (!cat) return null;

  const children = await db
    .select()
    .from(schema.categories)
    .where(and(eq(schema.categories.parentId, cat.id), eq(schema.categories.isActive, true)))
    .orderBy(asc(schema.categories.displayOrder));

  return {
    ...cat,
    children,
  };
}
