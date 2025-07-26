class_name ZIndex
extends RefCounted

# Z-Index Hierarchy Constants
# Higher numbers render on top of lower numbers

# Background layer - map, environment
const BACKGROUND: int = -100

# Foreground layer - player, NPCs, game objects
const FOREGROUND: int = 0

# Conversation/Dialogue layer
const CONVERSATION: int = 100

# Modal dialogs (confirmation, settings, etc.)  
const MODAL_DIALOG: int = 200

# Tutorial system layer
const TUTORIAL: int = 300

# Debug overlay layer - highest priority
const DEBUG: int = 400

# Utility function to get layer name for debugging
static func get_layer_name(z_index: int) -> String:
	match z_index:
		BACKGROUND:
			return "BACKGROUND"
		FOREGROUND:
			return "FOREGROUND"
		CONVERSATION:
			return "CONVERSATION"
		MODAL_DIALOG:
			return "MODAL_DIALOG"
		TUTORIAL:
			return "TUTORIAL"
		DEBUG:
			return "DEBUG"
		_:
			return "CUSTOM(%d)" % z_index

# Utility function to print current hierarchy (for debugging)
static func print_hierarchy():
	print("=== Z-Index Hierarchy ===")
	print("DEBUG: %d" % DEBUG)
	print("TUTORIAL: %d" % TUTORIAL)
	print("MODAL_DIALOG: %d" % MODAL_DIALOG)
	print("CONVERSATION: %d" % CONVERSATION)
	print("FOREGROUND: %d" % FOREGROUND)
	print("BACKGROUND: %d" % BACKGROUND)
	print("========================")