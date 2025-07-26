extends Control
class_name QuestDetailsPanel

# QuestDetailsPanel - Displays detailed information about selected quest
# Shows quest description, objectives, and rewards

var quest_title_label: Label
var quest_description_label: RichTextLabel
var objectives_container: VBoxContainer
var rewards_container: VBoxContainer

func initialize(title_label: Label, description_label: RichTextLabel, 
				objectives_cont: VBoxContainer, rewards_cont: VBoxContainer):
	quest_title_label = title_label
	quest_description_label = description_label
	objectives_container = objectives_cont
	rewards_container = rewards_cont

func display_quest_details(quest: QuestData):
	"""Display detailed information for the selected quest"""
	if not quest:
		clear_quest_details()
		return
	
	# Update quest title
	quest_title_label.text = quest.title
	
	# Update quest description with rich text formatting
	var description_text = "[font_size=14]%s[/font_size]" % quest.description
	if quest.short_description and quest.short_description != "":
		description_text += "\n\n[i]%s[/i]" % quest.short_description
	
	quest_description_label.text = description_text
	
	# Display objectives
	display_objectives(quest)
	
	# Display rewards
	display_rewards(quest)

func display_objectives(quest: QuestData):
	"""Display quest objectives"""
	# Clear existing objectives
	for child in objectives_container.get_children():
		child.queue_free()
	
	# Add objectives header
	var objectives_header = Label.new()
	objectives_header.text = "Objectives:"
	objectives_header.add_theme_font_size_override("font_size", 16)
	objectives_header.add_theme_color_override("font_color", Color.CYAN)
	objectives_container.add_child(objectives_header)
	
	if quest.objectives.is_empty():
		var no_objectives = Label.new()
		no_objectives.text = "No specific objectives"
		no_objectives.add_theme_color_override("font_color", Color.GRAY)
		objectives_container.add_child(no_objectives)
		return
	
	# Add each objective
	for i in range(quest.objectives.size()):
		var objective = quest.objectives[i]
		var objective_container = HBoxContainer.new()
		
		# Checkbox/status indicator
		var status_label = Label.new()
		if objective.is_completed:
			status_label.text = "✓"
			status_label.add_theme_color_override("font_color", Color.GREEN)
		else:
			status_label.text = "□"
			status_label.add_theme_color_override("font_color", Color.WHITE)
		
		# Objective text
		var objective_text = Label.new()
		objective_text.text = objective.description
		objective_text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		
		if objective.is_completed:
			objective_text.add_theme_color_override("font_color", Color.LIGHT_GREEN)
		else:
			objective_text.add_theme_color_override("font_color", Color.WHITE)
		
		# Add progress if applicable
		if objective.has_method("get_progress") and not objective.is_completed:
			var progress = objective.get_progress()
			if progress.has("current") and progress.has("total"):
				objective_text.text += " (%d/%d)" % [progress.current, progress.total]
		
		objective_container.add_child(status_label)
		objective_container.add_child(objective_text)
		objectives_container.add_child(objective_container)

func display_rewards(quest: QuestData):
	"""Display quest rewards"""
	# Clear existing rewards
	for child in rewards_container.get_children():
		child.queue_free()
	
	# Add rewards header
	var rewards_header = Label.new()
	rewards_header.text = "Rewards:"
	rewards_header.add_theme_font_size_override("font_size", 16)
	rewards_header.add_theme_color_override("font_color", Color.GOLD)
	rewards_container.add_child(rewards_header)
	
	var has_rewards = false
	
	# Experience reward
	if quest.experience_reward > 0:
		var exp_reward = Label.new()
		exp_reward.text = "📈 %d Experience" % quest.experience_reward
		exp_reward.add_theme_color_override("font_color", Color.CYAN)
		rewards_container.add_child(exp_reward)
		has_rewards = true
	
	# Money reward  
	if quest.money_reward > 0:
		var money_reward = Label.new()
		money_reward.text = "💰 %d Coins" % quest.money_reward
		money_reward.add_theme_color_override("font_color", Color.YELLOW)
		rewards_container.add_child(money_reward)
		has_rewards = true
	
	# Item rewards (if quest has items field)
	if quest.has_method("get_item_rewards"):
		var items = quest.get_item_rewards()
		for item in items:
			var item_reward = Label.new()
			item_reward.text = "🎁 %s" % item.name
			item_reward.add_theme_color_override("font_color", Color.LIGHT_BLUE)
			rewards_container.add_child(item_reward)
			has_rewards = true
	
	if not has_rewards:
		var no_rewards = Label.new()
		no_rewards.text = "No additional rewards"
		no_rewards.add_theme_color_override("font_color", Color.GRAY)
		rewards_container.add_child(no_rewards)

func clear_quest_details():
	"""Clear all quest details"""
	quest_title_label.text = "Select a quest"
	quest_description_label.text = ""
	
	# Clear objectives
	for child in objectives_container.get_children():
		child.queue_free()
	
	# Clear rewards
	for child in rewards_container.get_children():
		child.queue_free()

func update_quest_progress(quest: QuestData):
	"""Update quest progress display"""
	if quest == null:
		return
	
	# Refresh the entire display
	display_quest_details(quest)