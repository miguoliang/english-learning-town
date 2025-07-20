extends Node

# AudioManager - Handles all game audio including sound effects and music
# This is a singleton that can be accessed from anywhere in the game

signal audio_enabled_changed(enabled: bool)

# Audio settings
var master_volume: float = 1.0
var sfx_volume: float = 0.8
var music_volume: float = 0.6
var audio_enabled: bool = true

# Audio players for different types of sounds
var sfx_players: Array[AudioStreamPlayer] = []
var music_player: AudioStreamPlayer
var ui_player: AudioStreamPlayer

# Sound effect pool size
const SFX_POOL_SIZE = 8

func _ready():
	print("AudioManager initialized")
	setup_audio_players()

func setup_audio_players():
	# Create music player
	music_player = AudioStreamPlayer.new()
	music_player.name = "MusicPlayer"
	music_player.volume_db = linear_to_db(music_volume)
	add_child(music_player)
	
	# Create UI sound player
	ui_player = AudioStreamPlayer.new()
	ui_player.name = "UIPlayer"
	ui_player.volume_db = linear_to_db(sfx_volume)
	add_child(ui_player)
	
	# Create pool of SFX players
	for i in range(SFX_POOL_SIZE):
		var sfx_player = AudioStreamPlayer.new()
		sfx_player.name = "SFXPlayer" + str(i)
		sfx_player.volume_db = linear_to_db(sfx_volume)
		sfx_players.append(sfx_player)
		add_child(sfx_player)

func play_sfx(sound_name: String, pitch: float = 1.0):
	"""Play a sound effect"""
	if not audio_enabled:
		return
	
	# Debug: Print sound effect for now - will replace with actual audio later
	print("🔊 Playing SFX: ", sound_name, " (pitch: ", pitch, ")")
	
	# Try to play a simple beep sound using AudioStreamGenerator
	var available_player = get_available_sfx_player()
	if available_player:
		play_simple_beep(available_player, sound_name, pitch)

func play_simple_beep(player: AudioStreamPlayer, sound_name: String, pitch: float):
	"""Play a simple beep sound using procedural generation"""
	# Create procedural audio data
	var sample_rate = 22050
	var duration = get_sound_duration(sound_name)
	var frequency = get_sound_frequency(sound_name) * pitch
	var samples = int(sample_rate * duration)
	
	# Generate sine wave samples as 16-bit integers
	var audio_data = PackedByteArray()
	audio_data.resize(samples * 2)  # 2 bytes per 16-bit sample
	
	for i in range(samples):
		var t = float(i) / sample_rate
		var amplitude = 0.3 * exp(-t * 3.0)  # Decay envelope
		var sample_float = amplitude * sin(2.0 * PI * frequency * t)
		
		# Convert to 16-bit signed integer
		var sample_int = int(sample_float * 32767.0)
		sample_int = clamp(sample_int, -32768, 32767)
		
		# Store as little-endian 16-bit
		audio_data[i * 2] = sample_int & 0xFF
		audio_data[i * 2 + 1] = (sample_int >> 8) & 0xFF
	
	# Create AudioStreamWAV
	var stream = AudioStreamWAV.new()
	stream.data = audio_data
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = sample_rate
	stream.stereo = false
	
	player.stream = stream
	player.pitch_scale = 1.0  # Don't double-apply pitch
	player.volume_db = linear_to_db(0.4)
	player.play()

func get_sound_frequency(sound_name: String) -> float:
	"""Get base frequency for different sound types"""
	match sound_name:
		"footstep": return 200.0
		"interact": return 440.0
		"dialogue_open": return 523.0
		"dialogue_close": return 392.0
		"button_hover": return 800.0
		"button_click": return 1000.0
		_: return 440.0

func get_sound_duration(sound_name: String) -> float:
	"""Get duration for different sound types"""
	match sound_name:
		"footstep": return 0.1
		"interact": return 0.2
		"dialogue_open": return 0.3
		"dialogue_close": return 0.3
		"button_hover": return 0.05
		"button_click": return 0.1
		_: return 0.1

func play_placeholder_tone(frequency: float, duration: float, pitch: float = 1.0):
	"""Generate a simple tone as placeholder for actual sound effects"""
	var available_player = get_available_sfx_player()
	if not available_player:
		return
	
	# Create a simple sine wave using AudioStreamGenerator
	var stream = AudioStreamGenerator.new()
	stream.mix_rate = 44100.0
	stream.buffer_length = 0.1  # Small buffer for responsiveness
	
	available_player.stream = stream
	available_player.pitch_scale = pitch
	
	# Connect to the generator's buffer to fill it with sine wave data
	if not available_player.finished.is_connected(_on_audio_finished):
		available_player.finished.connect(_on_audio_finished)
	
	# Store the frequency for the audio generation
	available_player.set_meta("frequency", frequency)
	available_player.set_meta("duration", duration)
	available_player.set_meta("start_time", Time.get_time_dict_from_system())
	
	available_player.play()
	
	# Stop the player after duration
	var timer = Timer.new()
	timer.wait_time = duration
	timer.one_shot = true
	timer.timeout.connect(func(): 
		if available_player.playing:
			available_player.stop()
		timer.queue_free()
	)
	add_child(timer)
	timer.start()

func _on_audio_finished():
	"""Handle when audio playback finishes"""
	pass

func get_available_sfx_player() -> AudioStreamPlayer:
	"""Find an available SFX player from the pool"""
	for player in sfx_players:
		if not player.playing:
			return player
	
	# If all players are busy, use the first one
	return sfx_players[0] if sfx_players.size() > 0 else null

func play_ui_sound(sound_name: String):
	"""Play UI-specific sounds"""
	if not audio_enabled:
		return
	
	match sound_name:
		"button_hover":
			play_sfx("button_hover")
		"button_click":
			play_sfx("button_click")
		"menu_open":
			play_sfx("dialogue_open", 1.2)
		"menu_close":
			play_sfx("dialogue_close", 0.8)

func set_master_volume(volume: float):
	"""Set master volume (0.0 to 1.0)"""
	master_volume = clamp(volume, 0.0, 1.0)
	update_all_volumes()

func set_sfx_volume(volume: float):
	"""Set sound effects volume (0.0 to 1.0)"""
	sfx_volume = clamp(volume, 0.0, 1.0)
	update_sfx_volumes()

func set_music_volume(volume: float):
	"""Set music volume (0.0 to 1.0)"""
	music_volume = clamp(volume, 0.0, 1.0)
	if music_player:
		music_player.volume_db = linear_to_db(music_volume * master_volume)

func update_all_volumes():
	"""Update all audio player volumes"""
	update_sfx_volumes()
	set_music_volume(music_volume)

func update_sfx_volumes():
	"""Update SFX player volumes"""
	var final_volume = sfx_volume * master_volume
	for player in sfx_players:
		player.volume_db = linear_to_db(final_volume)
	if ui_player:
		ui_player.volume_db = linear_to_db(final_volume)

func set_audio_enabled(enabled: bool):
	"""Enable or disable all audio"""
	audio_enabled = enabled
	audio_enabled_changed.emit(enabled)
	
	if not enabled:
		# Stop all playing sounds
		for player in sfx_players:
			player.stop()
		if ui_player:
			ui_player.stop()
		if music_player:
			music_player.stop()

func linear_to_db(linear_value: float) -> float:
	"""Convert linear volume to decibel scale"""
	if linear_value <= 0:
		return -80.0  # Essentially muted
	return 20.0 * log(linear_value) / log(10.0)