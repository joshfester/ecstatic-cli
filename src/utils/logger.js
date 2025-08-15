// Simple logger utility for consistent output formatting

export function info(message) {
  console.log(`ℹ️  ${message}`);
}

export function success(message) {
  console.log(`✅  ${message}`);
}

export function warning(message) {
  console.warn(`⚠️  ${message}`);
}

export function error(message) {
  console.error(`❌  ${message}`);
}

