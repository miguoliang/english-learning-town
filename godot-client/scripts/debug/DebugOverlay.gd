extends CanvasLayer

# DebugOverlay - Shows FPS and debug information in development mode

signal debug_toggled(enabled: bool)

@export var debug_enabled: bool = false
@export var update_interval: float = 0.1  # Update every 100ms

@onready var debug_panel: Panel
@onready var fps_label: Label
@onready var memory_label: Label
@onready var nodes_label: Label
@onready var quest_info_label: Label
@onready var player_info_label: Label
@onready var debug_commands_label: Label
@onready var state_info_label: Label

var fps_history: Array[float] = []
var max_fps_history: int = 60
var update_timer: float = 0.0

func _ready():
	name = "DebugOverlay"
	layer = ZIndex.DEBUG  # Ensure it's on top using Z-Index constants
	
	# Add to debug_overlay group for GameStateManager integration
	add_to_group("debug_overlay")
	
	# Check if debug mode should be enabled
	debug_enabled = OS.is_debug_build() or OS.has_feature("debug")
	
	create_debug_ui()
	set_debug_visible(debug_enabled)
	
	print("DebugOverlay initialized (enabled: %s)" % debug_enabled)

func _input(event):
	# Debug input is now handled by GameStateManager for proper priority
	# This method is kept for compatibility but should not handle F-key inputs anymore
	# F-key inputs are handled by GameStateManager._handle_debug_input()
	pass

func _process(delta):
	if not debug_enabled:
		return
	
	update_timer += delta
	if update_timer >= update_interval:
		update_debug_info()
		update_timer = 0.0

func create_debug_ui():
	# Create debug panel
	debug_panel = Panel.new()
	debug_panel.name = "DebugPanel"
	debug_panel.size = Vector2(300, 400)
	debug_panel.position = Vector2(10, 10)
	debug_panel.modulate = Color(0, 0, 0, 0.7)  # Semi-transparent
	add_child(debug_panel)
	
	# Create container for debug info
	var vbox = VBoxContainer.new()
	vbox.name = "DebugContainer"
	vbox.position = Vector2(10, 10)
	vbox.size = Vector2(280, 380)
	debug_panel.add_child(vbox)
	
	# Create debug labels
	create_debug_labels(vbox)

func create_debug_labels(container: VBoxContainer):
	# Title
	var title_label = Label.new()
	title_label.text = "=== DEBUG INFO ==="
	title_label.add_theme_color_override("font_color", Color.YELLOW)
	title_label.add_theme_font_size_override("font_size", 16)
	container.add_child(title_label)
	
	# Separator
	var separator1 = HSeparator.new()
	container.add_child(separator1)
	
	# FPS Label
	fps_label = Label.new()
	fps_label.text = "FPS: --"
	fps_label.add_theme_color_override("font_color", Color.GREEN)
	fps_label.add_theme_font_size_override("font_size", 14)
	container.add_child(fps_label)
	
	# Memory Label
	memory_label = Label.new()
	memory_label.text = "Memory: --"
	memory_label.add_theme_color_override("font_color", Color.CYAN)
	container.add_child(memory_label)
	
	# Nodes Label
	nodes_label = Label.new()
	nodes_label.text = "Nodes: --"
	nodes_label.add_theme_color_override("font_color", Color.MAGENTA)
	container.add_child(nodes_label)
	
	# Separator
	var separator2 = HSeparator.new()
	container.add_child(separator2)
	
	# Quest Info
	quest_info_label = Label.new()
	quest_info_label.text = "Quest: --"
	quest_info_label.add_theme_color_override("font_color", Color.ORANGE)
	quest_info_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(quest_info_label)
	
	# Player Info
	player_info_label = Label.new()
	player_info_label.text = "Player: --"
	player_info_label.add_theme_color_override("font_color", Color.LIGHT_BLUE)
	player_info_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(player_info_label)
	
	# Separator
	var separator3 = HSeparator.new()
	container.add_child(separator3)
	
	# State Info
	state_info_label = Label.new()
	state_info_label.text = "State: --"
	state_info_label.add_theme_color_override("font_color", Color.YELLOW)
	state_info_label.add_theme_font_size_override("font_size", 12)
	state_info_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(state_info_label)
	
	# Separator
	var separator4 = HSeparator.new()
	container.add_child(separator4)
	
	# Debug Commands
	debug_commands_label = Label.new()
	debug_commands_label.text = "F3: Toggle Debug\nF4: Cycle Level\nF5: Start Tutorial\nF6: Reset Tutorial\nF7: Print State\nF8: Fix Stuck State"
	debug_commands_label.add_theme_color_override("font_color", Color.WHITE)
	debug_commands_label.add_theme_font_size_override("font_size", 10)
	debug_commands_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(debug_commands_label)

