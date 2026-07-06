# Use a lightweight python base image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder

# Set working directory for the builder stage
WORKDIR /app

# Copy lockfile, pyproject.toml and required packages for the build
COPY apps/api/pyproject.toml apps/api/uv.lock ./apps/api/
COPY packages/ ./packages/

# Build dependencies (cached separately from app source)
WORKDIR /app/apps/api
RUN uv sync --frozen --no-install-project --no-dev

# Copy app source and install the project itself, so hatchling's
# force-included oneiromantia_art_spec.py lands in site-packages
COPY apps/api/ /app/apps/api/
RUN uv sync --frozen --no-dev

# Final runtime image stage
FROM python:3.13-slim

WORKDIR /app

# Copy virtualenv and executables from builder stage
COPY --from=builder /app/apps/api/.venv /app/apps/api/.venv
ENV PATH="/app/apps/api/.venv/bin:$PATH"

# Copy source directories and main files
COPY apps/api/ /app/apps/api/
COPY packages/ /app/packages/

# Set working directory to the API app
WORKDIR /app/apps/api

# Expose port 8000
EXPOSE 8000

# Ensure logs flow directly to stdout/stderr
ENV PYTHONUNBUFFERED=1

# Run the FastAPI server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
