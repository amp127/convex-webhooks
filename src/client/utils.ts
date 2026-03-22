import type {
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";

/** Mutation or action context that can call into this component via `runMutation`. */
export type RunMutationCtx<
  DataModel extends GenericDataModel = GenericDataModel,
> =
  | Pick<GenericMutationCtx<DataModel>, "runMutation">
  | Pick<GenericActionCtx<DataModel>, "runMutation">;

/** Query context that can call into this component via `runQuery`. */
export type RunQueryCtx<DataModel extends GenericDataModel = GenericDataModel> =
  Pick<GenericQueryCtx<DataModel>, "runQuery">;

/** Action context that can call component actions via `runAction`. */
export type RunActionCtx<DataModel extends GenericDataModel = GenericDataModel> =
  Pick<GenericActionCtx<DataModel>, "runAction">;