func update_debug_info():
	if not debug_enabled:
		return
	
	update_fps_info()
	update_memory_info()
	update_nodes_info()
	update_quest_info()
	update_player_info()
	update_state_info()

func update_fps_info():
	var current_fps = Engine.get_frames_per_second()
	
	# Track FPS history for average
	fps_history.append(current_fps)
	if fps_history.size() > max_fps_history:
		fps_history.pop_front()
	
	# Calculate average FPS
	var avg_fps = 0.0
	for fps in fps_history:
		avg_fps += fps
	avg_fps /= fps_history.size()
	
	# Get min/max FPS
	var min_fps = fps_history.min()
	var max_fps = fps_history.max()
	
	# Update FPS label with color coding
	var fps_text = "FPS: %d (avg: %.1f)\nMin: %d | Max: %d" % [current_fps, avg_fps, min_fps, max_fps]
	fps_label.text = fps_text
	
	# Color code based on performance
	if current_fps >= 50:
		fps_label.add_theme_color_override("font_color", Color.GREEN)
	elif current_fps >= 30:
		fps_label.add_theme_color_override("font_color", Color.YELLOW)
	else:
		fps_label.add_theme_color_override("font_color", Color.RED)

func update_memory_info():
	var static_memory = OS.get_static_memory_usage()
	var dynamic_memory = Performance.get_monitor(Performance.MEMORY_STATIC)
	
	var static_mb = static_memory / 1024.0 / 1024.0
	var dynamic_mb = dynamic_memory / 1024.0 / 1024.0
	
	memory_label.text = "Memory:\nStatic: %.1f MB\nDynamic: %.1f MB" % [static_mb, dynamic_mb]

func update_nodes_info():
	var tree = get_tree()
	if not tree:
		return
	
	var total_nodes = get_total_node_count(tree.root)
	var scene_nodes = 0
	if tree.current_scene:
		scene_nodes = get_total_node_count(tree.current_scene)
	
	nodes_label.text = "Nodes:\nTotal: %d\nScene: %d" % [total_nodes, scene_nodes]

func get_total_node_count(node: Node) -> int:
	var count = 1  # Count this node
	for child in node.get_children():
		count += get_total_node_count(child)
	return count

func update_quest_info():
	if not QuestManager:
		quest_info_label.text = "Quest: N/A"
		return
	
	var active_quests = QuestManager.get_active_quests()
	var completed_count = QuestManager.completed_quests.size()
	var current_quest = QuestManager.get_current_active_quest()
	
	var quest_text = "Quests:\nActive: %d\nCompleted: %d" % [active_quests.size(), completed_count]
	
	if current_quest:
		var current_obj = current_quest.get_current_objective()
		if current_obj:
			quest_text += "\n\nCurrent:\n%s\nObj: %s" % [current_quest.title, current_obj.description]
	
	quest_info_label.text = quest_text

