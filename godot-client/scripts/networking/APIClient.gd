extends Node

# API Client for English Learning Town Go Backend
# Handles all HTTP requests to the Go server

signal player_data_received(player_data: Dictionary)
signal player_created(player_data: Dictionary)
signal player_updated(player_data: Dictionary)
signal player_stats_received(stats: Dictionary)
signal question_received(question: Dictionary)
signal interaction_result_received(result: Dictionary)
signal error_occurred(error_message: String)
signal health_check_completed(is_healthy: bool)

@export var base_url: String = "http://localhost:3000"
@export var timeout: float = 10.0
@export var debug_mode: bool = true

var http_request: HTTPRequest

func _ready():
	# Create HTTPRequest node
	http_request = HTTPRequest.new()
	add_child(http_request)
	http_request.timeout = timeout
	
	# Connect signals
	http_request.request_completed.connect(_on_request_completed)
	
	if debug_mode:
		print("APIClient initialized with base URL: ", base_url)

# Health check endpoint
func check_health():
	var url = base_url + "/health"
	_make_request(url, HTTPClient.METHOD_GET, [], "", "health_check")

# Player endpoints
func create_player(player_name: String, gender: String):
	var url = base_url + "/api/players/"
	var headers = ["Content-Type: application/json"]
	var data = {
		"name": player_name,
		"gender": gender
	}
	var json_data = JSON.stringify(data)
	_make_request(url, HTTPClient.METHOD_POST, headers, json_data, "create_player")

func get_player(player_id: String):
	var url = base_url + "/api/players/" + player_id
	_make_request(url, HTTPClient.METHOD_GET, [], "", "get_player")

func update_player(player_id: String, updates: Dictionary):
	var url = base_url + "/api/players/" + player_id
	var headers = ["Content-Type: application/json"]
	var json_data = JSON.stringify(updates)
	_make_request(url, HTTPClient.METHOD_PUT, headers, json_data, "update_player")

func get_player_stats(player_id: String):
	var url = base_url + "/api/players/" + player_id + "/stats"
	_make_request(url, HTTPClient.METHOD_GET, [], "", "get_player_stats")

# Question endpoints
func get_random_question(difficulty: String = "easy", category: String = "general"):
	var url = base_url + "/api/questions/random?difficulty=" + difficulty + "&category=" + category
	_make_request(url, HTTPClient.METHOD_GET, [], "", "get_random_question")

func get_all_questions(difficulty: String = "", category: String = ""):
	var url = base_url + "/api/questions/"
	var params = []
	if difficulty != "":
		params.append("difficulty=" + difficulty)
	if category != "":
		params.append("category=" + category)
	
	if params.size() > 0:
		url += "?" + "&".join(params)
	
	_make_request(url, HTTPClient.METHOD_GET, [], "", "get_all_questions")

# Interaction endpoints
func create_interaction(player_id: String, question_id: String, selected_answer: String):
	var url = base_url + "/api/interactions/"
	var headers = ["Content-Type: application/json"]
	var data = {
		"player_id": player_id,
		"question_id": question_id,
		"selected_answer": selected_answer
	}
	var json_data = JSON.stringify(data)
	_make_request(url, HTTPClient.METHOD_POST, headers, json_data, "create_interaction")

func get_player_interactions(player_id: String):
	var url = base_url + "/api/interactions/player/" + player_id
	_make_request(url, HTTPClient.METHOD_GET, [], "", "get_player_interactions")

# Private helper methods
func _make_request(url: String, method: int, headers: PackedStringArray, body: String, request_type: String):
	if debug_mode:
		var method_names = ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "TRACE", "CONNECT", "PATCH"]
		print("Making ", method_names[method], " request to: ", url)
		if body != "":
			print("Request body: ", body)
	
	# Check if HTTPRequest is initialized
	if not http_request:
		error_occurred.emit("HTTPRequest node not initialized")
		return
	
	# Store request type for handling response
	http_request.set_meta("request_type", request_type)
	
	var error = http_request.request(url, headers, method, body)
	if error != OK:
		var error_message = "Failed to make request: " + str(error)
		if debug_mode:
			print("Request error: ", error_message)
		error_occurred.emit(error_message)

func _on_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray):
	var request_type = http_request.get_meta("request_type", "unknown")
	
	if debug_mode:
		print("Request completed - Type: ", request_type, " Code: ", response_code)
	
	# Check for network errors
	if result != HTTPRequest.RESULT_SUCCESS:
		var error_message = "Network error: " + str(result)
		if debug_mode:
			print("Network error: ", error_message)
		error_occurred.emit(error_message)
		return
	
	# Parse response body
	var response_text = body.get_string_from_utf8()
	var json = JSON.new()
	var parse_result = json.parse(response_text)
	
	if parse_result != OK:
		var error_message = "Failed to parse JSON response"
		if debug_mode:
			print("JSON parse error: ", error_message, " - Response: ", response_text)
		error_occurred.emit(error_message)
		return
	
	var response_data = json.data
	
	# Handle different response codes
	if response_code >= 200 and response_code < 300:
		_handle_success_response(request_type, response_data)
	else:
		_handle_error_response(response_code, response_data)

func _handle_success_response(request_type: String, data):
	if debug_mode:
		print("Success response for ", request_type, ": ", data)
	
	match request_type:
		"health_check":
			health_check_completed.emit(true)
		"create_player":
			player_created.emit(data)
		"get_player":
			player_data_received.emit(data)
		"update_player":
			player_updated.emit(data)
		"get_player_stats":
			player_stats_received.emit(data)
		"get_random_question":
			question_received.emit(data)
		"get_all_questions":
			# Handle array of questions
			for question in data:
				question_received.emit(question)
		"create_interaction":
			interaction_result_received.emit(data)
		"get_player_interactions":
			# Handle array of interactions
			pass # Could emit a different signal for interaction history
		_:
			if debug_mode:
				print("Unknown request type: ", request_type)

func _handle_error_response(response_code: int, data):
	var error_message = "Server error (" + str(response_code) + ")"
	
	if typeof(data) == TYPE_DICTIONARY and data.has("error"):
		error_message += ": " + str(data.error)
	
	if debug_mode:
		print("Error response: ", error_message)
	
	if response_code == 404:
		error_message = "Resource not found"
	elif response_code == 400:
		error_message = "Invalid request"
	elif response_code >= 500:
		error_message = "Server error"
	
	error_occurred.emit(error_message)
