import {
  type Entity,
  type EntityType,
} from 'app/domain/scene';
import { createPartialComponent } from 'base/react/partial';
import { runInAction } from 'mobx';
import { type ComponentType } from 'react';

export type EntityRendererProps<E extends Entity = Entity> = {
  entity: E,
};

export type EntityRenderer<E extends Entity = Entity> = ComponentType<EntityRendererProps<E>>;

type EntityRendererWithPriorityAndFilter<E extends Entity = Entity> = {
  Renderer: EntityRenderer<E>,
  priority: number,
  filter: (entity: E) => boolean,
};

export class EntityRendererRegistry {
  accessor fallbackRenderers: EntityRendererWithPriorityAndFilter[] = [];
  private readonly mappedRenderers = new WeakMap<Entity, ComponentType>();

  registerRendererForEntityType(entityType: EntityType, Renderer: EntityRenderer, priority: number) {
    this.registerRenderer(entity => entity.type === entityType, Renderer, priority);
  }

  registerRenderer(
    filter: (entity: Entity) => boolean,
    Renderer: EntityRenderer,
    priority: number,
  ) {
    runInAction(() => {
      this.fallbackRenderers.push({
        Renderer,
        priority,
        filter,
      });
      this.fallbackRenderers.sort((a, b) => a.priority - b.priority);
    });
  }

  getRenderer(entity: Entity): ComponentType | undefined {
    const Renderer = this.mappedRenderers.get(entity);
    if (Renderer == null) {
      const fallbackRenderer = this.fallbackRenderers.find(({ filter }) => filter(entity));
      if (fallbackRenderer != null) {
        const Renderer = fallbackRenderer.Renderer;
        const EntityRenderer = createPartialComponent(Renderer, { entity });
        this.mappedRenderers.set(entity, EntityRenderer);
        return EntityRenderer;
      }
    } else {
      return Renderer;
    }
  }
}