func update_player_info():
	if not GameManager or not GameManager.is_player_logged_in:
		player_info_label.text = "Player: Not logged in"
		return
	
	var player = GameManager.current_player
	var player_node = get_tree().get_first_node_in_group("player")
	
	var player_text = "Player:\nName: %s\nLevel: %d\nMoney: $%d\nXP: %d" % [
		player.name, player.level, player.money, player.experience
	]
	
	if player_node:
		player_text += "\nPos: (%.0f, %.0f)" % [player_node.global_position.x, player_node.global_position.y]
		if player_node.has_method("get_velocity"):
			var velocity = player_node.velocity
			player_text += "\nVel: %.1f" % velocity.length()
	
	player_info_label.text = player_text

func update_state_info():
	"""Update game state information display"""
	var game_state_manager = get_node_or_null("/root/GameStateManager")
	if not game_state_manager:
		state_info_label.text = "State: GameStateManager not found"
		state_info_label.add_theme_color_override("font_color", Color.RED)
		return
	
	var state_info = game_state_manager.get_state_info()
	var state_text = "GAME STATE:\\nState: %s\\nMode: %s" % [state_info.state, state_info.mode]
	
	if state_info.input_blocked:
		state_text += "\\nINPUT BLOCKED\\nReason: %s" % state_info.input_block_reason
	else:
		state_text += "\\nInput Active"
	
	state_text += "\\nCan Move: %s" % ("YES" if state_info.can_player_move else "NO")
	state_text += "\\nTree Paused: %s" % ("YES" if get_tree().paused else "NO")
	
	# Color code based on state
	if state_info.input_blocked or get_tree().paused:
		state_info_label.add_theme_color_override("font_color", Color.RED)
	elif state_info.state == "TUTORIAL":
		state_info_label.add_theme_color_override("font_color", Color.CYAN)
	elif state_info.mode == "DIALOGUE":
		state_info_label.add_theme_color_override("font_color", Color.MAGENTA)
	else:
		state_info_label.add_theme_color_override("font_color", Color.GREEN)
	
	state_info_label.text = state_text

func toggle_debug():
	debug_enabled = not debug_enabled
	set_debug_visible(debug_enabled)
	debug_toggled.emit(debug_enabled)
	print("Debug overlay: %s" % ("ON" if debug_enabled else "OFF"))

func set_debug_visible(visible: bool):
	if debug_panel:
		debug_panel.visible = visible

func cycle_debug_level():
	# Cycle through different debug levels
	# For now, just toggle position
	if debug_panel.position.x < 100:
		debug_panel.position = Vector2(get_viewport().size.x - 320, 10)  # Move to right
	else:
		debug_panel.position = Vector2(10, 10)  # Move to left

func enable_debug():
	debug_enabled = true
	set_debug_visible(true)

func disable_debug():
	debug_enabled = false
	set_debug_visible(false)

# External API for other systems to add debug info
func add_debug_info(category: String, info: String):
	if not debug_enabled:
		return
	
	# Could extend to show custom debug info from other systems
	print("Debug [%s]: %s" % [category, info])

# Performance monitoring
func log_performance_warning(system: String, duration_ms: float, threshold_ms: float = 16.0):
	if duration_ms > threshold_ms:
		add_debug_info("PERF", "%s took %.2fms (>%.2fms)" % [system, duration_ms, threshold_ms])

# Memory monitoring
func check_memory_usage():
	var current_memory = OS.get_static_memory_usage() / 1024.0 / 1024.0
	var memory_threshold = 500.0  # 500MB threshold
	
	if current_memory > memory_threshold:
		add_debug_info("MEMORY", "High usage: %.1f MB" % current_memory)

# Tutorial debug functions
func start_tutorial_debug():
	"""Start tutorial via debug command"""
	if has_node("/root/TutorialManager"):
		print("Debug: Starting tutorial...")
		get_node("/root/TutorialManager").force_start_tutorial()
	else:
		print("Debug: TutorialManager not found")

func reset_tutorial_debug():
	"""Reset tutorial progress via debug command"""
	if has_node("/root/TutorialManager"):
		print("Debug: Resetting tutorial progress...")
		get_node("/root/TutorialManager").reset_tutorial_progress()
		print("Debug: Tutorial reset complete. Restart game to see tutorial again.")
	else:
		print("Debug: TutorialManager not found")