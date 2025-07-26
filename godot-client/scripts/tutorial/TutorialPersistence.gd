extends Node
class_name TutorialPersistence

# TutorialPersistence - Handles saving and loading tutorial progress
# Manages tutorial completion state and user preferences

const TUTORIAL_CONFIG_PATH = "user://tutorial_progress.cfg"

static func has_tutorial_save_data() -> bool:
	"""Check if player has completed tutorial before"""
	var config = ConfigFile.new()
	var err = config.load(TUTORIAL_CONFIG_PATH)
	if err != OK:
		return false
	return config.get_value("tutorial", "completed", false)

static func save_tutorial_progress():
	"""Save tutorial completion to prevent showing again"""
	var config = ConfigFile.new()
	config.set_value("tutorial", "completed", true)
	config.set_value("tutorial", "completion_date", Time.get_datetime_string_from_system())
	config.save(TUTORIAL_CONFIG_PATH)

static func reset_tutorial_progress():
	"""Reset tutorial progress (for testing)"""
	var config = ConfigFile.new()
	config.set_value("tutorial", "completed", false)
	config.save(TUTORIAL_CONFIG_PATH)
	print("Tutorial progress reset")

static func get_tutorial_completion_date() -> String:
	"""Get the date when tutorial was completed"""
	var config = ConfigFile.new()
	var err = config.load(TUTORIAL_CONFIG_PATH)
	if err != OK:
		return ""
	return config.get_value("tutorial", "completion_date", "")