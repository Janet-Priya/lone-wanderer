
export interface Quest {
  emotion: string;
  class: string;
  realm: string;
  realm_description: string;
  item: string;
  item_effect: string;
  quest: string;
  transformation: string;
}

export interface Insight {
  summary: string;
  growth_advice: string;
  emotional_pattern: string;
}

export interface QuestResultData {
  quest: Quest;
  insight: Insight;
}
