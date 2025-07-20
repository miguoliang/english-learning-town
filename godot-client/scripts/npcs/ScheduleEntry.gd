extends Resource
class_name ScheduleEntry

@export var start_hour: int = 9
@export var end_hour: int = 17
@export var location_id: String = ""
@export var activity: String = ""
@export var is_available: bool = true
@export var dialogue_set: String = ""

func _init(start: int = 9, end: int = 17, location: String = "", available: bool = true):
	start_hour = start
	end_hour = end
	location_id = location
	is_available = available

func is_active_now() -> bool:
	var current_time = Time.get_datetime_dict_from_system()
	var current_hour = current_time.hour
	return start_hour <= current_hour and current_hour < end_hour

func get_time_range_text() -> String:
	return "%02d:00 - %02d:00" % [start_hour, end_hour]