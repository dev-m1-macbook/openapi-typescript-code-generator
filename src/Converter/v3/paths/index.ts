import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import * as PathItem from "../components/PathItem";
import * as Reference from "../components/Reference";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";

export const generateStatements = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  paths: OpenApi.Paths,
  context: ToTypeNode.Context,
): void => {
  const statements: ts.Statement[][] = [];
  Object.entries(paths).forEach(([requestUri, pathItem]) => {
    if (!requestUri.startsWith("/")) {
      throw new Error(`Not start slash: ${requestUri}`);
    }
    if (Guard.isReference(pathItem)) {
      const reference = Reference.generate<OpenApi.PathItem>(entryPoint, currentPoint, pathItem);
      if (reference.type === "local") {
        statements.push(
          PathItem.generateStatements(entryPoint, currentPoint, store, factory, requestUri, store.getPathItem(reference.path), context),
        );
      } else {
        statements.push(PathItem.generateStatements(entryPoint, reference.referencePoint, store, factory, requestUri, reference.data, context));
      }
    } else {
      statements.push(PathItem.generateStatements(entryPoint, currentPoint, store, factory, requestUri, pathItem, context));
    }
  });

  store.addAdditionalStatement(statements.flat());
};
