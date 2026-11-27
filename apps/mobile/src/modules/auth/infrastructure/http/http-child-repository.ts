import type { Child, NewChild } from '@/modules/auth/domain/entities/child';
import type { ConsentGrant } from '@/modules/auth/domain/entities/consent';
import type { ChildRepository } from '@/modules/auth/domain/ports/child-repository';
import { isUnknownChild, toChildError } from '@/modules/auth/infrastructure/http/child-api-error';
import {
  toChild,
  toCreateChildBody,
  toUpdateChildBody,
  type ChildDto,
} from '@/modules/auth/infrastructure/http/child-dto';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';

/**
 * `ChildRepository` over the API's `/children` routes, which only ever see
 * the signed-in parent's children: the parent comes from the session cookie.
 */
export class HttpChildRepository implements ChildRepository {
  constructor(private readonly http: HttpClient) {}

  /** `parentId` is the session's parent: the API lists theirs on its own. */
  async findByParentId(_parentId: string): Promise<Child[]> {
    const children = await this.http.get<ChildDto[]>('/children');
    return children.map(toChild);
  }

  async findById(id: string): Promise<Child | null> {
    try {
      return toChild(await this.http.get<ChildDto>(childPath(id)));
    } catch (error) {
      if (isUnknownChild(error)) {
        return null;
      }
      throw error;
    }
  }

  async create(child: NewChild, consent: ConsentGrant): Promise<Child> {
    try {
      return toChild(
        await this.http.post<ChildDto>('/children', toCreateChildBody(child, consent)),
      );
    } catch (error) {
      throw toChildError(error);
    }
  }

  /** Sends only what changed since the stored profile, nothing if it didn't. */
  async save(child: Child): Promise<void> {
    const current = toChild(await this.http.get<ChildDto>(childPath(child.id)));
    const changes = toUpdateChildBody(current, child);
    if (Object.keys(changes).length === 0) {
      return;
    }
    try {
      await this.http.patch<ChildDto>(childPath(child.id), changes);
    } catch (error) {
      throw toChildError(error);
    }
  }
}

function childPath(id: string): string {
  return `/children/${encodeURIComponent(id)}`;
}
