export interface Element {
  id: number;
  text: string;
  emoji: string;
  is_first_discovery: boolean;
  created_at: string;
}

export interface Recipe {
  id: number;
  input_a: number;
  input_b: number;
  result_id: number;
}

export interface CombinationResult {
  result: Element;
  isNewDiscovery: boolean;
}
