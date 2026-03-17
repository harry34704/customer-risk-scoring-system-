from pydantic import BaseModel


class ScoringRuleRead(BaseModel):
    id: str
    name: str
    factor_key: str
    description: str
    weight: float
    threshold_operator: str
    threshold_value: float
    enabled: bool
    sort_order: int


class ScoringRuleUpdate(BaseModel):
    id: str
    name: str
    description: str
    weight: float
    threshold_operator: str
    threshold_value: float
    enabled: bool
    sort_order: int


class ScoringRuleUpdateRequest(BaseModel):
    rules: list[ScoringRuleUpdate]

