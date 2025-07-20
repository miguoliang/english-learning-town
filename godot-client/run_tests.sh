#!/bin/bash

# English Learning Town - Test Runner Script
# Runs all tests for the project using Godot's built-in test framework

set -e  # Exit on error

echo "=== English Learning Town Test Suite ==="
echo "Starting automated tests..."

# Configuration
GODOT_EXECUTABLE="godot"
PROJECT_PATH="."
TEST_RESULTS_DIR="test_results"

# Create test results directory
mkdir -p "$TEST_RESULTS_DIR"

# Function to run tests
run_test_suite() {
    local test_type=$1
    local test_path=$2
    
    echo ""
    echo "Running $test_type tests..."
    echo "----------------------------------------"
    
    # Run tests with Godot
    $GODOT_EXECUTABLE --headless --path "$PROJECT_PATH" --script test/TestBootstrap.gd --run-$test_type-tests 2>&1 | tee "$TEST_RESULTS_DIR/${test_type}_results.log"
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "✅ $test_type tests PASSED"
    else
        echo "❌ $test_type tests FAILED"
        return 1
    fi
}

# Function to run individual test files
run_individual_tests() {
    echo ""
    echo "Running individual test files..."
    echo "----------------------------------------"
    
    # Find all test files
    find test/ -name "Test*.gd" -type f | while read test_file; do
        echo "Running: $test_file"
        $GODOT_EXECUTABLE --headless --path "$PROJECT_PATH" --script "$test_file" 2>&1 | tee "$TEST_RESULTS_DIR/$(basename $test_file .gd)_results.log"
    done
}

# Main test execution
main() {
    echo "Godot version:"
    $GODOT_EXECUTABLE --version
    
    echo ""
    echo "Project path: $(pwd)"
    echo "Test results will be saved to: $TEST_RESULTS_DIR"
    
    # Run different test suites
    local exit_code=0
    
    # Unit tests
    if ! run_test_suite "unit" "test/unit"; then
        exit_code=1
    fi
    
    # Integration tests
    if ! run_test_suite "integration" "test/integration"; then
        exit_code=1
    fi
    
    # Scene tests
    if ! run_test_suite "scene" "test/scenes"; then
        exit_code=1
    fi
    
    # Generate test report
    generate_test_report
    
    echo ""
    echo "=== Test Summary ==="
    if [ $exit_code -eq 0 ]; then
        echo "🎉 ALL TESTS PASSED!"
    else
        echo "💥 Some tests failed. Check the logs for details."
    fi
    
    exit $exit_code
}

# Generate test report
generate_test_report() {
    echo ""
    echo "Generating test report..."
    
    local report_file="$TEST_RESULTS_DIR/test_report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>English Learning Town - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
        .pass { color: green; }
        .fail { color: red; }
        .log { background: #f9f9f9; padding: 10px; font-family: monospace; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>English Learning Town - Test Report</h1>
        <p>Generated on: $(date)</p>
        <p>Project: English Learning Town Quest System</p>
    </div>
    
    <div class="test-section">
        <h2>Test Results Summary</h2>
EOF

    # Add test results to report
    for log_file in "$TEST_RESULTS_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            echo "        <h3>$(basename "$log_file" .log)</h3>" >> "$report_file"
            echo "        <div class=\"log\">$(cat "$log_file")</div>" >> "$report_file"
        fi
    done
    
    cat >> "$report_file" << EOF
    </div>
</body>
</html>
EOF
    
    echo "Test report generated: $report_file"
}

# Check if help was requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --unit       Run only unit tests"
    echo "  --integration Run only integration tests"
    echo "  --scene      Run only scene tests"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all tests"
    echo "  $0 --unit       # Run only unit tests"
    echo "  $0 --integration # Run only integration tests"
    exit 0
fi

# Handle specific test type requests
case "$1" in
    --unit)
        run_test_suite "unit" "test/unit"
        ;;
    --integration)
        run_test_suite "integration" "test/integration"
        ;;
    --scene)
        run_test_suite "scene" "test/scenes"
        ;;
    *)
        main
        ;;
esac