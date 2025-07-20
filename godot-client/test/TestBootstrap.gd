# TestBootstrap.gd
# Main test runner and setup for English Learning Town tests

extends SceneTree

const GdUnit = preload("res://addons/gdUnit4/src/GdUnit.gd")

func _init():
	print("=== English Learning Town Test Suite ===")
	print("Initializing test environment...")
	
	# Setup test environment
	setup_test_environment()
	
	# Run tests based on command line arguments
	var args = OS.get_cmdline_args()
	if "--run-tests" in args:
		run_all_tests()
	elif "--run-unit-tests" in args:
		run_unit_tests()
	elif "--run-integration-tests" in args:
		run_integration_tests()
	else:
		print("Test environment ready. Use --run-tests to execute all tests.")

func setup_test_environment():
	# Ensure singletons are available for testing
	print("Setting up test singletons...")
	
	# Mock or initialize GameManager
	if not Engine.has_singleton("GameManager"):
		print("Warning: GameManager singleton not available in test environment")
	
	# Mock or initialize QuestManager  
	if not Engine.has_singleton("QuestManager"):
		print("Warning: QuestManager singleton not available in test environment")

func run_all_tests():
	print("Running all tests...")
	run_unit_tests()
	run_integration_tests()
	run_scene_tests()

func run_unit_tests():
	print("Running unit tests...")
	var test_suite = GdUnit.test_suite()
	test_suite.add_test_case("res://test/unit/TestQuestManager.gd")
	test_suite.add_test_case("res://test/unit/TestNPCManager.gd")
	test_suite.add_test_case("res://test/unit/TestDialogueSystem.gd")
	test_suite.run()

func run_integration_tests():
	print("Running integration tests...")
	var test_suite = GdUnit.test_suite()
	test_suite.add_test_case("res://test/integration/TestQuestFlow.gd")
	test_suite.add_test_case("res://test/integration/TestNPCInteractions.gd")
	test_suite.run()

func run_scene_tests():
	print("Running scene tests...")
	var test_suite = GdUnit.test_suite()
	test_suite.add_test_case("res://test/scenes/TestTownExploration.gd")
	test_suite.run()

func _exit_tree():
	print("Test suite completed.")
	get_tree().quit()