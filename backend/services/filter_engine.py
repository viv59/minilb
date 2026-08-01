"""
Generic, ServiceNow-style filter engine for SQLAlchemy models.

Usage pattern (ServiceNow "encoded query" equivalent):
    {
        "logic": "AND",
        "conditions": [
            {"field": "status", "operator": "eq", "value": true},
            {"field": "cpu", "operator": "gte", "value": 4},
            {
                "logic": "OR",
                "conditions": [
                    {"field": "region", "operator": "eq", "value": "us-east"},
                    {"field": "region", "operator": "eq", "value": "us-west"}
                ]
            }
        ]
    }

This walks the tree and produces a single SQLAlchemy boolean expression that
you pass to Query.filter() / select().where().
"""

from __future__ import annotations

from enum import Enum
from typing import Any, List, Optional, Union

from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, and_, or_, not_
from sqlalchemy.orm import DeclarativeMeta
from sqlalchemy.sql.elements import ColumnElement


# --------------------------------------------------------------------------
# 1. Operators
# --------------------------------------------------------------------------

class Operator(str, Enum):
    EQ = "eq"
    NE = "ne"
    GT = "gt"
    GTE = "gte"
    LT = "lt"
    LTE = "lte"
    IN = "in"
    NOT_IN = "not_in"
    LIKE = "like"          # contains, case-insensitive
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    IS_NULL = "is_null"    # value is ignored, but must still be present (bool)
    BETWEEN = "between"    # value = [low, high]


# Which operators make sense per underlying column type.
# Anything not listed here defaults to the STRING_OPS set (safe fallback).
NUMERIC_OPS = {
    Operator.EQ, Operator.NE, Operator.GT, Operator.GTE, Operator.LT,
    Operator.LTE, Operator.IN, Operator.NOT_IN, Operator.IS_NULL, Operator.BETWEEN,
}
STRING_OPS = {
    Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN, Operator.LIKE,
    Operator.STARTS_WITH, Operator.ENDS_WITH, Operator.IS_NULL,
}
BOOL_OPS = {
    Operator.EQ, Operator.NE, Operator.IS_NULL,
}
DATE_OPS = {
    Operator.EQ, Operator.NE, Operator.GT, Operator.GTE, Operator.LT,
    Operator.LTE, Operator.IS_NULL, Operator.BETWEEN,
}

_TYPE_OP_MAP = [
    (Boolean, BOOL_OPS),
    (Integer, NUMERIC_OPS),
    (Numeric, NUMERIC_OPS),
    (DateTime, DATE_OPS),
    (String, STRING_OPS),
]


class FilterError(ValueError):
    """Raised for invalid field names, operators, or values."""


# --------------------------------------------------------------------------
# 2. Request schemas (what the API accepts)
# --------------------------------------------------------------------------

class FilterCondition(BaseModel):
    field: str
    operator: Operator
    value: Optional[Any] = None

    @field_validator("value")
    @classmethod
    def _validate_value_shape(cls, v, info):
        op = info.data.get("operator")
        if op == Operator.BETWEEN:
            if not isinstance(v, (list, tuple)) or len(v) != 2:
                raise ValueError("`between` requires value=[low, high]")
        if op in (Operator.IN, Operator.NOT_IN):
            if not isinstance(v, (list, tuple)):
                raise ValueError(f"`{op.value}` requires a list value")
        return v


class FilterGroup(BaseModel):
    logic: str = Field(default="AND", pattern="^(AND|OR)$")
    conditions: List[Union["FilterGroup", FilterCondition]]
    negate: bool = False  # wrap the whole group in NOT(...)


FilterGroup.model_rebuild()

# What the API endpoint accepts as top-level input (can be a single
# condition or a full group)
FilterInput = Union[FilterGroup, FilterCondition]


# --------------------------------------------------------------------------
# 3. Builder
# --------------------------------------------------------------------------

def _allowed_ops_for_column(column) -> set:
    col_type = column.type
    for sa_type, ops in _TYPE_OP_MAP:
        if isinstance(col_type, sa_type):
            return ops
    return STRING_OPS  # safe fallback for unknown types


# Maps SQLAlchemy type -> a simple label the frontend can use to pick an
# input control (checkbox / number input / text input / date picker).
_TYPE_LABEL_MAP = [
    (Boolean, "boolean"),
    (Integer, "number"),
    (Numeric, "number"),
    (DateTime, "date"),
    (String, "string"),
]


def _field_type_label(column) -> str:
    col_type = column.type
    for sa_type, label in _TYPE_LABEL_MAP:
        if isinstance(col_type, sa_type):
            return label
    return "string"


def describe_model_fields(model: DeclarativeMeta) -> dict:
    """
    Returns {field_name: {"type": "...", "operators": [...]}} for every
    column on the model. Used to drive a dynamic filter UI.
    """
    result = {}
    for column in model.__table__.columns:
        result[column.name] = {
            "type": _field_type_label(column),
            "operators": [op.value for op in _allowed_ops_for_column(column)],
        }
    return result


def _condition_to_expr(model: DeclarativeMeta, cond: FilterCondition) -> ColumnElement:
    if not hasattr(model, cond.field):
        raise FilterError(f"Unknown field '{cond.field}' on {model.__name__}")

    column = getattr(model, cond.field)

    # Refuse to filter on relationships / non-column attributes
    if not hasattr(column, "type"):
        raise FilterError(f"'{cond.field}' is not a filterable column")

    allowed = _allowed_ops_for_column(column)
    if cond.operator not in allowed:
        raise FilterError(
            f"Operator '{cond.operator.value}' not allowed on field "
            f"'{cond.field}' (allowed: {[o.value for o in allowed]})"
        )

    op = cond.operator
    val = cond.value

    if op == Operator.EQ:
        return column == val
    if op == Operator.NE:
        return column != val
    if op == Operator.GT:
        return column > val
    if op == Operator.GTE:
        return column >= val
    if op == Operator.LT:
        return column < val
    if op == Operator.LTE:
        return column <= val
    if op == Operator.IN:
        return column.in_(val)
    if op == Operator.NOT_IN:
        return column.not_in(val)
    if op == Operator.LIKE:
        return column.ilike(f"%{val}%")
    if op == Operator.STARTS_WITH:
        return column.ilike(f"{val}%")
    if op == Operator.ENDS_WITH:
        return column.ilike(f"%{val}")
    if op == Operator.IS_NULL:
        return column.is_(None) if val else column.is_not(None)
    if op == Operator.BETWEEN:
        low, high = val
        return column.between(low, high)

    raise FilterError(f"Unhandled operator '{op}'")  # pragma: no cover


def build_filter(model: DeclarativeMeta, node: FilterInput) -> ColumnElement:
    """
    Recursively convert a FilterGroup/FilterCondition tree into a single
    SQLAlchemy boolean expression for the given model.
    """
    if isinstance(node, FilterCondition):
        return _condition_to_expr(model, node)

    # FilterGroup
    exprs = [build_filter(model, child) for child in node.conditions]
    if not exprs:
        raise FilterError("FilterGroup must contain at least one condition")

    combined = and_(*exprs) if node.logic == "AND" else or_(*exprs)
    return not_(combined) if node.negate else combined