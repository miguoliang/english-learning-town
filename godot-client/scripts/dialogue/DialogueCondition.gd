extends Resource
class_name DialogueCondition

@export var condition_type: ConditionType = ConditionType.NONE
@export var target_value: String = ""
@export var comparison_operator: ComparisonOperator = ComparisonOperator.EQUALS
@export var required_amount: int = 0

enum ConditionType {
	NONE,
	QUEST_ACTIVE,
	QUEST_COMPLETED,
	FRIENDSHIP_LEVEL,
	PLAYER_LEVEL,
	HAS_ITEM,
	KNOWS_VOCABULARY,
	TIME_OF_DAY,
	DAY_OF_WEEK
}

enum ComparisonOperator {
	EQUALS,
	GREATER_THAN,
	LESS_THAN,
	GREATER_EQUAL,
	LESS_EQUAL
}

func is_met() -> bool:
	match condition_type:
		ConditionType.NONE:
			return true
		ConditionType.QUEST_ACTIVE:
			return QuestManager.is_quest_active(target_value)
		ConditionType.QUEST_COMPLETED:
			return QuestManager.is_quest_completed(target_value)
		ConditionType.FRIENDSHIP_LEVEL:
			# TODO: Check NPC friendship level
			return true
		ConditionType.PLAYER_LEVEL:
			var player_level = GameManager.get_player_level()
			return compare_values(player_level, required_amount)
		_:
			return true

func compare_values(actual: int, required: int) -> bool:
	match comparison_operator:
		ComparisonOperator.EQUALS:
			return actual == required
		ComparisonOperator.GREATER_THAN:
			return actual > required
		ComparisonOperator.LESS_THAN:
			return actual < required
		ComparisonOperator.GREATER_EQUAL:
			return actual >= required
		ComparisonOperator.LESS_EQUAL:
			return actual <= required
		_:
			return false