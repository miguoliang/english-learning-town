#!/usr/bin/env python3
"""
Convert CEFR vocabulary CSV files to JSON format.

This script reads CSV files from the EnglishLearningTown directory and converts
them to JSON format matching the VocabularyWord structure for use in the iOS app.
"""

import csv
import json
import os
from pathlib import Path


def convert_csv_to_json(csv_file_path: Path, json_file_path: Path) -> int:
    """
    Convert a CSV file to JSON format.
    
    Args:
        csv_file_path: Path to the input CSV file
        json_file_path: Path to the output JSON file
        
    Returns:
        Number of words converted
    """
    words = []
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                # Helper function to safely get and strip a field
                def safe_get(field_name):
                    value = row.get(field_name)
                    if value is None:
                        return ''
                    return str(value).strip() or ''
                
                # Skip empty rows
                if not safe_get('English Word'):
                    continue
                
                # Map CSV column names to JSON field names
                # Theme column is optional (B1 and B2 files don't have it)
                word = {
                    'englishWord': safe_get('English Word'),
                    'pos': safe_get('POS'),
                    'level': safe_get('Level'),
                    'chineseTranslation': safe_get('Chinese Translation'),
                    'exampleSentence': safe_get('Example Sentence'),
                    'selfExaminePrompt': safe_get('Self-Examine Prompt'),
                    'theme': safe_get('Theme')
                }
                words.append(word)
        
        # Write JSON file with pretty formatting
        with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(words, jsonfile, ensure_ascii=False, indent=2)
        
        return len(words)
    
    except FileNotFoundError:
        print(f"Error: CSV file not found: {csv_file_path}")
        return 0
    except KeyError as e:
        # Theme column is optional, so only error on required columns
        required_columns = ['English Word', 'POS', 'Level', 'Chinese Translation', 'Example Sentence', 'Self-Examine Prompt']
        if str(e).strip("'\"") in required_columns:
            print(f"Error: Missing required column in CSV: {e}")
            return 0
    except Exception as e:
        print(f"Error converting {csv_file_path}: {e}")
        return 0


def main():
    """Main function to convert all CEFR CSV files to JSON."""
    # Get the script directory and project root
    script_dir = Path(__file__).parent
    english_learning_dir = script_dir / 'EnglishLearningTown'
    
    if not english_learning_dir.exists():
        print(f"Error: EnglishLearningTown directory not found at {english_learning_dir}")
        return 1
    
    # CEFR levels to process
    levels = ['a1', 'a2', 'b1', 'b2']
    
    total_words = 0
    successful_conversions = 0
    
    print("Converting CSV files to JSON...")
    print("-" * 50)
    
    for level in levels:
        csv_filename = f'cefr-{level}.csv'
        json_filename = f'cefr-{level}.json'
        
        csv_path = english_learning_dir / csv_filename
        json_path = english_learning_dir / json_filename
        
        if csv_path.exists():
            word_count = convert_csv_to_json(csv_path, json_path)
            if word_count > 0:
                print(f"✓ {csv_filename} → {json_filename} ({word_count} words)")
                total_words += word_count
                successful_conversions += 1
            else:
                print(f"✗ Failed to convert {csv_filename}")
        else:
            print(f"✗ CSV file not found: {csv_filename}")
    
    print("-" * 50)
    print(f"Conversion complete: {successful_conversions}/{len(levels)} files converted")
    print(f"Total words: {total_words}")
    
    return 0 if successful_conversions == len(levels) else 1


if __name__ == '__main__':
    exit(main())

