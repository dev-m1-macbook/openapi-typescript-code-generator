import ts from "typescript";

export interface Params {
  text: string;
  rawText?: string;
}

export interface Factory {
  create: (params: Params) => ts.TemplateHead;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.TemplateHead => {
  const node = factory.createTemplateHead(params.text, params.rawText, undefined);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
