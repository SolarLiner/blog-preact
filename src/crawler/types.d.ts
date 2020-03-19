export interface Edge {
  id: string;
  format: string;
  path: string;
  details: {
    title: string;
    date: string;
    tags: string;
  };
  preview: string;
}

export interface Node {
  id: string;
  data: BlogData;
}

export interface BlogData {
  nodes?: Node[];
  edges?: Edge[];
}
