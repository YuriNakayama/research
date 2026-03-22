# =============================================================================
# Auto Research Task Container
# Based on .devcontainer/Dockerfile patterns
# =============================================================================
FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# =============================================================================
# System packages
# =============================================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    openssh-client \
    jq \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# =============================================================================
# gh CLI
# =============================================================================
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# =============================================================================
# Claude CLI
# =============================================================================
RUN npm config set prefix /usr/local \
    && npm install -g @anthropic-ai/claude-code --silent

# =============================================================================
# UV + Python
# =============================================================================
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"
RUN uv python install 3.13

# =============================================================================
# Application user (UID=1000 to match EFS access point)
# =============================================================================
RUN groupadd -g 1000 claude \
    && useradd -u 1000 -g 1000 -m -s /bin/bash claude \
    && mkdir -p /home/claude/.local/bin /home/claude/.local/share \
    && cp /root/.local/bin/uv /home/claude/.local/bin/uv \
    && cp /root/.local/bin/uvx /home/claude/.local/bin/uvx \
    && cp -r /root/.local/share/uv /home/claude/.local/share/uv \
    && chown -R claude:claude /home/claude/.local

# =============================================================================
# Application code
# =============================================================================
WORKDIR /app
COPY pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev 2>/dev/null || uv sync --no-dev

COPY . .
RUN chown -R claude:claude /app

# =============================================================================
# Runtime
# =============================================================================
USER claude
ENV PATH="/home/claude/.local/bin:${PATH}"

COPY scripts/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
