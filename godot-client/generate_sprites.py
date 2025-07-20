#!/usr/bin/env python3
"""
Generate pixel-style sprites for the English Learning Town game
"""

from PIL import Image, ImageDraw
import os

def create_town_map(width=3840, height=2160):  # 4K resolution for fullscreen
    """Create a pixel-style town map background"""
    # Create image with grass base
    img = Image.new('RGB', (width, height), '#4a7c29')  # Grass green
    draw = ImageDraw.Draw(img)
    
    # Define colors
    road_color = '#6b6b6b'      # Gray road
    building_color = '#8b4513'   # Brown buildings
    roof_color = '#654321'       # Dark brown roofs
    door_color = '#2e1a0b'       # Dark brown doors
    window_color = '#87ceeb'     # Light blue windows
    tree_color = '#228b22'       # Forest green trees
    
    # Draw main roads (cross pattern)
    road_width = 64
    # Horizontal road
    draw.rectangle([0, height//2-road_width//2, width, height//2+road_width//2], fill=road_color)
    # Vertical road  
    draw.rectangle([width//2-road_width//2, 0, width//2+road_width//2, height], fill=road_color)
    
    # Add additional roads for larger map
    # Horizontal roads
    draw.rectangle([0, height//4-road_width//2, width, height//4+road_width//2], fill=road_color)
    draw.rectangle([0, 3*height//4-road_width//2, width, 3*height//4+road_width//2], fill=road_color)
    # Vertical roads
    draw.rectangle([width//4-road_width//2, 0, width//4+road_width//2, height], fill=road_color)
    draw.rectangle([3*width//4-road_width//2, 0, 3*width//4+road_width//2, height], fill=road_color)
    
    # Draw buildings in quadrants - more buildings for larger map
    building_positions = []
    
    # Generate buildings in a grid pattern for widescreen map
    building_width = 120
    building_height = 80
    spacing = 180
    road_buffer = 80
    
    # Create a 4x6 grid of city blocks (wider for widescreen)
    for block_x in range(4):  # 4 blocks horizontally
        for block_y in range(6):  # 6 blocks vertically
            # Calculate block position avoiding roads
            if block_x == 0:
                base_x = 100
            elif block_x == 1:
                base_x = width//4 + road_buffer
            elif block_x == 2:
                base_x = width//2 + road_buffer
            else:
                base_x = 3*width//4 + road_buffer
                
            if block_y == 0:
                base_y = 100
            elif block_y == 1:
                base_y = height//4 + road_buffer
            elif block_y == 2:
                base_y = height//2 + road_buffer
            else:
                base_y = 3*height//4 + road_buffer
            
            # Add 2-4 buildings per block
            buildings_per_block = 3
            for i in range(buildings_per_block):
                for j in range(2):
                    x = base_x + i * (spacing//2)
                    y = base_y + j * (spacing//2)
                    
                    # Check bounds
                    if (x + building_width < width - 50 and y + building_height < height - 50 and
                        x > 50 and y > 50):
                        building_positions.append((x, y, x + building_width, y + building_height))
    
    # Draw buildings
    for x1, y1, x2, y2 in building_positions:
        # Building body
        draw.rectangle([x1, y1, x2, y2], fill=building_color)
        # Roof (triangle)
        roof_height = 20
        draw.polygon([
            (x1-5, y1),
            ((x1+x2)//2, y1-roof_height),
            (x2+5, y1)
        ], fill=roof_color)
        
        # Door
        door_width = 16
        door_height = 24
        door_x = x1 + (x2-x1-door_width)//2
        door_y = y2 - door_height
        draw.rectangle([door_x, door_y, door_x+door_width, y2], fill=door_color)
        
        # Windows
        window_size = 12
        window_y = y1 + 20
        # Left window
        if x2-x1 > 80:  # Only if building is wide enough
            draw.rectangle([x1+15, window_y, x1+15+window_size, window_y+window_size], fill=window_color)
            draw.rectangle([x2-15-window_size, window_y, x2-15, window_y+window_size], fill=window_color)
    
    # Add many more trees for larger map
    tree_positions = []
    import random
    random.seed(42)  # For consistent tree placement
    
    # Generate random tree positions, avoiding roads and buildings
    for _ in range(200):  # More trees for larger map
        x = random.randint(50, width - 50)
        y = random.randint(50, height - 50)
        
        # Avoid all roads
        road_buffer = 80
        if (height//2 - road_buffer < y < height//2 + road_buffer) or (width//2 - road_buffer < x < width//2 + road_buffer) or \
           (height//4 - road_buffer < y < height//4 + road_buffer) or (3*height//4 - road_buffer < y < 3*height//4 + road_buffer) or \
           (width//4 - road_buffer < x < width//4 + road_buffer) or (3*width//4 - road_buffer < x < 3*width//4 + road_buffer):
            continue
            
        # Check if too close to buildings
        too_close = False
        for bx1, by1, bx2, by2 in building_positions:
            if (bx1 - 40 < x < bx2 + 40) and (by1 - 40 < y < by2 + 40):
                too_close = True
                break
        
        if not too_close:
            tree_positions.append((x, y))
    
    for tx, ty in tree_positions:
        # Tree trunk
        draw.rectangle([tx-4, ty, tx+4, ty+20], fill='#8b4513')
        # Tree top (circle approximation)
        draw.ellipse([tx-15, ty-20, tx+15, ty+10], fill=tree_color)
    
    return img

def create_boy_avatar_front(size=32):
    """Create front-facing boy avatar (walking down - can see face)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#8b4513'
    shirt_color = '#4169e1'
    pants_color = '#000080'
    shoe_color = '#000000'
    eye_color = '#000000'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (front view)
    hair_y = head_y - 2 * scale
    draw.ellipse([head_x - scale, hair_y, head_x + head_size + scale, head_y + 6 * scale], fill=hair_color)
    
    # Eyes (both visible)
    eye_size = scale
    left_eye_x = head_x + 2 * scale
    right_eye_x = head_x + head_size - 3 * scale
    eye_y = head_y + 3 * scale
    draw.rectangle([left_eye_x, eye_y, left_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    draw.rectangle([right_eye_x, eye_y, right_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    
    # Nose (small dot)
    nose_x = head_x + head_size // 2
    nose_y = head_y + 5 * scale
    draw.rectangle([nose_x, nose_y, nose_x + scale, nose_y + scale], fill='#e6a084')
    
    # Body and limbs (same as before)
    body_width = 8 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Arms
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x - arm_width, body_y + scale, body_x, body_y + arm_height], fill=skin_color)
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    draw.rectangle([body_x + body_width - scale - leg_width, leg_y, body_x + body_width - scale, leg_y + leg_height], fill=pants_color)
    
    # Shoes
    shoe_width = 4 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale - scale//2, shoe_y, body_x + scale - scale//2 + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    draw.rectangle([body_x + body_width - scale - leg_width - scale//2, shoe_y, body_x + body_width - scale - scale//2, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_boy_avatar_back(size=32):
    """Create back-facing boy avatar (walking up - can see back of head)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#8b4513'
    shirt_color = '#4169e1'
    pants_color = '#000080'
    shoe_color = '#000000'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (back view - fuller hair)
    hair_y = head_y - 2 * scale
    draw.ellipse([head_x - scale, hair_y, head_x + head_size + scale, head_y + 8 * scale], fill=hair_color)
    
    # No eyes visible from back
    
    # Body and limbs (same as front)
    body_width = 8 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Arms
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x - arm_width, body_y + scale, body_x, body_y + arm_height], fill=skin_color)
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    draw.rectangle([body_x + body_width - scale - leg_width, leg_y, body_x + body_width - scale, leg_y + leg_height], fill=pants_color)
    
    # Shoes
    shoe_width = 4 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale - scale//2, shoe_y, body_x + scale - scale//2 + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    draw.rectangle([body_x + body_width - scale - leg_width - scale//2, shoe_y, body_x + body_width - scale - scale//2, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_boy_avatar_side(size=32):
    """Create side-facing boy avatar (walking left/right - profile view)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#8b4513'
    shirt_color = '#4169e1'
    pants_color = '#000080'
    shoe_color = '#000000'
    eye_color = '#000000'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head (profile)
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (side view)
    hair_y = head_y - 2 * scale
    draw.ellipse([head_x - scale, hair_y, head_x + head_size + 2 * scale, head_y + 7 * scale], fill=hair_color)
    
    # One eye visible (side view)
    eye_size = scale
    eye_x = head_x + head_size - 3 * scale
    eye_y = head_y + 3 * scale
    draw.rectangle([eye_x, eye_y, eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    
    # Nose (profile)
    nose_x = head_x + head_size - scale
    nose_y = head_y + 4 * scale
    draw.rectangle([nose_x, nose_y, nose_x + 2 * scale, nose_y + 2 * scale], fill='#e6a084')
    
    # Body (profile - narrower)
    body_width = 6 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Arms (only one visible from side)
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs (profile)
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    
    # Shoes (side view)
    shoe_width = 5 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale, shoe_y, body_x + scale + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_girl_avatar_front(size=32):
    """Create front-facing girl avatar (walking down - can see face)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#654321'  # Brown hair
    shirt_color = '#ff69b4'  # Hot pink shirt
    pants_color = '#800080'  # Purple pants
    shoe_color = '#000000'
    eye_color = '#000000'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (front view - longer hair)
    hair_y = head_y - 3 * scale
    draw.ellipse([head_x - 2 * scale, hair_y, head_x + head_size + 2 * scale, head_y + 8 * scale], fill=hair_color)
    
    # Eyes (both visible)
    eye_size = scale
    left_eye_x = head_x + 2 * scale
    right_eye_x = head_x + head_size - 3 * scale
    eye_y = head_y + 3 * scale
    draw.rectangle([left_eye_x, eye_y, left_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    draw.rectangle([right_eye_x, eye_y, right_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    
    # Nose (small dot)
    nose_x = head_x + head_size // 2
    nose_y = head_y + 5 * scale
    draw.rectangle([nose_x, nose_y, nose_x + scale, nose_y + scale], fill='#e6a084')
    
    # Body and limbs
    body_width = 8 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Arms
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x - arm_width, body_y + scale, body_x, body_y + arm_height], fill=skin_color)
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    draw.rectangle([body_x + body_width - scale - leg_width, leg_y, body_x + body_width - scale, leg_y + leg_height], fill=pants_color)
    
    # Shoes
    shoe_width = 4 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale - scale//2, shoe_y, body_x + scale - scale//2 + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    draw.rectangle([body_x + body_width - scale - leg_width - scale//2, shoe_y, body_x + body_width - scale - scale//2, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_girl_avatar_back(size=32):
    """Create back-facing girl avatar (walking up - can see back of head)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#654321'  # Brown hair
    shirt_color = '#ff69b4'  # Hot pink shirt
    pants_color = '#800080'  # Purple pants
    shoe_color = '#000000'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (back view - longer flowing hair)
    hair_y = head_y - 3 * scale
    draw.ellipse([head_x - 2 * scale, hair_y, head_x + head_size + 2 * scale, head_y + 10 * scale], fill=hair_color)
    
    # No eyes visible from back
    
    # Body and limbs (same as front)
    body_width = 8 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Arms
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x - arm_width, body_y + scale, body_x, body_y + arm_height], fill=skin_color)
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    draw.rectangle([body_x + body_width - scale - leg_width, leg_y, body_x + body_width - scale, leg_y + leg_height], fill=pants_color)
    
    # Shoes
    shoe_width = 4 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale - scale//2, shoe_y, body_x + scale - scale//2 + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    draw.rectangle([body_x + body_width - scale - leg_width - scale//2, shoe_y, body_x + body_width - scale - scale//2, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_girl_avatar_side(size=32):
    """Create side-facing girl avatar (walking left/right - profile view)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#654321'  # Brown hair
    shirt_color = '#ff69b4'  # Hot pink shirt
    pants_color = '#800080'  # Purple pants
    shoe_color = '#000000'
    eye_color = '#000000'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head (profile)
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (side view - longer flowing hair)
    hair_y = head_y - 3 * scale
    draw.ellipse([head_x - 2 * scale, hair_y, head_x + head_size + 3 * scale, head_y + 9 * scale], fill=hair_color)
    
    # One eye visible (side view)
    eye_size = scale
    eye_x = head_x + head_size - 3 * scale
    eye_y = head_y + 3 * scale
    draw.rectangle([eye_x, eye_y, eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    
    # Nose (profile)
    nose_x = head_x + head_size - scale
    nose_y = head_y + 4 * scale
    draw.rectangle([nose_x, nose_y, nose_x + 2 * scale, nose_y + 2 * scale], fill='#e6a084')
    
    # Body (profile - narrower)
    body_width = 6 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Arms (only one visible from side)
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs (profile)
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    
    # Shoes (side view)
    shoe_width = 5 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale, shoe_y, body_x + scale + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_teacher_sprite(size=64):
    """Create a teacher NPC sprite"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#654321'  # Brown hair
    shirt_color = '#4b0082'  # Indigo shirt (professional)
    pants_color = '#2f4f4f'  # Dark slate gray pants
    shoe_color = '#000000'
    eye_color = '#000000'
    glasses_color = '#333333'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (more formal style)
    hair_y = head_y - 2 * scale
    draw.ellipse([head_x - scale, hair_y, head_x + head_size + scale, head_y + 5 * scale], fill=hair_color)
    
    # Glasses
    glasses_width = 6 * scale
    glasses_height = 3 * scale
    glasses_x = head_x + 2 * scale
    glasses_y = head_y + 3 * scale
    draw.rectangle([glasses_x, glasses_y, glasses_x + glasses_width, glasses_y + glasses_height], outline=glasses_color, width=scale)
    
    # Eyes behind glasses
    eye_size = scale
    left_eye_x = head_x + 3 * scale
    right_eye_x = head_x + head_size - 4 * scale
    eye_y = head_y + 4 * scale
    draw.rectangle([left_eye_x, eye_y, left_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    draw.rectangle([right_eye_x, eye_y, right_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    
    # Body (professional shirt)
    body_width = 8 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Collar
    collar_height = 2 * scale
    draw.rectangle([body_x + scale, body_y, body_x + body_width - scale, body_y + collar_height], fill='#ffffff')
    
    # Arms
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x - arm_width, body_y + scale, body_x, body_y + arm_height], fill=skin_color)
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    draw.rectangle([body_x + body_width - scale - leg_width, leg_y, body_x + body_width - scale, leg_y + leg_height], fill=pants_color)
    
    # Shoes
    shoe_width = 4 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale - scale//2, shoe_y, body_x + scale - scale//2 + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    draw.rectangle([body_x + body_width - scale - leg_width - scale//2, shoe_y, body_x + body_width - scale - scale//2, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_shopkeeper_sprite(size=64):
    """Create a shopkeeper NPC sprite"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    skin_color = '#fdbcb4'
    hair_color = '#8b7355'  # Light brown hair
    shirt_color = '#228b22'  # Forest green apron
    pants_color = '#8b4513'  # Saddle brown pants
    apron_color = '#ffffff'  # White apron
    shoe_color = '#654321'
    eye_color = '#000000'
    
    scale = size // 32
    if scale < 1: scale = 1
    
    # Head
    head_size = 10 * scale
    head_x = size // 2 - head_size // 2
    head_y = 2 * scale
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=skin_color)
    
    # Hair (friendly style)
    hair_y = head_y - 2 * scale
    draw.ellipse([head_x - scale, hair_y, head_x + head_size + scale, head_y + 6 * scale], fill=hair_color)
    
    # Eyes
    eye_size = scale
    left_eye_x = head_x + 2 * scale
    right_eye_x = head_x + head_size - 3 * scale
    eye_y = head_y + 3 * scale
    draw.rectangle([left_eye_x, eye_y, left_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    draw.rectangle([right_eye_x, eye_y, right_eye_x + eye_size, eye_y + eye_size], fill=eye_color)
    
    # Smile
    smile_x = head_x + 3 * scale
    smile_y = head_y + 6 * scale
    smile_width = 4 * scale
    draw.arc([smile_x, smile_y, smile_x + smile_width, smile_y + 2 * scale], 0, 180, fill=eye_color)
    
    # Body (shirt)
    body_width = 8 * scale
    body_height = 10 * scale
    body_x = size // 2 - body_width // 2
    body_y = head_y + head_size
    draw.rectangle([body_x, body_y, body_x + body_width, body_y + body_height], fill=shirt_color)
    
    # Apron
    apron_width = 6 * scale
    apron_height = 8 * scale
    apron_x = size // 2 - apron_width // 2
    apron_y = body_y + 2 * scale
    draw.rectangle([apron_x, apron_y, apron_x + apron_width, apron_y + apron_height], fill=apron_color)
    
    # Arms
    arm_width = 2 * scale
    arm_height = 8 * scale
    draw.rectangle([body_x - arm_width, body_y + scale, body_x, body_y + arm_height], fill=skin_color)
    draw.rectangle([body_x + body_width, body_y + scale, body_x + body_width + arm_width, body_y + arm_height], fill=skin_color)
    
    # Legs
    leg_width = 3 * scale
    leg_height = 8 * scale
    leg_y = body_y + body_height
    draw.rectangle([body_x + scale, leg_y, body_x + scale + leg_width, leg_y + leg_height], fill=pants_color)
    draw.rectangle([body_x + body_width - scale - leg_width, leg_y, body_x + body_width - scale, leg_y + leg_height], fill=pants_color)
    
    # Shoes
    shoe_width = 4 * scale
    shoe_height = 2 * scale
    shoe_y = leg_y + leg_height
    draw.rectangle([body_x + scale - scale//2, shoe_y, body_x + scale - scale//2 + shoe_width, shoe_y + shoe_height], fill=shoe_color)
    draw.rectangle([body_x + body_width - scale - leg_width - scale//2, shoe_y, body_x + body_width - scale - scale//2, shoe_y + shoe_height], fill=shoe_color)
    
    return img

def create_quest_indicator(size=32):
    """Create quest indicator sprites"""
    # Exclamation mark for new quests
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Yellow background circle
    draw.ellipse([2, 2, size-2, size-2], fill='#ffff00', outline='#000000', width=2)
    
    # Exclamation mark
    mark_width = size // 4
    mark_height = size // 2
    mark_x = size // 2 - mark_width // 2
    mark_y = size // 4
    
    # Main line
    draw.rectangle([mark_x, mark_y, mark_x + mark_width, mark_y + mark_height - 6], fill='#000000')
    
    # Dot
    dot_size = mark_width
    dot_y = mark_y + mark_height - 4
    draw.ellipse([mark_x, dot_y, mark_x + dot_size, dot_y + dot_size], fill='#000000')
    
    return img

def main():
    """Generate all sprites"""
    assets_dir = "/Users/frankmi/Repositories/english-learning-town/godot-client/assets/sprites"
    
    print("Generating pixel-style town map...")
    town_map = create_town_map(3840, 2160)  # 4K widescreen resolution
    town_map.save(os.path.join(assets_dir, "town_map.png"))
    print("✓ Town map saved")
    
    print("Generating boy avatar sprites...")
    # Create directional sprites
    size = 64
    
    # Front-facing (walking down)
    boy_front = create_boy_avatar_front(size)
    boy_front.save(os.path.join(assets_dir, "boy_front.png"))
    print("✓ Boy front sprite saved")
    
    # Back-facing (walking up)
    boy_back = create_boy_avatar_back(size)
    boy_back.save(os.path.join(assets_dir, "boy_back.png"))
    print("✓ Boy back sprite saved")
    
    # Side-facing (walking left/right)
    boy_side = create_boy_avatar_side(size)
    boy_side.save(os.path.join(assets_dir, "boy_side.png"))
    print("✓ Boy side sprite saved")
    
    print("Generating girl avatar sprites...")
    
    # Front-facing (walking down)
    girl_front = create_girl_avatar_front(size)
    girl_front.save(os.path.join(assets_dir, "girl_front.png"))
    print("✓ Girl front sprite saved")
    
    # Back-facing (walking up)
    girl_back = create_girl_avatar_back(size)
    girl_back.save(os.path.join(assets_dir, "girl_back.png"))
    print("✓ Girl back sprite saved")
    
    # Side-facing (walking left/right)
    girl_side = create_girl_avatar_side(size)
    girl_side.save(os.path.join(assets_dir, "girl_side.png"))
    print("✓ Girl side sprite saved")
    
    print("Generating NPC sprites...")
    # Teacher sprite
    teacher_sprite = create_teacher_sprite(64)
    teacher_sprite.save(os.path.join(assets_dir, "teacher.png"))
    print("✓ Teacher sprite saved")
    
    # Shopkeeper sprite
    shopkeeper_sprite = create_shopkeeper_sprite(64)
    shopkeeper_sprite.save(os.path.join(assets_dir, "shopkeeper.png"))
    print("✓ Shopkeeper sprite saved")
    
    # Quest indicator
    quest_indicator = create_quest_indicator(32)
    quest_indicator.save(os.path.join(assets_dir, "quest_indicator.png"))
    print("✓ Quest indicator saved")
    
    print("All sprites generated successfully!")

if __name__ == "__main__":
    main()