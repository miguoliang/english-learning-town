extends Node
class_name TutorialHighlighter

# TutorialHighlighter - Handles visual highlighting during tutorial
# Creates visual effects to guide player attention

func highlight_element(element_name: String):
	"""Highlight a specific UI element or game object"""
	match element_name:
		"player":
			highlight_player()
		"teacher":
			highlight_npc("teacher")
		"quest_panel":
			highlight_ui_element("quest_panel")
		"dialogue_ui":
			highlight_ui_element("dialogue_ui")

func highlight_player():
	"""Add visual highlight to the player"""
	var player = get_tree().get_first_node_in_group("player")
	if player:
		create_highlight_effect(player.global_position, Vector2(48, 48))

func highlight_npc(npc_name: String):
	"""Add visual highlight to specific NPC"""
	var npcs = get_tree().get_nodes_in_group("npcs")
	for npc in npcs:
		if npc.npc_data and npc.npc_data.name.to_lower().contains(npc_name.to_lower()):
			create_highlight_effect(npc.global_position, Vector2(48, 48))
			break

func highlight_ui_element(element_name: String):
	"""Add visual highlight to UI elements"""
	var scene_controller = get_tree().current_scene
	match element_name:
		"quest_panel":
			var quest_panel = scene_controller.get_node_or_null("UI/HUD/QuestPanel")
			if quest_panel:
				create_ui_highlight(quest_panel)

func create_highlight_effect(world_pos: Vector2, size: Vector2):
	"""Create a visual highlight effect at world position"""
	var highlight = ColorRect.new()
	highlight.color = Color(1, 1, 0, 0.3)  # Yellow with transparency
	highlight.size = size
	highlight.position = world_pos - size / 2
	
	# Add pulsing animation
	var tween = create_tween()
	tween.set_loops()
	tween.tween_property(highlight, "modulate:a", 0.1, 1.0)
	tween.tween_property(highlight, "modulate:a", 0.5, 1.0)
	
	get_tree().current_scene.add_child(highlight)
	
	# Clean up after step
	var cleanup_timer = Timer.new()
	cleanup_timer.wait_time = 10.0
	cleanup_timer.one_shot = true
	cleanup_timer.timeout.connect(func(): highlight.queue_free())
	add_child(cleanup_timer)
	cleanup_timer.start()

func create_ui_highlight(ui_element: Control):
	"""Create highlight effect for UI elements"""
	if not ui_element:
		return
		
	var highlight = ColorRect.new()
	highlight.color = Color(1, 1, 0, 0.2)
	highlight.size = ui_element.size
	highlight.position = Vector2.ZERO
	
	# Add to UI element
	ui_element.add_child(highlight)
	
	# Animate
	var tween = create_tween()
	tween.set_loops()
	tween.tween_property(highlight, "modulate:a", 0.05, 1.0)
	tween.tween_property(highlight, "modulate:a", 0.3, 1.0)
	
	# Clean up
	var cleanup_timer = Timer.new()
	cleanup_timer.wait_time = 8.0
	cleanup_timer.one_shot = true
	cleanup_timer.timeout.connect(func(): highlight.queue_free())
	add_child(cleanup_timer)
	cleanup_timer.start()