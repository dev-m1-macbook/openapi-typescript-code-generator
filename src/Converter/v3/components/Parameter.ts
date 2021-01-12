import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import * as Guard from "../Guard";
import * as Name from "../Name";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Reference from "./Reference";

export const generateTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameter: OpenApi.Parameter,
  context: ToTypeNode.Context,
): ts.TypeNode => {
  return ToTypeNode.convert(entryPoint, currentPoint, factory, parameter.schema || { type: "null" }, context);
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  parameter: OpenApi.Parameter,
  context: ToTypeNode.Context,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    comment: parameter.description,
    type: generateTypeNode(entryPoint, currentPoint, factory, parameter, context),
  });
};

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameter: OpenApi.Parameter | OpenApi.Reference,
  context: ToTypeNode.Context,
): ts.PropertySignature => {
  if (Guard.isReference(parameter)) {
    const reference = Reference.generate<OpenApi.Parameter>(entryPoint, currentPoint, parameter);
    if (reference.type === "local") {
      context.setReferenceHandler(reference);
      return factory.PropertySignature.create({
        name: reference.name,
        optional: false,
        type: factory.TypeReferenceNode.create({
          name: context.getReferenceName(currentPoint, reference.path),
        }),
      });
    }
    const isPathProperty = reference.data.in === "path";
    return factory.PropertySignature.create({
      name: reference.data.name,
      optional: isPathProperty ? false : !reference.data.required,
      type: ToTypeNode.convert(entryPoint, reference.referencePoint, factory, reference.data.schema || { type: "null" }, context),
    });
  }
  const isPathProperty = parameter.in === "path";
  return factory.PropertySignature.create({
    name: Name.escapeText(parameter.name),
    optional: isPathProperty ? false : !parameter.required,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, parameter.schema || { type: "null" }, context),
  });
};

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
): ts.PropertySignature[] => {
  return parameters.map(parameter => {
    return generatePropertySignature(entryPoint, currentPoint, factory, parameter, context);
  });
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  parameters: [OpenApi.Parameter | OpenApi.Reference],
  context: ToTypeNode.Context,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#headerObject`,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, parameters, context),
  });
};

/**
 * Alias作成用
 */
export const generateAliasInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  parameters: (OpenApi.Parameter | OpenApi.Reference)[],
  context: ToTypeNode.Context,
): ts.InterfaceDeclaration => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#headerObject`,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, parameters, context),
  });
};
