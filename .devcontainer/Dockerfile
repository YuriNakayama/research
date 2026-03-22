# ============================================
# Dev Container（シングルステージ、ツールのみインストール）
# ============================================
FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

ARG USERNAME=node

# ============================================
# システムパッケージ
# ============================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    openssh-client \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# 開発ツール (uv, Python, AWS CLI, pnpm, Claude Code)
# ============================================
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

RUN uv python install 3.13

# x86_64 専用（ARM Codespace マシンでは別途対応が必要）
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip" \
    && unzip -q /tmp/awscliv2.zip -d /tmp \
    && /tmp/aws/install \
    && rm -rf /tmp/awscliv2.zip /tmp/aws

RUN corepack enable pnpm

RUN npm config set prefix /usr/local \
    && npm install -g @anthropic-ai/claude-code --silent

# ============================================
# ユーザー設定
# ============================================
RUN mkdir -p /home/${USERNAME}/.local/bin /home/${USERNAME}/.local/share \
    && cp /root/.local/bin/uv /home/${USERNAME}/.local/bin/uv \
    && cp /root/.local/bin/uvx /home/${USERNAME}/.local/bin/uvx \
    && cp -r /root/.local/share/uv /home/${USERNAME}/.local/share/uv \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.local

WORKDIR /workspaces/ai-reception
USER ${USERNAME}
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"

SHELL ["/bin/bash", "-c"]
CMD ["/bin/bash"]
