#!/bin/bash
export LC_ALL=C

SUMMARY_FILE="coverage/coverage-summary.json"

if [ ! -f "$SUMMARY_FILE" ]; then
  echo "Coverage summary file not found at $SUMMARY_FILE. Exiting."
  exit 1
fi

LINES=$(jq '.total.lines.pct' "$SUMMARY_FILE")
BRANCHES=$(jq '.total.branches.pct' "$SUMMARY_FILE")
FUNCTIONS=$(jq '.total.functions.pct' "$SUMMARY_FILE")
STATEMENTS=$(jq '.total.statements.pct' "$SUMMARY_FILE")

echo "-------- Coverage Summary -------"
printf "Lines:      %20.2f%%\n" "$LINES"
printf "Branches:   %20.2f%%\n" "$BRANCHES"
printf "Functions:  %20.2f%%\n" "$FUNCTIONS"
printf "Statements: %20.2f%%\n" "$STATEMENTS"
echo "---------------------------------"

