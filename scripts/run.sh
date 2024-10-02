#!/bin/bash


run_backend() {
  echo "Starting Go backend..."
  cd backend || { echo "Backend directory not found!"; exit 1; }
  go mod tidy
  go run cmd/main.go
}





start_servers() {
  run_backend &         


  wait
}


if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  start_servers
fi
