export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_tag: string | null;
  meta_description: string | null;
  header: number;
  footer: number;
}

export interface PagesResponse {
  status: boolean;
  data: Page[];
  error: any[];
}

