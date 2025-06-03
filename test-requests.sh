#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"
WEBHOOK_URL="http://localhost:3000/test/webhook"

echo -e "${BLUE}🚀 Message Dispatcher Test Script${NC}"
echo "=================================="

make_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}📡 $description${NC}"
    echo "   Method: $method"
    echo "   URL: $url"
    
    if [ -n "$data" ]; then
        echo "   Data: $data"
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url")
    fi
    
    body=$(echo "$response" | sed '$d')
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "   ${GREEN}✅ Success ($status_code)${NC}"
        echo "   Response: $body"
    else
        echo -e "   ${RED}❌ Failed ($status_code)${NC}"
        echo "   Response: $body"
    fi
    
    sleep 1
}

test_health() {
    echo -e "\n${BLUE}🏥 Health Check${NC}"
    make_request "GET" "$API_URL/health" "" "Checking API health"
}

test_webhook_direct() {
    echo -e "\n${BLUE}🔧 Direct Webhook Tests${NC}"
    
    make_request "POST" "$WEBHOOK_URL?failureRate=0" \
        '{"test": "direct success", "timestamp": "'"$(date)"'"}' \
        "Direct webhook - 0% failure rate"
    
    make_request "POST" "$WEBHOOK_URL?failureRate=80" \
        '{"test": "direct high failure", "timestamp": "'"$(date)"'"}' \
        "Direct webhook - 80% failure rate"
}

test_message_creation() {
    echo -e "\n${BLUE}📨 Message Creation Tests${NC}"
    
    make_request "POST" "$API_URL/messages" \
        '{
            "type": "http",
            "destination": "'"$WEBHOOK_URL"'?failureRate=20",
            "payload": {
                "test": "http message",
                "timestamp": "'"$(date)"'",
                "scenario": "low_failure"
            }
        }' \
        "Creating HTTP message (20% failure rate)"
    
    make_request "POST" "$API_URL/messages" \
        '{
            "type": "http",
            "destination": "'"$WEBHOOK_URL"'?failureRate=70",
            "payload": {
                "test": "http message",
                "timestamp": "'"$(date)"'",
                "scenario": "high_failure"
            }
        }' \
        "Creating HTTP message (70% failure rate)"
    
    make_request "POST" "$API_URL/messages" \
        '{
            "type": "email",
            "destination": "test@example.com",
            "payload": {
                "subject": "Test Email",
                "body": "This is a test email",
                "timestamp": "'"$(date)"'"
            }
        }' \
        "Creating EMAIL message"
}

test_bulk_messages() {
    echo -e "\n${BLUE}📦 Bulk Message Tests${NC}"
    
    local count=10
    local failure_rate=40
    
    echo -e "${YELLOW}Creating $count HTTP messages with $failure_rate% failure rate...${NC}"
    
    for i in $(seq 1 $count); do
        echo -n "  Message $i/$count... "
        
        response=$(curl -s -w "%{http_code}" -X POST "$API_URL/messages" \
            -H "Content-Type: application/json" \
            -d '{
                "type": "http",
                "destination": "'"$WEBHOOK_URL"'?failureRate='"$failure_rate"'",
                "payload": {
                    "batch": '"$i"',
                    "test": "bulk message",
                    "timestamp": "'"$(date)"'",
                    "scenario": "bulk_test"
                }
            }')
        
        status_code=$(echo "$response" | tail -c 4)
        
        if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌ ($status_code)${NC}"
        fi
        
        sleep 0.5
    done
}

test_error_scenarios() {
    echo -e "\n${BLUE}💥 Error Scenario Tests${NC}"
    
    make_request "POST" "$API_URL/messages" \
        '{
            "type": "http",
            "destination": "'"$WEBHOOK_URL"'?failureRate=100",
            "payload": {
                "test": "timeout test",
                "timestamp": "'"$(date)"'",
                "scenario": "timeout"
            }
        }' \
        "Creating message for timeout test"
    
    make_request "POST" "$API_URL/messages" \
        '{
            "type": "http",
            "destination": "http://invalid-host-that-does-not-exist:9999/webhook",
            "payload": {
                "test": "invalid destination",
                "timestamp": "'"$(date)"'",
                "scenario": "invalid_host"
            }
        }' \
        "Creating message with invalid destination"
}

show_metrics() {
    echo -e "\n${BLUE}📊 Current Metrics${NC}"
    make_request "GET" "$API_URL/metrics" "" "Fetching Prometheus metrics"
}

show_menu() {
    echo -e "\n${BLUE}📋 Available Tests:${NC}"
    echo "1. Health Check"
    echo "2. Direct Webhook Tests"
    echo "3. Message Creation Tests"
    echo "4. Bulk Messages (10x)"
    echo "5. Error Scenarios"
    echo "6. Show Metrics"
    echo "7. Run All Tests"
    echo "8. Exit"
}

run_all_tests() {
    echo -e "\n${BLUE}🎯 Running All Tests${NC}"
    test_health
    test_webhook_direct
    test_message_creation
    test_bulk_messages
    test_error_scenarios
    echo -e "\n${GREEN}✅ All tests completed!${NC}"
    echo -e "${YELLOW}📊 Check Grafana dashboard: http://localhost:3001${NC}"
}

if [ $# -eq 0 ]; then
    while true; do
        show_menu
        echo -n "Choose an option (1-8): "
        read choice
        
        case $choice in
            1) test_health ;;
            2) test_webhook_direct ;;
            3) test_message_creation ;;
            4) test_bulk_messages ;;
            5) test_error_scenarios ;;
            6) show_metrics ;;
            7) run_all_tests ;;
            8) echo -e "${GREEN}👋 Goodbye!${NC}"; exit 0 ;;
            *) echo -e "${RED}❌ Invalid option${NC}" ;;
        esac
    done
else
    case $1 in
        "health") test_health ;;
        "webhook") test_webhook_direct ;;
        "messages") test_message_creation ;;
        "bulk") test_bulk_messages ;;
        "errors") test_error_scenarios ;;
        "metrics") show_metrics ;;
        "all") run_all_tests ;;
        *) echo -e "${RED}❌ Unknown command: $1${NC}"
           echo "Available commands: health, webhook, messages, bulk, errors, metrics, all"
           ;;
    esac
fi 