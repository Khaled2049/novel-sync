export interface PlotEvent {
  id: string;
  name: string;
  content: string;
}

export interface PlotLine {
  id: string;
  name: string;
  description: string;
  events: PlotEvent[];
}

export interface TemplateItem {
  id: number;
  name: string;
  content: string;
}

export interface TemplateData {
  id: number;
  name: string;
  events: TemplateItem[];
}
