#!/bin/sh

HARDHAT_URL="http://localhost:8546"
TIMEOUT=120  # Timeout in seconds
RETRY_INTERVAL=2  # Interval between checks (in seconds)
ELAPSED=0

echo "Waiting for Hardhat node to be available at $HARDHAT_URL (timeout: ${TIMEOUT}s)..."

# Keep checking until the Hardhat node responds or timeout occurs
until curl --silent --output /dev/null --fail "$HARDHAT_URL"; do
  ELAPSED=$((ELAPSED + RETRY_INTERVAL))

  # Check if timeout has been reached
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "Timeout of ${TIMEOUT}s reached. Hardhat node is still not up. Exiting."
    exit 1
  fi

  echo "Hardhat node is not up yet. Retrying... (${ELAPSED}s elapsed)"
  sleep "$RETRY_INTERVAL"  # Wait before retrying
done

echo "Hardhat node is up and running at $HARDHAT_URL!"

# Get the block number using a JSON-RPC call
BLOCK_NUMBER=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $HARDHAT_URL | jq -r '.result')

# Convert the block number from hex to decimal
BLOCK_NUMBER_DECIMAL=$(printf "%d\n" $BLOCK_NUMBER)

# Output the block number
echo "Current block number: $BLOCK_NUMBER_DECIMAL"
