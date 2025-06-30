import { Subject } from "../model/chat.model";

export const Template = {
  DEFAULT: "default",
  GENERATE_TITLE: "generate_title",
  TUTOR: "tutor",
  SUMMARIZE: "summarize",
  EXPLAIN_LIKE_IM_5: "explain_like_im_5",
} as const;

// TemplateKey = "DEFAULT" | "GENERATE_TITLE" | "TUTOR" | "SUMMARIZE" | "EXPLAIN_LIKE_IM_5"
export type TemplateKey = keyof typeof Template;

// TemplateValue = "default" | "generate_title" | "tutor" | "summarize" | "explain_like_im_5"
export type TemplateValue = (typeof Template)[TemplateKey];

// Maps each TemplateValue to a config object of type T
export type TemplateTypeConfig<T> = {
  [key in TemplateValue]: T;
};

type GenerateTitleResponse = {
  title: string;
  subject: Subject;
};

type TextResponse = {
  response: string;
};

// Map each TemplateValue to expected response type
export type TemplateResponseMap = {
  default: TextResponse;
  tutor: TextResponse;
  summarize: TextResponse;
  explain_like_im_5: TextResponse;
  generate_title: GenerateTitleResponse;
};
