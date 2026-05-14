export interface PostSummary {
  participant: string;
  body: string;
}

export interface Crystalliser {
  crystallise(question: string, posts: PostSummary[]): Promise<string>;
}
