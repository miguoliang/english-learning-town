extends Node
class_name PlayerCamera

# PlayerCamera - Manages camera following with map bounds

@onready var camera: Camera2D
@onready var player: CharacterBody2D

# Map bounds - these will be set based on the map size
var map_bounds: Rect2
var screen_size: Vector2
var half_screen: Vector2

# Camera settings
var follow_enabled: bool = true
var bounds_enabled: bool = true

func initialize(camera_node: Camera2D, player_node: CharacterBody2D):
	camera = camera_node
	player = player_node
	
	# Get screen size
	screen_size = get_viewport().get_visible_rect().size
	half_screen = screen_size * 0.5
	
	# Calculate map bounds
	calculate_map_bounds()
	
	# Set up camera limits
	setup_camera_limits()
	
	print("PlayerCamera initialized with bounds: ", map_bounds)

func calculate_map_bounds():
	"""Calculate the map bounds based on the town map sprite"""
	var town_map = get_tree().get_first_node_in_group("town_map")
	if not town_map:
		# Try alternative path
		town_map = get_node_or_null("../../Environment/TownMap")
	if not town_map:
		print("Warning: TownMap not found, using default bounds")
		map_bounds = Rect2(-1000, -1000, 2000, 2000)
		return
	
	var texture = town_map.texture
	if not texture:
		print("Warning: TownMap texture not found, using default bounds")
		map_bounds = Rect2(-1000, -1000, 2000, 2000)
		return
	
	# Get texture size
	var texture_size = texture.get_size()
	
	# Calculate bounds (town map is centered at origin)
	var half_width = texture_size.x * 0.5
	var half_height = texture_size.y * 0.5
	
	map_bounds = Rect2(-half_width, -half_height, texture_size.x, texture_size.y)
	
	print("Map bounds calculated: %s (texture size: %s)" % [map_bounds, texture_size])

func setup_camera_limits():
	"""Set up camera limits based on map bounds and screen size"""
	if not camera or not bounds_enabled:
		return
	
	# Account for camera zoom
	var zoom_factor = camera.zoom.x
	var effective_half_screen = half_screen / zoom_factor
	
	# Calculate camera limits (where camera center can be)
	var limit_left = map_bounds.position.x + effective_half_screen.x
	var limit_top = map_bounds.position.y + effective_half_screen.y
	var limit_right = map_bounds.end.x - effective_half_screen.x
	var limit_bottom = map_bounds.end.y - effective_half_screen.y
	
	# Ensure limits are valid (map is larger than screen)
	if limit_right < limit_left:
		# Map is smaller than screen horizontally - center it
		var center_x = map_bounds.position.x + map_bounds.size.x * 0.5
		limit_left = center_x
		limit_right = center_x
	
	if limit_bottom < limit_top:
		# Map is smaller than screen vertically - center it
		var center_y = map_bounds.position.y + map_bounds.size.y * 0.5
		limit_top = center_y
		limit_bottom = center_y
	
	# Apply limits to camera
	camera.limit_left = int(limit_left)
	camera.limit_top = int(limit_top)
	camera.limit_right = int(limit_right)
	camera.limit_bottom = int(limit_bottom)
	
	print("Camera limits set: left=%d, top=%d, right=%d, bottom=%d" % [
		camera.limit_left, camera.limit_top, camera.limit_right, camera.limit_bottom
	])

func _ready():
	# Wait one frame for scene to be fully loaded
	await get_tree().process_frame
	
	# Initialize if not done yet
	if not camera and get_parent().has_method("get"):
		var player_node = get_parent()
		if player_node.has_node("Camera2D"):
			initialize(player_node.get_node("Camera2D"), player_node)
	
	# Connect to viewport size changes
	get_viewport().size_changed.connect(_on_viewport_size_changed)

func _on_viewport_size_changed():
	"""Handle viewport size changes"""
	screen_size = get_viewport().get_visible_rect().size
	half_screen = screen_size * 0.5
	setup_camera_limits()

func update_camera_position():
	"""Manually update camera position if needed"""
	if not camera or not player or not follow_enabled:
		return
	
	# Camera automatically follows player since it's a child
	# This function is here for any additional camera logic

func set_follow_enabled(enabled: bool):
	"""Enable or disable camera following"""
	follow_enabled = enabled

func set_bounds_enabled(enabled: bool):
	"""Enable or disable boundary limits"""
	bounds_enabled = enabled
	if enabled:
		setup_camera_limits()
	else:
		# Remove limits
		if camera:
			camera.limit_left = -10000000
			camera.limit_top = -10000000
			camera.limit_right = 10000000
			camera.limit_bottom = 10000000

func get_camera_bounds() -> Rect2:
	"""Get the current camera bounds"""
	return map_bounds

func is_at_map_edge() -> Dictionary:
	"""Check if camera is at map edges"""
	if not camera:
		return {"left": false, "right": false, "top": false, "bottom": false}
	
	var pos = camera.global_position
	var tolerance = 1.0  # Small tolerance for floating point comparison
	
	return {
		"left": abs(pos.x - camera.limit_left) < tolerance,
		"right": abs(pos.x - camera.limit_right) < tolerance,
		"top": abs(pos.y - camera.limit_top) < tolerance,
		"bottom": abs(pos.y - camera.limit_bottom) < tolerance
	}

# Debug methods
func debug_print_info():
	"""Print debug information about camera state"""
	print("=== PlayerCamera Debug Info ===")
	print("Follow enabled: ", follow_enabled)
	print("Bounds enabled: ", bounds_enabled)
	print("Map bounds: ", map_bounds)
	print("Screen size: ", screen_size)
	if camera:
		print("Camera position: ", camera.global_position)
		print("Camera zoom: ", camera.zoom)
		print("Camera limits: left=%d, top=%d, right=%d, bottom=%d" % [
			camera.limit_left, camera.limit_top, camera.limit_right, camera.limit_bottom
		])
	print("At edges: ", is_at_map_edge())
	print("===============================")