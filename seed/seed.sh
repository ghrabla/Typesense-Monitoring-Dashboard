RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }

ENV_FILE="$(dirname "$0")/../.env"

if [ -f "$ENV_FILE" ]; then
  info "Loading environment variables from $ENV_FILE"
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  error ".env file not found at $ENV_FILE"
  exit 1
fi

set -euo pipefail

TYPESENSE_HOST="${TYPESENSE_HOST}"
TYPESENSE_PORT="${TYPESENSE_PORT}"
TYPESENSE_API_KEY="${TYPESENSE_API_KEY}"

BASE_URL="http://${TYPESENSE_HOST}:${TYPESENSE_PORT}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)" 

if [[ -z "$TYPESENSE_API_KEY" ]]; then
  error "TYPESENSE_API_KEY is not set. Export it before running this script."
  echo "  Usage: TYPESENSE_API_KEY=xyz ./seed.sh"
  exit 1
fi

info "Waiting for Typesense to be healthy at ${BASE_URL} ..."
for i in $(seq 1 30); do
  if curl -sf "${BASE_URL}/health" > /dev/null 2>&1; then
    info "Typesense is healthy!"
    break
  fi
  if [[ $i -eq 30 ]]; then
    error "Typesense did not become healthy in time. Aborting."
    exit 1
  fi
  sleep 2
done

seed_collection() {
  local name="$1"
  local schema_file="${SCRIPT_DIR}/${name}_schema.json"
  local data_file="${SCRIPT_DIR}/${name}.jsonl"

  info "────────────────────────────────────────"
  info "Seeding collection: ${name}"

  info "Dropping collection '${name}' if it exists ..."
  curl -sf -X DELETE \
    "${BASE_URL}/collections/${name}" \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
    > /dev/null 2>&1 || true

  info "Creating collection '${name}' ..."
  response=$(curl -sf -X POST \
    "${BASE_URL}/collections" \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d @"${schema_file}")

  if [[ $? -ne 0 ]]; then
    error "Failed to create collection '${name}'"
    echo "$response"
    return 1
  fi
  info "Collection '${name}' created successfully."

  info "Importing documents into '${name}' ..."
  import_result=$(curl -sf -X POST \
    "${BASE_URL}/collections/${name}/documents/import?action=create" \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
    -H "Content-Type: text/plain" \
    --data-binary @"${data_file}")

  total=$(echo "$import_result" | wc -l)
  failures=$(echo "$import_result" | grep -c '"success":false' || true)
  successes=$((total - failures))

  if [[ $failures -gt 0 ]]; then
    warn "${successes}/${total} documents imported, ${failures} failed."
    echo "$import_result" | grep '"success":false'
  else
    info "All ${successes} documents imported successfully into '${name}'."
  fi
}

info "Starting Typesense seed ..."
echo ""

seed_collection "products"
echo ""
seed_collection "users"
echo ""
seed_collection "orders"

echo ""
info "════════════════════════════════════════"
info "  Seeding complete!"
info "════════════════════════════════════════"
